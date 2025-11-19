
import React, { useState } from 'react';
import { 
  BarChart2, 
  PieChart as PieIcon, // Renamed to avoid conflict
  Activity, 
  Share2, 
  Download, 
  Calendar,
  Filter,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface LookerStudioViewProps {
  language: Language;
}

// Mock Data
const CHANNEL_DATA = [
  { name: 'Direct', revenue: 45000, color: '#4285F4' },
  { name: 'Organic', revenue: 38000, color: '#60A5FA' },
  { name: 'Social', revenue: 25000, color: '#2563EB' },
  { name: 'Email', revenue: 18000, color: '#6366F1' },
  { name: 'Referral', revenue: 12000, color: '#818CF8' },
  { name: 'Paid Search', revenue: 4392, color: '#22D3EE' },
];

const DEVICE_DATA = [
  { name: 'Mobile', value: 62, color: '#3B82F6' },
  { name: 'Desktop', value: 28, color: '#6366F1' },
  { name: 'Tablet', value: 10, color: '#22D3EE' },
];

const CustomLookerTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-slate-200 p-3 rounded shadow-lg z-50">
        <p className="text-slate-500 text-xs font-semibold mb-1 uppercase tracking-wider">{data.name}</p>
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }}></div>
            <span className="text-slate-900 font-bold text-sm font-mono">
                {data.revenue !== undefined ? `$${data.revenue.toLocaleString()}` : `${data.value}%`}
            </span>
        </div>
      </div>
    );
  }
  return null;
};

// Renaming internally to LookerStudioView to match functionality
export const LookerStudioView: React.FC<LookerStudioViewProps> = ({ language }) => {
  const t = TRANSLATIONS[language].looker;
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-2 animate-in fade-in duration-500">
      {/* Looker Studio Header Simulation */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between mb-6 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#4285F4] rounded flex items-center justify-center">
                    <BarChart2 className="text-white" size={18} />
                </div>
                <div>
                    <h1 className="text-xl font-semibold text-slate-800 leading-none">Looker Studio</h1>
                    <p className="text-xs text-slate-500 mt-1">PapaData Master Report • Oct 2023</p>
                </div>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={handleRefresh} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
                <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
            </button>
            <div className="h-6 w-px bg-slate-300"></div>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded transition-colors">
                <Calendar size={16} />
                <span>Last 30 Days</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded transition-colors">
                <Filter size={16} />
                <span>Add filter</span>
            </button>
            <div className="h-6 w-px bg-slate-300"></div>
            <button className="bg-[#4285F4] hover:bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2">
                <Share2 size={16} />
                Share
            </button>
        </div>
      </div>

      {/* Dashboard Canvas */}
      <div className="max-w-[1200px] mx-auto bg-white min-h-[800px] shadow-sm border border-slate-200 p-8 grid grid-cols-12 gap-6">
         
         {/* Header Card */}
         <div className="col-span-12 bg-blue-50 p-6 rounded border border-blue-100 flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-bold text-blue-900">Executive Summary</h2>
                <p className="text-blue-700">Consolidated view of e-commerce performance across all channels.</p>
            </div>
            <div className="text-right">
                <div className="text-3xl font-bold text-blue-900">$142,392.00</div>
                <div className="text-sm text-blue-700 uppercase font-semibold tracking-wider">Total Revenue</div>
            </div>
         </div>

         {/* KPI Cards */}
         <div className="col-span-3 bg-white p-4 rounded border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow">
             <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Sessions</h3>
             <div className="text-2xl font-bold text-slate-800">84,231</div>
             <div className="text-xs text-green-600 font-medium mt-1">▲ 12.5% vs prev 30 days</div>
         </div>
         <div className="col-span-3 bg-white p-4 rounded border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow">
             <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Conversion Rate</h3>
             <div className="text-2xl font-bold text-slate-800">2.84%</div>
             <div className="text-xs text-red-600 font-medium mt-1">▼ 0.4% vs prev 30 days</div>
         </div>
         <div className="col-span-3 bg-white p-4 rounded border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow">
             <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Avg. Order Value</h3>
             <div className="text-2xl font-bold text-slate-800">$124.50</div>
             <div className="text-xs text-green-600 font-medium mt-1">▲ 5.2% vs prev 30 days</div>
         </div>
         <div className="col-span-3 bg-white p-4 rounded border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow">
             <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Bounce Rate</h3>
             <div className="text-2xl font-bold text-slate-800">42.1%</div>
             <div className="text-xs text-slate-500 font-medium mt-1">- 0.0% vs prev 30 days</div>
         </div>

         {/* Main Chart Area - Revenue by Channel */}
         <div className="col-span-8 bg-white p-6 rounded border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] min-h-[350px] flex flex-col">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Revenue by Channel</h3>
            <div className="flex-1 w-full h-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={CHANNEL_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 11, fill: '#64748B'}} 
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 11, fill: '#64748B'}} 
                            tickFormatter={(val) => `$${val/1000}k`} 
                        />
                        <Tooltip content={<CustomLookerTooltip />} cursor={{fill: '#F8FAFC'}} />
                        <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                        {CHANNEL_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
         </div>

         {/* Side Chart - Device Category */}
         <div className="col-span-4 bg-white p-6 rounded border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] min-h-[350px] flex flex-col">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Device Category</h3>
            <div className="flex-1 w-full h-full min-h-[200px] relative flex items-center justify-center">
                <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <Pie
                            data={DEVICE_DATA}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {DEVICE_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomLookerTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                {/* Centered text for Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="text-3xl font-bold text-slate-800">62%</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Mobile</div>
                </div>
            </div>
            <div className="mt-2 space-y-3">
                {DEVICE_DATA.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs items-center">
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span> 
                            <span className="text-slate-600">{item.name}</span>
                        </span>
                        <span className="font-bold text-slate-800">{item.value}%</span>
                    </div>
                ))}
            </div>
         </div>

         {/* Table */}
         <div className="col-span-12 bg-white p-6 rounded border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Top Products Performance</h3>
            <table className="w-full text-left text-sm text-slate-600">
                <thead>
                    <tr className="border-b border-slate-200">
                        <th className="py-2 font-semibold">Product Name</th>
                        <th className="py-2 font-semibold text-right">Revenue</th>
                        <th className="py-2 font-semibold text-right">Sold</th>
                        <th className="py-2 font-semibold text-right">Trend</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-3">Premium Wireless Headphones</td>
                        <td className="py-3 text-right text-slate-900 font-medium">$12,400</td>
                        <td className="py-3 text-right">42</td>
                        <td className="py-3 text-right text-green-600">▲ 12%</td>
                    </tr>
                    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-3">Ergonomic Office Chair</td>
                        <td className="py-3 text-right text-slate-900 font-medium">$8,200</td>
                        <td className="py-3 text-right">18</td>
                        <td className="py-3 text-right text-green-600">▲ 5%</td>
                    </tr>
                    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-3">Smart Home Hub</td>
                        <td className="py-3 text-right text-slate-900 font-medium">$6,150</td>
                        <td className="py-3 text-right">85</td>
                        <td className="py-3 text-right text-red-600">▼ 2%</td>
                    </tr>
                </tbody>
            </table>
         </div>
         
         {/* Footer Watermark */}
         <div className="col-span-12 text-center pt-4">
            <div className="inline-flex items-center gap-2 text-slate-400 text-xs">
                <span>Powered by</span>
                <span className="font-bold text-slate-500">Google Cloud BigQuery</span>
            </div>
         </div>

      </div>
    </div>
  );
};
