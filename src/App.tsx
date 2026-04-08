import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile, UserRole } from './types';
import { LogOut, User as UserIcon, Shield, MessageSquare, CreditCard, Home as HomeIcon, Loader2, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Pages (to be created)
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import PaymentPlanPage from './pages/PaymentPlanPage';
import CryptoPaymentPage from './pages/CryptoPaymentPage';
import ProfilePage from './pages/ProfilePage';
import AdminPanelPage from './pages/AdminPanelPage';
import MessagesPage from './pages/MessagesPage';

// Components
const Navbar = ({ userProfile }: { userProfile: UserProfile | null }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [showLang, setShowLang] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  if (!userProfile) return null;

  const navItems = [
    { name: t('home_title'), path: '/', icon: HomeIcon },
    { name: t('payment_plan'), path: '/payment', icon: CreditCard },
    { name: t('profile'), path: '/profile', icon: UserIcon },
    { name: t('messages'), path: '/messages', icon: MessageSquare },
  ];

  if (userProfile.role === 'admin') {
    navItems.push({ name: t('admin_panel'), path: '/admin', icon: Shield });
  }

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-cyan-500/30">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-cyan-400 flex items-center gap-2",
                location.pathname === item.path ? "text-cyan-400" : "text-gray-300"
              )}
            >
              <item.icon className="w-4 h-4" />
              <span className="hidden md:inline">{item.name}</span>
            </Link>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLang(!showLang)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-zinc-800 text-gray-400 hover:text-white hover:border-zinc-700 transition-all text-xs font-bold"
            >
              <Languages className="w-4 h-4" />
              <span className="uppercase">{i18n.language.split('-')[0]}</span>
            </button>
            
            <AnimatePresence>
              {showLang && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-40 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        i18n.changeLanguage(lang.code);
                        setShowLang(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-xs font-bold transition-colors hover:bg-zinc-800",
                        i18n.language === lang.code ? "text-cyan-400 bg-cyan-500/5" : "text-gray-400"
                      )}
                    >
                      <span>{lang.flag}</span>
                      {lang.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-1.5 rounded-md border border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-black transition-all text-sm font-bold uppercase tracking-wider"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">{t('logout')}</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

const HackerBackground = () => (
  <div className="fixed inset-0 -z-10 bg-black overflow-hidden">
    {/* Main Background Image */}
    <div className="absolute inset-0 opacity-50">
      <img 
        src="https://69d6540182ab927176799632.imgix.net/channels4_banner.png" 
        alt="Background"
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
    </div>

    {/* Overlay Gradients */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60"></div>
    
    {/* Center Glow */}
    <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
      <div className="relative w-full max-w-4xl aspect-video">
        <div className="absolute inset-0 bg-cyan-500/20 blur-[120px] rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15vw] font-black text-cyan-400/10 select-none tracking-tighter italic uppercase">
          DARKBLAISEX
        </div>
      </div>
    </div>
    
    {/* Matrix-like falling lines */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: -100 }}
          animate={{ 
            opacity: [0, 0.7, 0], 
            y: [0, 1200],
            x: (i * 3.33) + '%'
          }}
          transition={{ 
            duration: Math.random() * 4 + 4, 
            repeat: Infinity, 
            delay: Math.random() * 5,
            ease: "linear"
          }}
          className="absolute w-[1px] h-32 bg-gradient-to-b from-cyan-400 to-transparent"
        />
      ))}
    </div>

    {/* Scanning line effect */}
    <motion.div 
      animate={{ y: ['0%', '100%', '0%'] }}
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      className="absolute inset-x-0 h-[2px] bg-cyan-500/20 blur-sm z-10 pointer-events-none"
    />
  </div>
);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Listen to user profile
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
          const isAdminEmail = firebaseUser.email === 'akrexsoft@gmail.com';
          
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            // Force admin role if email matches but role is not admin
            if (isAdminEmail && data.role !== 'admin') {
              updateDoc(userDocRef, { role: 'admin', isVip: true });
              // Update local state immediately with admin role to prevent redirect
              setUserProfile({ ...data, role: 'admin', isVip: true });
            } else {
              setUserProfile(data);
            }
          } else {
            // Create profile if it doesn't exist
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              role: isAdminEmail ? 'admin' : 'user',
              isVip: isAdminEmail,
              displayName: firebaseUser.displayName || (isAdminEmail ? 'Admin' : 'User')
            };
            setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          }
          setLoading(false);
        });
        return () => unsubscribeProfile();
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen text-gray-100 font-sans selection:bg-cyan-500 selection:text-black">
        <HackerBackground />
        <Navbar userProfile={userProfile} />
        
        <main className={cn("pt-16 pb-8 px-4 max-w-7xl mx-auto", !user && "pt-0")}>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
              
              <Route path="/" element={user ? <HomePage userProfile={userProfile} /> : <Navigate to="/login" />} />
              <Route path="/payment" element={user ? <PaymentPlanPage userProfile={userProfile} /> : <Navigate to="/login" />} />
              <Route path="/payment/crypto" element={user ? <CryptoPaymentPage userProfile={userProfile} /> : <Navigate to="/login" />} />
              <Route path="/profile" element={user ? <ProfilePage userProfile={userProfile} /> : <Navigate to="/login" />} />
              <Route path="/messages" element={user ? <MessagesPage userProfile={userProfile} /> : <Navigate to="/login" />} />
              
              <Route 
                path="/admin" 
                element={userProfile?.role === 'admin' ? <AdminPanelPage /> : <Navigate to="/" />} 
              />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </Router>
  );
}
