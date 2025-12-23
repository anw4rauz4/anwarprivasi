
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
    <div className="overflow-x-auto relative">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
          <tr>
            <th onClick={() => handleSort('Invoice_Date')} className="px-6 py-3 cursor-pointer hover:bg-slate-100"><div className="flex items-center gap-1">Date {renderSortIcon('Invoice_Date')}</div></th>
            <th onClick={() => handleSort('Invoice_No')} className="px-6 py-3 cursor-pointer hover:bg-slate-100"><div className="flex items-center gap-1">No Inv {renderSortIcon('Invoice_No')}</div></th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Sales</th>
            <th className="px-6 py-3">Outlet</th>
            <th className="px-6 py-3">Product</th>
            <th className="px-6 py-3 text-right">Price</th>
            <th className="px-6 py-3 text-right">Qty</th>
            <th onClick={() => handleSort('Line_Value')} className="px-6 py-3 text-right cursor-pointer hover:bg-slate-100"><div className="flex items-center justify-end gap-1">Value {renderSortIcon('Line_Value')}</div></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sortedData.length === 0 ? (
            <tr><td colSpan={9} className="px-6 py-12 text-center text-slate-400">No transactions found.</td></tr>
          ) : (
            sortedData.map((row, idx) => (
              <tr key={idx} className={`hover:bg-slate-50 transition-colors ${row.Status === 'R' ? 'bg-red-50/30' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap text-slate-600">{row.Invoice_Date}</td>
                <td className="px-6 py-4 font-medium text-slate-900">{row.Invoice_No}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${row.Status === 'R' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {row.Status === 'R' ? 'Return' : 'Invoice'}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{row.User_Code}</td>
                <td className="px-6 py-4 text-slate-600">{row.Retailer_Code}</td>
                <td className="px-6 py-4 text-slate-600 truncate max-w-[150px]">{row.SKU_Code}</td>
                <td className="px-6 py-4 text-right text-slate-500">{formatShorthand(row.SKU_Price)}</td>
                <td className={`px-6 py-4 text-right font-medium ${row.Status === 'R' ? 'text-red-600' : 'text-slate-600'}`}>
                  {row.Status === 'R' ? `-${row.Invoice_Qty}` : row.Invoice_Qty}
                </td>
                <td className={`px-6 py-4 text-right font-semibold ${row.Status === 'R' ? 'text-red-600' : 'text-slate-900'}`}>
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
