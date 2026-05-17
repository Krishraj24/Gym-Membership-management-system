import React, { useMemo, useState } from 'react';
import { Member, GymOwner } from '../types';
import { Users, TrendingUp, TrendingDown, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Timestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

interface AnalyticsSectionProps {
  members: Member[];
  ownerData: GymOwner | null;
}

export default function AnalyticsSection({ members, ownerData }: AnalyticsSectionProps) {
  const { t } = useLanguage();
  const [showRevenue, setShowRevenue] = useState(false);

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const activeMembers = members.filter(m => {
      const end = new Date(m.endDate instanceof Timestamp ? m.endDate.toDate() : m.endDate);
      return end >= now && m.status === 'active';
    });

    const membersThisMonth = members.filter(m => {
      const created = new Date(m.createdAt instanceof Timestamp ? m.createdAt.toDate() : m.createdAt);
      return created.getMonth() === currentMonth && created.getFullYear() === currentYear;
    }).length;

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const membersLastMonth = members.filter(m => {
      const created = new Date(m.createdAt instanceof Timestamp ? m.createdAt.toDate() : m.createdAt);
      return created.getMonth() === lastMonth.getMonth() && created.getFullYear() === lastMonth.getFullYear();
    }).length;

    const growth = membersThisMonth - membersLastMonth;
    
    // Chart data: growth by day for this month vs last month
    const chartData = Array.from({ length: 31 }, (_, i) => {
      const day = i + 1;
      const countThisMonth = members.filter(m => {
        const d = new Date(m.createdAt instanceof Timestamp ? m.createdAt.toDate() : m.createdAt);
        return d.getMonth() === currentMonth && d.getDate() <= day;
      }).length;
      
      const countLastMonth = members.filter(m => {
        const d = new Date(m.createdAt instanceof Timestamp ? m.createdAt.toDate() : m.createdAt);
        return d.getMonth() === lastMonth.getMonth() && d.getDate() <= day;
      }).length;

      return { name: `Day ${day}`, thisMonth: countThisMonth, lastMonth: countLastMonth };
    });

    return { activeMembers: activeMembers.length, growth, chartData, membersThisMonth };
  }, [members]);

  const revenueStats = useMemo(() => {
    const now = new Date();
    const formatDateKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}`;
    const todayStr = now.toDateString();

    const todayCollection = members
      .filter(m => {
        const d = new Date(m.createdAt instanceof Timestamp ? m.createdAt.toDate() : m.createdAt);
        return d.toDateString() === todayStr;
      })
      .reduce((acc, m) => acc + m.amountPaid, 0);

    const thisMonthCollection = members
      .filter(m => {
        const d = new Date(m.createdAt instanceof Timestamp ? m.createdAt.toDate() : m.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((acc, m) => acc + m.amountPaid, 0);

    const totalCollection = members.reduce((acc, m) => acc + m.amountPaid, 0);

    // Revenue by month for chart
    const monthMap: Record<string, number> = {};
    members.forEach(m => {
      const d = new Date(m.createdAt instanceof Timestamp ? m.createdAt.toDate() : m.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      monthMap[key] = (monthMap[key] || 0) + m.amountPaid;
    });

    const revenueChartData = Object.entries(monthMap).map(([name, total]) => ({ 
      name, 
      total 
    })).sort((a, b) => a.name.localeCompare(b.name));

    return { todayCollection, thisMonthCollection, totalCollection, revenueChartData };
  }, [members]);

  return (
    <div className="space-y-4">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('active_members'), value: stats.activeMembers, icon: <Users className="h-4 w-4" />, color: 'text-emerald-500' },
          { label: t('this_month'), value: stats.membersThisMonth, icon: <TrendingUp className="h-4 w-4" />, color: 'text-accent' },
          { label: t('today_revenue'), value: `₹${revenueStats.todayCollection}`, icon: <BarChart3 className="h-4 w-4" />, color: 'text-blue-500' },
          { label: t('total_sales'), value: `₹${revenueStats.totalCollection}`, icon: <TrendingUp className="h-4 w-4" />, color: 'text-accent' },
        ].map((stat, idx) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="bento-card p-4 flex flex-col gap-1"
          >
            <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase tracking-widest">
              {stat.icon} {stat.label}
            </div>
            <div className={`text-xl font-black font-serif ${stat.color}`}>
              {stat.value}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Membership Trend */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bento-card p-6"
        >
          <div className="section-header border-none mb-6">
            <div>
              <h2 className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-accent" /> {t('growth_tracking')}
              </h2>
              <p className="text-lg font-bold text-ink font-serif mt-1">{t('membership_trend')}</p>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="var(--muted)" 
                  fontSize={8} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                  interval={4}
                />
                <YAxis 
                  stroke="var(--muted)" 
                  fontSize={8} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    border: '1px solid var(--border)', 
                    borderRadius: '12px', 
                    fontSize: '10px', 
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    color: 'var(--ink)'
                  }}
                  itemStyle={{ color: 'var(--accent)', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="thisMonth" 
                  stroke="var(--accent)" 
                  strokeWidth={3} 
                  dot={{ r: 3, fill: 'var(--accent)', strokeWidth: 0 }} 
                  activeDot={{ r: 5, strokeWidth: 0 }}
                  name={t('this_month')}
                />
                <Line 
                  type="monotone" 
                  dataKey="lastMonth" 
                  stroke="var(--muted)" 
                  strokeWidth={2} 
                  strokeDasharray="5 5"
                  strokeOpacity={0.4}
                  dot={false}
                  name="Last Month"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Revenue Trend */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bento-card p-6"
        >
          <div className="section-header border-none mb-6">
            <div>
              <h2 className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-2">
                <BarChart3 className="h-3 w-3 text-accent" /> {t('financial_health')}
              </h2>
              <p className="text-lg font-bold text-ink font-serif mt-1">{t('monthly_revenue')}</p>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueStats.revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="var(--muted)" 
                  fontSize={8} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="var(--muted)" 
                  fontSize={8} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    border: '1px solid var(--border)', 
                    borderRadius: '12px', 
                    fontSize: '10px', 
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    color: 'var(--ink)'
                  }}
                  itemStyle={{ color: 'var(--accent)', fontWeight: 'bold' }}
                />
                <Bar 
                  dataKey="total" 
                  fill="var(--accent)" 
                  radius={[4, 4, 0, 0]} 
                  opacity={0.8}
                  name={t('monthly_revenue')}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function BarChart3_Local(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" fill="none" 
      stroke="currentColor" strokeWidth="2" 
      strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
    </svg>
  );
}
