import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { TrendingUp, Users, Eye, MousePointer2, Calendar, ArrowUpRight, ArrowDownRight, ShieldAlert } from 'lucide-react';

interface AnalyticsData {
  impressions: number;
  signups: number;
  conversionRate: number;
  dailyTrends: { date: string, impressions: number, signups: number }[];
}

export default function PerformanceDashboard() {
  const [data, setData] = useState<AnalyticsData>({
    impressions: 0,
    signups: 0,
    conversionRate: 0,
    dailyTrends: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setAuthError(true);
        setIsLoading(false);
        return;
      }

      const path = 'analyticsEvents';
      const q = query(collection(db, path), orderBy('timestamp', 'desc'));
      
      const unsubscribeSnap = onSnapshot(q, (snapshot) => {
        const events = snapshot.docs.map(doc => doc.data());
        setAuthError(false);
        
        const impressions = events.filter(e => e.type === 'impression').length;
        const signups = events.filter(e => e.type === 'signup').length;
        const conversionRate = impressions > 0 ? (signups / impressions) * 100 : 0;

        const last7Days = [...Array(7)].map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toISOString().split('T')[0];
        }).reverse();

        const dailyTrends = last7Days.map(date => {
          const dayEvents = events.filter(e => {
            if (!e.timestamp || typeof e.timestamp.toDate !== 'function') return false;
            const eventDate = e.timestamp.toDate().toISOString().split('T')[0];
            return eventDate === date;
          });
          return {
            date: new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
            impressions: dayEvents.filter(e => e.type === 'impression').length,
            signups: dayEvents.filter(e => e.type === 'signup').length
          };
        });

        setData({
          impressions,
          signups,
          conversionRate,
          dailyTrends
        });
        setIsLoading(false);
      }, (error) => {
        if (error.code === 'permission-denied') {
          setAuthError(true);
        } else {
          try {
            handleFirestoreError(error, OperationType.LIST, path);
          } catch (e) {
            // Logged
          }
        }
        setIsLoading(false);
      });

      return () => unsubscribeSnap();
    });

    return () => unsubscribeAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C5A02E]"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[400px]">
      {authError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-6 p-12 bg-white/95 dark:bg-slate-950/95 z-20 animate-in fade-in duration-300">
          <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-none flex items-center justify-center">
            <ShieldAlert className="h-10 w-10 text-rose-500" />
          </div>
          <div className="space-y-2 max-w-sm">
            <h5 className="font-serif font-bold text-[#0A1D37] dark:text-white text-lg uppercase tracking-tight">Access Restricted</h5>
            <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed font-sans">
              Real-time performance metrics require verified administrator credentials. Please ensure you have completed the Google SSO verification in the login portal.
            </p>
          </div>
        </div>
      )}

      <div className={`space-y-8 animate-in fade-in duration-200 ${authError ? 'blur-sm pointer-events-none' : ''}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#0A1D37] dark:text-white uppercase tracking-tight">Performance Analytics</h2>
            <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase tracking-widest font-sans mt-1">Newsletter Conversion Funnel • Real-time Metrics</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 rounded-none">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Live Monitoring Active</span>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 rounded-none space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-[#0A1D37] dark:bg-[#C5A02E] text-white">
                <Eye className="h-4 w-4" />
              </div>
              <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5">
                <ArrowUpRight className="h-3 w-3" /> 12%
              </span>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold tracking-widest">Total Impressions</p>
              <p className="text-3xl font-mono tabular-nums font-bold text-[#0A1D37] dark:text-white mt-1">{data.impressions.toLocaleString()}</p>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-slate-400 font-sans">Unique views of the newsletter module</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 rounded-none space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-[#C5A02E] text-white">
                <Users className="h-4 w-4" />
              </div>
              <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5">
                <ArrowUpRight className="h-3 w-3" /> 8%
              </span>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold tracking-widest">Net New Subscribers</p>
              <p className="text-3xl font-mono tabular-nums font-bold text-[#0A1D37] dark:text-white mt-1">{data.signups.toLocaleString()}</p>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-slate-400 font-sans">Confirmed corporate email registrations</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 rounded-none space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-[#F4F7F9] dark:bg-slate-800 text-[#0A1D37] dark:text-white">
                <TrendingUp className="h-4 w-4" />
              </div>
              <span className="text-[10px] text-rose-500 font-bold flex items-center gap-0.5">
                <ArrowDownRight className="h-3 w-3" /> 2%
              </span>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold tracking-widest">Conversion Velocity</p>
              <p className="text-3xl font-mono tabular-nums font-bold text-[#C5A02E] mt-1">{data.conversionRate.toFixed(1)}%</p>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-slate-400 font-sans">Percentage of viewers who subscribed</p>
          </div>
        </div>

        {/* Trends Chart */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-8 rounded-none shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="font-serif font-bold text-sm text-[#0A1D37] dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#C5A02E]" />
                7-Day Engagement Velocity
              </h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#0A1D37]/10 dark:bg-white/10" />
                <span className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold">Impressions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#C5A02E]" />
                <span className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold">Signups</span>
              </div>
            </div>
          </div>

          <div className="h-64 flex items-end justify-between gap-4 px-4">
            {data.dailyTrends.map((day, idx) => {
              const maxVal = Math.max(...data.dailyTrends.map(d => d.impressions), 1);
              const impHeight = (day.impressions / maxVal) * 100;
              const sigHeight = (day.signups / maxVal) * 100;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-3 group">
                  <div className="w-full flex items-end justify-center gap-1 h-full relative">
                    <div 
                      style={{ height: `${impHeight}%` }} 
                      className="w-4 bg-[#0A1D37]/10 dark:bg-white/10 group-hover:bg-[#0A1D37]/20 dark:group-hover:bg-white/20 transition-all"
                      title={`${day.impressions} impressions`}
                    />
                    <div 
                      style={{ height: `${sigHeight}%` }} 
                      className="w-4 bg-[#C5A02E] group-hover:bg-[#A68625] transition-all relative"
                      title={`${day.signups} signups`}
                    >
                      {day.signups > 0 && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#0A1D37] dark:bg-[#C5A02E] text-white text-[9px] px-1.5 py-0.5 rounded-none opacity-0 group-hover:opacity-100 transition-opacity">
                          {day.signups}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-[9px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-tighter whitespace-nowrap">{day.date}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
