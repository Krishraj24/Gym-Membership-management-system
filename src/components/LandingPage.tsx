import React from 'react';
import { Dumbbell, Users, TrendingUp, BarChart3, Image as ImageIcon, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

interface LandingPageProps {
  onLogin: () => void;
  onExplore: () => void;
}

export default function LandingPage({ onLogin, onExplore }: LandingPageProps) {
  const { t } = useLanguage();
  const features = [
    { icon: <Users className="h-6 w-6" />, title: t('member_tracking'), desc: t('member_tracking_desc') },
    { icon: <TrendingUp className="h-6 w-6" />, title: t('growth_analytics'), desc: t('growth_analytics_desc') },
    { icon: <BarChart3 className="h-6 w-6" />, title: t('revenue_insights'), desc: t('revenue_insights_desc') },
    { icon: <ImageIcon className="h-6 w-6" />, title: t('gym_of_fame'), desc: t('physique_gallery_desc') },
    { icon: <ShieldCheck className="h-6 w-6" />, title: t('secure_access'), desc: t('secure_access_desc') },
    { icon: <Dumbbell className="h-6 w-6" />, title: t('profile_management'), desc: t('profile_management_desc') },
  ];

  return (
    <div className="relative overflow-hidden bg-bg min-h-screen">
      {/* Decorative Grid */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Hero Section */}
      <div className="relative z-10 px-6 pt-20 lg:px-8">
        <div className="mx-auto max-w-4xl py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <div className="flex items-center gap-3 rounded-full bg-accent/10 px-4 py-1 text-sm font-semibold text-accent ring-1 ring-inset ring-accent/20">
              <Dumbbell className="h-4 w-4" />
              <span>Five Star Fitness Point</span>
            </div>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8 text-5xl font-bold tracking-tight text-ink sm:text-7xl font-serif"
          >
            {t('app_tagline')}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg leading-8 text-muted"
          >
            {t('app_desc')}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <button
              onClick={onLogin}
              className="btn-primary py-4 px-10 shadow-xl shadow-accent/10"
            >
              {t('sign_in')}
            </button>
            <button
              onClick={onLogin}
              className="btn-secondary py-4 px-10 border-accent/20 hover:border-accent/50"
            >
              {t('log_in')}
            </button>
            <button
              onClick={onExplore}
              className="text-ink font-semibold border-b border-border hover:text-accent hover:border-accent transition-all pb-1"
            >
              {t('explore_more')}
            </button>
          </motion.div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bento-card group flex flex-col items-start gap-4"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <div>
                  <dt className="text-lg font-semibold leading-7 text-ink">{feature.title}</dt>
                  <dd className="mt-1 text-base leading-7 text-muted">{feature.desc}</dd>
                </div>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>

      {/* App Promotion Message */}
      <div className="mx-auto max-w-7xl px-6 mb-24">
        <div className="relative group p-8 md:p-12 bg-accent/5 border border-accent/10 rounded-[2.5rem] overflow-hidden flex flex-col items-center text-center gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 space-y-4">
            <h3 className="text-2xl md:text-3xl font-bold text-ink font-serif tracking-tight">
              Access more feature in the app. Just download from the menu bar
            </h3>
            <p className="text-xs md:text-sm font-black text-accent uppercase tracking-[0.4em] flex items-center justify-center gap-4">
              <span className="w-12 h-px bg-accent/30" />
              ~Creater
              <span className="w-12 h-px bg-accent/30" />
            </p>
          </div>
          
          <button 
            onClick={onExplore}
            className="btn-primary py-4 px-12 text-sm relative z-10 hover:scale-105 transition-transform"
          >
            Start Exploring
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 border-t border-border mt-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="bg-accent text-black p-1 rounded font-black text-xs">5★</div>
              <span className="text-xl font-bold tracking-tight font-serif text-accent">Five Star Fitness Point</span>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-muted">
              <a href="#" className="hover:text-accent">{t('about_us')}</a>
              <a href="#" className="hover:text-accent">{t('contact_us')}</a>
              <a href="#" className="hover:text-accent">{t('privacy_policy')}</a>
              <a href="#" className="hover:text-accent">{t('terms_conditions')}</a>
            </div>
          </div>
          <div className="mt-8 text-center text-xs text-muted">
            &copy; {new Date().getFullYear()} Five Star Fitness Point. {t('premium_suite')}.
          </div>
        </div>
      </footer>
    </div>
  );
}
