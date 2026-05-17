import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { 
  X, 
  Languages, 
  Sun, 
  Moon, 
  Mail, 
  Check, 
  ChevronRight,
  Smartphone
} from 'lucide-react';

interface AppMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadClick?: () => void;
}

const INDIAN_LANGUAGES = [
  { id: 'en', name: 'English', native: 'English' },
  { id: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { id: 'bn', name: 'Bengali', native: 'বাংলা' },
  { id: 'te', name: 'Telugu', native: 'తెలుగు' },
  { id: 'mr', name: 'Marathi', native: 'मराठी' },
  { id: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { id: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { id: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { id: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { id: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { id: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { id: 'as', name: 'Assamese', native: 'অসমীয়া' },
  { id: 'ma', name: 'Maithili', native: 'मैथिली' },
  { id: 'sa', name: 'Sanskrit', native: 'संस्कृतम्' },
  { id: 'ks', name: 'Kashmiri', native: 'कश्मीरी' },
  { id: 'sd', name: 'Sindhi', native: 'سنڌي' },
  { id: 'ur', name: 'Urdu', native: 'اردو' },
  { id: 'ko', name: 'Konkani', native: 'कोंकणी' },
  { id: 'mn', name: 'Manipuri', native: 'মণিপুরী' },
  { id: 'bo', name: 'Bodo', native: 'बড়ো' },
  { id: 'do', name: 'Dogri', native: 'डोगरी' },
  { id: 'ne', name: 'Nepali', native: 'नेपाली' },
  { id: 'st', name: 'Santali', native: 'संताली' }
] as const;

export default function AppMenu({ isOpen, onClose, onDownloadClick }: AppMenuProps) {
  const { language, setLanguage, t } = useLanguage();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showLanguages, setShowLanguages] = useState(false);

  useEffect(() => {
    const isLight = document.documentElement.classList.contains('light');
    setIsDarkMode(!isLight);
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (!newMode) {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  const handleLangSelect = (langId: any) => {
    setLanguage(langId);
    setShowLanguages(false);
  };

  const menuItems = [
    {
      icon: <Languages className="w-5 h-5" />,
      label: t('change_language'),
      description: `${INDIAN_LANGUAGES.find(l => l.id === language)?.native || 'English'} selected`,
      action: () => setShowLanguages(true),
    },
    {
      icon: isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />,
      label: isDarkMode ? t('light_mode') : t('dark_mode'),
      description: `Switch to ${isDarkMode ? 'light' : 'dark'} theme`,
      action: toggleTheme,
    },
    {
      icon: <Mail className="w-5 h-5" />,
      label: t('contact_us'),
      description: 'Get in touch with support',
      action: () => window.location.href = 'mailto:rajkrish349@gmail.com',
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Menu Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 z-[60] w-full max-w-xs bg-card border-l border-border shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-accent">{t('menu')}</h3>
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1">Settings & Support</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full text-muted transition-colors"
                id="close-menu-btn"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <AnimatePresence mode="wait">
                {!showLanguages ? (
                  <motion.div
                    key="main-menu"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-1"
                  >
                    {menuItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={item.action}
                        className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all text-left group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                          {item.icon}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-ink">{item.label}</p>
                          <p className="text-[10px] text-muted font-medium mt-0.5">{item.description}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted/30 group-hover:text-accent transition-colors" />
                      </button>
                    ))}

                    <div className="mt-8 p-6 bg-accent/5 rounded-2xl border border-accent/10">
                      <div className="flex items-center gap-3 mb-4">
                        <Smartphone className="w-5 h-5 text-accent" />
                        <span className="text-xs font-bold text-accent uppercase tracking-widest">Mobile Ready</span>
                      </div>
                      <p className="text-[10px] text-muted font-medium leading-relaxed mb-4">
                        Take your gym management everywhere. Install our PWA for offline access and faster performance.
                      </p>
                      <button 
                        onClick={() => {
                          onClose();
                          onDownloadClick?.();
                        }}
                        className="w-full py-2 bg-accent text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-lg shadow-lg shadow-accent/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        Get App Now
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="language-menu"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-1"
                  >
                    <button 
                      onClick={() => setShowLanguages(false)}
                      className="flex items-center gap-2 p-2 text-[10px] font-bold text-accent uppercase tracking-widest mb-4 hover:translate-x-[-4px] transition-transform"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" /> {t('back')}
                    </button>
                    
                    <div className="grid grid-cols-1 gap-1">
                      {INDIAN_LANGUAGES.map((lang) => (
                        <button
                          key={lang.id}
                          onClick={() => handleLangSelect(lang.id)}
                          className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                            language === lang.id 
                              ? 'bg-accent/10 border border-accent/20' 
                              : 'hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          <div className="text-left">
                            <p className={`text-sm font-bold ${language === lang.id ? 'text-accent' : 'text-ink'}`}>
                              {lang.native}
                            </p>
                            <p className="text-[10px] text-muted uppercase tracking-widest">{lang.name}</p>
                          </div>
                          {language === lang.id && <Check className="w-4 h-4 text-accent" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border">
              <div className="flex justify-between items-center text-[10px] font-bold text-muted uppercase tracking-widest">
                <span>Version 2.4.0</span>
                <div className="flex gap-4">
                  <a href="#" className="hover:text-accent">Help</a>
                  <a href="#" className="hover:text-accent">Legal</a>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
