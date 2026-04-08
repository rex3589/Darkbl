import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, doc, onSnapshot, updateDoc, query, orderBy, limit, deleteDoc, setDoc, addDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { UserProfile, PaymentRecord, Message, GlobalSettings } from '../types';
import { Users, CreditCard, MessageSquare, Settings, Shield, Check, X, Trash2, Save, Loader2, Search, Filter, ArrowRight, Clock, ShieldCheck, ShieldAlert, Send } from 'lucide-react';

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

export default function AdminPanelPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'users' | 'payments' | 'messages' | 'settings'>('users');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [selectedUserForChat, setSelectedUserForChat] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(d => ({ ...d.data() } as UserProfile)));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'users'));

    const unsubPayments = onSnapshot(collection(db, 'payments'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as PaymentRecord));
      setPayments(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'payments'));

    const unsubMessages = onSnapshot(collection(db, 'messages'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Message));
      setMessages(data.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'messages'));

    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (snap) => {
      if (snap.exists()) {
        setSettings(snap.data() as GlobalSettings);
      } else {
        setSettings({
          btcAddress: '',
          ethAddress: '',
          ltcAddress: '',
          usdtAddress: '',
          vip1DayPrice: 50,
          vip30DayPrice: 300
        });
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'settings/global'));

    setLoading(false);
    return () => {
      unsubUsers();
      unsubPayments();
      unsubMessages();
      unsubSettings();
    };
  }, []);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedUserForChat || sendingReply) return;

    setSendingReply(true);
    try {
      await addDoc(collection(db, 'messages'), {
        senderUid: 'admin',
        receiverUid: selectedUserForChat,
        content: replyText.trim(),
        createdAt: new Date().toISOString(),
        read: false
      });
      setReplyText('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'messages');
    } finally {
      setSendingReply(false);
    }
  };

  const chatMessages = messages.filter(m => 
    (m.senderUid === selectedUserForChat && m.receiverUid === 'admin') ||
    (m.senderUid === 'admin' && m.receiverUid === selectedUserForChat)
  );

  const uniqueMessageUsers = Array.from(new Set(messages.filter(m => m.senderUid !== 'admin').map(m => m.senderUid)));

  const handleToggleVip = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), { 
        isVip: !currentStatus,
        vipExpiry: !currentStatus ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const handleApprovePayment = async (payment: PaymentRecord) => {
    if (!payment.id) return;
    try {
      await updateDoc(doc(db, 'payments', payment.id), { status: 'completed' });
      
      // Activate VIP for user
      const duration = payment.plan === '30_DAY' ? 30 : 1;
      await updateDoc(doc(db, 'users', payment.uid), {
        isVip: true,
        vipExpiry: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `payments/${payment.id}`);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      await setDoc(doc(db, 'settings', 'global'), settings);
      alert(t('settings_updated', { defaultValue: 'Settings updated' }));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/global');
    }
  };

  const handleRejectPayment = async (paymentId: string) => {
    if (!paymentId || !window.confirm(t('confirm_reject_payment', { defaultValue: 'Are you sure you want to reject this payment request?' }))) return;
    try {
      await deleteDoc(doc(db, 'payments', paymentId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `payments/${paymentId}`);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="w-12 h-12 text-cyan-500 animate-spin" /></div>;

  const filteredUsers = users.filter(u => u.email.toLowerCase().includes(search.toLowerCase()) || u.displayName?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 md:p-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-2">
          <h2 className="text-2xl font-black text-white tracking-tighter italic mb-8 flex items-center gap-3">
            <Shield className="w-8 h-8 text-cyan-400" />
            {t('admin_panel')}
          </h2>
          
          {[
            { id: 'users', name: t('users', { defaultValue: 'Users' }), icon: Users },
            { id: 'payments', name: t('vip_approvals', { defaultValue: 'VIP Approvals' }), icon: ShieldCheck },
            { id: 'messages', name: t('messages'), icon: MessageSquare },
            { id: 'settings', name: t('settings'), icon: Settings },
          ].map((tab) => {
            const pendingCount = tab.id === 'payments' ? payments.filter(p => p.status === 'pending').length : 0;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "w-full flex items-center justify-between px-6 py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all border",
                  activeTab === tab.id 
                    ? "bg-cyan-500 border-cyan-500 text-black shadow-lg shadow-cyan-500/20" 
                    : "bg-zinc-900/50 border-zinc-800 text-gray-500 hover:border-zinc-700 hover:text-gray-300"
                )}
              >
                <div className="flex items-center gap-3">
                  <tab.icon className="w-5 h-5" />
                  {tab.name}
                </div>
                {pendingCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-grow bg-zinc-900/80 backdrop-blur-xl border border-cyan-500/20 rounded-3xl p-8 shadow-2xl shadow-cyan-500/5 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'users' && (
              <motion.div key="users" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-white tracking-tight uppercase italic">{t('manage_users', { defaultValue: 'Manage Users' })}</h3>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder={t('search_users', { defaultValue: 'Search users...' })}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-black/50 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 text-[10px] font-black uppercase tracking-widest text-gray-500">
                        <th className="pb-4 pl-4">{t('user', { defaultValue: 'User' })}</th>
                        <th className="pb-4">{t('role', { defaultValue: 'Role' })}</th>
                        <th className="pb-4">{t('status', { defaultValue: 'Status' })}</th>
                        <th className="pb-4">{t('expiry', { defaultValue: 'Expiry' })}</th>
                        <th className="pb-4 pr-4 text-right">{t('actions', { defaultValue: 'Actions' })}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {filteredUsers.map((u) => (
                        <tr key={u.uid} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 pl-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-black text-cyan-400">
                                {u.displayName?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-white">{u.displayName}</div>
                                <div className="text-[10px] text-gray-500 font-mono">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border",
                              u.role === 'admin' ? "bg-purple-500/10 border-purple-500 text-purple-400" : "bg-zinc-800 border-zinc-700 text-gray-400"
                            )}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              {u.isVip ? (
                                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                              ) : (
                                <ShieldAlert className="w-4 h-4 text-yellow-500" />
                              )}
                              <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest",
                                u.isVip ? "text-cyan-400" : "text-yellow-500"
                              )}>
                                {u.isVip ? 'VIP' : 'Free'}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 text-[10px] font-mono text-gray-500">
                            {u.vipExpiry ? new Date(u.vipExpiry).toLocaleDateString() : '-'}
                          </td>
                          <td className="py-4 pr-4 text-right">
                            <button
                              onClick={() => handleToggleVip(u.uid, !!u.isVip)}
                              className={cn(
                                "p-2 rounded-lg border transition-all",
                                u.isVip ? "bg-red-500/10 border-red-500 text-red-400 hover:bg-red-500 hover:text-white" : "bg-cyan-500/10 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black"
                              )}
                            >
                              {u.isVip ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'payments' && (
              <motion.div key="payments" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h3 className="text-xl font-black text-white tracking-tight uppercase italic mb-8">{t('vip_approval_requests', { defaultValue: 'VIP Approval Requests' })}</h3>
                <div className="space-y-4">
                  {payments.length === 0 ? (
                    <div className="text-center py-20 opacity-20">
                      <ShieldCheck className="w-16 h-16 mx-auto mb-4" />
                      <p className="font-black uppercase tracking-widest">{t('no_pending_requests', { defaultValue: 'No pending requests' })}</p>
                    </div>
                  ) : (
                    payments.map((p) => {
                      const user = users.find(u => u.uid === p.uid);
                      return (
                        <div key={p.id} className="bg-black/40 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between group">
                          <div className="flex items-center gap-6">
                            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                              <CreditCard className="w-8 h-8 text-cyan-400" />
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <span className="text-lg font-black text-white italic tracking-tight">${p.amount}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500/60">{p.plan}</span>
                                <span className={cn(
                                  "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border",
                                  p.status === 'completed' ? "bg-green-500/10 border-green-500 text-green-400" : "bg-yellow-500/10 border-yellow-500 text-yellow-500"
                                )}>
                                  {p.status}
                                </span>
                              </div>
                              <div className="text-xs text-white font-bold mb-1">
                                {user?.displayName || 'Unknown User'} ({user?.email || p.uid})
                              </div>
                              <div className="text-[10px] text-gray-500 font-medium flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                {new Date(p.createdAt).toLocaleString()}
                              </div>
                              <div className="text-[10px] text-gray-600 font-mono mt-1">Crypto: {p.cryptoType}</div>
                            </div>
                          </div>
                          
                          {p.status === 'pending' && (
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleApprovePayment(p)}
                                className="px-6 py-2 rounded-xl bg-green-500 hover:bg-green-400 text-black font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-green-500/20"
                              >
                                {t('approve_vip', { defaultValue: 'Approve VIP' })}
                              </button>
                              <button 
                                onClick={() => handleRejectPayment(p.id!)}
                                className="p-2 rounded-xl border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && settings && (
              <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h3 className="text-xl font-black text-white tracking-tight uppercase italic mb-8">{t('global_settings', { defaultValue: 'Global Settings' })}</h3>
                <form onSubmit={handleUpdateSettings} className="space-y-8 max-w-2xl">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-500/60">{t('crypto_addresses', { defaultValue: 'Crypto Addresses' })}</h4>
                      <div className="space-y-4">
                        {['btc', 'eth', 'ltc', 'usdt'].map((c) => (
                          <div key={c} className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1 uppercase">{c} {t('address', { defaultValue: 'Address' })}</label>
                            <input
                              type="text"
                              value={(settings as any)[`${c}Address`]}
                              onChange={(e) => setSettings({ ...settings, [`${c}Address`]: e.target.value })}
                              className="w-full bg-black/50 border border-zinc-800 rounded-xl py-3 px-4 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-500/60">{t('pricing_usd', { defaultValue: 'Pricing (USD)' })}</h4>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">{t('1_day_price', { defaultValue: '1 Day Price' })}</label>
                          <input
                            type="number"
                            value={settings.vip1DayPrice}
                            onChange={(e) => setSettings({ ...settings, vip1DayPrice: Number(e.target.value) })}
                            className="w-full bg-black/50 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">{t('30_day_price', { defaultValue: '30 Day Price' })}</label>
                          <input
                            type="number"
                            value={settings.vip30DayPrice}
                            onChange={(e) => setSettings({ ...settings, vip30DayPrice: Number(e.target.value) })}
                            className="w-full bg-black/50 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-3"
                  >
                    <Save className="w-6 h-6" />
                    {t('save_settings', { defaultValue: 'Save Settings' })}
                  </button>
                </form>
              </motion.div>
            )}

            {activeTab === 'messages' && (
              <motion.div key="messages" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col">
                <h3 className="text-xl font-black text-white tracking-tight uppercase italic mb-8">{t('user_messages', { defaultValue: 'User Messages' })}</h3>
                
                <div className="flex flex-col md:flex-row gap-6 h-[60vh]">
                  {/* User List */}
                  <div className="w-full md:w-1/3 overflow-y-auto border-r border-zinc-800 pr-4 space-y-2">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">{t('conversations', { defaultValue: 'Conversations' })}</h4>
                    {uniqueMessageUsers.length === 0 ? (
                      <p className="text-xs text-gray-600 italic">{t('no_messages_yet', { defaultValue: 'No messages yet' })}</p>
                    ) : (
                      uniqueMessageUsers.map(uid => {
                        const user = users.find(u => u.uid === uid);
                        const lastMsg = messages.filter(m => m.senderUid === uid || m.receiverUid === uid).pop();
                        return (
                          <button
                            key={uid}
                            onClick={() => setSelectedUserForChat(uid)}
                            className={cn(
                              "w-full text-left p-4 rounded-xl border transition-all",
                              selectedUserForChat === uid 
                                ? "bg-cyan-500/10 border-cyan-500 text-cyan-400" 
                                : "bg-black/20 border-zinc-800 text-gray-500 hover:border-zinc-700"
                            )}
                          >
                            <div className="font-bold text-sm truncate">{user?.displayName || 'Unknown User'}</div>
                            <div className="text-[10px] opacity-60 truncate">{lastMsg?.content}</div>
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* Chat Area */}
                  <div className="flex-grow flex flex-col bg-black/20 rounded-2xl border border-zinc-800 overflow-hidden">
                    {selectedUserForChat ? (
                      <>
                        <div className="p-4 border-b border-zinc-800 bg-black/40 flex items-center justify-between">
                          <div className="text-sm font-black uppercase tracking-widest text-cyan-400">
                            {t('chatting_with', { defaultValue: 'Chatting with' })} {users.find(u => u.uid === selectedUserForChat)?.displayName || 'User'}
                          </div>
                          <button onClick={() => setSelectedUserForChat(null)} className="text-gray-500 hover:text-white">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="flex-grow overflow-y-auto p-4 space-y-4">
                          {chatMessages.map((m, i) => (
                            <div key={i} className={cn(
                              "flex flex-col max-w-[80%]",
                              m.senderUid === 'admin' ? "ml-auto items-end" : "mr-auto items-start"
                            )}>
                              <div className={cn(
                                "px-4 py-2 rounded-xl text-xs font-medium",
                                m.senderUid === 'admin' 
                                  ? "bg-cyan-500 text-black rounded-tr-none" 
                                  : "bg-zinc-800 text-white rounded-tl-none border border-zinc-700"
                              )}>
                                {m.content}
                              </div>
                              <span className="text-[8px] text-gray-600 mt-1 uppercase font-bold">
                                {new Date(m.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                          ))}
                        </div>

                        <form onSubmit={handleSendReply} className="p-4 border-t border-zinc-800 bg-black/40 flex gap-2">
                          <input
                            type="text"
                            placeholder={t('type_reply', { defaultValue: 'Type a reply...' })}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="flex-grow bg-black/50 border border-zinc-800 rounded-xl py-2 px-4 text-xs text-white focus:outline-none focus:border-cyan-500"
                          />
                          <button
                            type="submit"
                            disabled={!replyText.trim() || sendingReply}
                            className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black transition-all"
                          >
                            {sendingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          </button>
                        </form>
                      </>
                    ) : (
                      <div className="flex-grow flex flex-col items-center justify-center text-center opacity-20">
                        <MessageSquare className="w-12 h-12 mb-2" />
                        <p className="text-xs font-black uppercase tracking-widest">{t('select_conversation', { defaultValue: 'Select a conversation' })}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
