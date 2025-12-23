
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ComposedChart, Line, Area, AreaChart, LabelList
} from 'recharts';
import { Box, TrendingUp, CalendarDays } from 'lucide-react';
import { ProductPerformance, OutletPareto, SalesTeamPerformance, DailyOmset } from '../types';
import { formatShorthand } from '../utils';

interface ChartsSectionProps {
  products: ProductPerformance[];
  pareto: OutletPareto[];
  salesTeam: SalesTeamPerformance[];
  dailyOmset: DailyOmset[];
}

const ChartsSection: React.FC<ChartsSectionProps> = ({ products, pareto, salesTeam, dailyOmset }) => {
  const paretoChartData = pareto.slice(0, 10);
  
  return (
    <div className="grid grid-cols-1 gap-6 w-full lg:col-span-2">
      {/* Daily Omset Chart - Area + Line + Dot + Auto Labels */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden col-span-1">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2 bg-slate-50/50">
          <CalendarDays className="w-5 h-5 text-indigo-600" />
          <h2 className="font-semibold text-slate-800">Total Net Omset Harian</h2>
        </div>
        <div className="p-6 h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyOmset} margin={{ top: 40, right: 20, left: -20, bottom: 10 }}>
              <defs>
                <linearGradient id="colorOmset" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="label" 
                fontSize={12} 
                stroke="#64748b" 
                tick={{ fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
              />
              {/* Sumbu Y disembunyikan untuk tampilan minimalis */}
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                formatter={(value: number) => [`Rp ${formatShorthand(value)}`, 'Net Omset']}
                labelFormatter={(label) => `Tanggal ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="omset" 
                stroke="#6366f1" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorOmset)" 
                dot={{ r: 4, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
              >
                <LabelList 
                  dataKey="omset" 
                  position="top" 
                  offset={15}
                  formatter={(val: number) => formatShorthand(val)}
                  style={{ fontSize: '11px', fill: '#4f46e5', fontWeight: '700' }}
                />
              </Area>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Chart - With Auto Labels */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2 bg-slate-50/50">
            <Box className="w-5 h-5 text-indigo-600" />
            <h2 className="font-semibold text-slate-800">Top Products by Net Omset</h2>
          </div>
          <div className="p-6 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={products} margin={{ top: 30, right: 10, left: -20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="skuCode" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80} 
                  fontSize={10} 
                  interval={0}
                  stroke="#64748b"
                  tickLine={false}
                  axisLine={false}
                />
                {/* Sumbu Y disembunyikan */}
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value: number) => [`Rp ${formatShorthand(value)}`, 'Net Omset']}
                />
                <Bar dataKey="totalOmset" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={24}>
                  <LabelList 
                    dataKey="totalOmset" 
                    position="top" 
                    formatter={(val: number) => formatShorthand(val)}
                    style={{ fontSize: '10px', fill: '#6366f1', fontWeight: 'bold' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pareto Chart - With Auto Labels */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2 bg-slate-50/50">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h2 className="font-semibold text-slate-800">Top Outlets (Pareto 80/20)</h2>
          </div>
          <div className="p-6 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={paretoChartData} margin={{ top: 30, right: 20, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="retailerCode" fontSize={10} stroke="#64748b" tickLine={false} axisLine={false} />
                {/* Sumbu Y kiri dan kanan disembunyikan */}
                <YAxis yAxisId="left" hide domain={['auto', 'auto']} />
                <YAxis yAxisId="right" orientation="right" hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value: number, name: string) => {
                    if (name === 'Net Omset') return [`Rp ${formatShorthand(value)}`, name];
                    return [value.toFixed(1) + '%', name];
                  }}
                />
                <Bar yAxisId="left" dataKey="omset" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Net Omset" barSize={30}>
                  <LabelList 
                    dataKey="omset" 
                    position="top" 
                    formatter={(val: number) => formatShorthand(val)}
                    style={{ fontSize: '10px', fill: '#3b82f6', fontWeight: 'bold' }}
                  />
                </Bar>
                <Line yAxisId="right" type="monotone" dataKey="cumulativePercentage" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 4, stroke: '#fff', strokeWidth: 2 }} name="Cum %" />
              </ComposedChart>
            </ResponsiveContainer>
            <div className="mt-2 text-center text-xs text-slate-500 italic">
              Outlets shown contribute to {paretoChartData.length > 0 ? paretoChartData[paretoChartData.length - 1].cumulativePercentage.toFixed(1) : 0}% of total revenue.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;
