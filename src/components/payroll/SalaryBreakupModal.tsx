'use client';

import { useState, useEffect } from 'react';
import { X, Save, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';
import { getBreakupByUserId, upsertBreakup } from '@/services/payrollApi';

interface SalaryBreakupModalProps {
  user: {
    _id: string;
    name: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SalaryBreakupModal: React.FC<SalaryBreakupModalProps> = ({
  user,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    basic: 0,
    hra: 0,
    conveyance: 0,
    specialAllowance: 0,
    pf: 0,
    esi: 0,
    tds: 0,
    otherDeductions: 0,
  });

  useEffect(() => {
    if (isOpen && user?._id) {
      fetchBreakup();
    }
  }, [isOpen, user]);

  const fetchBreakup = async () => {
    if (!user?._id) return;
    try {
      const breakup = await getBreakupByUserId(user._id);
      if (breakup) {
        setFormData({
          basic: breakup.basic || 0,
          hra: breakup.hra || 0,
          conveyance: breakup.conveyance || 0,
          specialAllowance: breakup.specialAllowance || 0,
          pf: breakup.pf || 0,
          esi: breakup.esi || 0,
          tds: breakup.tds || 0,
          otherDeductions: breakup.otherDeductions || 0,
        });
      } else {
        setFormData({
            basic: 0,
            hra: 0,
            conveyance: 0,
            specialAllowance: 0,
            pf: 0,
            esi: 0,
            tds: 0,
            otherDeductions: 0,
          });
      }
    } catch (error) {
      console.error('Error fetching breakup:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return;

    setLoading(true);
    try {
      await upsertBreakup({ user: user._id, ...formData });
      toast.success('Salary breakup updated successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update breakup');
    } finally {
      setLoading(false);
    }
  };

  const totalEarnings = formData.basic + formData.hra + formData.conveyance + formData.specialAllowance;
  const totalDeductions = formData.pf + formData.esi + formData.tds + formData.otherDeductions;
  const netSalary = totalEarnings - totalDeductions;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-[#0f766e] tracking-tight">Salary Breakup</h2>
            <p className="text-sm text-gray-500 font-medium">Define structure for <span className="text-[#0f766e] font-bold">{user?.name}</span></p>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-white hover:shadow-md rounded-xl transition-all text-gray-400 hover:text-gray-600 border border-transparent hover:border-gray-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Earnings Column */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#0f766e] flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0f766e]" />
                Earnings
              </h3>
              <div className="space-y-4">
                {[
                  { name: 'basic', label: 'Basic Salary' },
                  { name: 'hra', label: 'HRA' },
                  { name: 'conveyance', label: 'Conveyance' },
                  { name: 'specialAllowance', label: 'Special Allowance' },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">{field.label}</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0f766e] transition-colors">
                        <IndianRupee size={14} />
                      </div>
                      <input
                        type="number"
                        name={field.name}
                        value={formData[field.name as keyof typeof formData]}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-[#0f766e]/20 focus:bg-white rounded-2xl text-sm font-bold text-[#0f766e] transition-all outline-none"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Deductions Column */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#0f766e] flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0f766e]" />
                Deductions
              </h3>
              <div className="space-y-4">
                {[
                  { name: 'pf', label: 'Provident Fund (PF)' },
                  { name: 'esi', label: 'Employee Insurance (ESI)' },
                  { name: 'tds', label: 'Tax Deducted (TDS)' },
                  { name: 'otherDeductions', label: 'Other Deductions' },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">{field.label}</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0f766e] transition-colors">
                        <IndianRupee size={14} />
                      </div>
                      <input
                        type="number"
                        name={field.name}
                        value={formData[field.name as keyof typeof formData]}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-[#0f766e]/20 focus:bg-white rounded-2xl text-sm font-bold text-[#0f766e] transition-all outline-none"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary Section */}
          <div className="mt-10 p-6 bg-gradient-to-br from-[#0f766e] to-[#134e4a] rounded-[2rem] text-white shadow-xl shadow-[#0f766e]/20">
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center border-r border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Earnings</p>
                <p className="text-xl font-black">₹{totalEarnings.toLocaleString()}</p>
              </div>
              <div className="text-center border-r border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Deductions</p>
                <p className="text-xl font-black">₹{totalDeductions.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#0f766e] mb-1">Net Take Home</p>
                <p className="text-2xl font-black text-white">₹{netSalary.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3.5 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-[#0f766e] hover:bg-teal-800 text-white font-black py-3.5 px-10 rounded-2xl shadow-xl shadow-teal-700/20 active:scale-95 transition-all uppercase tracking-widest text-xs disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Save Structure
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
