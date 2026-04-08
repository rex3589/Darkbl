import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, doc, onSnapshot } from 'firebase/firestore';
import { motion } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { UserProfile, CryptoType, GlobalSettings } from '../types';
import { Copy, Check, ArrowLeft, Loader2, Info, Bitcoin, Wallet } from 'lucide-react';

export default function CryptoPaymentPage({ userProfile }: { userProfile: UserProfile | null }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { planId, price } = location.state || { planId: '1_DAY', price: 50 };

  const [selectedCrypto, setSelectedCrypto] = useState<CryptoType>('BTC');
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as GlobalSettings);
      } else {
        // Default settings if not set
        setSettings({
          btcAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
          ethAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          ltcAddress: 'LhY9S3U3U3U3U3U3U3U3U3U3U3U3U3U3U3',
          usdtAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
          vip1DayPrice: 50,
          vip30DayPrice: 300
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getAddress = () => {
    if (!settings) return '';
    switch (selectedCrypto) {
      case 'BTC': return settings.btcAddress;
      case 'ETH': return settings.ethAddress;
      case 'LTC': return settings.ltcAddress;
      case 'USDT': return settings.usdtAddress;
      default: return '';
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getAddress());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaymentSubmit = async () => {
    if (!userProfile) return;
    
    try {
      await addDoc(collection(db, 'payments'), {
        uid: userProfile.uid,
        amount: price,
        plan: planId,
        status: 'pending',
        cryptoType: selectedCrypto,
        address: getAddress(),
        createdAt: new Date().toISOString()
      });
      alert('Payment request submitted. Please wait for confirmation.');
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Error submitting payment request');
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
        className="w-full max-w-2xl bg-zinc-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-8 shadow-2xl shadow-cyan-500/10"
      >
        <button
          onClick={() => navigate('/payment')}
          className="flex items-center gap-2 text-gray-500 hover:text-cyan-400 mb-8 transition-colors text-sm font-bold uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Plans
        </button>

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter italic mb-2">PAYMENT</h2>
            <p className="text-gray-400 text-sm uppercase tracking-widest font-bold mb-8">Select Cryptocurrency</p>

            <div className="space-y-3 mb-8">
              {(['BTC', 'ETH', 'LTC', 'USDT'] as CryptoType[]).map((crypto) => (
                <button
                  key={crypto}
                  onClick={() => setSelectedCrypto(crypto)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                    selectedCrypto === crypto
                      ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-lg shadow-cyan-500/10'
                      : 'bg-black/50 border-zinc-800 text-gray-500 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${selectedCrypto === crypto ? 'bg-cyan-500/20' : 'bg-zinc-800'}`}>
                      <Bitcoin className="w-5 h-5" />
                    </div>
                    <span className="font-black uppercase tracking-widest italic">{crypto}</span>
                  </div>
                  {selectedCrypto === crypto && <Check className="w-5 h-5" />}
                </button>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 flex items-start gap-3 text-cyan-400/80 text-xs font-medium leading-relaxed">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p>Send exactly ${price} in {selectedCrypto} to the address provided. Your VIP status will be activated after confirmation.</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center text-center">
            <div className="p-6 bg-white rounded-3xl mb-8 shadow-xl shadow-white/5">
              <QRCodeSVG value={getAddress()} size={200} level="H" />
            </div>

            <div className="w-full space-y-4">
              <div className="text-left">
                <label className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-black mb-2 block">Wallet Address</label>
                <div className="relative group">
                  <input
                    type="text"
                    readOnly
                    value={getAddress()}
                    className="w-full bg-black/50 border border-zinc-800 rounded-xl py-4 pl-4 pr-12 text-xs font-mono text-cyan-400 focus:outline-none"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              </div>

              <button
                onClick={handlePaymentSubmit}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest py-5 rounded-xl transition-all shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-3"
              >
                <Wallet className="w-6 h-6" />
                I Have Paid
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
