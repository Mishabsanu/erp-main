import { FormikProvider, useFormik } from 'formik';
import {
  Activity,
  Banknote,
  BookOpen,
  Box,
  Building2,
  Calendar,
  ClipboardCheck,
  Clock,
  Contact,
  CreditCard,
  Database,
  Edit2,
  Eye,
  FileText,
  HardHat,
  Info,
  Layers,
  LayoutGrid,
  Package,
  PieChart,
  Plus,
  ReceiptText,
  RotateCcw,
  Shield,
  ShieldCheck,
  Trash2,
  Truck,
  UserPlus,
  Users,
  Wallet,
  Wrench,
  Activity as MatrixIcon
} from 'lucide-react';
import React from 'react';
import * as Yup from 'yup';
import { FormikInput } from './shared/FormikInput';
import { FormikSelect } from './shared/FormikSelect';
import { FormikTextarea } from './shared/FormikTextarea';
import ListPageHeader from './shared/ListPageHeader';
import { Section } from './ui/Section';



/* ---------------- VALIDATION ---------------- */
const RoleValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(3, 'Role name must be at least 3 characters')
    .required('Role name is required'),
  status: Yup.string()
    .oneOf(['active', 'inactive'])
    .required('Status is required'),
  description: Yup.string().max(500, 'Max 500 characters'),
});

const emptyPermissions = {
  // CRM
  sales: { view: false, create: false, update: false, delete: false },
  running_order: { view: false, create: false, update: false, delete: false },

  // Inventory & Logistics
  delivery_ticket: { view: false, create: false, update: false, delete: false },
  return_ticket: { view: false, create: false, update: false, delete: false },
  rental_tracking: { view: false, create: false, update: false, delete: false },
  inventory: { view: false, create: false, update: false, delete: false },
  product: { view: false, create: false, update: false, delete: false },
  customer: { view: false, create: false, update: false, delete: false },
  vendor: { view: false, create: false, update: false, delete: false },

  // Finance & Accounts
  accounts: { view: false, create: false, update: false, delete: false },
  ledger: { view: false, create: false, update: false, delete: false },
  expense: { view: false, create: false, update: false, delete: false },
  payment: { view: false, create: false, update: false, delete: false },
  payroll: { view: false, create: false, update: false, delete: false },
  salary_breakup: { view: false, create: false, update: false, delete: false },
  salary_slip: { view: false, create: false, update: false, delete: false },
  invoice: { view: false, create: false, update: false, delete: false },

  // Production & Factory
  production: { view: false, create: false, update: false, delete: false },
  raw_material: { view: false, create: false, update: false, delete: false },
  raw_material_registry: { view: false, create: false, update: false, delete: false },
  raw_material_stock: { view: false, create: false, update: false, delete: false },

  // HR & Workforce
  worker: { view: false, create: false, update: false, delete: false },
  utility: { view: false, create: false, update: false, delete: false },
  attendance: { view: false, create: false, update: false, delete: false },
  leave: { view: false, create: false, update: false, delete: false },

  // Operations & Fleet
  fleet: { view: false, create: false, update: false, delete: false },
  mechanical_checkup: { view: false, create: false, update: false, delete: false },
  workshop_reports: { view: false, create: false, update: false, delete: false },
  facility: { view: false, create: false, update: false, delete: false },
  facility_audit: { view: false, create: false, update: false, delete: false },

  // Administration
  role: { view: false, create: false, update: false, delete: false },
  user: { view: false, create: false, update: false, delete: false },
};

