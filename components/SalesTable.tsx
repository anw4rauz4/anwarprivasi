
import React, { useState } from 'react';
import { SalesData } from '../types';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { formatShorthand } from '../utils';

interface SalesTableProps {
  data: SalesData[];
}

const SalesTable: React.FC<SalesTableProps> = ({ data }) => {
  const [sortField, setSortField] = useState<keyof SalesData>('Invoice_Date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof SalesData) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    }
    return sortOrder === 'asc' ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
  });

  const renderSortIcon = (field: keyof SalesData) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  return (
    <div className="overflow-x-auto relative scrollbar-thin scrollbar-thumb-[#456882] scrollbar-track-[#E3E3E3]">
      <table className="w-full text-[11px] md:text-sm text-left border-collapse min-w-[900px]">
        <thead className="text-[10px] md:text-xs text-[#E3E3E3] uppercase bg-[#234C6A] border-b border-[#1B3C53] sticky top-0 z-10">
          <tr>
            <th onClick={() => handleSort('Invoice_Date')} className="px-5 md:px-8 py-4 cursor-pointer hover:bg-[#1B3C53] transition-colors sticky left-0 bg-[#234C6A]"><div className="flex items-center gap-2 font-black">Date {renderSortIcon('Invoice_Date')}</div></th>
            <th onClick={() => handleSort('Invoice_No')} className="px-5 md:px-8 py-4 cursor-pointer hover:bg-[#1B3C53] transition-colors"><div className="flex items-center gap-2 font-black">No Inv {renderSortIcon('Invoice_No')}</div></th>
            <th className="px-5 md:px-8 py-4 font-black">Status</th>
            <th className="px-5 md:px-8 py-4 font-black">Sales</th>
            <th className="px-5 md:px-8 py-4 font-black">Outlet</th>
            <th className="px-5 md:px-8 py-4 font-black">Product</th>
            <th className="px-5 md:px-8 py-4 text-right font-black">Price</th>
            <th className="px-5 md:px-8 py-4 text-right font-black">Qty</th>
            <th onClick={() => handleSort('Line_Value')} className="px-5 md:px-8 py-4 text-right cursor-pointer hover:bg-[#1B3C53] transition-colors"><div className="flex items-center justify-end gap-2 font-black">Value {renderSortIcon('Line_Value')}</div></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E3E3E3]">
          {sortedData.length === 0 ? (
            <tr><td colSpan={9} className="px-5 md:px-8 py-12 md:py-16 text-center text-[#456882] font-bold">No transactions detected.</td></tr>
          ) : (
            sortedData.map((row, idx) => (
              <tr key={idx} className={`hover:bg-[#E3E3E3]/50 transition-colors ${row.Status === 'R' ? 'bg-red-50/50' : ''}`}>
                <td className="px-5 md:px-8 py-3 md:py-5 whitespace-nowrap text-[#456882] font-semibold sticky left-0 bg-white group-hover:bg-[#E3E3E3]/50">{row.Invoice_Date}</td>
                <td className="px-5 md:px-8 py-3 md:py-5 font-bold text-[#1B3C53]">{row.Invoice_No}</td>
                <td className="px-5 md:px-8 py-3 md:py-5">
                  <span className={`px-2 md:px-3 py-1 rounded text-[9px] md:text-[10px] font-black uppercase tracking-widest ${row.Status === 'R' ? 'bg-red-600 text-white' : 'bg-[#456882] text-white'}`}>
                    {row.Status === 'R' ? 'Return' : 'Inv'}
                  </span>
                </td>
                <td className="px-5 md:px-8 py-3 md:py-5 text-[#1B3C53] font-medium">{row.User_Code}</td>
                <td className="px-5 md:px-8 py-3 md:py-5 text-[#1B3C53] font-medium">{row.Retailer_Code}</td>
                <td className="px-5 md:px-8 py-3 md:py-5 text-[#456882] font-medium truncate max-w-[120px] md:max-w-[150px]">{row.SKU_Code}</td>
                <td className="px-5 md:px-8 py-3 md:py-5 text-right text-[#456882] font-bold">{formatShorthand(row.SKU_Price)}</td>
                <td className={`px-5 md:px-8 py-3 md:py-5 text-right font-black ${row.Status === 'R' ? 'text-red-600' : 'text-[#1B3C53]'}`}>
                  {row.Status === 'R' ? `-${row.Invoice_Qty}` : row.Invoice_Qty}
                </td>
                <td className={`px-5 md:px-8 py-3 md:py-5 text-right font-black ${row.Status === 'R' ? 'text-red-600' : 'text-[#234C6A]'}`}>
                  {row.Status === 'R' ? `-${formatShorthand(row.Line_Value)}` : formatShorthand(row.Line_Value)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SalesTable;
