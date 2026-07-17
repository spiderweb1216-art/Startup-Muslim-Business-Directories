import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, ShieldCheck, UserRound } from 'lucide-react';
import { Wordmark } from '@/components/common/Logo';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';

export default function Auth({ mode = 'signin' }) {
  const [tab, setTab] = useState(mode);
  const [show, setShow] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [country, setCountry] = useState('');
  const [role, setRole] = useState('Founder');
  const [remember, setRemember] = useState(true);
  const nav = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { login, register, currentUser } = useAuth();
  const { data } = useData();

  useEffect(() => setTab(mode), [mode]);
  useEffect(() => {
    if (currentUser) nav(currentUser.role === 'Admin' ? '/admin' : '/dashboard', { replace: true });
  }, [currentUser, nav]);

  const submit = async (e) => {
    e.preventDefault();
    if (tab === 'register' && !name.trim()) return toast('Please enter your full name.', { type: 'warning' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast('Enter a valid email.', { type: 'warning' });
    if (pw.length < 8) return toast('Password must be at least 8 characters.', { type: 'warning' });

    if (tab === 'signin') {
      const result = await login({ email, password: pw, remember });
      if (!result.ok) return toast(result.message, { type: 'warning' });
      toast(`Welcome back, ${result.user.name}.`, { type: 'success' });
      const from = location.state?.from;
      nav(from || (result.user.role === 'Admin' ? '/admin' : '/dashboard'), { replace: true });
      return;
    }

    if (!data.settings.registrationsEnabled) return toast('New registrations are currently disabled by the administrator.', { type:'warning' });
    const result = await register({ name, email, password: pw, role, country });
    if (!result.ok) return toast(result.message, { type: 'warning' });
    toast('Your account has been created.', { type: 'success' });
    nav('/dashboard', { replace: true });
  };



  return (
    <div className="min-h-[calc(100vh-68px)] grid grid-cols-1 md:grid-cols-2" data-testid={`auth-${tab}-page`}>
      <div className="relative overflow-hidden hidden md:block bg-ink text-white">
        <img src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1400&auto=format&fit=crop&q=70" alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-tr from-ink via-ink/70 to-transparent" />
        <div className="relative p-12 h-full flex flex-col">
          <Wordmark dark />
          <div className="mt-auto max-w-md">
            <div className="eyebrow text-white/60">Crescent Startup Lab</div>
            <h2 className="font-display text-[40px] leading-[1.05] mt-2">Manage the ecosystem from one secure workspace.</h2>
            <p className="text-white/70 text-[14px] mt-4">Create listings, review submissions, publish funding data, manage users, and control the complete directory.</p>
            <div className="mt-7 grid grid-cols-2 gap-3">
              <div className="text-left border border-white/15 rounded-xl p-4">
                <ShieldCheck className="w-5 h-5 text-coral" />
                <div className="text-[13px] font-medium mt-2">Directory administration</div>
                <div className="text-[11px] text-white/55 mt-1">Secure CMS workspace</div>
              </div>
              <div className="text-left border border-white/15 rounded-xl p-4">
                <UserRound className="w-5 h-5 text-coral" />
                <div className="text-[13px] font-medium mt-2">Founder workspace</div>
                <div className="text-[11px] text-white/55 mt-1">Listings and submissions</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-12 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-1 bg-white border border-line rounded-full p-1 w-fit">
            <button onClick={() => setTab('signin')} className={`px-4 py-1.5 rounded-full text-[13px] ${tab==='signin'?'bg-ink text-white':'text-ink'}`}>Sign in</button>
            <button onClick={() => setTab('register')} className={`px-4 py-1.5 rounded-full text-[13px] ${tab==='register'?'bg-ink text-white':'text-ink'}`}>Register</button>
          </div>

          <h1 className="font-display text-[38px] mt-6">{tab === 'signin' ? 'Welcome back.' : 'Create your account.'}</h1>
          <p className="text-slate2 mt-2">{tab === 'signin' ? 'Sign in to access your dashboard.' : 'Register to submit, save, claim, and manage listings.'}</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {tab === 'register' && (
              <>
                <div>
                  <label className="text-[12.5px] text-slate2">Full name</label>
                  <input value={name} onChange={e=>setName(e.target.value)} className="mt-1 w-full bg-white border border-line rounded-xl p-3 outline-none focus:border-ink" placeholder="Your full name" />
                </div>
                <div>
                  <label className="text-[12.5px] text-slate2">I am a</label>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    {['Founder','Investor','Ecosystem Partner','General User'].map(r => (
                      <button type="button" key={r} onClick={() => setRole(r)} className={`chip ${role===r?'active':''}`}>{r}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[12.5px] text-slate2">Country</label>
                  <input value={country} onChange={e=>setCountry(e.target.value)} className="mt-1 w-full bg-white border border-line rounded-xl p-3 outline-none focus:border-ink" placeholder="Country" />
                </div>
              </>
            )}

            <div>
              <label className="text-[12.5px] text-slate2">Email</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} type="email" className="mt-1 w-full bg-white border border-line rounded-xl p-3 outline-none focus:border-ink" placeholder="you@example.com" />
            </div>

            <div>
              <label className="text-[12.5px] text-slate2">Password</label>
              <div className="mt-1 relative">
                <input value={pw} onChange={e=>setPw(e.target.value)} type={show ? 'text' : 'password'} className="w-full bg-white border border-line rounded-xl p-3 pr-11 outline-none focus:border-ink" placeholder="At least 8 characters" />
                <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate2" aria-label="Toggle password visibility">{show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>

            {tab === 'signin' && (
              <div className="flex items-center justify-between text-[12.5px]">
                <label className="flex items-center gap-2"><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} className="w-4 h-4 accent-brand" /> Remember me</label>
                <span className="text-slate2">Use your registered account credentials.</span>
              </div>
            )}

            <button className="btn btn-coral w-full justify-center">{tab === 'signin' ? 'Sign in' : 'Create account'} <ArrowRight className="w-4 h-4" /></button>
          </form>

          <p className="text-[12.5px] text-slate2 mt-6">
            {tab === 'signin' ? (<>New here? <button className="text-ink underline" onClick={() => setTab('register')}>Create an account</button></>) : (<>Already registered? <button className="text-ink underline" onClick={() => setTab('signin')}>Sign in</button></>)}
          </p>
          <Link to="/" className="inline-block mt-5 text-[12.5px] text-slate2 underline">Back to website</Link>
        </div>
      </div>
    </div>
  );
}
