'use client';

import LoadingSpinner from '@/components/LoadingSpinner';
import { ReturnTicket } from '@/lib/types';
import { getReturnTicketById, updateReturnTicket } from '@/services/returnTicketApi';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ReturnTicketPreview from '@/components/return-ticket/ReturnTicketPreview';
import { FileText, Upload, ArrowLeft, Edit2 } from 'lucide-react';
import ReturnAttachmentsTab from '@/components/return-ticket/ReturnAttachmentsTab';

const ViewReturnTicketPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || '';

  const [ticket, setTicket] = useState<ReturnTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'document' | 'attachments'>('document');

  const fetchTicket = async () => {
    try {
      const fetchedTicket = await getReturnTicketById(id);
      setTicket(fetchedTicket);
    } catch (error) {
      toast.error('Failed to fetch return ticket data.');
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
    router.push(`/return-ticket/edit/${id}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!ticket) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Return ticket not found.
      </div>
    );
  }

  const tabs = [
    { key: 'document', label: 'View Document', icon: FileText },
    { key: 'attachments', label: 'Manage Attachments', icon: Upload },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">
      {/* Tab Switcher */}
      <div className="flex gap-4 mb-8 bg-white p-1 rounded-xl shadow-sm border border-gray-100 print:hidden">
        <button
          onClick={() => setActiveTab('document')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'document' 
            ? 'bg-[#0f766e] text-white shadow-md' 
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
            ? 'bg-[#0f766e] text-white shadow-md' 
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
        {activeTab === 'document' ? (
          <ReturnTicketPreview
            data={ticket}
            mode="view"
            onBack={() => router.back()}
            onEdit={handleEdit}
          />
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <ReturnAttachmentsTab 
                ticket={ticket} 
                onRefresh={fetchTicket}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewReturnTicketPage;
