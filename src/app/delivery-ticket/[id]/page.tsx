'use client';

import LoadingSpinner from '@/components/LoadingSpinner';
import { DeliveryTicket } from '@/lib/types';
import { getDeliveryTicketById, updateDeliveryTicket } from '@/services/deliveryTicketApi';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import withAuth from '@/components/withAuth';
import DeliveryTicketPreview from '@/components/delivery-ticket/DeliveryTicketPreview';
import { Section } from '@/components/ui/Section';
import { FileText, Upload, Trash2, Eye, Download, Plus } from 'lucide-react';

const ViewDeliveryTicketPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || '';

  const [ticket, setTicket] = useState<DeliveryTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'preview' | 'attachments'>('preview');
  const [uploading, setUploading] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<string | null>(null);

  // Initialize selected attachment once ticket is loaded
  useEffect(() => {
    if (ticket?.attachments?.signedTicket) {
      setSelectedAttachment(ticket.attachments.signedTicket);
    } else if (ticket?.attachments?.supportingDocs?.[0]) {
      setSelectedAttachment(ticket.attachments.supportingDocs[0]);
    }
  }, [ticket]);

  /* ---------------- UPLOAD STATE ---------------- */
  const [signedTicketFile, setSignedTicketFile] = useState<File | null>(null);
  const [supportingDocs, setSupportingDocs] = useState<File[]>([]);

  const fetchTicket = async () => {
    setLoading(true);
    try {
      const fetchedTicket = await getDeliveryTicketById(id);
      setTicket(fetchedTicket);
    } catch (error) {
      toast.error('Failed to fetch delivery ticket data.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTicket();
    }
  }, [id]);

  const handleEdit = () => {
    router.push(`/delivery-ticket/edit/${id}`);
  };

  const handleUpload = async () => {
    if (!signedTicketFile && supportingDocs.length === 0) {
      toast.error('Please select files to upload.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      if (signedTicketFile) formData.append('signedTicket', signedTicketFile);
      supportingDocs.forEach(file => formData.append('supportingDocs', file));
      
      await updateDeliveryTicket(id, formData as any, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Attachments updated successfully!');
      setSignedTicketFile(null);
      setSupportingDocs([]);
      fetchTicket(); // Refresh data
    } catch (error) {
      toast.error('Failed to upload attachments.');
      console.error(error);
    } finally {
      setUploading(false);
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

            await updateDeliveryTicket(id, formData as any, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Document purged successfully');
            if (selectedAttachment === url) setSelectedAttachment(null);
            fetchTicket();
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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!ticket) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Delivery ticket not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">
      {/* Tab Switcher */}
      <div className="flex gap-4 mb-8 bg-white p-1 rounded-xl shadow-sm border border-gray-100 print:hidden">
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'preview' 
            ? 'bg-sky-600 text-white shadow-md' 
            : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Document Preview
          </div>
        </button>
        <button
          onClick={() => setActiveTab('attachments')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'attachments' 
            ? 'bg-sky-600 text-white shadow-md' 
            : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Attachments & Uploads
          </div>
        </button>
      </div>

      <div className="w-full">
        {activeTab === 'preview' ? (
          <DeliveryTicketPreview
            data={ticket}
            mode="view"
            onBack={() => router.back()}
            onEdit={handleEdit}
          />
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1600px] mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[700px]">
              
              {/* --- LEFT: UPLOAD & LIST --- */}
              <div className="lg:col-span-4 space-y-6">
                {/* Simple Upload Form */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Upload size={16} className="text-sky-600" />
                    Upload Assets
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Signed Ticket Scan</label>
                      <input 
                        type="file" 
                        onChange={(e) => setSignedTicketFile(e.target.files?.[0] || null)}
                        className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-black file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer"
                        accept=".pdf,image/*"
                      />
                    </div>
                    
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Supporting Proofs</label>
                      <input 
                        type="file" 
                        multiple
                        onChange={(e) => setSupportingDocs(Array.from(e.target.files || []))}
                        className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-black file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100 cursor-pointer"
                        accept=".pdf,image/*"
                      />
                    </div>

                    <button
                      onClick={handleUpload}
                      disabled={uploading || (!signedTicketFile && supportingDocs.length === 0)}
                      className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-xl shadow-slate-200"
                    >
                      {uploading ? 'Synchronizing...' : 'Upload & Sync'}
                    </button>
                  </div>
                </div>

                {/* Available Assets List */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Proofs</h3>
                    <div className="px-2 py-1 bg-white rounded text-[10px] font-bold text-slate-500 border border-slate-200">
                      {(ticket.attachments?.supportingDocs?.length || 0) + (ticket.attachments?.signedTicket ? 1 : 0)} Files
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                    {/* Signed Ticket */}
                    <div 
                      onClick={() => ticket.attachments?.signedTicket && setSelectedAttachment(ticket.attachments.signedTicket)}
                      className={`p-4 cursor-pointer transition-all flex items-center justify-between group ${selectedAttachment === ticket.attachments?.signedTicket ? 'bg-sky-50' : 'hover:bg-slate-50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${ticket.attachments?.signedTicket ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-300'}`}>
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">Signed Delivery Note</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Primary Asset</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {ticket.attachments?.signedTicket && (
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
                        )}
                        {ticket.attachments?.signedTicket && <div className="w-1.5 h-1.5 bg-sky-500 rounded-full shadow-[0_0_8px_rgba(14,165,233,0.5)]"></div>}
                      </div>
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
                            <p className="text-xs font-bold text-slate-900">Attachment {i + 1}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Secondary Proof</p>
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
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        </div>
                      </div>
                    ))}

                    {(!ticket.attachments?.signedTicket && (ticket.attachments?.supportingDocs?.length || 0) === 0) && (
                      <div className="p-10 text-center text-slate-300">
                        <Plus size={24} className="mx-auto mb-2 opacity-20" />
                        <p className="text-[9px] font-black uppercase tracking-widest">No Assets Found</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* --- RIGHT: VIEWER --- */}
              <div className="lg:col-span-8">
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm h-full flex flex-col">
                  <div className="bg-slate-50/50 px-6 py-3 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></div>
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Live Document Preview</span>
                    </div>
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
                        <div className="relative group w-full h-full flex items-center justify-center">
                          <img 
                            src={selectedAttachment} 
                            alt="Attachment Preview" 
                            className="max-w-full max-h-full rounded-2xl shadow-2xl border border-white object-contain"
                          />
                        </div>
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
        )}
      </div>
    </div>
  );
};

export default withAuth(ViewDeliveryTicketPage, [{ module: 'delivery_ticket', action: 'view' }]);
