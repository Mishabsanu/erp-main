'use client';

import { useState, useEffect } from 'react';
import { X, Save, IndianRupee, Calendar, Users as UsersIcon } from 'lucide-react';
import { toast } from 'sonner';
import { generateSlip } from '@/services/payrollApi';
import { getUsers } from '@/services/userApi';

interface SalarySlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SalarySlipModal: React.FC<SalarySlipModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    user: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    paidDays: 30,
    totalDays: 30,
  });

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
    }
  }, [isOpen]);

  const fetchEmployees = async () => {
    try {
      const data = await getUsers({ status: 'active' }, 1, 100);
      setEmployees(data.users || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'user' ? value : Number(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.user) {
      toast.error('Please select an employee');
      return;
    }

    setLoading(true);
    try {
      await generateSlip(formData);
      toast.success('Salary slip generated successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate slip');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-[#0f766e] tracking-tight">Generate Slip</h2>
            <p className="text-sm text-gray-500 font-medium">Generate monthly salary statement</p>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-white hover:shadow-md rounded-xl transition-all text-gray-400 hover:text-gray-600 border border-transparent hover:border-gray-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Employee Selection */}
          <div>
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Select Employee</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0f766e] transition-colors">
                <UsersIcon size={18} />
              </div>
              <select
                name="user"
                value={formData.user}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[#0f766e]/20 focus:bg-white rounded-2xl text-sm font-bold text-[#0f766e] transition-all outline-none appearance-none"
                required
              >
                <option value="">Choose an employee...</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Month */}
            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Month</label>
              <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0f766e] transition-colors">
                    <Calendar size={18} />
                  </div>
                  <select
                    name="month"
                    value={formData.month}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[#0f766e]/20 focus:bg-white rounded-2xl text-sm font-bold text-[#0f766e] transition-all outline-none appearance-none"
                    required
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>
                        {new Date(0, m - 1).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
              </div>
            </div>

            {/* Year */}
            <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Year</label>
                <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#0f766e]/20 focus:bg-white rounded-2xl text-sm font-bold text-[#0f766e] transition-all outline-none"
                    required
                />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Paid Days */}
            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Paid Days</label>
              <input
                type="number"
                name="paidDays"
                value={formData.paidDays}
                onChange={handleInputChange}
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#0f766e]/20 focus:bg-white rounded-2xl text-sm font-bold text-[#0f766e] transition-all outline-none"
                placeholder="e.g. 30"
                required
              />
            </div>

            {/* Total Days */}
            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Total Days</label>
              <input
                type="number"
                name="totalDays"
                value={formData.totalDays}
                onChange={handleInputChange}
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#0f766e]/20 focus:bg-white rounded-2xl text-sm font-bold text-[#0f766e] transition-all outline-none"
                placeholder="e.g. 30"
                required
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-4">
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
              className="flex items-center gap-2 bg-[#0f766e] hover:bg-[#134e4a] text-white font-black py-4 px-10 rounded-2xl shadow-xl shadow-slate-900/10 active:scale-95 transition-all uppercase tracking-widest text-xs disabled:opacity-50 w-full justify-center"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Generate & Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
