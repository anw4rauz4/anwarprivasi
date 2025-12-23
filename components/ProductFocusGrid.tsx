
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
  // Menghitung OA per salesperson per SKU secara efisien
  // OA = Jumlah Retailer unik yang membeli SKU tersebut dari Sales tersebut
  const achievementMap = React.useMemo(() => {
    const map = new Map<string, Map<string, Set<string>>>();

    salesData.forEach(row => {
      // Hanya hitung status 'I' (Invoice/Penjualan), bukan 'R' (Return)
      if (row.Status !== 'I') return;
      
      const user = String(row.User_Code).trim();
      const sku = String(row.SKU_Code).trim();
      const retailer = String(row.Retailer_Code).trim();

      if (!user || !sku || !retailer) return;

      if (!map.has(user)) {
        map.set(user, new Map());
      }
      
      const userMap = map.get(user)!;
      if (!userMap.has(sku)) {
        userMap.set(sku, new Set());
      }
      
      userMap.get(sku)!.add(retailer);
    });

    return map;
  }, [salesData]);

  const getAchievement = (user: string, sku: string) => {
    if (!sku) return 0;
    return achievementMap.get(user)?.get(sku)?.size || 0;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-100 p-1.5 rounded-lg">
            <Target className="w-5 h-5 text-indigo-600" />
          </div>
          <h2 className="font-semibold text-slate-800">OA Product Focus Achievement</h2>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Metrik: Outlet Active (OA)</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-bold border-r border-slate-200 min-w-[200px] text-slate-600">
                KODE SALES
              </th>
              {focusCodes.map((code, idx) => (
                <th key={idx} className="px-2 py-3 min-w-[130px] border-r border-slate-200 last:border-r-0">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-center text-indigo-600 font-extrabold bg-indigo-50 py-0.5 rounded">PF {idx + 1}</span>
                    <select 
                      className="w-full px-2 py-1.5 text-[11px] font-semibold border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer hover:border-indigo-300 transition-colors"
                      value={code}
                      onChange={(e) => onFocusCodeChange(idx, e.target.value)}
                    >
                      <option value="">-- PILIH SKU --</option>
                      {availableSKUs.map(sku => (
                        <option key={sku} value={sku}>{sku}</option>
                      ))}
                    </select>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {salesTeam.length === 0 ? (
              <tr>
                <td colSpan={focusCodes.length + 1} className="px-6 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm font-medium">Belum ada data sales yang tersedia.</p>
                    <p className="text-xs">Silakan upload file laporan penjualan terlebih dahulu.</p>
                  </div>
                </td>
              </tr>
            ) : (
              salesTeam.map((userCode, idx) => (
                <tr key={idx} className="hover:bg-indigo-50/20 transition-colors group">
                  <td className="px-6 py-3.5 font-semibold text-slate-700 border-r border-slate-200 group-hover:text-indigo-600">
                    {userCode}
                  </td>
                  {focusCodes.map((code, fIdx) => {
                    const count = getAchievement(userCode, code);
                    const hasCode = code !== "";
                    return (
                      <td key={fIdx} className={`px-2 py-3.5 text-center border-r border-slate-200 last:border-r-0 font-bold transition-all ${hasCode && count > 0 ? 'text-indigo-700 bg-indigo-50/40' : 'text-slate-300'}`}>
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
      <div className="px-6 py-2 bg-slate-50 border-t border-slate-200">
        <p className="text-[10px] text-slate-400 italic">* Nilai di atas menunjukkan jumlah Outlet unik yang mengorder SKU Focus tersebut melalui sales terkait.</p>
      </div>
    </div>
  );
};

export default ProductFocusGrid;
