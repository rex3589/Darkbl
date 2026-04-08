import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { updatePassword, updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { UserProfile } from '../types';
import { User, Mail, Shield, ShieldCheck, ShieldAlert, Lock, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function ProfilePage({ userProfile }: { userProfile: UserProfile | null }) {
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !userProfile) return;
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (displayName !== userProfile.displayName) {
        await updateProfile(auth.currentUser, { displayName });
        await updateDoc(doc(db, 'users', userProfile.uid), { displayName });
      }

      if (newPassword) {
        await updatePassword(auth.currentUser, newPassword);
      }

      setMessage({ type: 'success', text: 'Profile updated successfully' });
      setNewPassword('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error updating profile' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-zinc-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-10 shadow-2xl shadow-cyan-500/10"
      >
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-cyan-500/10 border-2 border-cyan-500/30 flex items-center justify-center shadow-xl shadow-cyan-500/5">
              <User className="w-16 h-16 text-cyan-400" />
            </div>
            <div className="absolute -bottom-2 -right-2 p-2 rounded-full bg-zinc-900 border border-cyan-500/30 shadow-lg">
              {userProfile?.isVip ? (
                <ShieldCheck className="w-6 h-6 text-cyan-400" />
              ) : (
                <ShieldAlert className="w-6 h-6 text-yellow-500" />
              )}
            </div>
          </div>

          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black text-white tracking-tighter italic mb-2 uppercase">{userProfile?.displayName}</h2>
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-gray-400 text-sm font-medium">{userProfile?.email}</span>
            </div>
            <div className={cn(
              "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border",
              userProfile?.isVip 
                ? "bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-lg shadow-cyan-500/10" 
                : "bg-yellow-500/10 border-yellow-500 text-yellow-500"
            )}>
              {userProfile?.isVip ? 'VİP ÜYE' : 'ÇAYLAK ÜYE'}
            </div>
          </div>
        </div>

        {message.text && (
          <div className={cn(
            "mb-8 p-4 rounded-xl flex items-center gap-3 text-sm font-medium border",
            message.type === 'success' ? "bg-green-500/10 border-green-500/50 text-green-400" : "bg-red-500/10 border-red-500/50 text-red-400"
          )}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <p>{message.text}</p>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-black ml-1">Display Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-black/50 border border-zinc-800 rounded-xl py-4 pl-11 pr-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-black ml-1">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  placeholder="Leave blank to keep current"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-black/50 border border-zinc-800 rounded-xl py-4 pl-11 pr-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-black uppercase tracking-widest py-5 rounded-xl transition-all shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
            Save Changes
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