const MODULE_CONFIG: Record<string, { label: string; icon: any; category: string }> = {
  // CRM
  sales: { label: 'Leads', icon: UserPlus, category: 'CRM' },
  running_order: { label: 'Running Order', icon: Activity, category: 'CRM' },

  // Inventory & Logistics
  delivery_ticket: { label: 'Delivery Note', icon: Truck, category: 'Inventory & Logistics' },
  return_ticket: { label: 'Return Note', icon: RotateCcw, category: 'Inventory & Logistics' },
  rental_tracking: { label: 'Rental Tracking', icon: Box, category: 'Inventory & Logistics' },
  inventory: { label: 'Stock', icon: Layers, category: 'Inventory & Logistics' },
  product: { label: 'Products', icon: Box, category: 'Inventory & Logistics' },
  customer: { label: 'Customers Master', icon: Users, category: 'Inventory & Logistics' },
  vendor: { label: 'Vendors Master', icon: Building2, category: 'Inventory & Logistics' },

  // Finance & Accounts
  accounts: { label: 'Accounts Dashboard', icon: BookOpen, category: 'Finance & Accounts' },
  ledger: { label: 'Ledger', icon: Database, category: 'Finance & Accounts' },
  expense: { label: 'Expenses', icon: Wallet, category: 'Finance & Accounts' },
  payment: { label: 'Payments & Collections', icon: CreditCard, category: 'Finance & Accounts' },
  payroll: { label: 'Payroll & Salary', icon: Banknote, category: 'Finance & Accounts' },
  salary_breakup: { label: 'Salary Breakups', icon: PieChart, category: 'Finance & Accounts' },
  salary_slip: { label: 'Salary Slips', icon: ReceiptText, category: 'Finance & Accounts' },
  invoice: { label: 'Invoices', icon: FileText, category: 'Finance & Accounts' },

  // Production & Factory
  production: { label: 'Production Reports', icon: FileText, category: 'Production & Factory' },
  raw_material: { label: 'Raw Materials Master', icon: Box, category: 'Production & Factory' },
  raw_material_registry: { label: 'Raw Material Registry', icon: Layers, category: 'Production & Factory' },
  raw_material_stock: { label: 'Raw Material Stock', icon: Package, category: 'Production & Factory' },

  // HR & Workforce
  worker: { label: 'Workers', icon: HardHat, category: 'HR & Workforce' },
  utility: { label: 'Utility & Safety Master', icon: Package, category: 'HR & Workforce' },
  attendance: { label: 'Attendance', icon: Clock, category: 'HR & Workforce' },
  leave: { label: 'Leave Management', icon: Calendar, category: 'HR & Workforce' },

  // Operations & Fleet
  fleet: { label: 'Vehicle Registry', icon: Truck, category: 'Operations & Fleet' },
  mechanical_checkup: { label: 'Mechanical Checkup', icon: Wrench, category: 'Operations & Fleet' },
  workshop_reports: { label: 'Workshop Reports', icon: FileText, category: 'Operations & Fleet' },
  facility: { label: 'Offices & Camps', icon: Building2, category: 'Operations & Fleet' },
  facility_audit: { label: 'Facility Audits', icon: ClipboardCheck, category: 'Operations & Fleet' },

  // Administration
  role: { label: 'Roles & Permissions', icon: ShieldCheck, category: 'Administration' },
  user: { label: 'Staff', icon: Contact, category: 'Administration' },
};

interface RoleFormProps {
  initialData?: any;
  onSubmit: (data: any, helpers: any) => Promise<void> | void;
  onCancel: () => void;
  isEditMode: boolean;
}

