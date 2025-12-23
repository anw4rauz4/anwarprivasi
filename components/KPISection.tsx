
import React from 'react';
import { FileText, Package, Store, Calculator, DollarSign, ListOrdered } from 'lucide-react';
import { KPIStats } from '../types';
import { formatShorthand } from '../utils';

interface KPIProps {
  stats: KPIStats;
}

const KPICard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass: string;
  subtitle?: string;
}> = ({ title, value, icon, colorClass, subtitle }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-all group overflow-hidden relative">
    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 ${colorClass}`}></div>
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 text-opacity-100`}>
        {React.cloneElement(icon as React.ReactElement, { className: `w-6 h-6 ${colorClass.replace('bg-', 'text-')}` })}
      </div>
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <div className="flex items-baseline gap-1">
        <h3 className="text-2xl font-bold text-slate-900 truncate">{value}</h3>
        {subtitle && <span className="text-xs text-slate-400 font-normal">{subtitle}</span>}
      </div>
    </div>
  </div>
);

const KPISection: React.FC<KPIProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <KPICard 
        title="Total Omset"
        value={`Rp ${formatShorthand(stats.totalOmset)}`}
        icon={<DollarSign />}
        colorClass="bg-indigo-600"
      />
      <KPICard 
        title="Total Invoices"
        value={stats.totalInvoice.toLocaleString()}
        icon={<FileText />}
        colorClass="bg-blue-500"
      />
      <KPICard 
        title="Total Quantity"
        value={stats.totalQuantity.toLocaleString()}
        icon={<Package />}
        colorClass="bg-teal-500"
      />
      <KPICard 
        title="Outlet Active"
        value={stats.outletActive.toLocaleString()}
        icon={<Store />}
        colorClass="bg-orange-500"
      />
      <KPICard 
        title="Total Line Sold"
        value={stats.totalLineSold.toLocaleString()}
        icon={<ListOrdered />}
        colorClass="bg-pink-600"
      />
      <KPICard 
        title="Avg SKU / Invoice"
        value={stats.avgSkuPerInvoice.toFixed(2)}
        icon={<Calculator />}
        colorClass="bg-purple-600"
      />
    </div>
  );
};

export default KPISection;
