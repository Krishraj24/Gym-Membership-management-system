import React, { useState, useEffect } from 'react';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Member, GymOwner } from '../types';
import OwnerProfileSection from './OwnerProfileSection';
import MemberActions from './MemberActions';
import AnalyticsSection from './AnalyticsSection';
import GymOfFame from './GymOfFame';
import { motion } from 'motion/react';
import { Dumbbell, LogOut, ChevronLeft, Trophy, Menu } from 'lucide-react';
import AppMenu from './AppMenu';
import { useLanguage } from '../context/LanguageContext';

interface DashboardProps {
  user: any;
  ownerData: GymOwner | null;
  setOwnerData: (data: GymOwner) => void;
  handleLogout: () => void;
  isGuest?: boolean;
  onBackToLanding?: () => void;
  onDownloadClick?: () => void;
}

export default function Dashboard({ user, ownerData, setOwnerData, handleLogout, isGuest, onBackToLanding, onDownloadClick }: DashboardProps) {
  const { t } = useLanguage();
  const [members, setMembers] = useState<Member[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // If not guest, listen to members
    if (user) {
      const q = query(collection(db, 'members'), where('ownerId', '==', user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetched = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Member));
        setMembers(fetched);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'members');
      });
      return () => unsubscribe();
    }
  }, [user]);

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Background Decorative Grid */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-bg/80 backdrop-blur-md border-b border-border px-6 h-16 flex items-center">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={onBackToLanding}>
            {ownerData?.photoUrl ? (
              <img src={ownerData.photoUrl} className="w-8 h-8 rounded-lg object-cover border border-accent/20 transition-transform group-hover:scale-110" alt="Logo" />
            ) : (
              <div className="bg-accent text-black p-1.5 rounded-lg font-black text-sm transition-transform group-hover:rotate-12">5★</div>
            )}
            <span className="text-base sm:text-xl font-bold tracking-tight font-serif text-accent truncate max-w-[150px] sm:max-w-none">
              {ownerData?.gymName || "Five Star Fitness Point"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {isGuest ? (
              <button 
                onClick={onBackToLanding}
                className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase tracking-widest hover:text-accent transition-colors"
                id="back-to-intro"
              >
                <ChevronLeft className="h-4 w-4" /> Back to Intro
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <div className="hidden sm:block text-right leading-none">
                  <p className="text-[10px] font-bold text-ink uppercase tracking-widest mb-0.5">{user?.displayName}</p>
                  <p className="text-[8px] font-bold text-muted uppercase tracking-[0.2em]">{t('gym_owner')}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-muted hover:text-red-500 transition-all border border-border rounded-lg"
                  id="logout-button"
                  title={t('logout')}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
            
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-2 text-accent hover:bg-accent/10 transition-all border border-accent/20 rounded-lg ml-2"
              id="hamburger-menu-btn"
              title={t('menu')}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <AppMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onDownloadClick={onDownloadClick} />

      {/* Main Content */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {isGuest && (
            <div className="mb-6 px-4 py-2 bg-accent/10 text-accent rounded-full border border-accent/20 text-[10px] font-black uppercase tracking-[0.2em] text-center">
              {t('explore_mode')}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Column: Management & Profile */}
            <div className="lg:col-span-4 space-y-6">
              <OwnerProfileSection 
                ownerData={ownerData} 
                setOwnerData={setOwnerData} 
                userId={user?.uid || 'guest'}
                isGuest={isGuest}
              />
              <div className="bento-card">
                <div className="section-header">{t('fast_operations')}</div>
                <MemberActions 
                  ownerId={user?.uid || ''} 
                  ownerData={ownerData}
                  isGuest={isGuest}
                />
              </div>
            </div>

            {/* Right Column: Analytics & Gallery */}
            <div className="lg:col-span-8 space-y-4">
              <GymOfFame 
                ownerId={user?.uid || 'fivestar_official'} 
                isGuest={isGuest}
              />
              <AnalyticsSection 
                members={members} 
                ownerData={ownerData}
              />
            </div>
          </div>
        </motion.div>
      </main>

      {/* App Promotion Message */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 mb-8 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="p-8 bg-accent/5 border border-accent/10 rounded-3xl backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
          
          <div className="flex-1 space-y-2 relative z-10">
            <h4 className="text-lg md:text-xl font-bold text-ink tracking-tight font-serif">
              Access more feature in the app. Just download from the menu bar
            </h4>
            <p className="text-[10px] text-accent font-black tracking-[0.3em] uppercase flex items-center gap-2">
              <span className="w-8 h-px bg-accent/30" />
              ~Creater
            </p>
          </div>
          
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="px-8 py-3 bg-accent text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all relative z-10 whitespace-nowrap"
          >
            Go to Menu
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-12 px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            {ownerData?.photoUrl ? (
              <img src={ownerData.photoUrl} className="w-6 h-6 rounded-md object-cover opacity-80" alt="Logo" />
            ) : (
              <div className="bg-accent text-black p-1.5 rounded font-black text-xs">5★</div>
            )}
            <span className="font-bold text-accent font-serif truncate max-w-[200px]">
              {ownerData?.gymName || "Five Star Fitness Point"}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-[10px] font-bold text-muted uppercase tracking-widest">
            <a href="#" className="hover:text-accent transition-colors">About</a>
            <a href="#" className="hover:text-accent transition-colors">Contact</a>
            <a href="#" className="hover:text-accent transition-colors">Privacy</a>
            <a href="#" className="hover:text-accent transition-colors">Terms</a>
          </div>
          <div className="text-[10px] font-bold text-muted/50 uppercase tracking-widest">
            &copy; 2026 Premium Suite
          </div>
        </div>
      </footer>
    </div>
  );
}
