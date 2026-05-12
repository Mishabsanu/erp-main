'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Wrench,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Truck,
  History,
  MessageSquare,
  Activity
} from 'lucide-react';
import ListPageHeader from '@/components/shared/ListPageHeader';
import { getVehicleDropdown, createMechanicalCheckup, getLastCheckup } from '@/services/fleetApi';
import withAuth from '@/components/withAuth';
import { MechanicalCheckup } from '@/lib/types';

const PART_KEYS = [
  'engine', 'oilLevel', 'coolantLevel', 'battery',
  'tires', 'spareTyre', 'brakes', 'lights',
  'suspension', 'wipers'
];

const MechanicalCheckupPage = () => {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<{ _id: string, name: string, plateNo: string }[]>([]);
  const [lastReport, setLastReport] = useState<MechanicalCheckup | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    vehicleId: '',
    odometer: '',
    date: new Date().toISOString().split('T')[0],
    isWaterWashed: false,
    isClean: false,
    remarks: '',
    status: 'Fit',
    partsCondition: {
      engine: { status: 'Good', remarks: '' },
      oilLevel: { status: 'OK', remarks: '' },
      coolantLevel: { status: 'OK', remarks: '' },
      battery: { status: 'Good', remarks: '' },
      tires: { status: 'Good', remarks: '' },
      spareTyre: { status: 'Good', remarks: '' },
      brakes: { status: 'Good', remarks: '' },
      lights: { status: 'Working', remarks: '' },
      suspension: { status: 'Good', remarks: '' },
      wipers: { status: 'Working', remarks: '' }
    } as any
  });

  const [photos, setPhotos] = useState<File[]>([]);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await getVehicleDropdown();
        setVehicles(data);
      } catch (error) {
        toast.error('Failed to load vehicles');
      }
    };
    fetchVehicles();
  }, []);

  // Fetch last report when vehicle changes
  useEffect(() => {
    const fetchLast = async () => {
      if (!formData.vehicleId) {
        setLastReport(null);
        return;
      }
      try {
        const report = await getLastCheckup(formData.vehicleId);
        setLastReport(report);
      } catch (error) {
        console.error('Failed to fetch last report');
      }
    };
    fetchLast();
  }, [formData.vehicleId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePartStatusChange = (part: string, status: string) => {
    setFormData(prev => ({
      ...prev,
      partsCondition: {
        ...prev.partsCondition,
        [part]: { ...prev.partsCondition[part], status }
      }
    }));
  };

  const handlePartRemarkChange = (part: string, remarks: string) => {
    setFormData(prev => ({
      ...prev,
      partsCondition: {
        ...prev.partsCondition,
        [part]: { ...prev.partsCondition[part], remarks }
      }
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleId) return toast.error('Please select a vehicle');

    setSubmitting(true);
    const data = new FormData();
    data.append('vehicleId', formData.vehicleId);
    data.append('odometer', formData.odometer);
    data.append('date', formData.date);
    data.append('isWaterWashed', String(formData.isWaterWashed));
    data.append('isClean', String(formData.isClean));
    data.append('remarks', formData.remarks);
    data.append('status', formData.status);
    data.append('partsCondition', JSON.stringify(formData.partsCondition));

    photos.forEach(photo => data.append('photos', photo));

    try {
      await createMechanicalCheckup(data);
      toast.success('Mechanical checkup recorded successfully');
      router.push('/fleet/reports');
    } catch (error) {
      toast.error('Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const getLastStatus = (part: string) => {
    if (!lastReport?.partsCondition) return 'No History';
    const condition = (lastReport.partsCondition as any)[part];
    if (typeof condition === 'string') return condition;
    return condition?.status || 'Unknown';
  };

  const getLastRemark = (part: string) => {
    if (!lastReport?.partsCondition) return '';
    const condition = (lastReport.partsCondition as any)[part];
    return typeof condition === 'object' ? condition?.remarks : '';
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans">
      {/* COMPACT HEADER */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm mb-8">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-[#0f766e]/10 rounded-xl flex items-center justify-center text-[#0f766e]">
            <Wrench size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Mechanical Audit</h2>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Fleet Technical Terminal</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all"
          >
            Discard
          </button>
          <button
            type="submit"
            form="mechanical-form"
            disabled={submitting}
            className="px-8 py-2.5 bg-[#0f766e] text-white rounded-xl font-bold text-sm shadow-lg shadow-teal-900/20 hover:bg-[#134e4a] transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? <Activity className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {submitting ? 'Saving...' : 'Finalize Audit'}
          </button>
        </div>
      </div>

      <form id="mechanical-form" onSubmit={handleSubmit} className="space-y-8">
        {/* TOP ROW: DEPLOYMENT & STATUS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Target Asset *</label>
            <select
              name="vehicleId"
              value={formData.vehicleId}
              onChange={handleInputChange}
              className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-700 outline-none text-sm font-bold text-slate-900 transition-all"
              required
            >
              <option value="">Select Vehicle</option>
              {vehicles.map(v => (
                <option key={v._id} value={v._id}>{v.name} — {v.plateNo}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Odometer (KM) *</label>
            <input
              type="number"
              name="odometer"
              value={formData.odometer}
              onChange={handleInputChange}
              placeholder="145200"
              className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-700 outline-none text-sm font-bold text-slate-900 transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Audit Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-700 outline-none text-sm font-bold text-slate-900 transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Verdict</label>
            <div className="flex gap-2">
              {['Fit', 'Needs Maintenance', 'Grounded'].map((s) => (
                <button
                  key={s} type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status: s }))}
                  title={s}
                  className={`flex-1 h-11 rounded-xl text-[10px] font-black uppercase tracking-tighter border transition-all ${formData.status === s
                    ? s === 'Grounded' ? 'bg-rose-600 border-rose-600 text-white shadow-md'
                      : s === 'Needs Maintenance' ? 'bg-amber-500 border-amber-500 text-white shadow-md'
                        : 'bg-teal-800 border-teal-800 text-white shadow-md'
                    : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                >
                  {s.charAt(0)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MAIN MATRIX */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-3">
              <Activity size={20} className="text-[#0f766e]" />
              Diagnostic Matrix
            </h3>
            {lastReport && (
              <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full tracking-wider">History Sync Active</span>
            )}
          </div>

          <div className="w-full overflow-x-auto no-scrollbar">
            <table className="w-full border-separate border-spacing-y-3">
              <thead>
                <tr>
                  <th className="text-left px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest pb-3">Component</th>
                  <th className="text-left px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest pb-3">Last Status</th>
                  <th className="text-left px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest pb-3">Current Assessment</th>
                  <th className="text-left px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest pb-3">Technical Notes</th>
                </tr>
              </thead>
              <tbody>
                {PART_KEYS.map((part) => (
                  <tr key={part} className="group">
                    <td className="bg-slate-50/50 rounded-l-2xl px-5 py-4 border-y border-l border-transparent group-hover:bg-white group-hover:border-slate-100 transition-all">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">{part.replace(/([A-Z])/g, ' $1')}</span>
                    </td>
                    <td className="bg-slate-50/50 px-5 py-4 border-y border-transparent group-hover:bg-white group-hover:border-slate-100 transition-all">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{getLastStatus(part)}</span>
                    </td>
                    <td className="bg-slate-50/50 px-5 py-4 border-y border-transparent group-hover:bg-white group-hover:border-slate-100 transition-all">
                      <select
                        value={formData.partsCondition[part].status}
                        onChange={(e) => handlePartStatusChange(part, e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[11px] font-bold uppercase outline-none focus:border-[#0f766e] transition-all shadow-sm"
                      >
                        {['oilLevel', 'coolantLevel'].includes(part) ? (
                          <> <option value="OK">OK</option> <option value="Low">Low</option> <option value="Needs Change">Needs Change</option> </>
                        ) : part === 'lights' || part === 'wipers' ? (
                          <> <option value="Working">Working</option> <option value="Defective">Defective</option> <option value="Repair Needed">Repair Needed</option> </>
                        ) : (
                          <> <option value="Good">Good</option> <option value="Fair">Fair</option> <option value="Repair Needed">Repair Needed</option> <option value="Critical">Critical</option> </>
                        )}
                      </select>
                    </td>
                    <td className="bg-slate-50/50 rounded-r-2xl px-5 py-4 border-y border-r border-transparent group-hover:bg-white group-hover:border-slate-100 transition-all">
                      <input
                        type="text"
                        value={formData.partsCondition[part].remarks}
                        onChange={(e) => handlePartRemarkChange(part, e.target.value)}
                        placeholder="Add technical notes..."
                        className="w-full bg-transparent border-b border-slate-200 outline-none text-xs font-medium text-slate-700 focus:border-teal-600 transition-all"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* BOTTOM ROW: SANITATION, EVIDENCE, REMARKS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Wrench size={14} /> Sanitation
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:bg-white hover:border-teal-100 transition-all group">
                <input type="checkbox" name="isWaterWashed" checked={formData.isWaterWashed} onChange={handleInputChange} className="w-5 h-5 text-teal-700 rounded-md" />
                <span className="text-[11px] font-bold uppercase text-slate-600 tracking-wider">Pressure Wash</span>
              </label>
              <label className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:bg-white hover:border-teal-100 transition-all group">
                <input type="checkbox" name="isClean" checked={formData.isClean} onChange={handleInputChange} className="w-5 h-5 text-teal-700 rounded-md" />
                <span className="text-[11px] font-bold uppercase text-slate-600 tracking-wider">Detailing</span>
              </label>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Camera size={14} /> Evidence
            </h3>
            <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-teal-700 hover:bg-teal-50/50 transition-all cursor-pointer h-[120px]">
              <Camera size={28} className="text-slate-300 mb-2" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capture Evidence</p>
              <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              {photos.length > 0 && <span className="text-[10px] font-bold text-teal-700 mt-2 bg-teal-50 px-3 py-1 rounded-full">{photos.length} files attached</span>}
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm space-y-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <MessageSquare size={14} /> Summary Remarks
            </h3>
            <textarea
              name="remarks" value={formData.remarks} onChange={handleInputChange}
              placeholder="Provide a detailed technical summary of the audit..."
              className="w-full h-[120px] p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium outline-none focus:bg-white focus:border-teal-700 transition-all resize-none text-sm shadow-inner"
            />
          </div>
        </div>
      </form>
    </div>
  );
};



export default withAuth(MechanicalCheckupPage, [{ module: 'fleet', action: 'create' }]);
