
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
  <div className="bg-white rounded-2xl p-6 shadow-md border border-[#E3E3E3] flex flex-col justify-between hover:shadow-lg transition-all group overflow-hidden relative">
    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 ${colorClass}`}></div>
    <div className="flex items-start justify-between mb-4">
      <div className={`p-4 rounded-xl ${colorClass} bg-opacity-20`}>
        {React.cloneElement(icon as React.ReactElement, { className: `w-6 h-6 ${colorClass.replace('bg-', 'text-')}` })}
      </div>
    </div>
    <div>
      <p className="text-xs font-bold text-[#456882] uppercase tracking-wider mb-1">{title}</p>
      <div className="flex items-baseline gap-1">
        <h3 className="text-2xl font-black text-[#1B3C53] truncate">{value}</h3>
        {subtitle && <span className="text-xs text-[#456882] font-normal">{subtitle}</span>}
      </div>
    </div>
  </div>
);

const KPISection: React.FC<KPIProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      <KPICard 
        title="Total Omset"
        value={`Rp ${formatShorthand(stats.totalOmset)}`}
        icon={<DollarSign />}
        colorClass="bg-[#1B3C53]"
      />
      <KPICard 
        title="Total Invoices"
        value={stats.totalInvoice.toLocaleString()}
        icon={<FileText />}
        colorClass="bg-[#234C6A]"
      />
      <KPICard 
        title="Total Quantity"
        value={stats.totalQuantity.toLocaleString()}
        icon={<Package />}
        colorClass="bg-[#456882]"
      />
      <KPICard 
        title="Outlet Active"
        value={stats.outletActive.toLocaleString()}
        icon={<Store />}
        colorClass="bg-[#234C6A]"
      />
      <KPICard 
        title="Total Line Sold"
        value={stats.totalLineSold.toLocaleString()}
        icon={<ListOrdered />}
        colorClass="bg-[#1B3C53]"
      />
      <KPICard 
        title="Avg SKU / Invoice"
        value={stats.avgSkuPerInvoice.toFixed(2)}
        icon={<Calculator />}
        colorClass="bg-[#456882]"
      />
    </div>
  );
};

export default KPISection;
