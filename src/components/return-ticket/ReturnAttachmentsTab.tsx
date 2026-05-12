'use client';

import { ReturnTicket } from '@/lib/types';
import { updateReturnTicket } from '@/services/returnTicketApi';
import { FileText, Plus, Trash2, Eye, Download, X, Paperclip, CheckCircle2, Loader2, Upload } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';

interface ReturnAttachmentsTabProps {
  ticket: ReturnTicket;
  onRefresh: () => void;
}

const ReturnAttachmentsTab = ({ ticket, onRefresh }: ReturnAttachmentsTabProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [signedFile, setSignedFile] = useState<File | null>(null);
  const [supportingDocs, setSupportingDocs] = useState<File[]>([]);
  
  const [selectedAttachment, setSelectedAttachment] = useState<string | null>(null);
  
  // Initialize selected attachment once ticket is loaded
  useEffect(() => {
    if (ticket?.attachments?.signedTicket) {
      setSelectedAttachment(ticket.attachments.signedTicket);
    } else if (ticket?.attachments?.supportingDocs?.[0]) {
      setSelectedAttachment(ticket.attachments.supportingDocs[0]);
    }
  }, [ticket]);

  const signedInputRef = useRef<HTMLInputElement>(null);
  const docsInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async () => {
    if (!signedFile && supportingDocs.length === 0) {
      toast.error('Please select at least one file to upload');
      return;
    }

    setIsUploading(true);
    const loadingToast = toast.loading('Uploading attachments...');

    try {
      const formData = new FormData();
      
      if (signedFile) {
        formData.append('signedTicket', signedFile);
      }
      
      supportingDocs.forEach((file) => {
        formData.append('supportingDocs', file);
      });

      // Partial update - only sending files
      const res = await updateReturnTicket(ticket._id!, formData as any, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.success) {
        toast.success('Attachments updated successfully');
        setSignedFile(null);
        setSupportingDocs([]);
        onRefresh();
      } else {
        toast.error(res.message || 'Failed to upload attachments');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while uploading. Please try again.');
    } finally {
      setIsUploading(false);
      toast.dismiss(loadingToast);
    }
  };

  const handleRemoveAttachment = async (url: string, type: 'signedTicket' | 'supportingDocs') => {
    toast('Confirm Deletion', {
      description: 'Permanently remove this document from the cloud?',
      action: {
        label: 'Delete Now',
        onClick: async () => {
          const loadingToast = toast.loading('Removing asset...');
          try {
            const formData = new FormData();
            formData.append('removeUrl', url);
            formData.append('removeType', type);

            const res = await updateReturnTicket(ticket._id!, formData as any, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.success) {
              toast.success('Document purged successfully');
              if (selectedAttachment === url) setSelectedAttachment(null);
              onRefresh();
            } else {
              toast.error(res.message || 'Failed to remove asset');
            }
          } catch (error) {
            console.error(error);
            toast.error('Sync error occurred');
          } finally {
            toast.dismiss(loadingToast);
          }
        },
      },
      cancel: {
        label: 'Keep File',
        onClick: () => toast.dismiss()
      },
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1600px] mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[700px]">
        
        {/* --- LEFT: UPLOAD & LIST --- */}
        <div className="lg:col-span-4 space-y-6">
          {/* Simple Upload Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Upload size={16} className="text-emerald-600" />
              Upload Assets
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Return Note Scan</label>
                <input 
                  type="file" 
                  ref={signedInputRef}
                  onChange={(e) => setSignedFile(e.target.files?.[0] || null)}
                  className="block w-full text-[10px] text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:bg-slate-100 file:text-slate-600 hover:file:bg-slate-200 cursor-pointer"
                />
              </div>
              
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Evidence Photos</label>
                <input 
                  type="file" 
                  ref={docsInputRef}
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      setSupportingDocs(prev => [...prev, ...Array.from(e.target.files!)]);
                    }
                  }}
                  className="block w-full text-[10px] text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:bg-slate-100 file:text-slate-600 hover:file:bg-slate-200 cursor-pointer"
                />
              </div>

              <button
                onClick={handleFileUpload}
                disabled={isUploading || (!signedFile && supportingDocs.length === 0)}
                className="w-full mt-2 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-30 shadow-lg"
              >
                {isUploading ? 'Uploading...' : 'Sync to Repository'}
              </button>
            </div>
          </div>

          {/* Simple List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100">
               <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Available Proofs</h3>
            </div>
            
            <div className="divide-y divide-slate-100">
              {/* Signed Ticket */}
              <div 
                onClick={() => ticket.attachments?.signedTicket && setSelectedAttachment(ticket.attachments.signedTicket)}
                className={`p-4 cursor-pointer transition-all flex items-center justify-between group ${selectedAttachment === ticket.attachments?.signedTicket ? 'bg-sky-50' : 'hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${ticket.attachments?.signedTicket ? 'bg-sky-50 text-sky-600' : 'bg-slate-100 text-slate-300'}`}>
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Signed Return Note</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Primary Scan</p>
                  </div>
                </div>
                {ticket.attachments?.signedTicket && (
                  <div className="flex items-center gap-2">
                     <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveAttachment(ticket.attachments!.signedTicket!, 'signedTicket');
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="Remove signed note"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="w-1.5 h-1.5 bg-sky-500 rounded-full"></div>
                  </div>
                )}
              </div>

              {/* Supporting Docs */}
              {(ticket.attachments?.supportingDocs || []).map((url, i) => (
                <div 
                  key={i}
                  onClick={() => setSelectedAttachment(url)}
                  className={`p-4 cursor-pointer transition-all flex items-center justify-between group ${selectedAttachment === url ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                      <Upload size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Proof Asset {i + 1}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Support File</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveAttachment(url, 'supportingDocs');
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="Remove document"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  </div>
                </div>
              ))}

              {(!ticket.attachments?.signedTicket && (ticket.attachments?.supportingDocs?.length || 0) === 0) && (
                <div className="p-10 text-center text-slate-300">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em]">No Evidence Uploaded</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- RIGHT: LIVE DOCUMENT VIEWER --- */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl h-full flex flex-col overflow-hidden min-h-[600px]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Asset Preview Engine</span>
               </div>
               {selectedAttachment && (
                 <a 
                   href={selectedAttachment} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="text-[10px] font-black text-sky-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                 >
                   <Eye size={12} /> Open Full
                 </a>
               )}
            </div>

            <div className="flex-1 bg-slate-100/50 flex items-center justify-center p-6 min-h-[500px]">
              {selectedAttachment ? (
                selectedAttachment.split('?')[0].toLowerCase().endsWith('.pdf') ? (
                  <div className="w-full h-full flex flex-col gap-6">
                    {/* Smart Action Header */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">PDF Document</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Cloud Hosted Proof</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a 
                          href={selectedAttachment} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-sky-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-sky-700 transition-all flex items-center gap-2 shadow-lg shadow-sky-100"
                        >
                          <Eye size={14} /> View Fullscreen
                        </a>
                        <a 
                          href={selectedAttachment} 
                          download
                          className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2"
                        >
                          <Download size={14} /> Download
                        </a>
                      </div>
                    </div>

                    {/* Native Embed with specific headers attempt */}
                    <div className="flex-1 min-h-[500px] rounded-3xl overflow-hidden border border-slate-200 shadow-2xl bg-white relative group">
                      <iframe 
                        src={selectedAttachment}
                        className="absolute inset-0 w-full h-full"
                        title="Document Viewer"
                      />
                      <div className="absolute inset-0 bg-slate-900/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  </div>
                ) : (
                  <img 
                    src={selectedAttachment} 
                    alt="Return Attachment Preview" 
                    className="max-w-full max-h-full rounded-2xl shadow-2xl border border-white object-contain"
                  />
                )
              ) : (
                <div className="text-center space-y-4 opacity-30">
                   <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto">
                     <FileText size={32} className="text-slate-400" />
                   </div>
                   <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Select asset to view</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReturnAttachmentsTab;
