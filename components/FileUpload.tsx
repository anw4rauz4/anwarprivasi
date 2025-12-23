
import React from 'react';
import { Upload, FileText, AlertCircle, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  error: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload, isLoading, error }) => {
  return (
    <div className="w-full max-w-lg p-8 bg-white rounded-3xl shadow-xl border border-slate-100 transition-all">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Upload Sales Report</h2>
        <p className="text-slate-500 text-sm">Select an Excel (.xlsx) or CSV file to generate your dashboard.</p>
      </div>

      <div className="relative group">
        <input 
          type="file" 
          accept=".xlsx, .xls, .csv" 
          onChange={onUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
          disabled={isLoading}
        />
        <div className={`
          border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-4 transition-all
          ${isLoading ? 'bg-slate-50 border-slate-200' : 'bg-indigo-50/30 border-indigo-200 group-hover:border-indigo-400 group-hover:bg-indigo-50'}
        `}>
          {isLoading ? (
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          ) : (
            <div className="bg-indigo-100 p-4 rounded-full group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-indigo-600" />
            </div>
          )}
          <div className="text-center">
            <span className="text-indigo-600 font-semibold text-sm">
              {isLoading ? 'Processing your data...' : 'Click to browse or drag and drop'}
            </span>
            <p className="text-slate-400 text-xs mt-1">Maximum file size 10MB</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700 animate-pulse">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="mt-8 pt-8 border-t border-slate-100">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
            Supports XLSX/CSV
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
            Real-time KPIs
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
            Pareto Analysis
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
            Sales Tracking
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
