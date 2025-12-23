
import React from 'react';
import { SalesData } from '../types';
import { Target } from 'lucide-react';

interface ProductFocusGridProps {
  salesData: SalesData[];
  salesTeam: string[];
  focusCodes: string[];
  onFocusCodeChange: (index: number, code: string) => void;
  availableSKUs: string[];
}

const ProductFocusGrid: React.FC<ProductFocusGridProps> = ({ 
  salesData, 
  salesTeam, 
  focusCodes, 
  onFocusCodeChange,
  availableSKUs
}) => {
  const achievementMap = React.useMemo(() => {
    const map = new Map<string, Map<string, Set<string>>>();
    salesData.forEach(row => {
      if (row.Status !== 'I') return;
      const user = String(row.User_Code).trim();
      const sku = String(row.SKU_Code).trim();
      const retailer = String(row.Retailer_Code).trim();
      if (!user || !sku || !retailer) return;
      if (!map.has(user)) map.set(user, new Map());
      const userMap = map.get(user)!;
      if (!userMap.has(sku)) userMap.set(sku, new Set());
      userMap.get(sku)!.add(retailer);
    });
    return map;
  }, [salesData]);

  const getAchievement = (user: string, sku: string) => {
    if (!sku) return 0;
    return achievementMap.get(user)?.get(sku)?.size || 0;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-[#E3E3E3] overflow-hidden mb-6 md:mb-8">
      <div className="px-5 md:px-8 py-5 border-b border-[#E3E3E3] flex items-center justify-between bg-[#1B3C53]">
        <div className="flex items-center gap-3">
          <div className="bg-[#456882] p-2 rounded-xl shadow-inner">
            <Target className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <h2 className="font-bold text-[#E3E3E3] text-base md:text-lg">Product Focus OA</h2>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[9px] md:text-[10px] font-black text-[#456882] uppercase tracking-widest bg-[#234C6A] px-3 py-1 rounded-full shadow-sm">OA Metric</span>
        </div>
      </div>
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#456882] scrollbar-track-[#E3E3E3]">
        <table className="w-full text-xs md:text-sm text-left border-collapse min-w-[1000px]">
          <thead className="text-[10px] md:text-xs text-[#E3E3E3] uppercase bg-[#234C6A] border-b border-[#1B3C53]">
            <tr>
              <th className="px-5 md:px-8 py-4 md:py-6 font-black border-r border-[#1B3C53] min-w-[150px] md:min-w-[200px] sticky left-0 bg-[#234C6A] z-20">
                SALES CODE
              </th>
              {focusCodes.map((code, idx) => (
                <th key={idx} className="px-3 py-3 md:py-4 min-w-[120px] md:min-w-[140px] border-r border-[#1B3C53] last:border-r-0">
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] text-center text-white font-black bg-[#456882] py-1 rounded-lg uppercase tracking-widest">PF {idx + 1}</span>
                    <select 
                      className="w-full px-2 py-1.5 md:px-3 md:py-2 text-[10px] md:text-[11px] font-black border border-[#1B3C53] rounded-xl focus:ring-2 focus:ring-[#456882] outline-none bg-[#E3E3E3] text-[#1B3C53] cursor-pointer hover:bg-white transition-all shadow-inner"
                      value={code}
                      onChange={(e) => onFocusCodeChange(idx, e.target.value)}
                    >
                      <option value="">-- SKU --</option>
                      {availableSKUs.map(sku => (
                        <option key={sku} value={sku}>{sku}</option>
                      ))}
                    </select>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E3E3E3]">
            {salesTeam.length === 0 ? (
              <tr>
                <td colSpan={focusCodes.length + 1} className="px-8 py-16 md:py-20 text-center text-[#456882]">
                  <p className="text-sm md:text-lg font-black uppercase tracking-widest">No Sales Data Available</p>
                </td>
              </tr>
            ) : (
              salesTeam.map((userCode, idx) => (
                <tr key={idx} className="hover:bg-[#E3E3E3]/50 transition-colors group">
                  <td className="px-5 md:px-8 py-3.5 md:py-4.5 font-black text-[#1B3C53] border-r border-[#E3E3E3] sticky left-0 bg-white group-hover:bg-[#E3E3E3]/50">
                    {userCode}
                  </td>
                  {focusCodes.map((code, fIdx) => {
                    const count = getAchievement(userCode, code);
                    const hasCode = code !== "";
                    return (
                      <td key={fIdx} className={`px-3 py-3.5 md:py-4.5 text-center border-r border-[#E3E3E3] last:border-r-0 font-black transition-all ${hasCode && count > 0 ? 'text-[#1B3C53] bg-[#456882]/10' : 'text-[#456882]/30'}`}>
                        {hasCode ? (count > 0 ? count : '0') : '-'}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="px-5 md:px-8 py-3 md:py-4 bg-[#E3E3E3]/50 border-t border-[#E3E3E3]">
        <p className="text-[9px] md:text-[10px] text-[#456882] font-bold italic uppercase tracking-wider">
          * OA (Outlet Active) dihitung berdasarkan jumlah toko unik yang memesan SKU terkait.
        </p>
      </div>
    </div>
  );
};

export default ProductFocusGrid;
