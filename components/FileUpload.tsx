
import React from 'react';
import { Upload, AlertCircle, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  error: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload, isLoading, error }) => {
  return (
    <div className="w-full max-w-xl p-10 bg-white rounded-[2.5rem] shadow-2xl border border-[#E3E3E3] transition-all">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-[#1B3C53] mb-3">Upload Sales Report</h2>
        <p className="text-[#456882] font-medium">Generate real-time executive dashboards from XLSX/CSV.</p>
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
          border-4 border-dashed rounded-3xl p-14 flex flex-col items-center gap-6 transition-all
          ${isLoading ? 'bg-[#E3E3E3]/50 border-[#456882]' : 'bg-[#1B3C53]/5 border-[#234C6A] group-hover:border-[#1B3C53] group-hover:bg-[#1B3C53]/10'}
        `}>
          {isLoading ? (
            <Loader2 className="w-16 h-16 text-[#1B3C53] animate-spin" />
          ) : (
            <div className="bg-[#1B3C53] p-6 rounded-2xl group-hover:scale-110 transition-transform shadow-lg">
              <Upload className="w-10 h-10 text-white" />
            </div>
          )}
          <div className="text-center">
            <span className="text-[#1B3C53] font-black text-lg">
              {isLoading ? 'Processing Analytics...' : 'Drop your files here'}
            </span>
            <p className="text-[#456882] text-sm mt-2 font-bold uppercase tracking-wider">Supports up to 10MB</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-8 p-5 bg-red-50 border-2 border-red-200 rounded-2xl flex items-start gap-4 text-red-700 animate-pulse">
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <p className="text-sm font-black">{error}</p>
        </div>
      )}

      <div className="mt-10 pt-10 border-t-2 border-[#E3E3E3]">
        <div className="grid grid-cols-2 gap-6 text-xs font-black uppercase tracking-widest text-[#456882]">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#1B3C53]"></div>
            Excel/CSV Native
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#234C6A]"></div>
            Real-time KPIs
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#456882]"></div>
            Pareto Logic
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#234C6A]"></div>
            Export Ready
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
