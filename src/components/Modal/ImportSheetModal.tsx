'use client';

import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  importSalesFromGoogleSheet,
  importSalesFromCsv,
} from '@/services/salesApi';

type Props = {
  onClose: () => void;
  onImported?: () => void;
};

const ImportSheetModal: React.FC<Props> = ({ onClose, onImported }) => {
  const [sheetUrl, setSheetUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);

  /** GOOGLE SHEET IMPORT */
  const handleGoogleImport = async () => {
    if (!sheetUrl) return;

    try {
      setLoadingGoogle(true);
      const loadingId = toast.loading('Starting Google Sheet import...');

      const res = await importSalesFromGoogleSheet(sheetUrl);

      toast.dismiss(loadingId);
      toast.success(res.message || 'Import started. Processing in background.');

      onImported?.();
      onClose();
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

      const res = await importSalesFromCsv(uploadedFile);

      toast.dismiss(loadingId);
      toast.success(res.message || 'Import started.');

      onImported?.();
      onClose();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || 'Failed to upload and start import.'
      );
    } finally {
      setLoadingFile(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      ></div>

      {/* Right Drawer Modal */}
      <div className="fixed top-0 right-0 h-screen w-full sm:w-[60%] md:w-[30%] bg-white z-50 shadow-2xl flex flex-col animate-slide-left">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Import Enquiries
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-8">
          {/* GOOGLE SHEET */}
          <div className="border border-gray-200 rounded-xl p-5 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Import from Google Sheet
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Make sure sheet is public & paste the link.
            </p>

            <input
              type="text"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="Paste Google Sheet URL..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-teal-500 outline-none"
            />

            <button
              disabled={!sheetUrl || loadingGoogle}
              onClick={handleGoogleImport}
              className={`mt-4 w-full py-2.5 rounded-lg font-semibold transition ${
                sheetUrl && !loadingGoogle
                  ? 'bg-teal-700 hover:bg-teal-800 text-white shadow-md'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loadingGoogle ? 'Importing...' : 'Import from Google Sheet'}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center gap-2 text-gray-400 my-4">
            <span className="h-[1px] bg-gray-300 flex-1"></span>
            OR
            <span className="h-[1px] bg-gray-300 flex-1"></span>
          </div>

          {/* CSV UPLOAD */}
          <div className="border border-gray-200 rounded-xl p-5 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Upload CSV / Excel
            </h3>

            {/* TEMPLATE */}
            <div className="flex items-center justify-between bg-white border border-gray-300 rounded-xl px-4 py-3">
              <div className="min-w-0 flex-1 mr-3">
                <p className="text-sm font-medium text-gray-800 truncate">
                  Download Template
                </p>
                <p className="text-[11px] text-gray-500 leading-tight">
                  Standard enquiry structure for bulk upload
                </p>
              </div>

              <a
                href="/templates/sale-import-template.csv"
                download
                className="px-4 py-2 text-xs rounded-lg bg-gray-800 hover:bg-gray-900 text-white font-semibold transition whitespace-nowrap"
              >
                Download
              </a>
            </div>

            {/* DROPZONE */}
            <div
              onClick={() =>
                document.getElementById('importFileInput')?.click()
              }
              className="mt-5 border-2 border-dashed border-gray-300 rounded-xl py-10 bg-white flex flex-col items-center cursor-pointer hover:border-teal-500 hover:bg-gray-50 transition"
            >
              <Upload className="w-10 h-10 text-gray-400 mb-3" />
              <p className="text-gray-600 text-sm font-medium">
                Click to upload CSV / XLSX file
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Supported: .csv, .xls, .xlsx
              </p>

              <input
                id="importFileInput"
                type="file"
                hidden
                accept=".csv, .xls, .xlsx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setUploadedFile(file);
                }}
              />
            </div>

            {/* File Preview */}
            {uploadedFile && (
              <div className="mt-4 flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {uploadedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(uploadedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>

                <button
                  onClick={() => setUploadedFile(null)}
                  className="bg-teal-700 text-white text-[10px] uppercase font-bold px-2 py-1 rounded hover:bg-teal-800 transition ml-2"
                >
                  Remove
                </button>
              </div>
            )}

            {/* BUTTON */}
            <button
              disabled={!uploadedFile || loadingFile}
              onClick={handleFileUpload}
              className={`mt-5 w-full py-2.5 rounded-lg font-semibold transition ${
                uploadedFile && !loadingFile
                  ? 'bg-teal-700 hover:bg-teal-800 text-white shadow-md'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loadingFile ? 'Uploading...' : 'Upload & Import'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t bg-white flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition"
          >
            Cancel
          </button>
        </div>
      </div>
      <style jsx>{`
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-left {
          animation: slideLeft 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default ImportSheetModal;
