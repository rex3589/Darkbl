import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { UserProfile } from '../types';
import { ShieldCheck, ShieldAlert, Lock, ArrowRight } from 'lucide-react';

export default function HomePage({ userProfile }: { userProfile: UserProfile | null }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLoginClick = () => {
    if (userProfile?.isVip || userProfile?.role === 'admin') {
      // Access granted
      alert(t('access_granted', { defaultValue: 'Access Granted to DarkBlaiseX System' }));
    } else {
      // Access denied, redirect to payment
      navigate('/payment');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-zinc-900/60 backdrop-blur-2xl border border-cyan-500/20 rounded-3xl p-12 shadow-2xl shadow-cyan-500/5 text-center relative overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 blur-[80px] rounded-full"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/10 blur-[80px] rounded-full"></div>

        <div className="relative z-10">
          <div className="mb-8 flex justify-center">
            <div className="p-4 rounded-full bg-cyan-500/10 border border-cyan-500/30">
              {userProfile?.isVip ? (
                <ShieldCheck className="w-12 h-12 text-cyan-400" />
              ) : (
                <ShieldAlert className="w-12 h-12 text-yellow-500" />
              )}
            </div>
          </div>

          <h2 className="text-4xl font-black text-white tracking-tighter italic mb-4">DARKBLAISE X</h2>
          
          <p className="text-gray-400 mb-10 text-sm uppercase tracking-[0.2em] font-bold">
            {userProfile?.isVip ? t('access_authorized', { defaultValue: 'System Access Authorized' }) : t('auth_required', { defaultValue: 'Authorization Required' })}
          </p>

          <button
            onClick={handleLoginClick}
            className="group relative w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest py-6 rounded-xl transition-all shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <span className="relative z-10 text-xl">{t('login')}</span>
            <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform" />
          </button>

          {!userProfile?.isVip && userProfile?.role !== 'admin' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-3 text-yellow-500 text-xs font-bold uppercase tracking-wider"
            >
              <Lock className="w-4 h-4 shrink-0" />
              <p>{t('vip_required', { defaultValue: 'VIP Membership required for system access' })}</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
