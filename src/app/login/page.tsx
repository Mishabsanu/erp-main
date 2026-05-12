'use client';

import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { LogIn, Eye, EyeOff, ShieldCheck, Zap, Globe, ArrowRight, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Image from 'next/image';

const PRIMARY = '#0f766e'; // Teal-700
const DARK_NAVY = '#0f172a';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Min 6 characters required')
    .required('Password is required'),
});

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'data' in error.response &&
    typeof error.response.data === 'object' &&
    error.response.data !== null &&
    'message' in error.response.data &&
    typeof error.response.data.message === 'string'
  ) {
    return error.response.data.message;
  }
  return 'Login failed. Try again.';
};

const LoginPage = () => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [currentYear, setCurrentYear] = useState('');

  useEffect(() => {
    setCurrentYear(new Date().getFullYear().toString());
  }, []);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await login(values.email, values.password);
        toast.success('Access Granted. Welcome back.');
      } catch (err: unknown) {
        toast.error(getErrorMessage(err));
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden md:flex-row bg-[#f8fafc]">
      {/* LEFT PARTITION - PREMIUM BRANDING & VISUALS */}
       <div className="relative hidden md:flex h-full w-[55%] overflow-hidden flex-col justify-between p-16 bg-[#020617]">
      
      {/* 🌌 BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">

        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617]" />

        {/* Radial highlights */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.15),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.1),transparent_40%)]" />

        {/* Glow blobs */}
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-teal-500/20 blur-[120px] animate-pulse" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[120px] animate-pulse delay-700" />

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
      </div>

      {/* 🚀 CONTENT */}
      <div className="relative z-10 flex flex-col h-full justify-between">

        {/* 🔷 PREMIUM BRANDING - TOP CENTERED */}
        <div className="flex flex-col items-center justify-center w-full pt-4 animate-in fade-in slide-in-from-top-10 duration-1000">
          <div className="relative group">
            {/* Subtle glow effect behind logo */}
            <div className="absolute -inset-4 bg-teal-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <Image
              src="/logo.png"
              alt="Proserve Logo"
              width={240}
              height={80}
              className="relative object-contain transition-transform duration-500 group-hover:scale-105"
              priority
            />
          </div>

          <div className="mt-6 text-center">

            <div className="mt-2 flex items-center justify-center gap-3">
              <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-teal-500" />
              <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-teal-400">
                Enterprise Systems
              </p>
              <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-teal-500" />
            </div>
          </div>
        </div>

        {/* 🧠 HERO SECTION - CENTERED & PREMIUM */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
          
          <div className="space-y-6">
            <div className="h-1.5 w-24 bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full mx-auto" />

            <h2 className="text-7xl font-black leading-[0.85] tracking-tighter text-white">
              <span className="block opacity-90">Next-Gen</span>
              <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-emerald-300 text-transparent bg-clip-text drop-shadow-sm">
                ERP Intelligence
              </span>
              <span className="block text-white/70 mt-2">Workspace</span>
            </h2>
          </div>

          <p className="text-xl font-medium leading-relaxed text-gray-400 max-w-lg mx-auto">
            Empower your enterprise with precision logistics, seamless finance,
            and intelligent resource management at scale.
          </p>

          {/* ⚡ FEATURES - CENTERED GRID */}
          <div className="grid grid-cols-2 gap-12 pt-4 w-full">
            
            <div className="flex flex-col items-center gap-4 group transition-all duration-300 hover:-translate-y-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl transition-all duration-500 group-hover:border-teal-500/50 group-hover:bg-teal-500/10">
                <ShieldCheck className="text-teal-400 group-hover:scale-110 transition-all duration-300" size={32} />
              </div>
              <div>
                <p className="text-lg font-bold text-white">Encrypted</p>
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                  Industrial Security
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 group transition-all duration-300 hover:-translate-y-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl transition-all duration-500 group-hover:border-teal-500/50 group-hover:bg-teal-500/10">
                <Zap className="text-teal-400 group-hover:scale-110 transition-all duration-300" size={32} />
              </div>
              <div>
                <p className="text-lg font-bold text-white">High Velocity</p>
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                  Real-time Sync
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* 📊 FLOATING STATS CARD - REPOSITIONED & REFINED */}
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 backdrop-blur-2xl bg-white/5 border border-white/10 rounded-[2rem] p-6 shadow-2xl animate-bounce duration-[3000ms] hover:scale-105 transition-transform cursor-default">
          <div className="flex items-center gap-4">
             <div className="bg-emerald-500/20 p-3 rounded-2xl">
               <Globe className="text-emerald-400" size={20} />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Global Active Orders</p>
                <div className="flex items-baseline gap-3">
                  <h3 className="text-3xl font-black text-white">1,284</h3>
                  <span className="text-emerald-400 text-xs font-bold">+12.4%</span>
                </div>
             </div>
          </div>
        </div>

        {/* 🟢 FOOTER STATUS - BALANCED */}
        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.4em] text-white/20 border-t border-white/5 pt-8">
          
          <span className="hover:text-white/40 transition-colors cursor-default">Build: v2.4.08</span>

          <div className="flex items-center gap-4 px-6 py-2.5 rounded-full bg-emerald-500/5 border border-emerald-500/20 backdrop-blur-xl group">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute inset-0" />
              <div className="w-2 h-2 rounded-full bg-emerald-500 relative z-10" />
            </div>
            <span className="text-[10px] text-emerald-500/80 tracking-[0.3em] font-black group-hover:text-emerald-400 transition-colors">
              NETWORK ACTIVE
            </span>
          </div>
        </div>

      </div>
    </div>

      {/* RIGHT PARTITION - LOGIN FORM */}
      <div className="flex h-full w-full flex-col items-center justify-center px-6 md:w-[45%] lg:px-24">
        <div className="w-full max-w-[440px] space-y-12 animate-in fade-in zoom-in-95 duration-700">

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-teal-600 mb-2">
              <Lock size={12} strokeWidth={3} />
              <span>Secure Authentication</span>
            </div>
            <h3 className="text-5xl font-black tracking-tight text-gray-900">
              Welcome <span className="text-[#0f766e]">Back</span>
            </h3>
            <p className="text-sm font-bold text-gray-500 leading-relaxed">
              Enter secure credentials to access the Proserve enterprise dashboard.
            </p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-8">
            <div className="space-y-8">
              {/* Email Input */}
              <div className="group relative">
                <label className="mb-3 block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-focus-within:text-[#0f766e] transition-colors">
                  Organizational Email
                </label>
                <div className="relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#0f766e] transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@proserve.com"
                    autoComplete="email"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                    className={`w-full border-b-2 bg-transparent py-4 pl-8 text-sm font-bold text-gray-900 transition-all focus:outline-none 
                      ${formik.touched.email && formik.errors.email ? 'border-red-500' : 'border-gray-200 focus:border-[#0f766e]'}`}
                  />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <p className="mt-2 text-[10px] font-bold text-red-500 uppercase tracking-tighter">
                    {formik.errors.email}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="group relative">
                <label className="mb-3 block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-focus-within:text-[#0f766e] transition-colors">
                  Secure Access Key
                </label>
                <div className="relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#0f766e] transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.password}
                    className={`w-full border-b-2 bg-transparent py-4 pl-8 text-sm font-bold text-gray-900 transition-all focus:outline-none 
                      ${formik.touched.password && formik.errors.password ? 'border-red-500' : 'border-gray-200 focus:border-[#0f766e]'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-[#0f766e] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <p className="mt-2 text-[10px] font-bold text-red-500 uppercase tracking-tighter">
                    {formik.errors.password}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-[#0f766e] py-6 text-[11px] font-black uppercase tracking-[0.25em] text-white shadow-[0_20px_40px_rgba(15,118,110,0.3)] transition-all hover:bg-[#134e4a] hover:-translate-y-1 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <div className="absolute inset-x-0 bottom-0 h-[2px] w-full scale-x-0 bg-white/30 transition-transform duration-500 group-hover:scale-x-100" />
                {formik.isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Initialize Session</span>
                    <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="flex flex-col items-center gap-10 pt-8">
            <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-300 w-full">
              <div className="h-[1px] flex-1 bg-gray-100" />
              <span>Official Access Node</span>
              <div className="h-[1px] flex-1 bg-gray-100" />
            </div>

            <div className="text-center space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                © {currentYear} PROSERVE GROUP.
              </p>
              <p className="text-[9px] font-bold uppercase tracking-tighter text-gray-300">
                Security Policy Enforcement Active
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

