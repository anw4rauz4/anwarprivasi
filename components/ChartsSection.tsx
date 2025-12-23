
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
    <div className="grid grid-cols-1 gap-8 w-full lg:col-span-2">
      {/* Daily Omset Chart */}
      <div className="bg-white rounded-2xl shadow-xl border border-[#E3E3E3] overflow-hidden col-span-1">
        <div className="px-8 py-5 border-b border-[#E3E3E3] flex items-center gap-3 bg-[#1B3C53]">
          <CalendarDays className="w-6 h-6 text-[#456882]" />
          <h2 className="font-bold text-[#E3E3E3] text-lg">Total Net Omset Harian</h2>
        </div>
        <div className="p-8 h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyOmset} margin={{ top: 40, right: 30, left: -20, bottom: 10 }}>
              <defs>
                <linearGradient id="colorOmset" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1B3C53" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#1B3C53" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E3E3" />
              <XAxis 
                dataKey="label" 
                fontSize={12} 
                stroke="#1B3C53" 
                tick={{ fill: '#1B3C53', fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1B3C53', borderRadius: '12px', border: 'none', color: '#E3E3E3', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}
                itemStyle={{ color: '#E3E3E3' }}
                formatter={(value: number) => [`Rp ${formatShorthand(value)}`, 'Net Omset']}
                labelFormatter={(label) => `Tanggal ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="omset" 
                stroke="#1B3C53" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorOmset)" 
                dot={{ r: 5, fill: '#1B3C53', stroke: '#E3E3E3', strokeWidth: 3 }}
                activeDot={{ r: 8, fill: '#234C6A', stroke: '#fff', strokeWidth: 3 }}
              >
                <LabelList 
                  dataKey="omset" 
                  position="top" 
                  offset={15}
                  formatter={(val: number) => formatShorthand(val)}
                  style={{ fontSize: '12px', fill: '#1B3C53', fontWeight: '900' }}
                />
              </Area>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products Chart */}
        <div className="bg-white rounded-2xl shadow-xl border border-[#E3E3E3] overflow-hidden">
          <div className="px-8 py-5 border-b border-[#E3E3E3] flex items-center gap-3 bg-[#1B3C53]">
            <Box className="w-6 h-6 text-[#456882]" />
            <h2 className="font-bold text-[#E3E3E3] text-lg">Top Products by Net Omset</h2>
          </div>
          <div className="p-8 h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={products} margin={{ top: 30, right: 10, left: -20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E3E3" />
                <XAxis 
                  dataKey="skuCode" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80} 
                  fontSize={11} 
                  interval={0}
                  stroke="#1B3C53"
                  tick={{ fill: '#1B3C53', fontWeight: 600 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#234C6A', borderRadius: '12px', border: 'none', color: '#E3E3E3' }}
                  itemStyle={{ color: '#E3E3E3' }}
                  formatter={(value: number) => [`Rp ${formatShorthand(value)}`, 'Net Omset']}
                />
                <Bar dataKey="totalOmset" fill="#456882" radius={[6, 6, 0, 0]} barSize={28}>
                  <LabelList 
                    dataKey="totalOmset" 
                    position="top" 
                    formatter={(val: number) => formatShorthand(val)}
                    style={{ fontSize: '11px', fill: '#1B3C53', fontWeight: 'bold' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pareto Chart */}
        <div className="bg-white rounded-2xl shadow-xl border border-[#E3E3E3] overflow-hidden">
          <div className="px-8 py-5 border-b border-[#E3E3E3] flex items-center gap-3 bg-[#1B3C53]">
            <TrendingUp className="w-6 h-6 text-[#456882]" />
            <h2 className="font-bold text-[#E3E3E3] text-lg">Top Outlets (Pareto 80/20)</h2>
          </div>
          <div className="p-8 h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={paretoChartData} margin={{ top: 30, right: 20, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E3E3" />
                <XAxis dataKey="retailerCode" fontSize={11} stroke="#1B3C53" tick={{ fill: '#1B3C53', fontWeight: 600 }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" hide domain={['auto', 'auto']} />
                <YAxis yAxisId="right" orientation="right" hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1B3C53', borderRadius: '12px', border: 'none', color: '#E3E3E3' }}
                  itemStyle={{ color: '#E3E3E3' }}
                  formatter={(value: number, name: string) => {
                    if (name === 'Net Omset') return [`Rp ${formatShorthand(value)}`, name];
                    return [value.toFixed(1) + '%', name];
                  }}
                />
                <Bar yAxisId="left" dataKey="omset" fill="#234C6A" radius={[6, 6, 0, 0]} name="Net Omset" barSize={35}>
                  <LabelList 
                    dataKey="omset" 
                    position="top" 
                    formatter={(val: number) => formatShorthand(val)}
                    style={{ fontSize: '11px', fill: '#1B3C53', fontWeight: 'black' }}
                  />
                </Bar>
                <Line yAxisId="right" type="monotone" dataKey="cumulativePercentage" stroke="#456882" strokeWidth={4} dot={{ fill: '#456882', r: 5, stroke: '#E3E3E3', strokeWidth: 3 }} name="Cum %" />
              </ComposedChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center text-xs text-[#456882] font-bold uppercase tracking-widest italic">
              Outlets contributing to {paretoChartData.length > 0 ? paretoChartData[paretoChartData.length - 1].cumulativePercentage.toFixed(1) : 0}% Revenue
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;
