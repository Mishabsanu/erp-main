'use client';

import React, { useState } from 'react';
import { X, FileSpreadsheet, Upload, Link, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface ImportDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (type: 'csv' | 'sheet', payload: any) => Promise<any>;
    title: string;
}

export default function ImportDialog({ isOpen, onClose, onImport, title }: ImportDialogProps) {
    const [activeTab, setActiveTab] = useState<'sheet' | 'csv'>('sheet');
    const [sheetUrl, setSheetUrl] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    if (!isOpen) return null;

    const handleImport = async () => {
        setLoading(true);
        setStatus(null);
        try {
            let res;
            if (activeTab === 'sheet') {
                if (!sheetUrl) throw new Error('Please enter a Google Sheet URL');
                res = await onImport('sheet', sheetUrl);
            } else {
                if (!file) throw new Error('Please select a CSV file');
                res = await onImport('csv', file);
            }
            
            if (res.success) {
                setStatus({ type: 'success', msg: `Imported successfully! ${res.data?.insertedCount || 0} inserted, ${res.data?.updatedCount || 0} updated.` });
                setTimeout(() => {
                    onClose();
                    setStatus(null);
                }, 3000);
            } else {
                throw new Error(res.message || 'Import failed');
            }
        } catch (err: any) {
            setStatus({ type: 'error', msg: err.message || 'Something went wrong' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100">
                
                {/* Header */}
                <div className="p-8 border-b border-gray-50 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#0f766e]/10 flex items-center justify-center text-[#0f766e] shadow-inner">
                            <FileSpreadsheet size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-[#0f766e] tracking-tight">{title}</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Bulk Management Wizard</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-teal-50 text-gray-400 hover:text-teal-500 rounded-xl transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-2 bg-gray-50/50 border-b border-gray-50">
                    <button 
                        onClick={() => setActiveTab('sheet')}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-xs font-black transition-all ${activeTab === 'sheet' ? 'bg-white text-[#0f766e] shadow-md shadow-gray-200/50' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Link size={16} /> GOOGLE SHEET
                    </button>
                    <button 
                        onClick={() => setActiveTab('csv')}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-xs font-black transition-all ${activeTab === 'csv' ? 'bg-white text-[#0f766e] shadow-md shadow-gray-200/50' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Upload size={16} /> CSV UPLOAD
                    </button>
                </div>

                {/* Content */}
                <div className="p-10 space-y-8">
                    {activeTab === 'sheet' ? (
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Paste Spreadsheet URL</label>
                            <div className="relative">
                                <Link className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input 
                                    type="text"
                                    placeholder="https://docs.google.com/spreadsheets/d/..."
                                    value={sheetUrl}
                                    onChange={(e) => setSheetUrl(e.target.value)}
                                    className="w-full h-14 pl-12 pr-4 bg-[#f9fafb] border-2 border-transparent rounded-2xl text-sm font-bold text-gray-800 focus:bg-white focus:border-[#0f766e] focus:shadow-lg transition-all outline-none"
                                />
                            </div>
                            <p className="text-[10px] text-amber-500 font-bold ml-1 italic">* Ensure your sheet is shared with "Anyone with the link can view"</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Upload Data File</label>
                             <div 
                                onClick={() => document.getElementById('csv-file')?.click()}
                                className="border-2 border-dashed border-gray-200 rounded-3xl p-10 bg-gray-50/50 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-[#0f766e] hover:bg-teal-50/5 transition-all group"
                             >
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-[#0f766e] group-hover:scale-110 transition-all">
                                    <Upload size={28} />
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-800 font-black text-sm">{file ? file.name : 'Select CSV file'}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Maximum 5MB • CSV Only</p>
                                </div>
                                <input id="csv-file" type="file" accept=".csv" hidden onChange={(e) => setFile(e.target.files?.[0] || null)} />
                             </div>
                        </div>
                    )}

                    {status && (
                        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-teal-50 text-teal-700 border border-teal-100'}`}>
                            {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                            <p className="text-xs font-black tracking-tight">{status.msg}</p>
                        </div>
                    )}

                    <div className="flex items-center gap-4 pt-4">
                        <button 
                            onClick={onClose}
                            className="flex-1 py-4 px-6 rounded-2xl border border-gray-200 text-gray-400 font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleImport}
                            disabled={loading}
                            className="flex-[1.5] py-4 px-6 rounded-2xl bg-[#0f766e] text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#0f766e]/20 hover:bg-[#134e4a] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Processing...
                                </>
                            ) : 'Execute Import'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