const RoleForm: React.FC<RoleFormProps> = ({ initialData, onSubmit, onCancel, isEditMode }) => {
  const formik = useFormik({
    initialValues: {
      name: initialData?.name || '',
      status: initialData?.status || 'active',
      description: initialData?.description || '',
      isSuperAdmin: initialData?.isSuperAdmin || false,
      permissions: (() => {
        const base = JSON.parse(JSON.stringify(emptyPermissions));
        if (initialData?.permissions) {
          Object.keys(initialData.permissions).forEach(key => {
            if (base[key]) {
              base[key] = { ...base[key], ...initialData.permissions[key] };
            } else {
            }
          });
        }
        return base;
      })(),
    },
    validationSchema: RoleValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values, helpers) => {
      await onSubmit(values, helpers);
    },
  });

  const modules = Object.keys(formik.values.permissions);

  React.useEffect(() => {
    const allChecked = modules.every((m) => 
      Object.values(formik.values.permissions[m]).every((v) => v === true)
    );
    if (formik.values.isSuperAdmin !== allChecked) {
      formik.setFieldValue('isSuperAdmin', allChecked, false);
    }
  }, [formik.values.permissions]);

  const toggleSuperAdmin = (checked: boolean) => {
    const updated = JSON.parse(JSON.stringify(formik.values.permissions));
    Object.keys(updated).forEach((m) => {
      Object.keys(updated[m]).forEach((p) => {
        updated[m][p] = checked;
      });
    });
    formik.setFieldValue('permissions', updated);
    formik.setFieldValue('isSuperAdmin', checked);
  };
  const toggleModule = (module: string, checked: boolean) => {
    const updated = { ...formik.values.permissions[module] };
    Object.keys(updated).forEach((p) => {
      updated[p] = checked;
    });
    formik.setFieldValue(`permissions.${module}`, updated);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-6 md:p-10 font-sans">
      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit}>
          <ListPageHeader
            eyebrow="Permissions Matrix"
            title={isEditMode ? 'Modify' : 'Architect'}
            highlight="Security Role"
            description={isEditMode
              ? 'Review and adjust assigned access levels. Granular permission changes will take effect upon the next user session.'
              : 'Establish a new administrative or operational role. Define precise CRUD permissions across all system modules.'}
            className="mb-12"
          />

          <div className="w-full mx-auto py-10 space-y-12">
            {/* Role Personalization Section */}
            <Section
              eyebrow="Identity & Scope"
              title="Role"
              highlight="Identity"
              icon={<Shield className="text-[#0f766e]" size={20} />}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1 space-y-6">
                  <FormikInput
                    label="Role Identity"
                    name="name"
                    placeholder="e.g. Finance Director"
                    required
                    icon={<Shield size={18} />}
                  />

                  <FormikSelect
                    label="Status"
                    name="status"
                    options={[
                      { value: 'active', label: 'Active Service' },
                      { value: 'inactive', label: 'Inactive / Suspended' }
                    ]}
                  />

                  {/* Super Admin Override Toggle */}
                  <div className="pt-4 border-t border-slate-100 mt-6">
                    <div className="flex items-center justify-between bg-teal-50/50 p-4 rounded-2xl border border-teal-100/50">
                      <div>
                        <p className="text-[10px] font-black text-[#0f766e] uppercase tracking-widest leading-none mb-1">Global Access</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase">Super Admin Override</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formik.values.isSuperAdmin}
                          onChange={(e) => toggleSuperAdmin(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0f766e]"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <FormikTextarea
                    label="Scope / Description"
                    name="description"
                    placeholder="Briefly define the responsibilities and access boundaries for this role..."
                    rows={6}
                    icon={<Info size={18} />}
                  />
                </div>
              </div>
            </Section>

            {/* Authorization Matrix Section */}
            <div className="pt-6">
              <div className="mb-10 flex items-end justify-between px-2">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    <MatrixIcon className="text-[#0f766e]" />
                    Authorization <span className="text-[#0f766e]">Matrix</span>
                  </h2>
                  <p className="text-gray-400 text-sm font-medium mt-1 ml-9">Configure granular access for every ERP module</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{modules.length} Modules Active</span>
                  {formik.values.isSuperAdmin && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-[#0f766e] rounded-full">
                      <ShieldCheck size={12} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Full Bypass Active</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((m) => {
                  const config = MODULE_CONFIG[m] || { label: m, icon: LayoutGrid, category: 'Module' };
                  const isAllSelected = Object.values(formik.values.permissions[m]).every((v) => v === true);
                  const isAnySelected = Object.values(formik.values.permissions[m]).some((v) => v === true);

                  return (
                    <div
                      key={m}
                      className={`bg-white rounded-[2rem] border-2 transition-all duration-300 p-8 flex flex-col ${isAllSelected ? 'border-[#0f766e] shadow-xl shadow-teal-900/5' : isAnySelected ? 'border-teal-50' : 'border-gray-50'
                        }`}
                    >
                      {/* Module Card Header */}
                      <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isAnySelected ? 'bg-[#0f766e] text-white shadow-lg shadow-teal-900/10' : 'bg-gray-100 text-gray-400'
                              }`}
                          >
                            <config.icon size={24} />
                          </div>
                          <div>
                            <h3 className="text-base font-black text-gray-900 uppercase tracking-tight">{config.label}</h3>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">{config.category} Module</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={(e) => toggleModule(m, e.target.checked)}
                          className="w-5 h-5 rounded-lg border-2 border-gray-200 text-[#0f766e] focus:ring-[#0f766e] transition-all cursor-pointer"
                        />
                      </div>

                      {/* Permissions Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        {[
                          { key: 'view', label: 'View', icon: Eye },
                          { key: 'create', label: 'Create', icon: Plus },
                          { key: 'update', label: 'Update', icon: Edit2 },
                          { key: 'delete', label: 'Delete', icon: Trash2 },
                        ].map((p) => {
                          const isActive = formik.values.permissions[m][p.key];
                          return (
                            <button
                              key={p.key}
                              type="button"
                              onClick={() => formik.setFieldValue(`permissions.${m}.${p.key}`, !isActive)}
                              className={`flex items-center justify-between px-4 py-3.5 rounded-xl border-2 transition-all group ${isActive
                                ? 'bg-[#0f766e] border-[#0f766e] text-white shadow-md'
                                : 'bg-[#f8fafc] border-[#f8fafc] text-gray-400 hover:border-teal-100 hover:text-gray-600'
                                }`}
                            >
                              <span className="text-[10px] font-black uppercase tracking-widest">{p.label}</span>
                              <p.icon size={14} className={isActive ? 'text-white' : 'text-gray-300 group-hover:text-teal-400'} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Simple Action Buttons at Bottom */}
          <div className="w-full mx-auto py-12 flex items-center justify-end gap-4 border-t border-slate-100 mt-12">
            <button
              type="button"
              onClick={onCancel}
              className="px-8 py-3 rounded-xl text-slate-500 font-bold text-sm hover:bg-slate-200/50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="px-10 py-3 bg-[#0f766e] text-white rounded-xl font-bold text-sm shadow-lg shadow-teal-900/10 hover:bg-[#0d9488] transition-all disabled:opacity-50"
            >
              {formik.isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
};

export default RoleForm;
