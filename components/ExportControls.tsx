
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
  
  // Helper untuk menghitung OA per Sales per SKU
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

  // Helper to calculate net value per row
  const getNetValue = (row: SalesData) => {
    const val = Number(row.Line_Value) || 0;
    return row.Status === 'R' ? -val : val;
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const totalOmsetVal = stats.totalOmset || 1;
    
    // 1. Summary Sheet
    const summaryData = [
      ["Laporan Daily Sales Tracking", ""],
      ["Tanggal Cetak", new Date().toLocaleString('id-ID')],
      ["", ""],
      ["Metrik Utama", "Nilai"],
      ["Total Net Omset", stats.totalOmset],
      ["Total Invoices", stats.totalInvoice],
      ["Total Quantity", stats.totalQuantity],
      ["Outlet Active (OA)", stats.outletActive],
      ["Total Baris SKU Terjual (Line Sold)", stats.totalLineSold],
      ["Rata-rata SKU/Inv", stats.avgSkuPerInvoice.toFixed(2)]
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan");

    // 2. Sales Performance Sheet
    const perfData = performance.map(p => ({
      "Kode Sales": p.userCode,
      "Net Omset": p.omset,
      "Jumlah Invoice": p.invoice,
      "Net Qty": p.qty,
      "OA Total": p.oa,
      "Total Baris SKU": p.totalSku,
      "Avg SKU/Inv": p.avgSkuInv.toFixed(2)
    }));
    const wsPerf = XLSX.utils.json_to_sheet(perfData);
    XLSX.utils.book_append_sheet(wb, wsPerf, "Performa Sales");

    // 3. Product Focus Achievement Sheet
    const pfData = performance.map(p => {
      const row: any = { "Kode Sales": p.userCode };
      focusCodes.forEach((code, idx) => {
        row[`PF${idx + 1} (${code || 'N/A'})`] = code ? calculateOA(p.userCode, code) : 0;
      });
      return row;
    });
    const wsPF = XLSX.utils.json_to_sheet(pfData);
    XLSX.utils.book_append_sheet(wb, wsPF, "Product Focus");

    // 4. Top 30 Products Sheet
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
        "Contribution (%)": ((p.omset / totalOmsetVal) * 100).toFixed(2) + "%"
      }));
    const wsTopProducts = XLSX.utils.json_to_sheet(topProducts);
    XLSX.utils.book_append_sheet(wb, wsTopProducts, "Top 30 Products");

    // 5. Top 30 Outlets Sheet
    const outletMap = new Map<string, number>();
    data.forEach(row => {
      const retailer = row.Retailer_Code || 'Unknown';
      outletMap.set(retailer, (outletMap.get(retailer) || 0) + getNetValue(row));
    });
    const topOutlets = Array.from(outletMap.entries())
      .map(([code, omset]) => ({ code, omset }))
      .sort((a, b) => b.omset - a.omset)
      .slice(0, 30)
      .map((o, i) => ({
        "No": i + 1,
        "Retailer Code": o.code,
        "Net Omset": o.omset,
        "Contribution (%)": ((o.omset / totalOmsetVal) * 100).toFixed(2) + "%"
      }));
    const wsTopOutlets = XLSX.utils.json_to_sheet(topOutlets);
    XLSX.utils.book_append_sheet(wb, wsTopOutlets, "Top 30 Outlets");

    // 6. Raw Data Sheet (Detail Transaksi Rapi)
    // Menyesuaikan dengan kolom yang tampil di UI: Date, No Inv, Status, Sales, Outlet, Product, Price, Qty, Value
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
    XLSX.utils.book_append_sheet(wb, wsRaw, "Detail Transaksi");

    XLSX.writeFile(wb, `DailySalesTracking_Full_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4'
    });
    const dateStr = new Date().toLocaleDateString('id-ID');

    // --- PAGE 1 ---
    doc.setFontSize(18);
    doc.setTextColor(79, 70, 229);
    doc.text('Daily Sales Tracking Report', 14, 15);
    
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Dicetak pada: ${dateStr}`, 14, 22);

    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('Ringkasan Performa', 14, 32);
    
    (doc as any).autoTable({
      startY: 35,
      head: [['Metrik Utama', 'Nilai']],
      body: [
        ['Total Net Omset', `Rp ${formatNumber(stats.totalOmset)}`],
        ['Total Invoices', formatNumber(stats.totalInvoice)],
        ['Total Outlet Active', formatNumber(stats.outletActive)],
        ['Total Qty Terjual', formatNumber(stats.totalQuantity)],
        ['Total Line Sold', formatNumber(stats.totalLineSold)],
        ['Avg SKU per Invoice', stats.avgSkuPerInvoice.toFixed(2)]
      ],
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 9 }
    });

    const lastY1 = (doc as any).lastAutoTable.finalY || 35;
    doc.setFontSize(12);
    doc.text('Performa Sales Team', 14, lastY1 + 10);
    
    (doc as any).autoTable({
      startY: lastY1 + 13,
      head: [['Sales', 'Net Omset', 'Inv', 'Qty', 'OA', 'SKU']],
      body: performance.map(p => [
        p.userCode,
        formatNumber(p.omset),
        p.invoice,
        p.qty,
        p.oa,
        p.totalSku
      ]),
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], halign: 'center' },
      styles: { fontSize: 8 },
      columnStyles: {
        1: { halign: 'right' },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'center' }
      }
    });

    const lastY2 = (doc as any).lastAutoTable.finalY || lastY1 + 13;
    let pfStartY = lastY2 + 10;
    if (pfStartY > 250) { doc.addPage(); pfStartY = 20; }
    
    doc.setFontSize(12);
    doc.text('OA Product Focus', 14, pfStartY);
    
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
      headStyles: { fillColor: [67, 56, 202], fontSize: 6, halign: 'center' },
      styles: { fontSize: 7, halign: 'center' },
      columnStyles: { 0: { halign: 'left', fontStyle: 'bold', minCellWidth: 20 } }
    });

    // --- PAGE 2: TOP 30 PRODUCT & TOP 30 OUTLET ---
    doc.addPage();
    doc.setFontSize(18);
    doc.setTextColor(79, 70, 229);
    doc.text('Top Performance Analytics', 14, 15);
    
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Top 30 Products & Top 30 Outlets Breakdown', 14, 22);

    // Calculate Top 30 Products
    const productMap = new Map<string, number>();
    data.forEach(row => {
      const sku = row.SKU_Code || 'Unknown';
      productMap.set(sku, (productMap.get(sku) || 0) + getNetValue(row));
    });
    const topProducts = Array.from(productMap.entries())
      .map(([code, omset]) => ({ code, omset }))
      .sort((a, b) => b.omset - a.omset)
      .slice(0, 30);

    // Calculate Top 30 Outlets
    const outletMap = new Map<string, number>();
    data.forEach(row => {
      const retailer = row.Retailer_Code || 'Unknown';
      outletMap.set(retailer, (outletMap.get(retailer) || 0) + getNetValue(row));
    });
    const topOutlets = Array.from(outletMap.entries())
      .map(([code, omset]) => ({ code, omset }))
      .sort((a, b) => b.omset - a.omset)
      .slice(0, 30);

    const totalOmsetVal = stats.totalOmset || 1;

    // Table Titles
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text('Top 30 Products', 14, 32);
    doc.text('Top 30 Outlets', 110, 32);

    // Table: Top Products (Left Column)
    (doc as any).autoTable({
      startY: 35,
      margin: { left: 14, right: 105 },
      head: [['No', 'Code', 'Omset', '%']],
      body: topProducts.map((p, i) => [
        i + 1,
        p.code,
        formatNumber(p.omset),
        ((p.omset / totalOmsetVal) * 100).toFixed(2) + '%'
      ]),
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], fontSize: 7, halign: 'center' },
      styles: { fontSize: 7, cellPadding: 1 },
      columnStyles: {
        0: { halign: 'center', cellWidth: 8 },
        1: { halign: 'left', cellWidth: 35 },
        2: { halign: 'right', cellWidth: 30 },
        3: { halign: 'center', cellWidth: 15 }
      }
    });

    // Table: Top Outlets (Right Column)
    (doc as any).autoTable({
      startY: 35,
      margin: { left: 110, right: 14 },
      head: [['No', 'Code', 'Omset', '%']],
      body: topOutlets.map((o, i) => [
        i + 1,
        o.code,
        formatNumber(o.omset),
        ((o.omset / totalOmsetVal) * 100).toFixed(2) + '%'
      ]),
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], fontSize: 7, halign: 'center' },
      styles: { fontSize: 7, cellPadding: 1 },
      columnStyles: {
        0: { halign: 'center', cellWidth: 8 },
        1: { halign: 'left', cellWidth: 35 },
        2: { halign: 'right', cellWidth: 30 },
        3: { halign: 'center', cellWidth: 15 }
      }
    });

    doc.save(`DailySalesTracking_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={exportToExcel}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-semibold shadow-sm"
      >
        <FileSpreadsheet className="w-4 h-4" />
        Export Excel
      </button>
      <button 
        onClick={exportToPDF}
        className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors text-sm font-semibold shadow-sm"
      >
        <FilePdf className="w-4 h-4" />
        Export PDF (Portrait)
      </button>
    </div>
  );
};

export default ExportControls;
