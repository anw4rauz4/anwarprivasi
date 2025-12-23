
import React from 'react';
import { FileSpreadsheet, FilePieChart as FilePdf } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { SalesData, SalesTeamPerformance, KPIStats } from '../types';
import { formatNumber } from '../utils';

interface ExportControlsProps {
  data: SalesData[];
  performance: SalesTeamPerformance[];
  stats: KPIStats;
  focusCodes: string[];
}

const ExportControls: React.FC<ExportControlsProps> = ({ data, performance, stats, focusCodes }) => {
  
  const calculateOA = (userCode: string, skuCode: string) => {
    if (!skuCode) return 0;
    const uniqueRetailers = new Set(
      data
        .filter(row => 
          row.Status === 'I' && 
          String(row.User_Code).trim() === userCode && 
          String(row.SKU_Code).trim() === skuCode
        )
        .map(row => row.Retailer_Code)
    );
    return uniqueRetailers.size;
  };

  const getNetValue = (row: SalesData) => {
    const val = Number(row.Line_Value) || 0;
    return row.Status === 'R' ? -val : val;
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const totalOmsetVal = stats.totalOmset || 1;
    
    // 1. Summary
    const summaryData = [
      ["Executive Daily Sales Report", ""],
      ["Tanggal Cetak", new Date().toLocaleString('id-ID')],
      ["", ""],
      ["Key Metrics", "Value"],
      ["Total Net Omset", stats.totalOmset],
      ["Total Invoices", stats.totalInvoice],
      ["Total Quantity", stats.totalQuantity],
      ["Outlet Active (OA)", stats.outletActive],
      ["Total Line Sold", stats.totalLineSold],
      ["Avg SKU/Inv", stats.avgSkuPerInvoice.toFixed(2)]
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

    // 2. Sales Performance
    const perfData = performance.map(p => ({
      "Sales Code": p.userCode,
      "Net Omset": p.omset,
      "Invoices": p.invoice,
      "Net Qty": p.qty,
      "Total OA": p.oa,
      "Line Sold": p.totalSku,
      "Avg SKU/Inv": p.avgSkuInv.toFixed(2)
    }));
    const wsPerf = XLSX.utils.json_to_sheet(perfData);
    XLSX.utils.book_append_sheet(wb, wsPerf, "Performance");

    // 3. Top 30 Products
    const productMap = new Map<string, number>();
    data.forEach(row => {
      const sku = row.SKU_Code || 'Unknown';
      productMap.set(sku, (productMap.get(sku) || 0) + getNetValue(row));
    });
    const topProducts = Array.from(productMap.entries())
      .map(([code, omset]) => ({ code, omset }))
      .sort((a, b) => b.omset - a.omset)
      .slice(0, 30)
      .map((p, i) => ({
        "No": i + 1,
        "SKU Code": p.code,
        "Net Omset": p.omset,
        "% Contribution": ((p.omset / totalOmsetVal) * 100).toFixed(2) + "%"
      }));
    const wsTopProducts = XLSX.utils.json_to_sheet(topProducts);
    XLSX.utils.book_append_sheet(wb, wsTopProducts, "Top 30 Products");

    // 4. Transactions Detail
    const detailedTransactionData = data.map(row => ({
      "Date": row.Invoice_Date,
      "No Inv": row.Invoice_No,
      "Status": row.Status === 'R' ? 'Return' : 'Invoice',
      "Sales": row.User_Code,
      "Outlet": row.Retailer_Code,
      "Product": row.SKU_Code,
      "Price": row.SKU_Price,
      "Qty": row.Status === 'R' ? -row.Invoice_Qty : row.Invoice_Qty,
      "Value": row.Status === 'R' ? -row.Line_Value : row.Line_Value
    }));
    const wsRaw = XLSX.utils.json_to_sheet(detailedTransactionData);
    XLSX.utils.book_append_sheet(wb, wsRaw, "Transactions");

    XLSX.writeFile(wb, `Executive_Sales_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4'
    });
    const dateStr = new Date().toLocaleString('id-ID');

    // --- PAGE 1: EXECUTIVE SUMMARY ---
    doc.setFontSize(20);
    doc.setTextColor(27, 60, 83); // #1B3C53
    doc.text('Executive Sales Report', 14, 20);
    
    doc.setFontSize(9);
    doc.setTextColor(69, 104, 130); // #456882
    doc.text(`Generated at: ${dateStr}`, 14, 27);

    // Summary Table
    (doc as any).autoTable({
      startY: 35,
      head: [['Key Metrics', 'Value']],
      body: [
        ['Total Net Omset', `Rp ${formatNumber(stats.totalOmset)}`],
        ['Total Invoices', formatNumber(stats.totalInvoice)],
        ['Total Outlet Active (OA)', formatNumber(stats.outletActive)],
        ['Total Quantity Sold', formatNumber(stats.totalQuantity)],
        ['Total SKU Lines (Line Sold)', formatNumber(stats.totalLineSold)],
        ['Avg SKU per Invoice', stats.avgSkuPerInvoice.toFixed(2)]
      ],
      theme: 'striped',
      headStyles: { fillColor: [27, 60, 83], fontSize: 10 },
      styles: { fontSize: 9 }
    });

    const lastY1 = (doc as any).lastAutoTable.finalY || 35;
    doc.setFontSize(11);
    doc.setTextColor(27, 60, 83);
    doc.text('Sales Team Performance', 14, lastY1 + 10);

    // Sales Table (Updated with Avg SKU)
    (doc as any).autoTable({
      startY: lastY1 + 13,
      head: [['Sales Code', 'Net Omset', 'Inv', 'Qty', 'OA', 'Line', 'Avg SKU']],
      body: performance.map(p => [
        p.userCode,
        formatNumber(p.omset),
        p.invoice,
        p.qty,
        p.oa,
        p.totalSku,
        p.avgSkuInv.toFixed(2)
      ]),
      theme: 'grid',
      headStyles: { fillColor: [35, 76, 106], halign: 'center' },
      styles: { fontSize: 8 },
      columnStyles: { 
        1: { halign: 'right' }, 
        2: { halign: 'center' }, 
        3: { halign: 'center' }, 
        4: { halign: 'center' }, 
        5: { halign: 'center' },
        6: { halign: 'center' }
      }
    });

    const lastY2 = (doc as any).lastAutoTable.finalY || lastY1 + 13;
    let pfStartY = lastY2 + 10;
    if (pfStartY > 240) { doc.addPage(); pfStartY = 20; }

    doc.setFontSize(11);
    doc.text('Product Focus OA Achievement', 14, pfStartY);

    const pfHeader = ['Sales', ...focusCodes.map((c, i) => `PF${i+1}\n${c || '-'}`)];
    const pfBody = performance.map(p => [
      p.userCode,
      ...focusCodes.map(code => code ? calculateOA(p.userCode, code) : '-')
    ]);

    (doc as any).autoTable({
      startY: pfStartY + 3,
      head: [pfHeader],
      body: pfBody,
      theme: 'grid',
      headStyles: { fillColor: [69, 104, 130], fontSize: 7, halign: 'center' },
      styles: { fontSize: 7, halign: 'center' },
      columnStyles: { 0: { halign: 'left', fontStyle: 'bold' } }
    });

    // --- PAGE 2: TOP PERFORMANCE ANALYTICS ---
    doc.addPage();
    doc.setFontSize(18);
    doc.setTextColor(27, 60, 83);
    doc.text('Performance Analytics', 14, 20);
    
    doc.setFontSize(9);
    doc.setTextColor(69, 104, 130);
    doc.text('Top 30 Products & Top 30 Outlets Breakdown', 14, 27);

    // Calculations
    const totalOmsetVal = stats.totalOmset || 1;
    const productMap = new Map<string, number>();
    data.forEach(row => productMap.set(row.SKU_Code || 'N/A', (productMap.get(row.SKU_Code || 'N/A') || 0) + getNetValue(row)));
    const topProducts = Array.from(productMap.entries()).map(([code, omset]) => ({ code, omset })).sort((a, b) => b.omset - a.omset).slice(0, 30);

    const outletMap = new Map<string, number>();
    data.forEach(row => outletMap.set(row.Retailer_Code || 'N/A', (outletMap.get(row.Retailer_Code || 'N/A') || 0) + getNetValue(row)));
    const topOutlets = Array.from(outletMap.entries()).map(([code, omset]) => ({ code, omset })).sort((a, b) => b.omset - a.omset).slice(0, 30);

    doc.setFontSize(10);
    doc.setTextColor(27, 60, 83);
    doc.text('Top 30 Products', 14, 37);
    doc.text('Top 30 Outlets', 110, 37);

    // Top Products Table (Left)
    (doc as any).autoTable({
      startY: 40,
      margin: { left: 14, right: 105 },
      head: [['#', 'SKU', 'Net Omset', '%']],
      body: topProducts.map((p, i) => [i + 1, p.code, formatNumber(p.omset), ((p.omset / totalOmsetVal) * 100).toFixed(1) + '%']),
      theme: 'grid',
      headStyles: { fillColor: [27, 60, 83], fontSize: 7 },
      styles: { fontSize: 7, cellPadding: 1 },
      columnStyles: { 0: { cellWidth: 6 }, 1: { cellWidth: 32 }, 2: { halign: 'right', cellWidth: 32 }, 3: { halign: 'center' } }
    });

    // Top Outlets Table (Right)
    (doc as any).autoTable({
      startY: 40,
      margin: { left: 110, right: 14 },
      head: [['#', 'Outlet', 'Net Omset', '%']],
      body: topOutlets.map((o, i) => [i + 1, o.code, formatNumber(o.omset), ((o.omset / totalOmsetVal) * 100).toFixed(1) + '%']),
      theme: 'grid',
      headStyles: { fillColor: [35, 76, 106], fontSize: 7 },
      styles: { fontSize: 7, cellPadding: 1 },
      columnStyles: { 0: { cellWidth: 6 }, 1: { cellWidth: 32 }, 2: { halign: 'right', cellWidth: 32 }, 3: { halign: 'center' } }
    });

    doc.save(`Executive_Full_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="flex items-center gap-2 w-full md:w-auto">
      <button 
        onClick={exportToExcel}
        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2 bg-[#234C6A] text-white rounded-xl hover:bg-[#1B3C53] transition-all text-[11px] md:text-sm font-black shadow-lg"
        title="Export to Excel"
      >
        <FileSpreadsheet className="w-3.5 h-3.5 md:w-4 md:h-4" />
        <span className="hidden sm:inline">Excel</span>
      </button>
      <button 
        onClick={exportToPDF}
        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2 bg-[#456882] text-white rounded-xl hover:bg-[#1B3C53] transition-all text-[11px] md:text-sm font-black shadow-lg"
        title="Export Full PDF Report"
      >
        <FilePdf className="w-3.5 h-3.5 md:w-4 md:h-4" />
        <span className="hidden sm:inline">PDF</span>
      </button>
    </div>
  );
};

export default ExportControls;
