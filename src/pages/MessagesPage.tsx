import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, limit, or } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, Message } from '../types';
import { Send, MessageSquare, Shield, User, Loader2, Clock } from 'lucide-react';
import { auth } from '../firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function MessagesPage({ userProfile }: { userProfile: UserProfile | null }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userProfile) return;

    // Get messages where user is involved
    const q = query(
      collection(db, 'messages'),
      or(
        where('senderUid', '==', userProfile.uid),
        where('receiverUid', '==', userProfile.uid)
      ),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      
      // Filter for conversation with admin and sort in memory to avoid index requirements
      const filteredMsgs = msgs
        .filter(m => 
          (m.senderUid === userProfile.uid && m.receiverUid === 'admin') ||
          (m.senderUid === 'admin' && m.receiverUid === userProfile.uid)
        )
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      setMessages(filteredMsgs);
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'messages');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userProfile || sending) return;

    setSending(true);
    try {
      await addDoc(collection(db, 'messages'), {
        senderUid: userProfile.uid,
        receiverUid: 'admin',
        content: newMessage.trim(),
        createdAt: new Date().toISOString(),
        read: false
      });
      setNewMessage('');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'messages');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl h-[80vh] bg-zinc-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-3xl flex flex-col shadow-2xl shadow-cyan-500/10 overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-cyan-500/20 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-cyan-500/10 border border-cyan-500/30">
              <Shield className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight uppercase italic">Admin Support</h2>
              <p className="text-cyan-500/60 text-[10px] font-black uppercase tracking-widest">Direct Secure Channel</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-green-500 text-[10px] font-black uppercase tracking-widest">Online</span>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-hide">
          <AnimatePresence initial={false}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                <MessageSquare className="w-16 h-16 mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest">No messages yet</p>
                <p className="text-xs mt-2">Send a message to the administrator</p>
              </div>
            ) : (
              messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: msg.senderUid === userProfile?.uid ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex flex-col max-w-[80%]",
                    msg.senderUid === userProfile?.uid ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className={cn(
                    "px-5 py-3 rounded-2xl text-sm font-medium shadow-lg",
                    msg.senderUid === userProfile?.uid 
                      ? "bg-cyan-500 text-black rounded-tr-none" 
                      : "bg-zinc-800 text-white rounded-tl-none border border-zinc-700"
                  )}>
                    {msg.content}
                  </div>
                  <div className="flex items-center gap-2 mt-2 px-1">
                    <Clock className="w-3 h-3 text-gray-600" />
                    <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
          <div ref={scrollRef} />
        </div>

        {/* Input area */}
        <form onSubmit={handleSendMessage} className="p-6 bg-black/40 border-t border-cyan-500/20">
          <div className="relative flex items-center gap-4">
            <input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-grow bg-black/50 border border-zinc-800 rounded-2xl py-4 px-6 text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="p-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black transition-all shadow-lg shadow-cyan-500/20"
            >
              {sending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
