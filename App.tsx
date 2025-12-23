
import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  FileText, 
  Search,
  Users,
  Filter
} from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { SalesData, KPIStats, SalesTeamPerformance, ProductPerformance, OutletPareto, DailyOmset } from './types';
import KPISection from './components/KPISection';
import ChartsSection from './components/ChartsSection';
import SalesTable from './components/SalesTable';
import FileUpload from './components/FileUpload';
import ProductFocusGrid from './components/ProductFocusGrid';
import ExportControls from './components/ExportControls';
import { formatShorthand } from './utils';

const App: React.FC = () => {
  const [rawData, setRawData] = useState<SalesData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBranch, setFilterBranch] = useState<string>('All');
  const [showFilters, setShowFilters] = useState(false);
  
  const [focusCodes, setFocusCodes] = useState<string[]>(Array(8).fill(''));

  const handleFocusCodeChange = (index: number, code: string) => {
    const updated = [...focusCodes];
    updated[index] = code;
    setFocusCodes(updated);
  };

  const availableSKUs = useMemo(() => {
    const skus = new Set<string>();
    rawData.forEach(row => {
      if (row.SKU_Code) skus.add(String(row.SKU_Code).trim());
    });
    return Array.from(skus).sort();
  }, [rawData]);

  const getNetValue = (row: SalesData) => {
    const val = Number(row.Line_Value) || 0;
    return row.Status === 'R' ? -val : val;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      if (file.name.endsWith('.csv')) {
        Papa.parse(file, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            const validatedData: SalesData[] = (results.data as any[]).map(row => ({
              ...row,
              Invoice_Qty: Number(row.Invoice_Qty) || 0,
              SKU_Price: Number(row.SKU_Price) || 0,
              Line_Value: Number(row.Line_Value) || 0,
              Total_Lines: Number(row.Total_Lines) || 0,
            }));
            setRawData(validatedData);
            setIsLoading(false);
          },
          error: (err) => {
            setError(`Error parsing CSV: ${err.message}`);
            setIsLoading(false);
          }
        });
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]) as any[];
            const validatedData: SalesData[] = jsonData.map(row => ({
              ...row,
              Invoice_Qty: Number(row.Invoice_Qty) || 0,
              SKU_Price: Number(row.SKU_Price) || 0,
              Line_Value: Number(row.Line_Value) || 0,
              Total_Lines: Number(row.Total_Lines) || 0,
            }));
            setRawData(validatedData);
            setIsLoading(false);
          } catch (err) {
            setError('Failed to process Excel file.');
            setIsLoading(false);
          }
        };
        reader.readAsArrayBuffer(file);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return rawData.filter(row => {
      const matchesSearch = searchTerm === '' || 
        String(row.Invoice_No).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(row.User_Code).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(row.Retailer_Code).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBranch = filterBranch === 'All' || row.Branch_Code === filterBranch;
      return matchesSearch && matchesBranch;
    });
  }, [rawData, searchTerm, filterBranch]);

  const branches = useMemo(() => 
    Array.from(new Set(rawData.map(r => r.Branch_Code))).filter(Boolean).sort()
  , [rawData]);

  const stats = useMemo<KPIStats>(() => {
    const totalOmset = filteredData.reduce((acc, row) => acc + getNetValue(row), 0);
    const invoices = new Set(filteredData.filter(r => r.Status === 'I').map(row => row.Invoice_No));
    const totalInvoice = invoices.size;
    const totalQuantity = filteredData.reduce((acc, row) => acc + (row.Status === 'R' ? -row.Invoice_Qty : row.Invoice_Qty), 0);
    const outletActive = new Set(filteredData.map(row => row.Retailer_Code)).size;
    const avgSkuPerInvoice = totalInvoice === 0 ? 0 : filteredData.filter(r => r.Status === 'I').length / totalInvoice;
    const totalLineSold = filteredData.filter(r => r.Status === 'I').length;

    return { totalOmset, totalInvoice, totalQuantity, outletActive, avgSkuPerInvoice, totalLineSold };
  }, [filteredData]);

  const dailyPerformance = useMemo<DailyOmset[]>(() => {
    const dailyMap = new Map<string, { omset: number, timestamp: number }>();
    
    filteredData.forEach(row => {
      const dateVal = row.Invoice_Date;
      let dateObj: Date | null = null;

      if (typeof dateVal === 'number') {
        dateObj = new Date((dateVal - 25569) * 86400 * 1000);
      } else if (dateVal) {
        const dateStr = String(dateVal);
        dateObj = new Date(dateStr);
        if (isNaN(dateObj.getTime())) {
          const parts = dateStr.split(/[/-]/);
          if (parts.length >= 3) {
            const d = parseInt(parts[0]);
            const m = parseInt(parts[1]) - 1;
            const y = parseInt(parts[2]);
            dateObj = new Date(y, m, d);
          }
        }
      }

      if (dateObj && !isNaN(dateObj.getTime())) {
        const normalized = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
        const key = normalized.toISOString().split('T')[0];
        
        const existing = dailyMap.get(key) || { omset: 0, timestamp: normalized.getTime() };
        existing.omset += getNetValue(row);
        dailyMap.set(key, existing);
      }
    });

    return Array.from(dailyMap.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .map(([key, data]) => {
        const d = new Date(data.timestamp);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        return {
          label: `${day}/${month}`,
          timestamp: data.timestamp,
          omset: data.omset
        };
      });
  }, [filteredData]);

  const productPerformance = useMemo<ProductPerformance[]>(() => {
    const map = new Map<string, ProductPerformance>();
    filteredData.forEach(row => {
      const existing = map.get(row.SKU_Code) || { skuCode: row.SKU_Code, totalQty: 0, totalOmset: 0 };
      existing.totalQty += (row.Status === 'R' ? -row.Invoice_Qty : row.Invoice_Qty);
      existing.totalOmset += getNetValue(row);
      map.set(row.SKU_Code, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.totalOmset - a.totalOmset).slice(0, 15);
  }, [filteredData]);

  const salesTeamPerformance = useMemo<SalesTeamPerformance[]>(() => {
    const map = new Map<string, { omset: number, invoices: Set<string>, qty: number, oa: Set<string>, rowCount: number, skus: Set<string> }>();
    filteredData.forEach(row => {
      const existing = map.get(row.User_Code) || { omset: 0, invoices: new Set<string>(), qty: 0, oa: new Set<string>(), rowCount: 0, skus: new Set<string>() };
      existing.omset += getNetValue(row);
      if (row.Status === 'I') {
        existing.invoices.add(row.Invoice_No);
        existing.rowCount += 1;
        existing.skus.add(row.SKU_Code);
      }
      existing.qty += (row.Status === 'R' ? -row.Invoice_Qty : row.Invoice_Qty);
      existing.oa.add(row.Retailer_Code);
      map.set(row.User_Code, existing);
    });
    return Array.from(map.entries()).map(([userCode, data]) => ({
      userCode,
      omset: data.omset,
      invoice: data.invoices.size,
      qty: data.qty,
      oa: data.oa.size,
      avgSkuInv: data.invoices.size === 0 ? 0 : data.rowCount / data.invoices.size,
      totalSku: data.rowCount
    })).sort((a, b) => b.omset - a.omset);
  }, [filteredData]);

  const salesTeamList = useMemo(() => salesTeamPerformance.map(s => s.userCode), [salesTeamPerformance]);

  const paretoOutlets = useMemo<OutletPareto[]>(() => {
    const map = new Map<string, number>();
    filteredData.forEach(row => {
      map.set(row.Retailer_Code, (map.get(row.Retailer_Code) || 0) + getNetValue(row));
    });
    const sorted = Array.from(map.entries())
      .map(([retailerCode, omset]) => ({ retailerCode, omset }))
      .sort((a, b) => b.omset - a.omset);

    let cumulative = 0;
    const total = Math.max(0, sorted.reduce((acc, curr) => acc + curr.omset, 0));
    return sorted.map(item => {
      cumulative += item.omset;
      const percentage = total === 0 ? 0 : (cumulative / total) * 100;
      return { ...item, cumulativeOmset: cumulative, cumulativePercentage: percentage, isTop80: percentage <= 80 };
    });
  }, [filteredData]);

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 z-50 bg-[#1B3C53] border-b border-[#234C6A] px-4 md:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between shadow-lg gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#456882] p-2 rounded-xl shadow-inner"><TrendingUp className="text-white w-5 h-5 md:w-6 md:h-6" /></div>
            <h1 className="text-lg md:text-2xl font-black tracking-tight text-[#E3E3E3] truncate">Daily Sales Tracking</h1>
          </div>
          {rawData.length > 0 && (
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden p-2 text-[#E3E3E3] bg-[#234C6A] rounded-lg"
            >
              <Filter className="w-5 h-5" />
            </button>
          )}
        </div>

        {rawData.length > 0 && (
          <div className={`${showFilters ? 'flex' : 'hidden md:flex'} flex-col md:flex-row items-stretch md:items-center gap-4 animate-in slide-in-from-top-2 duration-300`}>
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#456882] w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 bg-[#234C6A] border-none rounded-xl text-sm text-white placeholder-[#456882] outline-none focus:ring-2 focus:ring-[#456882] w-full md:w-64 lg:w-72 transition-all" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
            <select 
              className="bg-[#234C6A] border-none rounded-xl px-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-[#456882] cursor-pointer w-full md:w-auto" 
              value={filterBranch} 
              onChange={(e) => setFilterBranch(e.target.value)}
            >
              <option value="All">All Branches</option>
              {branches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <div className="hidden md:block h-8 w-px bg-[#234C6A] mx-1"></div>
            <div className="flex items-center gap-2">
              <ExportControls data={filteredData} performance={salesTeamPerformance} stats={stats} focusCodes={focusCodes} />
              <button 
                onClick={() => setRawData([])} 
                className="flex-1 md:flex-none px-5 py-2 text-sm font-bold text-[#E3E3E3] bg-[#234C6A] hover:bg-[#456882] rounded-xl transition-all shadow-sm"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1 p-3 md:p-8 max-w-full lg:max-w-7xl mx-auto w-full">
        {rawData.length === 0 ? (
          <div className="min-h-[70vh] flex items-center justify-center p-4">
            <FileUpload onUpload={handleFileUpload} isLoading={isLoading} error={error} />
          </div>
        ) : (
          <div className="space-y-6 md:space-y-8">
            <KPISection stats={stats} />
            <ChartsSection products={productPerformance} pareto={paretoOutlets} salesTeam={salesTeamPerformance} dailyOmset={dailyPerformance} />
            
            <ProductFocusGrid 
              salesData={filteredData}
              salesTeam={salesTeamList}
              focusCodes={focusCodes}
              onFocusCodeChange={handleFocusCodeChange}
              availableSKUs={availableSKUs}
            />

            <div className="bg-white rounded-2xl shadow-xl border border-[#E3E3E3] overflow-hidden">
              <div className="px-5 md:px-8 py-5 border-b border-[#E3E3E3] flex items-center gap-3 bg-[#1B3C53]">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-[#456882]" />
                <h2 className="font-bold text-[#E3E3E3] text-base md:text-lg">Sales Performance (Net Omset)</h2>
              </div>
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#456882] scrollbar-track-[#E3E3E3]">
                <table className="w-full text-xs md:text-sm text-left min-w-[800px]">
                  <thead className="text-[10px] md:text-xs text-[#E3E3E3] uppercase bg-[#234C6A] border-b border-[#1B3C53]">
                    <tr>
                      <th className="px-5 md:px-8 py-4 font-bold sticky left-0 bg-[#234C6A]">User Code</th>
                      <th className="px-5 md:px-8 py-4 font-bold text-right">Net Omset</th>
                      <th className="px-5 md:px-8 py-4 font-bold text-right">Invoices</th>
                      <th className="px-5 md:px-8 py-4 font-bold text-right">Net Qty</th>
                      <th className="px-5 md:px-8 py-4 font-bold text-right">OA</th>
                      <th className="px-5 md:px-8 py-4 font-bold text-right">Total SKU</th>
                      <th className="px-5 md:px-8 py-4 font-bold text-right">Avg SKU/INV</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3E3E3]">
                    {salesTeamPerformance.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#E3E3E3]/50 transition-colors">
                        <td className="px-5 md:px-8 py-4 md:py-5 font-bold text-[#1B3C53] sticky left-0 bg-white group-hover:bg-[#E3E3E3]/50">{item.userCode}</td>
                        <td className={`px-5 md:px-8 py-4 md:py-5 text-right font-black ${item.omset < 0 ? 'text-red-600' : 'text-[#234C6A]'}`}>
                          Rp {formatShorthand(item.omset)}
                        </td>
                        <td className="px-5 md:px-8 py-4 md:py-5 text-right font-medium">{item.invoice}</td>
                        <td className="px-5 md:px-8 py-4 md:py-5 text-right font-medium">{item.qty.toLocaleString()}</td>
                        <td className="px-5 md:px-8 py-4 md:py-5 text-right font-medium">{item.oa}</td>
                        <td className="px-5 md:px-8 py-4 md:py-5 text-right font-bold text-[#456882]">{item.totalSku}</td>
                        <td className="px-5 md:px-8 py-4 md:py-5 text-right text-[#456882]">{item.avgSkuInv.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-[#E3E3E3] overflow-hidden">
              <div className="px-5 md:px-8 py-5 border-b border-[#E3E3E3] flex items-center justify-between bg-[#1B3C53]">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 md:w-6 md:h-6 text-[#456882]" />
                  <h2 className="font-bold text-[#E3E3E3] text-base md:text-lg">Transaction Details</h2>
                </div>
              </div>
              <SalesTable data={filteredData} />
            </div>
          </div>
        )}
      </main>
      <footer className="py-6 md:py-8 text-center text-[#456882] text-[10px] md:text-sm font-medium border-t border-[#E3E3E3] bg-white">
        &copy; {new Date().getFullYear()} Daily Sales Tracking. Powered by Executive Analytics.
      </footer>
    </div>
  );
};

export default App;
