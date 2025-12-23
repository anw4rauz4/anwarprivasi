
export interface SalesData {
  Distributor_Code: string;
  Retailer_Code: string;
  Branch_Code: string;
  User_Code: string;
  Invoice_No: string;
  Invoice_Date: string;
  SKU_Code: string;
  Batch_Code: string;
  UOM: string;
  Invoice_Qty: number;
  SKU_Price: number;
  Line_Value: number;
  Sku_Weight: number;
  Total_Amount: number;
  Net_Amount: number;
  Total_Discount: number;
  Total_Tax: number;
  Total_Return: number;
  Total_Weight: number;
  Total_Lines: number;
  Status: string;
  Delivery_Status: string;
}

export interface KPIStats {
  totalOmset: number;
  totalInvoice: number;
  totalQuantity: number;
  outletActive: number;
  avgSkuPerInvoice: number;
  totalLineSold: number;
}

export interface SalesTeamPerformance {
  userCode: string;
  omset: number;
  invoice: number;
  qty: number;
  oa: number;
  avgSkuInv: number;
  totalSku: number;
}

export interface ProductPerformance {
  skuCode: string;
  totalQty: number;
  totalOmset: number;
}

export interface OutletPareto {
  retailerCode: string;
  omset: number;
  cumulativeOmset: number;
  cumulativePercentage: number;
  isTop80: boolean;
}

export interface DailyOmset {
  label: string;
  timestamp: number;
  omset: number;
}
