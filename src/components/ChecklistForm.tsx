'use client';

import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  Camera, 
  CheckCircle2, 
  Home, 
  Building2,
  MapPin, 
  Zap, 
  Droplets, 
  ShieldAlert, 
  Wind, 
  Settings, 
  Wifi, 
  Bug, 
  HardHat,
  X
} from 'lucide-react';
import { getFacilityDropdown } from '@/services/facilityApi';
import { toast } from 'sonner';

interface ChecklistFormProps {
  initialData?: any;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  isEditMode: boolean;
}

const ChecklistForm: React.FC<ChecklistFormProps> = ({ initialData, onSubmit, onCancel, isEditMode }) => {
  const [facilities, setFacilities] = useState<{ _id: string, name: string, type: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<{ _id: string, name: string, type: string } | null>(null);

  const [formData, setFormData] = useState({
    facilityId: initialData?.facilityId?._id || initialData?.facilityId || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    checkFrequency: initialData?.checkFrequency || 'Daily',
    isClean: initialData?.isClean ?? true,
    isWaterAvailable: initialData?.isWaterAvailable ?? true,
    isElectricityOK: initialData?.isElectricityOK ?? true,
    isFireSafetyOK: initialData?.isFireSafetyOK ?? true,
    isACVentilationOK: initialData?.isACVentilationOK ?? true,
    isEquipmentOK: initialData?.isEquipmentOK ?? true,
    isInternetOK: initialData?.isInternetOK ?? true,
    isPestControlOK: initialData?.isPestControlOK ?? true,
    isPPEComplianceOK: initialData?.isPPEComplianceOK ?? true,
    remarks: initialData?.remarks || ''
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>(initialData?.photos || []);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const data = await getFacilityDropdown();
        setFacilities(data);
        if (formData.facilityId) {
          const facility = data.find((f: any) => f._id === formData.facilityId);
          setSelectedFacility(facility || null);
        }
      } catch (error) {
        toast.error('Failed to load facilities');
      }
    };
    fetchFacilities();
  }, [formData.facilityId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (name === 'facilityId') {
        const facility = facilities.find(f => f._id === value);
        setSelectedFacility(facility || null);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files));
    }
  };

  const removeExistingPhoto = (index: number) => {
    setExistingPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.facilityId) return toast.error('Please select a facility');

    setSubmitting(true);
    const data = new FormData();
    data.append('facilityId', formData.facilityId);
    data.append('date', formData.date);
    data.append('checkFrequency', formData.checkFrequency);
    
    // Append all boolean checks
    Object.keys(formData).forEach(key => {
      if (key.startsWith('is')) {
        data.append(key, String((formData as any)[key]));
      }
    });
    
    data.append('remarks', formData.remarks);
    photos.forEach(photo => data.append('photos', photo));
    
    // If editing, send remaining existing photos
    if (isEditMode) {
      existingPhotos.forEach(photo => data.append('existingPhotos', photo));
    }

    try {
      await onSubmit(data);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderCheckItem = (id: string, label: string, icon: any) => {
    const Icon = icon;
    const isActive = (formData as any)[id];
    return (
      <div key={id} className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${isActive ? 'bg-white border-slate-200 shadow-sm' : 'bg-rose-50 border-rose-100'}`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-600 text-white shadow-lg shadow-rose-900/20'}`}>
            <Icon size={20} />
          </div>
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500">{label}</h4>
            <p className={`text-xs font-bold mt-0.5 ${isActive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isActive ? 'STATUS: NOMINAL' : 'STATUS: ISSUE DETECTED'}
            </p>
          </div>
        </div>
        <input
          type="checkbox"
          name={id}
          checked={isActive}
          onChange={handleInputChange}
          className="w-6 h-6 rounded-lg text-emerald-600 border-slate-300 focus:ring-emerald-600 transition-all cursor-pointer"
        />
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* COMPACT HEADER */}
      <div className="flex items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-600/10 rounded-xl flex items-center justify-center text-emerald-600">
            <ClipboardCheck size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight uppercase">
              {isEditMode ? 'Modify Audit Entry' : 'Facility Asset Audit'}
            </h2>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Health, Safety & Environment Terminal</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all"
          >
            Discard
          </button>
          <button
            type="submit"
            form="audit-form"
            disabled={submitting}
            className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? 'Saving...' : (isEditMode ? 'Update Registry' : 'Commit Audit')}
          </button>
        </div>
      </div>

      <form id="audit-form" onSubmit={handleFormSubmit} className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm p-8 md:p-10 space-y-10">
        {/* TOP SECTION: TARGET & LOGISTICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-slate-100 pb-10">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Target Facility *</label>
            <select
              name="facilityId"
              value={formData.facilityId}
              onChange={handleInputChange}
              className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-600 outline-none text-sm font-bold text-slate-900 transition-all"
              required
            >
              <option value="">Choose Facility</option>
              {facilities.map(f => (
                <option key={f._id} value={f._id}>{f.name} ({f.type})</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Audit Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-600 outline-none text-sm font-bold text-slate-900 transition-all"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Frequency</label>
            <select
              name="checkFrequency"
              value={formData.checkFrequency}
              onChange={handleInputChange}
              className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-600 outline-none text-sm font-bold text-slate-900 transition-all"
            >
              <option value="Daily">Daily Check</option>
              <option value="Weekly">Weekly Deep Clean</option>
            </select>
          </div>
        </div>

        {/* STATUS MATRIX - COMMON */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-1 h-3 bg-emerald-600 rounded-full" />
            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Global Health & Safety Checks</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {renderCheckItem('isClean', 'Cleanliness', ClipboardCheck)}
            {renderCheckItem('isWaterAvailable', 'Water Supply', Droplets)}
            {renderCheckItem('isElectricityOK', 'Power Supply', Zap)}
            {renderCheckItem('isFireSafetyOK', 'Fire Safety', ShieldAlert)}
            {renderCheckItem('isACVentilationOK', 'AC & Ventilation', Wind)}
          </div>
        </div>

        {/* DYNAMIC SECTIONS BASED ON TYPE */}
        {selectedFacility && (
          <div className="space-y-6 pt-6 border-t border-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-1 h-3 bg-emerald-600 rounded-full" />
              <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">
                {selectedFacility.type} Specific Checks
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {selectedFacility.type === 'Office' && (
                <>
                  {renderCheckItem('isInternetOK', 'Internet & LAN', Wifi)}
                  {renderCheckItem('isEquipmentOK', 'IT & Furniture', Settings)}
                </>
              )}
              {(selectedFacility.type === 'Factory' || selectedFacility.type === 'Production Center' || selectedFacility.type === 'Workshop') && (
                <>
                  {renderCheckItem('isPPEComplianceOK', 'PPE Compliance', HardHat)}
                  {renderCheckItem('isEquipmentOK', 'Machinery Status', Settings)}
                </>
              )}
              {selectedFacility.type === 'Warehouse' && (
                <>
                  {renderCheckItem('isPestControlOK', 'Pest Control', Bug)}
                  {renderCheckItem('isEquipmentOK', 'Pallet & Rack Safety', Settings)}
                </>
              )}
              {selectedFacility.type === 'Camp' && (
                <>
                  {renderCheckItem('isEquipmentOK', 'Bedding & Rooms', Home)}
                  {renderCheckItem('isPestControlOK', 'Hygiene & Pests', Bug)}
                </>
              )}
            </div>
          </div>
        )}

        {/* BOTTOM: EVIDENCE & NOTES */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8 border-t border-slate-50">
          <div className="md:col-span-1 space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Visual Evidence</label>
            <div className="relative border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center hover:bg-emerald-50 hover:border-emerald-600 transition-all cursor-pointer h-[120px]">
              <Camera size={24} className="text-slate-300 mb-1" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center px-4">
                Add Photos {photos.length > 0 && `(${photos.length})`}
              </span>
              <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
            
            {existingPhotos.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {existingPhotos.map((photo, idx) => (
                  <div key={idx} className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200">
                    <img src={photo} alt="Existing" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeExistingPhoto(idx)}
                      className="absolute top-0 right-0 bg-rose-500 text-white rounded-bl-lg p-0.5"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-3 space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Inspector Notes</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              rows={4}
              placeholder="Log maintenance requirements, specific issues, or observations..."
              className="w-full min-h-[120px] p-5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium outline-none focus:bg-white focus:border-emerald-600 transition-all resize-none text-sm shadow-inner"
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChecklistForm;
