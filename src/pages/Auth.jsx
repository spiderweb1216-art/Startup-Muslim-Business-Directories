import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';

const INPUT = 'w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-coral focus:ring-2 focus:ring-coral/10';

export default function Auth({ mode = 'signin', admin = false }) {
  const registerMode = mode === 'register' && !admin;
  const { login, register, logout, currentUser } = useAuth();
  const { data } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const [form,setForm] = useState({name:'',email:'',password:'',confirm:'',country:'',role:'Founder'});
  const [show,setShow] = useState(false);
  const [remember,setRemember] = useState(true);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const set=(key,value)=>{setForm((previous)=>({...previous,[key]:value}));setError('');};

  if (currentUser) return <Navigate to={currentUser.role === 'Admin' ? '/admin' : currentUser.role === 'Investor' ? '/dashboard/investor' : '/dashboard'} replace/>;
  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    if (registerMode && !form.name.trim()) return setError('Please enter your full name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError('Enter a valid email address.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    if (registerMode && form.password !== form.confirm) return setError('Passwords do not match.');
    setBusy(true);
    try {
      if (registerMode) {
        if (data.settings.registrationsEnabled === false) return setError('Registration is currently paused.');
        const result = await register({name:form.name.trim(),email:form.email.trim(),password:form.password,role:form.role,country:form.country.trim()});
        if (!result.ok) return setError(result.message);
        navigate(result.user.role === 'Investor' ? '/dashboard/investor' : '/dashboard',{replace:true});
      } else {
        const result = await login({email:form.email.trim(),password:form.password,remember});
        if (!result.ok) return setError(result.message);
        if (admin && result.user.role !== 'Admin') {
          logout();
          return setError('This page is for administrators. Use the member sign-in page.');
        }
        navigate(result.user.role === 'Admin' ? '/admin' : location.state?.from || (result.user.role === 'Investor' ? '/dashboard/investor' : '/dashboard'),{replace:true});
      }
    } finally { setBusy(false); }
  };

  const title = admin ? 'Admin sign in' : registerMode ? 'Create your account' : 'Welcome back';
  return <div className="auth-screen relative min-h-[100dvh] isolate overflow-hidden flex items-center justify-center px-4 py-5 sm:px-6" data-testid={admin?'admin-login-page':registerMode?'auth-register-page':'auth-signin-page'}>
    <div className="auth-orb auth-orb-one" aria-hidden="true"/><div className="auth-orb auth-orb-two" aria-hidden="true"/>
    <div className="relative w-full max-w-[560px] rounded-[26px] bg-white/95 border border-white/80 shadow-[0_24px_80px_rgba(17,24,39,.14)] px-5 py-5 sm:px-8 sm:py-6 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3"><span className="text-[10px] tracking-[.19em] uppercase text-coral font-bold">{admin?'Administrator':'Startup Muslim · Member access'}</span><Link to="/" className="text-xs text-slate2 hover:text-ink">Back to website ↗</Link></div>
      <h1 className="font-display text-[29px] sm:text-[34px] leading-tight mt-2">{title}</h1>
      <p className="text-xs text-slate2 mt-1">{admin?'Manage listings and approvals.':registerMode?'Choose your role and create your account.':'Manage your company or investor profile.'}</p>
      <form onSubmit={submit} className="mt-4 space-y-3">
        {registerMode && <>
          <fieldset><legend className="text-[11px] font-semibold mb-1.5">I am joining as</legend><div className="grid grid-cols-2 gap-2">{[['Founder','Company / Founder','Create a company and pitch'],['Investor','Investor','Share an investment profile']].map(([role,label,detail])=><button key={role} type="button" aria-pressed={form.role===role} onClick={()=>set('role',role)} className={`rounded-xl border px-3 py-2.5 text-left transition ${form.role===role?'bg-coralSoft border-coral shadow-[inset_0_0_0_1px_rgba(217,75,61,.25)]':'bg-white border-line hover:border-coral/50'}`}><span className="block text-[12px] font-semibold">{label}</span><span className="block text-[10px] text-slate2 leading-snug mt-0.5">{detail}</span></button>)}</div></fieldset>
          <div className="grid sm:grid-cols-2 gap-3"><label className="block text-[11px] font-medium">Full name<input required autoComplete="name" value={form.name} onChange={(e)=>set('name',e.target.value)} placeholder="Your full name" className={`${INPUT} mt-1`}/></label><label className="block text-[11px] font-medium">Country <span className="text-slate2 font-normal">(optional)</span><input autoComplete="country-name" value={form.country} onChange={(e)=>set('country',e.target.value)} placeholder="Country" className={`${INPUT} mt-1`}/></label></div>
        </>}
        <label className="block text-[11px] font-medium">Email address<input required type="email" autoComplete="email" value={form.email} onChange={(e)=>set('email',e.target.value)} placeholder="you@example.com" className={`${INPUT} mt-1`}/></label>
        <div className={registerMode?'grid sm:grid-cols-2 gap-3':''}>
          <label className="block text-[11px] font-medium">Password<div className="relative mt-1"><input required minLength={6} type={show?'text':'password'} autoComplete={registerMode?'new-password':'current-password'} value={form.password} onChange={(e)=>set('password',e.target.value)} placeholder={registerMode?'At least 6 characters':'Enter password'} className={`${INPUT} pr-10`}/><button type="button" onClick={()=>setShow(!show)} aria-label={show?'Hide password':'Show password'} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate2">{show?<EyeOff size={16}/>:<Eye size={16}/>}</button></div></label>
          {registerMode && <label className="block text-[11px] font-medium mt-3 sm:mt-0">Confirm password<input required type={show?'text':'password'} autoComplete="new-password" value={form.confirm} onChange={(e)=>set('confirm',e.target.value)} placeholder="Repeat password" className={`${INPUT} mt-1`}/></label>}
        </div>
        {!registerMode && <label className="flex items-center gap-2 text-xs text-slate2"><input type="checkbox" checked={remember} onChange={(e)=>setRemember(e.target.checked)} className="accent-[#D94B3D]"/> Keep me signed in</label>}
        {error && <p role="alert" className="rounded-lg bg-coralSoft text-coral px-3 py-2 text-xs">{error}</p>}
        <button disabled={busy} className="btn btn-coral w-full justify-center !py-2.5 disabled:opacity-60">{busy?'Please wait…':registerMode?'Create account':'Sign in'} <ArrowRight size={16}/></button>
      </form>
      <div className="text-xs text-slate2 text-center mt-3">{admin?<Link to="/sign-in" className="text-ink underline underline-offset-4">Member sign in</Link>:registerMode?<>Already have an account? <Link to="/sign-in" className="text-ink underline underline-offset-4">Sign in</Link></>:<>New here? <Link to="/register" className="text-ink underline underline-offset-4">Create an account</Link></>}</div>
    </div>
  </div>;
}
