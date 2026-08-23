import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  IndianRupee, 
  Lightbulb, 
  TrendingDown, 
  RefreshCw,
  PlusCircle,
  History,
  MessageSquare,
  UserCheck
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import type { DailySalesEntry } from '../services/mockData';
import type { UserProfile } from '../services/api';

// Recharts Custom Tooltip (Dark Mode Compatible)
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-sm text-xs transition-colors duration-200">
        <p className="font-bold text-slate-500 dark:text-slate-400 mb-1.5">{label}</p>
        <div className="space-y-1 font-bold">
          <p className="text-emerald-600 dark:text-emerald-400">Sales: ₹{payload[0].value}</p>
          {payload[1] && <p className="text-red-500 dark:text-red-400">Expense: ₹{payload[1].value}</p>}
          {payload[0] && payload[1] && (
            <p className="text-slate-800 dark:text-slate-200 border-t border-slate-100 dark:border-slate-800 pt-1 mt-1">
              Profit: ₹{payload[0].value - payload[1].value}
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

interface DashboardProps {
  user: UserProfile;
  apiService: {
    getSales: () => Promise<DailySalesEntry[]>;
    getInsights: () => Promise<any>;
  };
  refreshTrigger: number;
  setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, apiService, refreshTrigger, setActiveTab }) => {
  const [sales, setSales] = useState<DailySalesEntry[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const salesData = await apiService.getSales();
      setSales(salesData);
    } catch (err: any) {
      setError('Data load nahi ho paya. Kripya reload karein.');
    }

    try {
      const insightsData = await apiService.getInsights();
      setInsights(insightsData);
    } catch (err: any) {
      console.warn('Insights failed to load (possibly no sales data yet):', err);
      setInsights(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [refreshTrigger]);

  // Compute stats for today/latest entry
  const getLatestStats = () => {
    if (sales.length === 0) return { revenue: 0, expense: 0, profit: 0, date: 'N/A' };
    const latest = sales[sales.length - 1];
    const revenue = latest.items.reduce((acc, curr) => acc + (curr.qtySold * curr.price), 0);
    const expense = latest.totalExpense;
    const profit = revenue - expense;
    return { revenue, expense, profit, date: latest.date };
  };

  const latestStats = getLatestStats();

  // Dynamic Sales Trend calculator comparing latest with previous day
  const getSalesTrends = () => {
    if (sales.length < 2) return { salesDiff: null, expenseDiff: null, profitDiff: null };
    const latest = sales[sales.length - 1];
    const prev = sales[sales.length - 2];

    const latestRev = latest.items.reduce((acc, curr) => acc + (curr.qtySold * curr.price), 0);
    const prevRev = prev.items.reduce((acc, curr) => acc + (curr.qtySold * curr.price), 0);
    const salesDiff = prevRev > 0 ? ((latestRev - prevRev) / prevRev) * 100 : null;

    const latestExp = latest.totalExpense;
    const prevExp = prev.totalExpense;
    const expenseDiff = prevExp > 0 ? ((latestExp - prevExp) / prevExp) * 100 : null;

    const latestProf = latestRev - latestExp;
    const prevProf = prevRev - prevExp;
    const profitDiff = prevProf !== 0 ? ((latestProf - prevProf) / Math.abs(prevProf)) * 100 : null;

    return { salesDiff, expenseDiff, profitDiff };
  };

  const trends = getSalesTrends();

  // Format Recharts data: limit to last 7 days of entries
  const chartData = sales.slice(-7).map(entry => {
    const revenue = entry.items.reduce((acc, curr) => acc + (curr.qtySold * curr.price), 0);
    const dateObj = new Date(entry.date);
    const label = isNaN(dateObj.getTime()) 
      ? entry.date 
      : dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      
    return {
      date: label,
      Bikri: revenue,
      Kharch: entry.totalExpense,
      Profit: revenue - entry.totalExpense
    };
  });


  // Skeleton Loader View
  if (loading && sales.length === 0) {
    return (
      <div className="space-y-6 max-w-full mx-auto animate-pulse">
        {/* Banner Greeting Loader */}
        <div className="h-20 bg-slate-200 dark:bg-slate-800/60 rounded-2xl"></div>
        {/* KPI Cards Loader */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-24 bg-slate-200 dark:bg-slate-800/60 rounded-2xl"></div>
          <div className="h-24 bg-slate-200 dark:bg-slate-800/60 rounded-2xl"></div>
          <div className="h-24 bg-slate-200 dark:bg-slate-800/60 rounded-2xl"></div>
        </div>
        {/* Chart and Sidebars Loader */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-slate-200 dark:bg-slate-800/60 rounded-3xl"></div>
          <div className="h-72 bg-slate-200 dark:bg-slate-800/60 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  // Greeting Message based on time of day
  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good morning / नमस्ते';
    if (hrs < 17) return 'Good afternoon / नमस्कार';
    return 'Good evening / शुभ संध्या';
  };

  return (
    <div className="space-y-6 max-w-full mx-auto transition-colors duration-200">
      {/* 1. Header Greeting Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 shadow-sm space-y-4 sm:space-y-0 transition-colors duration-200">
        <div>
          <h2 className="text-lg font-extrabold text-slate-800 dark:text-white tracking-tight">
            {getGreeting()}, {user.name} 👋
          </h2>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1 flex items-center space-x-2">
            <span>📍 {user.location}</span>
            <span>•</span>
            <span>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </p>
        </div>
        
        <div className="flex items-center space-x-3 self-start sm:self-center">
          <span className="flex items-center space-x-1.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 py-1 px-3 rounded-full text-[10px] font-bold text-emerald-700 dark:text-emerald-400 select-none">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Account Active / सक्रिय</span>
          </span>
          <button 
            onClick={loadDashboardData}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:text-slate-800 dark:hover:text-slate-200 transition-colors duration-150"
            title="Refresh Dashboard"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/40 p-3.5 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {/* 2. Overview Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Today's Sales */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-colors duration-200">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Today's Sales / आज की बिक्री</span>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-slate-800 dark:text-white leading-none">
              ₹{latestStats.revenue}
            </div>
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-2 flex items-center">
              {trends.salesDiff !== null ? (
                <>
                  <span className={trends.salesDiff >= 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-red-500 font-bold'}>
                    {trends.salesDiff >= 0 ? '↑' : '↓'} {Math.abs(trends.salesDiff).toFixed(1)}%
                  </span>
                  <span className="ml-1">vs previous record</span>
                </>
              ) : (
                <span>First recorded sales day</span>
              )}
            </p>
          </div>
        </div>

        {/* Today's Expenses */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-colors duration-200">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Today's Expense / आज का खर्च</span>
            <TrendingDown size={16} className="text-red-400 dark:text-red-500" />
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-slate-800 dark:text-white leading-none">
              ₹{latestStats.expense}
            </div>
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-2 flex items-center">
              {trends.expenseDiff !== null ? (
                <>
                  <span className={trends.expenseDiff <= 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-red-500 font-bold'}>
                    {trends.expenseDiff >= 0 ? '↑' : '↓'} {Math.abs(trends.expenseDiff).toFixed(1)}%
                  </span>
                  <span className="ml-1">vs previous record</span>
                </>
              ) : (
                <span>First recorded expense day</span>
              )}
            </p>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-colors duration-200">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Net Profit / शुद्ध मुनाफा</span>
            <span className="text-xs font-bold text-slate-400"><IndianRupee size={15} /></span>
          </div>
          <div className="mt-4">
            <div className={`text-2xl font-extrabold leading-none ${latestStats.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
              {latestStats.profit >= 0 ? '+' : ''}₹{latestStats.profit}
            </div>
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-2 flex items-center">
              {trends.profitDiff !== null ? (
                <>
                  <span className={trends.profitDiff >= 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-red-500 font-bold'}>
                    {trends.profitDiff >= 0 ? '↑' : '↓'} {Math.abs(trends.profitDiff).toFixed(1)}%
                  </span>
                  <span className="ml-1">vs previous record</span>
                </>
              ) : (
                <span>Calculating profit trend</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Weekly Chart & Recent Sales List */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recharts Area Chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 transition-colors duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Sales & Expense Trend / बिक्री एवं खर्च रिपोर्ट
              </h3>
              <span className="text-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold py-0.5 px-2 rounded-lg">
                Last 7 Records
              </span>
            </div>
            
            {chartData.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-xs text-slate-400 dark:text-slate-500 font-bold">
                Koi data nahi mila. Pehle sales record add karein.
              </div>
            ) : (
              <div className="h-56 w-full -ml-8 text-[9px] font-bold">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 5, left: 5, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorBikri" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                      </linearGradient>
                      <linearGradient id="colorKharch" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.01}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:hidden" />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" className="hidden dark:block" />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconSize={8} iconType="circle" verticalAlign="top" height={28} />
                    <Area name="Sales (बिक्री)" type="monotone" dataKey="Bikri" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBikri)" />
                    <Area name="Expense (खर्च)" type="monotone" dataKey="Kharch" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorKharch)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Recent Sales Section (Requirement 13) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 transition-colors duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <History size={14} className="text-slate-400" />
                <span>Recent Records / हालिया बिक्री सूची</span>
              </h3>
              <button 
                onClick={() => setActiveTab('sales')}
                className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
              >
                View All →
              </button>
            </div>

            {sales.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500 font-medium">
                <p>Koi sales record nahi mila. Apna pehla sales jodein!</p>
                <button
                  onClick={() => setActiveTab('sales')}
                  className="mt-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-xl text-xs"
                >
                  + Add Sale
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-2.5">Date</th>
                      <th className="py-2.5">Items Summary</th>
                      <th className="py-2.5 text-right">Expense</th>
                      <th className="py-2.5 text-right">Net Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {sales.slice(-4).reverse().map((entry) => {
                      const entryRev = entry.items.reduce((acc, curr) => acc + (curr.qtySold * curr.price), 0);
                      const netProfit = entryRev - entry.totalExpense;
                      const itemsSummary = entry.items.map(it => `${it.name} (${it.qtySold})`).join(', ');

                      return (
                        <tr key={entry.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="py-3 font-bold text-slate-700 dark:text-slate-200">{entry.date}</td>
                          <td className="py-3 max-w-[160px] truncate pr-2" title={itemsSummary}>{itemsSummary}</td>
                          <td className="py-3 text-right">₹{entry.totalExpense}</td>
                          <td className={`py-3 text-right font-bold ${netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                            {netProfit >= 0 ? '+' : ''}₹{netProfit}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Insights & Quick Actions */}
        <div className="space-y-6">
          
          {/* Quick Actions Card (Requirement 12) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 transition-colors duration-200">
            <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
              Quick Actions / त्वरित लिंक
            </h3>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <button
                onClick={() => setActiveTab('sales')}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300 transition-colors font-bold space-y-1.5"
              >
                <PlusCircle size={18} className="text-emerald-500" />
                <span>+ Add Sale</span>
              </button>
              
              <button
                onClick={() => setActiveTab('sales')}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300 transition-colors font-bold space-y-1.5"
              >
                <History size={18} className="text-slate-500" />
                <span>History</span>
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300 transition-colors font-bold space-y-1.5"
              >
                <UserCheck size={18} className="text-blue-500" />
                <span>Settings</span>
              </button>
              
              <button
                onClick={() => setActiveTab('chat')}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300 transition-colors font-bold space-y-1.5"
              >
                <MessageSquare size={18} className="text-purple-500" />
                <span>Ask AI</span>
              </button>
            </div>
          </div>

          {/* AI Cash-Flow Health Score */}
          {insights && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 transition-colors duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-305 uppercase tracking-wider">
                  Cash-Flow Analysis / कैश-फ्लो
                </h3>
                <span className={`text-[9px] font-extrabold uppercase py-1 px-3.5 rounded-full border ${insights.scoreColor}`}>
                  {insights.cashFlowScore}
                </span>
              </div>

              {/* Savings Tip Box */}
              <div className="flex items-start space-x-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-3.5 rounded-xl text-xs">
                <Lightbulb className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                <div className="space-y-1 text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-slate-800 dark:text-white block">Savings Tip / बचत सुझाव</span>
                  <p className="font-semibold leading-relaxed">{insights.savingsTip}</p>
                </div>
              </div>
            </div>
          )}

          {/* AI Demand Prediction Card */}
          {insights && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 transition-colors duration-200">
              <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-305 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
                Market Demand / कल की मांग
              </h3>

              <div className="space-y-3">
                <p 
                  className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed" 
                  dangerouslySetInnerHTML={{ __html: insights.demandPrediction }} 
                />

                {/* Restock suggestions list */}
                {insights.restockTips && insights.restockTips.length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-3.5 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-550 block uppercase tracking-wider">
                      Restock Tips / सामान भरने की सलाह:
                    </span>
                    <ul className="text-[11px] font-bold text-slate-605 dark:text-slate-300 space-y-1 list-inside list-disc">
                      {insights.restockTips.map((tip: string, index: number) => (
                        <li key={index} className="leading-snug">{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Inactive state for AI Insights when sales data is not recorded yet */}
          {!insights && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 transition-colors duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-305 uppercase tracking-wider">
                  AI Insights / एआई विश्लेषण
                </h3>
              </div>
              <div className="flex items-start space-x-3 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-150/40 dark:border-slate-800 p-3.5 rounded-xl text-xs">
                <Lightbulb className="text-amber-500 shrink-0 mt-0.5" size={16} />
                <div className="space-y-1 text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-slate-700 dark:text-slate-305 block">AI Insights Inactive</span>
                  <p className="font-semibold leading-relaxed">
                    Pehle sales record add karein taaki hum aapko cash-flow aur demand tips de sakein! (Please record your sales first to unlock AI insights).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div> {/* End Right Column */}
      </div> {/* End Grid Wrapper */}
    </div>
  );
};
