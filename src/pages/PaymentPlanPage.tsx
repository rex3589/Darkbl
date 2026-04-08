import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { motion } from 'motion/react';
import { UserProfile, GlobalSettings } from '../types';
import { Shield, Check, ArrowRight, Zap, Clock, Loader2 } from 'lucide-react';

export default function PaymentPlanPage({ userProfile }: { userProfile: UserProfile | null }) {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as GlobalSettings);
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
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const plans = [
    {
      id: '1_DAY',
      name: 'DarkBlaiseX 1 DAY',
      price: settings?.vip1DayPrice || 50,
      duration: '1 Day',
      features: ['Full System Access', '24/7 Support', 'Instant Activation'],
      icon: Clock,
      color: 'border-cyan-500/30',
      glow: 'shadow-cyan-500/10'
    },
    {
      id: '30_DAY',
      name: 'DarkBlaiseX 30 DAY',
      price: settings?.vip30DayPrice || 300,
      duration: '30 Days',
      features: ['Full System Access', 'Priority Support', 'Instant Activation', 'Exclusive Tools'],
      icon: Zap,
      color: 'border-cyan-500/60',
      glow: 'shadow-cyan-500/20'
    }
  ];

  const handleSubscribe = (planId: string, price: number) => {
    navigate('/payment/crypto', { state: { planId, price } });
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
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-white tracking-tighter italic mb-4">VIP MEMBERSHIP</h2>
        <p className="text-gray-400 uppercase tracking-[0.2em] font-bold text-sm">Choose your plan for full access</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative flex flex-col bg-zinc-900/80 backdrop-blur-xl border ${plan.color} rounded-3xl p-8 shadow-2xl ${plan.glow} overflow-hidden group`}
          >
            {/* Background pattern */}
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <plan.icon className="w-32 h-32" />
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                  <plan.icon className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-xl font-black text-white tracking-tight uppercase italic">{plan.name}</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-cyan-400 tracking-tighter italic">${plan.price}</span>
                <span className="text-gray-500 font-bold uppercase tracking-widest text-sm">/ {plan.duration}</span>
              </div>
            </div>

            <ul className="space-y-4 mb-10 flex-grow">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-300">
                  <div className="p-1 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                    <Check className="w-3 h-3 text-cyan-400" />
                  </div>
                  <span className="text-sm font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan.id, plan.price)}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 group-hover:scale-[1.02]"
            >
              Subscribe
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
