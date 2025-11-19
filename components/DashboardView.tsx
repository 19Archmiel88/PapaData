
import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { MOCK_KPIS, MOCK_ETL_METRICS, TRANSLATIONS } from '../constants';
import { TrendingUp, Users, DollarSign, ShoppingCart, Activity, Database, Sparkles, BrainCircuit } from 'lucide-react';
import { Language, AnalysisResult } from '../types';
import { Logo } from './Logo';
import { analyzeData } from '../services/geminiService';

interface DashboardViewProps {
  language: Language;
}

const Card: React.FC<{ title: string; value: string; sub: string; icon: React.ElementType; color: string; vsText: string }> = ({ title, value, sub, icon: Icon, color, vsText }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
      </div>
      <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
    </div>
    <div className="flex items-center text-green-600 text-sm font-medium">
      <TrendingUp size={16} className="mr-1" />
      <span>{sub}</span>
      <span className="text-slate-400 font-normal ml-1">{vsText}</span>
    </div>
  </div>
);

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label, currency = false }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl">
        <p className="text-slate-300 text-xs mb-2 font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm text-white">
             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
             <span className="capitalize">{entry.name}:</span>
             <span className="font-bold font-mono">
                {currency && index === 0 ? '$' : ''}{entry.value.toLocaleString()}
             </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const DashboardView: React.FC<DashboardViewProps> = ({ language }) => {
  const t = TRANSLATIONS[language].dashboard;
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const dataStr = JSON.stringify({ kpis: MOCK_KPIS.slice(-3), etl: MOCK_ETL_METRICS.slice(-3) });
      const result = await analyzeData(dataStr);
      setAnalysis(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t.title}</h2>
          <p className="text-slate-500 mt-1">{t.subtitle}</p>
        </div>
        <div className="flex items-center space-x-4">
            <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70"
            >
                {isAnalyzing ? (
                    <Activity className="animate-spin" size={16} />
                ) : (
                    <Sparkles size={16} />
                )}
                <span>{isAnalyzing ? 'Analyzing...' : 'AI Insights'}</span>
            </button>
            <div className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-600">
            {t.updated}: <span className="font-semibold text-slate-900">Just now</span>
            </div>
        </div>
      </div>

      {/* System Core & AI Analysis Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-80">
        {/* System Core Visualization */}
        <div className="bg-slate-900 rounded-xl shadow-lg overflow-hidden relative col-span-1 group">
            <div className="absolute top-4 left-4 z-20 flex items-center space-x-2">
                <BrainCircuit className="text-blue-400" size={20} />
                <span className="text-white font-semibold text-sm">Neural Core</span>
            </div>
            <div className="w-full h-full flex items-center justify-center bg-slate-950">
                <div className="scale-75 transform transition-transform duration-700 group-hover:scale-90">
                   <Logo />
                </div>
            </div>
        </div>

        {/* AI Analysis Results */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 col-span-1 lg:col-span-2 overflow-y-auto relative">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Sparkles size={18} className="text-indigo-500 mr-2" />
                PapaData Intelligence
            </h3>
            {!analysis ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm">
                    <p>Click "AI Insights" to analyze current platform metrics.</p>
                </div>
            ) : (
                <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <div className="flex items-center justify-between">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                            analysis.sentiment === 'positive' ? 'bg-green-100 text-green-800' : 
                            analysis.sentiment === 'negative' ? 'bg-red-100 text-red-800' : 
                            'bg-slate-100 text-slate-800'
                        }`}>
                            {analysis.sentiment} Outlook
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">Executive Summary</h4>
                        <p className="text-slate-800 text-sm leading-relaxed">{analysis.summary}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-indigo-50 p-3 rounded-lg">
                            <h4 className="text-xs font-semibold text-indigo-700 uppercase mb-2">Key Insights</h4>
                            <ul className="space-y-1">
                                {analysis.keyInsights.map((insight, i) => (
                                    <li key={i} className="flex items-start text-xs text-indigo-900">
                                        <span className="mr-2">•</span>
                                        {insight}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {analysis.recommendation && (
                             <div className="bg-emerald-50 p-3 rounded-lg">
                                <h4 className="text-xs font-semibold text-emerald-700 uppercase mb-2">Recommendation</h4>
                                <p className="text-xs text-emerald-900">{analysis.recommendation}</p>
                             </div>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          title={t.revenue} 
          value="$39,200" 
          sub="+12.5%" 
          icon={DollarSign} 
          color="bg-green-600 text-green-600" 
          vsText={t.vsLastMonth}
        />
        <Card 
          title={t.sessions} 
          value="124,500" 
          sub="+8.2%" 
          icon={Users} 
          color="bg-blue-600 text-blue-600"
          vsText={t.vsLastMonth} 
        />
        <Card 
          title={t.orders} 
          value="1,240" 
          sub="+3.1%" 
          icon={ShoppingCart} 
          color="bg-purple-600 text-purple-600"
          vsText={t.vsLastMonth} 
        />
      </div>

      {/* First Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">{t.revenueTrend}</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_KPIS}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip content={<CustomTooltip currency={true} />} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#2563EB" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">{t.sessionsOrders}</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_KPIS}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F1F5F9' }} />
                <Bar dataKey="sessions" fill="#64748B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="orders" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Second Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ETL Performance Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-lg font-semibold text-slate-900">{t.etlPerformance}</h3>
             <Activity size={18} className="text-orange-500" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_ETL_METRICS}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Line 
                    type="monotone" 
                    dataKey="durationMinutes" 
                    stroke="#F97316" 
                    strokeWidth={3} 
                    dot={{r: 4, fill: '#F97316'}} 
                    activeDot={{r: 7, stroke: '#fff', strokeWidth: 2}} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data Quality Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-lg font-semibold text-slate-900">{t.dataQuality}</h3>
             <Database size={18} className="text-emerald-500" />
          </div>
          <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_ETL_METRICS} stackOffset="sign">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F1F5F9' }} />
                <Legend />
                <Bar dataKey="rowsLoaded" name="Success" fill="#10B981" stackId="a" radius={[0, 0, 4, 4]} />
                <Bar dataKey="rowsFailed" name="Failed" fill="#EF4444" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
