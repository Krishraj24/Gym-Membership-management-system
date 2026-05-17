import React, { useState, useEffect } from 'react';
import { auth, db, OperationType, handleFirestoreError } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { GymOwner } from './types';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AppDownloadPage from './components/AppDownloadPage';
import { motion, AnimatePresence } from 'motion/react';
import { LanguageProvider } from './context/LanguageContext';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [ownerData, setOwnerData] = useState<GymOwner | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExploring, setIsExploring] = useState(false);
  const [isDownloadingApp, setIsDownloadingApp] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        setIsExploring(false);
        try {
          const ownerDoc = await getDoc(doc(db, 'owners', user.uid));
          if (ownerDoc.exists()) {
            setOwnerData({ ...ownerDoc.data() as GymOwner, id: ownerDoc.id });
          } else {
            // New user, but data will be filled in dashboard setup
            setOwnerData(null);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `owners/${user.uid}`);
        }
      } else {
        setOwnerData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsExploring(false);
    setIsDownloadingApp(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-bg text-ink selection:bg-accent/30 selection:text-ink">
        <AnimatePresence mode="wait">
          {isDownloadingApp ? (
            <motion.div
              key="download"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <AppDownloadPage onBack={() => setIsDownloadingApp(false)} />
            </motion.div>
          ) : (user || isExploring) ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Dashboard 
                user={user} 
                ownerData={ownerData} 
                setOwnerData={setOwnerData} 
                handleLogout={handleLogout}
                isGuest={isExploring}
                onDownloadClick={() => setIsDownloadingApp(true)}
                onBackToLanding={() => {
                  setIsExploring(false);
                  setUser(null);
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LandingPage 
                onLogin={handleLogin} 
                onExplore={() => setIsExploring(true)} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </LanguageProvider>
  );
}
