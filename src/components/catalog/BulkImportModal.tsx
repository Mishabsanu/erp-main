'use client';

import React, { useState } from 'react';
import { Upload, X, Loader2, Download, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  importProductsFromGoogleSheet,
  bulkImportProducts,
} from '@/services/catalogApi';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const [sheetUrl, setSheetUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);
  const [result, setResult] = useState<{ count: number; errors?: string[] } | null>(null);

  if (!isOpen) return null;

  /** GOOGLE SHEET IMPORT */
  const handleGoogleImport = async () => {
    if (!sheetUrl) return;

    try {
      setLoadingGoogle(true);
      const loadingId = toast.loading('Starting Google Sheet import...');

      const res = await importProductsFromGoogleSheet(sheetUrl);

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

      const res = await bulkImportProducts(uploadedFile);

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
      <div className="fixed top-0 right-0 h-screen w-full sm:w-[60%] md:w-[30%] bg-white z-[70] shadow-2xl flex flex-col animate-slide-left">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Bulk Import Products
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Import products via Google Sheet or CSV</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-8">
          {result ? (
            <div className="space-y-6 animate-in fade-in zoom-in duration-300 py-10">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 border-2 border-green-200">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Import Completed!</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Processed <span className="font-bold text-teal-700">{result.count}</span> products.
                </p>
              </div>

              {result.errors && result.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-red-600 uppercase tracking-widest px-1">Import Warnings ({result.errors.length})</h4>
                  <div className="max-h-60 overflow-y-auto bg-red-50 border border-red-100 rounded-lg p-3 space-y-2">
                    {result.errors.map((err, idx) => (
                      <p key={idx} className="text-[10px] text-red-700 font-medium font-mono border-b border-red-200/50 pb-1 last:border-0">{err}</p>
                    ))}
                  </div>
                </div>
              )}
              
              <button
                onClick={handleClose}
                className="w-full py-3 bg-teal-700 text-white rounded-xl font-bold hover:bg-teal-800 transition shadow-lg shadow-teal-900/10"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* GOOGLE SHEET */}
              <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-3 px-1 uppercase tracking-wider">
                  <div className="w-2 h-4 bg-teal-600 rounded-full"></div>
                  Import from Google Sheet
                </h3>
                <p className="text-xs text-gray-500 mb-4 px-1">
                  Make sure your sheet is set to "Anyone with the link can view".
                </p>

                <input
                  type="text"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="Paste Google Sheet URL..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                />

                <button
                  disabled={!sheetUrl || loadingGoogle}
                  onClick={handleGoogleImport}
                  className={`mt-4 w-full py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
                    sheetUrl && !loadingGoogle
                      ? 'bg-teal-700 hover:bg-teal-800 text-white shadow-md'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {loadingGoogle ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {loadingGoogle ? 'Importing...' : 'Import from Google Sheet'}
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center justify-center gap-3 text-gray-400 my-2">
                <span className="h-[1px] bg-gray-200 flex-1"></span>
                <span className="text-[10px] font-bold tracking-widest text-gray-300 uppercase">OR</span>
                <span className="h-[1px] bg-gray-200 flex-1"></span>
              </div>

              {/* CSV UPLOAD */}
              <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-3 px-1 uppercase tracking-wider">
                  <div className="w-2 h-4 bg-teal-600 rounded-full"></div>
                  Upload CSV File
                </h3>

                {/* TEMPLATE */}
                <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 mb-5 hover:border-teal-200 transition-colors">
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="text-xs font-bold text-gray-800 truncate">
                      Sample Template
                    </p>
                    <p className="text-[10px] text-gray-500 leading-tight">
                      Required: name, itemCode
                    </p>
                  </div>

                  <a
                    href="/templates/product-import-template.csv"
                    download
                    className="p-2 text-teal-700 hover:bg-teal-50 rounded-lg transition"
                    title="Download Template"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                </div>

                {/* DROPZONE */}
                <div
                  onClick={() =>
                    document.getElementById('importFileInput')?.click()
                  }
                  className={`border-2 border-dashed rounded-2xl py-10 flex flex-col items-center cursor-pointer transition-all ${
                    uploadedFile ? 'border-teal-500 bg-teal-50/30' : 'border-gray-200 bg-white hover:border-teal-400 hover:bg-gray-50'
                  }`}
                >
                  <div className={`p-4 rounded-full mb-3 transition-all ${uploadedFile ? 'bg-teal-100 text-teal-600' : 'bg-gray-50 text-gray-400'}`}>
                    {uploadedFile ? <FileText className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                  </div>
                  <p className="text-gray-700 text-sm font-bold px-4 text-center">
                    {uploadedFile ? uploadedFile.name : 'Select CSV file'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">
                    {uploadedFile ? `${(uploadedFile.size / 1024).toFixed(1)} KB` : 'Only .csv supported'}
                  </p>

                  <input
                    id="importFileInput"
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
                  className={`mt-5 w-full py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
                    uploadedFile && !loadingFile
                      ? 'bg-teal-700 hover:bg-teal-800 text-white shadow-md'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {loadingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {loadingFile ? 'Processing...' : 'Upload & Start Import'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!result && (
          <div className="p-5 border-t bg-white flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-100 transition"
            >
              Cancel
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
          animation: slideLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </>
  );
};
