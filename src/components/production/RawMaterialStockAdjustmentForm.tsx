'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getRawMaterialDropdown } from '@/services/rawMaterialApi';
import {
  TrendingUp,
  CheckCircle2,
  FileText,
  AlertCircle,
  Hash,
  X,
  Loader2,
  Layers
} from 'lucide-react';
import { toast } from 'sonner';
import SearchableSelect from '@/components/shared/SearchableSelect';

interface RawMaterialStockAdjustmentFormProps {
  onSubmit: (materialId: string, quantity: number, note?: string) => Promise<void>;
  onCancel: () => void;
  initialMaterialId?: string;
  initialData?: {
    materialId?: string;
    quantity?: number;
    note?: string;
  };
  isEditMode?: boolean;
}

const RawMaterialStockAdjustmentForm: React.FC<RawMaterialStockAdjustmentFormProps> = ({
  onSubmit,
  onCancel,
  initialMaterialId,
  initialData,
  isEditMode = false
}) => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaterialId, setSelectedMaterialId] = useState(initialData?.materialId || initialMaterialId || '');
  const [quantity, setQuantity] = useState<number>(initialData?.quantity || 0);
  const [note, setNote] = useState(initialData?.note || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const data = await getRawMaterialDropdown();
        setMaterials(data || []);
      } catch (error) {
        toast.error('Failed to load raw materials');
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, []);

  const materialOptions = useMemo(() =>
    materials.map(m => ({ value: m._id, label: `${m.name} (${m.itemCode})` })),
    [materials]);

  const selectedMaterial = useMemo(() =>
    materials.find(m => m._id === selectedMaterialId),
    [materials, selectedMaterialId]);

  // Autofill current quantity when material is selected (only for new adjustments)
  useEffect(() => {
    if (selectedMaterial) {
      if (!isEditMode || isInitialized) {
        setQuantity(selectedMaterial.availableQty);
      }
      setIsInitialized(true);
    }
  }, [selectedMaterial, isEditMode, isInitialized]);

  const handleSubmit = async () => {
    if (!selectedMaterialId) return toast.error('Please select a material');
    if (!selectedMaterial) return;

    // Calculate the difference (Adjustment)
    const finalQty = quantity - selectedMaterial.availableQty;

    if (finalQty === 0) return toast.error('No changes detected in stock level');

    setIsSubmitting(true);
    try {
      const adjustmentNote = isEditMode
        ? (note || `Manual correction to ${quantity}.`)
        : `Manual adjustment from ${selectedMaterial.availableQty} to ${quantity}. ${note}`;

      await onSubmit(selectedMaterialId, finalQty, adjustmentNote);
      onCancel();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Adjustment failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-white rounded-[2rem] border border-slate-100">
        <Loader2 className="w-10 h-10 text-[#0f766e] animate-spin opacity-20" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10 font-sans">
      {/* HEADER AREA */}
      <div className="max-w-full mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[1.5rem] border border-slate-200/60 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-[#0f766e]/10 rounded-2xl flex items-center justify-center text-[#0f766e]">
            {isEditMode ? <Layers size={28} /> : <TrendingUp size={28} />}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
              {isEditMode ? 'Update Stock Record' : 'Adjust Stock Volume'}
            </h2>
            <p className="text-slate-400 font-medium text-sm">
              {isEditMode ? 'Inventory Correction' : 'Inventory Maintenance'} &bull; Resource Balancing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-2.5 bg-[#0f766e] text-white rounded-xl font-bold text-sm shadow-lg shadow-teal-900/20 hover:bg-[#134e4a] transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {isEditMode ? <CheckCircle2 size={16} /> : <CheckCircle2 size={16} />}
            {isSubmitting ? 'Processing...' : (isEditMode ? 'Update Adjustment' : 'Authorize Adjustment')}
          </button>
        </div>
      </div>

      <div className="max-w-full mx-auto space-y-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* ADJUSTMENT SPECIFICATIONS */}
          <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-200/60 shadow-sm space-y-8">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
              <span className="w-2 h-6 bg-[#0f766e] rounded-full" />
              Resource Selection
            </h3>

            <div className="space-y-6">
              <SearchableSelect
                label="Select Raw Material"
                options={materialOptions}
                onChange={setSelectedMaterialId}
                placeholder="Search registry..."
                value={selectedMaterialId}
                disabled={isEditMode}
              />



              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#0f766e] uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                    <TrendingUp size={12} />
                    Target Stock Volume
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={quantity || ''}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-5 py-5 text-2xl font-black text-slate-800 outline-none focus:border-[#0f766e] focus:bg-white transition-all shadow-sm"
                      placeholder="0.00"
                    />
                    <Hash size={24} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />

                    {selectedMaterial && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-end">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{selectedMaterial.unit}</span>
                        {quantity !== selectedMaterial.availableQty && (
                          <span className={`text-[10px] font-black uppercase ${quantity > selectedMaterial.availableQty ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {quantity > selectedMaterial.availableQty ? '+' : ''}{(quantity - selectedMaterial.availableQty).toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium px-2 italic">
                    Change the current value to record a positive or negative adjustment automatically.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* DOCUMENTATION */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <FileText size={14} />
                Reason for Adjustment
              </h3>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={6}
                className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-5 text-sm text-slate-600 outline-none focus:border-[#0f766e] transition-all resize-none shadow-inner"
                placeholder="Detail the cause of adjustment (e.g. Damage, Manual Correction, Initial Stocking)..."
              />
            </div>

            {/* ALERT CARD */}
            <div className="bg-[#0f172a] p-8 rounded-[2rem] text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 blur-2xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <AlertCircle size={16} className="text-teal-400" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ledger Integrity</span>
                </div>
                <p className="text-lg font-bold leading-tight">Adjustments are permanently recorded in history.</p>
                <p className="text-[11px] text-slate-500 mt-4 leading-relaxed font-medium italic">
                  Manual adjustments bypass the standard procurement flow. Please ensure notes are detailed for audit compliance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RawMaterialStockAdjustmentForm;
