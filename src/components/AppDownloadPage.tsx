import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Smartphone, 
  Zap, 
  Globe, 
  UserCircle2, 
  RefreshCw,
  Database,
  Download,
  ShieldCheck,
  BarChart3,
  MessageSquare
} from 'lucide-react';

interface AppDownloadPageProps {
  onBack: () => void;
}

export default function AppDownloadPage({ onBack }: AppDownloadPageProps) {
  const [downloadReady, setDownloadReady] = useState(false);

  const features = [
    { icon: <ShieldCheck className="w-6 h-6" />, text: "Ads Free Experience" },
    { icon: <Globe className="w-6 h-6" />, text: "No need to access website" },
    { icon: <UserCircle2 className="w-6 h-6" />, text: "Personalised App" },
    { icon: <RefreshCw className="w-6 h-6" />, text: "PARTIAL INTERNET REQUIRED" },
    { icon: <Zap className="w-6 h-6" />, text: "MORE AND BETTER FEATURES FROM WEBSITE" },
    { icon: <Smartphone className="w-6 h-6" />, text: "Easy to switch from website to app" },
    { icon: <Database className="w-6 h-6" />, text: "No Data Loss" },
    { icon: <BarChart3 className="w-6 h-6" />, text: "Get more Features for analysis" },
    { icon: <MessageSquare className="w-6 h-6" />, text: "Send automated message" },
  ];

  return (
    <div className="min-h-screen bg-bg p-6 md:p-12 relative overflow-hidden">
      {/* Background shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-4xl mx-auto relative z-10">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-muted hover:text-accent transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span className="font-bold uppercase tracking-widest text-xs">Back to Home</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 rounded-full border border-accent/20 mb-4 transition-transform hover:scale-105 cursor-default">
                <Smartphone className="w-4 h-4 text-accent" />
                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-accent">Official Release</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-ink mb-4 leading-tight font-serif tracking-tighter">
                Gym Management <br /><span className="text-accent underline decoration-4 underline-offset-4">Simplified.</span>
              </h1>
              <p className="text-muted text-sm leading-relaxed max-w-md">
                Experience the full power of Five Star Fitness Point on your smartphone. Track attendance, manage memberships, and generate reports—all in one lightning-fast app.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="flex items-center gap-3 p-3 bg-accent/5 rounded-xl border border-accent/10 transition-all hover:bg-accent/10 hover:border-accent/20 group"
                >
                  <div className="p-2 bg-bg rounded-lg text-accent border border-accent/10 shadow-sm group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <span className="text-[11px] font-bold text-ink uppercase tracking-wider">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-accent/5 border-2 border-dashed border-accent/30 rounded-[2.5rem] p-8 text-center relative"
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 p-4 bg-accent rounded-2xl shadow-xl shadow-accent/20">
                <Download className="w-8 h-8 text-black" />
              </div>
              
              <div className="mt-8 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-ink tracking-tight">App Download</h3>
                  <p className="text-xs text-muted font-bold tracking-widest uppercase">Version 2.0.4 • 12MB</p>
                </div>

                <div className="p-4 bg-bg rounded-2xl border border-accent/10 space-y-4">
                  <div className="flex justify-between items-center text-xs font-black tracking-widest uppercase">
                    <span className="text-muted">Download APK version</span>
                    <span className="text-accent">Available</span>
                  </div>
                  <div className="h-px bg-accent/10" />
                  <p className="text-[10px] text-muted text-left flex items-start gap-2">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                    Secure direct download of the official Android application package.
                  </p>
                </div>

                {downloadReady ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">Link Generated</span>
                    </div>
                    {/* The link will be manually added by the user as per request */}
                    <a 
                      href="#" 
                      className="w-full py-4 bg-emerald-500 text-white text-sm font-black uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <Download className="w-5 h-5" />
                      Final APK Download
                    </a>
                  </motion.div>
                ) : (
                  <button 
                    onClick={() => setDownloadReady(true)}
                    className="w-full py-4 bg-accent text-black text-sm font-black uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all group"
                  >
                    <Download className="w-5 h-5 transition-transform group-hover:rotate-12" />
                    Download App version
                  </button>
                )}
                
                <p className="text-[10px] text-muted font-medium italic">
                  Click the button above to access the direct download link.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
