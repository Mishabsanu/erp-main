'use client';

import React, { useState } from 'react';
import { Upload, X, Loader2, Download, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  importRawMaterialsFromGoogleSheet,
  bulkImportRawMaterials,
} from '@/services/rawMaterialApi';

interface RawMaterialBulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RawMaterialBulkImportModal: React.FC<RawMaterialBulkImportModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const [sheetUrl, setSheetUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);
  const [result, setResult] = useState<{ count: number; insertedCount?: number; updatedCount?: number; errors?: string[] } | null>(null);

  if (!isOpen) return null;

  /** GOOGLE SHEET IMPORT */
  const handleGoogleImport = async () => {
    if (!sheetUrl) return;

    try {
      setLoadingGoogle(true);
      const loadingId = toast.loading('Starting Google Sheet import...');

      const res = await importRawMaterialsFromGoogleSheet(sheetUrl);

      toast.dismiss(loadingId);
      if (res.success) {
        setResult(res.data);
        toast.success(res.message || 'Import successful.');
        onSuccess();
      } else {
        toast.error(res.message || 'Import failed');
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || 'Failed to start Google Sheet import.'
      );
    } finally {
      setLoadingGoogle(false);
    }
  };

  /** CSV FILE IMPORT */
  const handleFileUpload = async () => {
    if (!uploadedFile) return;

    try {
      setLoadingFile(true);
      const loadingId = toast.loading('Uploading file and starting import...');

      const res = await bulkImportRawMaterials(uploadedFile);

      toast.dismiss(loadingId);
      if (res.success) {
        setResult(res.data);
        toast.success(res.message || 'Import successful.');
        onSuccess();
      } else {
        toast.error(res.message || 'Import failed');
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || 'Failed to upload and start import.'
      );
    } finally {
      setLoadingFile(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    setUploadedFile(null);
    setSheetUrl('');
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
        onClick={handleClose}
      ></div>

      {/* Right Drawer Modal */}
      <div className="fixed top-0 right-0 h-screen w-full sm:w-[60%] md:w-[35%] bg-white z-[70] shadow-2xl flex flex-col animate-slide-left">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Import Materials
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Registry Bulk Onboarding</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-50 rounded-xl transition-all"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 flex-1 overflow-y-auto space-y-8">
          {result ? (
            <div className="space-y-6 animate-in fade-in zoom-in duration-300 py-10">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-teal-50 text-[#0f766e] rounded-3xl flex items-center justify-center mb-6 border border-teal-100 shadow-sm shadow-teal-900/5">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Import Successful</h3>
                <p className="text-sm text-slate-500 mt-2 font-medium">
                  We've successfully processed <span className="font-black text-[#0f766e]">{result.count}</span> records.
                </p>
                <div className="mt-4 flex gap-4 text-[10px] font-bold uppercase tracking-widest">
                  <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">New: {result.insertedCount || 0}</div>
                  <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">Updated: {result.updatedCount || 0}</div>
                </div>
              </div>

              {result.errors && result.errors.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-50">
                  <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest px-1">Validation Warnings ({result.errors.length})</h4>
                  <div className="max-h-60 overflow-y-auto bg-rose-50/30 border border-rose-100 rounded-2xl p-4 space-y-2">
                    {result.errors.map((err, idx) => (
                      <p key={idx} className="text-[10px] text-rose-700 font-bold font-mono border-b border-rose-200/30 pb-2 last:border-0">{err}</p>
                    ))}
                  </div>
                </div>
              )}
              
              <button
                onClick={handleClose}
                className="w-full py-4 bg-[#0f766e] text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#134e4a] transition-all shadow-xl shadow-teal-900/20 active:scale-95"
              >
                Close & Refresh
              </button>
            </div>
          ) : (
            <>
              {/* GOOGLE SHEET */}
              <div className="bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center shadow-sm">
                      <FileText className="w-5 h-5 text-[#0f766e]" />
                   </div>
                   <div>
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Google Sheet Sync</h3>
                      <p className="text-[10px] text-slate-400 font-medium italic mt-0.5">Cloud based material synchronization</p>
                   </div>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/..."
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white text-sm focus:ring-4 focus:ring-teal-500/10 focus:border-[#0f766e] outline-none transition-all placeholder:text-slate-300 font-medium"
                  />

                  <button
                    disabled={!sheetUrl || loadingGoogle}
                    onClick={handleGoogleImport}
                    className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 ${
                      sheetUrl && !loadingGoogle
                        ? 'bg-[#0f766e] text-white shadow-lg shadow-teal-900/10 hover:bg-[#134e4a]'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {loadingGoogle ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {loadingGoogle ? 'Synchronizing...' : 'Sync via Google Sheet'}
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center justify-center gap-4 text-slate-200 py-2">
                <span className="h-[1px] bg-slate-100 flex-1"></span>
                <span className="text-[10px] font-black tracking-[0.3em] text-slate-300 uppercase">Legacy Path</span>
                <span className="h-[1px] bg-slate-100 flex-1"></span>
              </div>

              {/* CSV UPLOAD */}
              <div className="bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center shadow-sm">
                         <Upload className="w-5 h-5 text-[#0f766e]" />
                      </div>
                      <div>
                         <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">CSV Payload</h3>
                         <p className="text-[10px] text-slate-400 font-medium italic mt-0.5">Local file processing</p>
                      </div>
                   </div>
                   
                   <a
                    href="/templates/raw-material-import-template.csv"
                    download
                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                    title="Download Schema"
                   >
                    <Download className="w-3.5 h-3.5" />
                    Template
                   </a>
                </div>

                {/* DROPZONE */}
                <div
                  onClick={() =>
                    document.getElementById('rawMaterialImportInput')?.click()
                  }
                  className={`border-2 border-dashed rounded-3xl py-12 flex flex-col items-center cursor-pointer transition-all ${
                    uploadedFile ? 'border-[#0f766e] bg-teal-50/20' : 'border-slate-200 bg-white hover:border-[#0f766e] hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-4 rounded-2xl mb-4 transition-all ${uploadedFile ? 'bg-[#0f766e]/10 text-[#0f766e]' : 'bg-slate-50 text-slate-300'}`}>
                    {uploadedFile ? <FileText className="w-10 h-10" /> : <Upload className="w-10 h-10" />}
                  </div>
                  <p className="text-slate-800 text-xs font-black uppercase tracking-widest px-4 text-center">
                    {uploadedFile ? uploadedFile.name : 'Select Data Payload'}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-2 uppercase font-bold tracking-[0.2em]">
                    {uploadedFile ? `${(uploadedFile.size / 1024).toFixed(1)} KB` : 'Required: name, itemCode, unit'}
                  </p>

                  <input
                    id="rawMaterialImportInput"
                    type="file"
                    hidden
                    accept=".csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setUploadedFile(file);
                    }}
                  />
                </div>

                {/* BUTTON */}
                <button
                  disabled={!uploadedFile || loadingFile}
                  onClick={handleFileUpload}
                  className={`mt-6 w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 ${
                    uploadedFile && !loadingFile
                      ? 'bg-[#0f766e] text-white shadow-lg shadow-teal-900/10 hover:bg-[#134e4a]'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {loadingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {loadingFile ? 'Processing...' : 'Execute CSV Upload'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!result && (
          <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-8 py-3 rounded-xl text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              Abort Transaction
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-left {
          animation: slideLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </>
  );
};
