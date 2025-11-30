
import React, { useState, useEffect, useRef } from 'react';
import { setSession, registerUser, authenticateUser, setMPIN, generateUserID, generatePasscode, requestOTP, verifyOTP } from '../services/authService';
import { UserProfile, Language } from '../types';
import { Smartphone, ArrowRight, ShieldCheck, Fingerprint, Loader2, Sparkles, Globe, CheckCircle, Lock, User, Key, Camera, Copy, RefreshCw, MessageSquare } from 'lucide-react';
import { t } from '../services/translationService';

interface AuthFlowProps {
  onLoginSuccess: (user: UserProfile) => void;
  language: Language;
}

export default function AuthFlow({ onLoginSuccess, language }: AuthFlowProps) {
  // STEPS: onboarding -> welcome -> login OR (register_mobile -> register_otp -> register_profile) -> mpin -> success
  const [step, setStep] = useState<'onboarding' | 'welcome' | 'login' | 'register_mobile' | 'register_otp' | 'register_profile' | 'mpin' | 'success'>('onboarding');
  
  const [isLoading, setIsLoading] = useState(false);
  const [onboardingIndex, setOnboardingIndex] = useState(0);

  // Login Form
  const [loginId, setLoginId] = useState('');
  const [loginPasscode, setLoginPasscode] = useState('');
  const [loginError, setLoginError] = useState('');

  // Registration - Step 1: Mobile & OTP
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6 digit OTP
  const [requestId, setRequestId] = useState('');
  const [otpTimer, setOtpTimer] = useState(30);
  const [otpError, setOtpError] = useState('');
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Registration - Step 2: Profile
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [email, setEmail] = useState('');

  // MPIN Setup
  const [newMpin, setNewMpin] = useState('');
  
  // Generated User Data
  const [createdUser, setCreatedUser] = useState<UserProfile | null>(null);

  const INDIAN_STATES = [
    'Bihar', 'Uttar Pradesh', 'Delhi', 'Maharashtra', 'Karnataka', 
    'Tamil Nadu', 'West Bengal', 'Gujarat', 'Rajasthan', 'Madhya Pradesh', 
    'Punjab', 'Haryana', 'Jharkhand', 'Odisha', 'Chhattisgarh'
  ];

  // Onboarding Data
  const slides = [
    {
      title: "One Platform, All Services",
      desc: "Access 775+ Government & Utility services instantly from a single secure app.",
      icon: Globe,
      color: "text-royal"
    },
    {
      title: "Sonic AI Assistant",
      desc: "Your personal voice-enabled assistant to guide you through any form or process.",
      icon: Sparkles,
      color: "text-electric"
    },
    {
      title: "Secure & Automated",
      desc: "Bank-grade encryption for your documents with auto-OCR form filling.",
      icon: ShieldCheck,
      color: "text-green-500"
    }
  ];

  // Handle Onboarding Auto-Scroll
  useEffect(() => {
    if (step === 'onboarding') {
       const t = setTimeout(() => {
           if (onboardingIndex < 2) setOnboardingIndex(p => p + 1);
       }, 3000);
       return () => clearTimeout(t);
    }
  }, [onboardingIndex, step]);

  // Handle OTP Timer
  useEffect(() => {
      let interval: any;
      if (step === 'register_otp' && otpTimer > 0) {
          interval = setInterval(() => {
              setOtpTimer(prev => prev - 1);
          }, 1000);
      }
      return () => clearInterval(interval);
  }, [otpTimer, step]);

  // WebOTP API (Auto Read SMS)
  useEffect(() => {
      if (step === 'register_otp' && 'credentials' in navigator) {
          const ac = new AbortController();
          
          (navigator.credentials as any).get({
              otp: { transport: ['sms'] },
              signal: ac.signal
          }).then((otp: any) => {
              if (otp && otp.code) {
                  // Auto-fill OTP from SMS
                  const codeArr = otp.code.split('').slice(0, 6);
                  setOtp(codeArr);
                  handleVerifyOTP(codeArr.join(''));
              }
          }).catch((err: any) => {
              console.log("WebOTP not triggered or cancelled", err);
          });
          
          return () => {
              ac.abort();
          };
      }
  }, [step]);

  const handleLogin = () => {
      setIsLoading(true);
      setLoginError('');
      setTimeout(() => {
          const authResult = authenticateUser(loginId, loginPasscode);
          if (authResult.success && authResult.user) {
              setSession(authResult.user);
              onLoginSuccess(authResult.user);
          } else {
              setLoginError('Invalid User ID or Passcode');
              setIsLoading(false);
          }
      }, 1000);
  };

  // --- REGISTRATION FLOW HANDLERS ---

  const handleSendOTP = async () => {
      if (mobile.length !== 10) return;
      setIsLoading(true);
      setOtpError('');
      
      try {
          const res = await requestOTP('+91' + mobile);
          if (res.status === 'ok' && res.requestId) {
              setRequestId(res.requestId);
              setStep('register_otp');
              setOtpTimer(30);
              setOtp(['', '', '', '', '', '']); // Reset OTP
              
              // DEV MODE: Simulate Auto-Fill for Testing
              if (res.dev_otp) {
                  console.log("DEV OTP RECEIVED:", res.dev_otp);
                  setTimeout(() => {
                     const devCode = (res.dev_otp || '').split('');
                     setOtp(devCode);
                     // Optional: Auto submit after 1s for smoother demo
                     // setTimeout(() => handleVerifyOTP(res.dev_otp!), 800);
                  }, 1500);
              }
          } else {
              alert(res.message || "Failed to send OTP");
          }
      } catch (e) {
          alert("Network Error");
      } finally {
          setIsLoading(false);
      }
  };

  const handleOtpChange = (index: number, value: string) => {
      if (isNaN(Number(value))) return;
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto Advance
      if (value && index < 5) {
          otpInputRefs.current[index + 1]?.focus();
      }
      
      // Auto Submit if full
      if (index === 5 && value) {
          const fullCode = newOtp.join('');
          if (fullCode.length === 6) handleVerifyOTP(fullCode);
      }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
      if (e.key === 'Backspace' && !otp[index] && index > 0) {
          otpInputRefs.current[index - 1]?.focus();
      }
  };

  const handleVerifyOTP = async (codeOverride?: string) => {
      const code = codeOverride || otp.join('');
      if (code.length !== 6) return;
      
      setIsLoading(true);
      setOtpError('');

      try {
          const res = await verifyOTP(requestId, code);
          if (res.status === 'ok') {
              setStep('register_profile');
          } else {
              setOtpError(res.message || "Invalid OTP");
          }
      } catch (e) {
          setOtpError("Verification Failed");
      } finally {
          setIsLoading(false);
      }
  };

  const handleRegisterProfile = () => {
      if(name && city && state && pincode && email) {
          setStep('mpin');
      }
  };

  const handleMpinSet = () => {
      if(newMpin.length === 4) {
          setMPIN(newMpin);
          
          const genUserId = generateUserID(state);
          const genPasscode = generatePasscode(city);

          const newUser: UserProfile = {
              name,
              phone: '+91 ' + mobile,
              email: email,
              city,
              state,
              pincode,
              id: genUserId,
              passcode: genPasscode,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
          };
          
          registerUser(newUser); // Save to "DB"
          setCreatedUser(newUser);
          setStep('success');
      }
  };

  const handleFinalContinue = () => {
      if (createdUser) {
          onLoginSuccess(createdUser);
      }
  };

  // --- RENDER STEPS ---

  if (step === 'onboarding') {
      const SlideIcon = slides[onboardingIndex].icon;
      return (
          <div className="flex flex-col h-screen bg-white dark:bg-deep relative overflow-hidden">
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in key={onboardingIndex}">
                  <div className="w-64 h-64 mb-8 relative flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-tr from-royal/20 to-electric/20 rounded-full animate-pulse-slow blur-3xl" />
                      <SlideIcon size={120} className={`${slides[onboardingIndex].color} drop-shadow-lg`} />
                  </div>
                  <h2 className="text-3xl font-black mb-4 dark:text-white">{slides[onboardingIndex].title}</h2>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{slides[onboardingIndex].desc}</p>
              </div>

              <div className="p-8 flex flex-col items-center gap-8">
                  <div className="flex gap-2">
                      {slides.map((_, i) => (
                          <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === onboardingIndex ? 'w-8 bg-royal' : 'w-2 bg-gray-200 dark:bg-white/10'}`} />
                      ))}
                  </div>
                  <div className="w-full flex justify-between items-center">
                      <button onClick={() => setStep('welcome')} className="text-gray-400 font-bold text-sm">{t('btn.skip', language)}</button>
                      <button 
                        onClick={() => {
                            if(onboardingIndex < 2) setOnboardingIndex(p => p+1);
                            else setStep('welcome');
                        }}
                        className="bg-royal text-white p-4 rounded-full shadow-lg shadow-royal/30"
                      >
                          <ArrowRight size={24} />
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  if (step === 'welcome') {
    return (
      <div className="flex flex-col h-screen bg-white dark:bg-deep relative">
        <div className="flex-1 flex flex-col justify-end p-8 pb-12 z-10">
           <div className="mb-8">
             <div className="flex items-center gap-4 mb-4 select-none">
               <img 
                 src="https://img1.wsimg.com/isteam/ip/e8186a9b-5cfd-4d09-9ac8-87df4de0cc9e/IMG-20251109-WA0001.jpg" 
                 alt="NivaranX Logo" 
                 className="w-20 h-20 rounded-2xl shadow-xl border-2 border-white/20 pointer-events-none select-none" 
                 onContextMenu={(e) => e.preventDefault()}
                 draggable={false}
                 style={{ WebkitTouchCallout: 'none' }}
               />
               <h1 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-royal to-electric">NIVARANX™</h1>
             </div>
             <p className="text-2xl font-bold dark:text-white leading-tight">
               Solutions That <br/>Think Ahead.
             </p>
           </div>
           
           <div className="space-y-4">
             <button onClick={() => setStep('login')} className="w-full bg-royal text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-royal/30 active:scale-95 transition-transform">
                <Lock size={20} /> Login with User ID
             </button>
             <button onClick={() => setStep('register_mobile')} className="w-full bg-white dark:bg-slate-800 text-gray-800 dark:text-white border border-gray-200 dark:border-white/10 py-4 rounded-xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-transform">
                <Smartphone size={20} /> New Registration
             </button>
           </div>
           
           <p className="text-center text-xs text-gray-400 mt-8">
             {t('auth.terms', language)}
           </p>
        </div>
      </div>
    );
  }

  if (step === 'login') {
      return (
          <div className="p-6 h-screen bg-white dark:bg-deep pt-12 animate-slide-up flex flex-col">
              <button onClick={() => setStep('welcome')} className="mb-6 text-gray-400 flex items-center gap-2 text-sm font-bold"><ArrowRight className="rotate-180" size={16} /> Back</button>
              
              <h2 className="text-3xl font-bold dark:text-white mb-2">Welcome Back</h2>
              <p className="text-sm text-gray-500 mb-8">Enter your credentials to continue.</p>
              
              <div className="space-y-4 mb-8">
                  <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-white/10 flex items-center gap-4 focus-within:ring-2 ring-royal transition-all">
                      <User size={20} className="text-gray-400" />
                      <input 
                        type="text" 
                        value={loginId} 
                        onChange={e => setLoginId(e.target.value.toUpperCase())} 
                        className="bg-transparent w-full outline-none font-bold text-lg dark:text-white placeholder-gray-400"
                        placeholder="UserID (e.g. NVX...)"
                        autoFocus
                      />
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-white/10 flex items-center gap-4 focus-within:ring-2 ring-royal transition-all">
                      <Key size={20} className="text-gray-400" />
                      <input 
                        type="password" 
                        value={loginPasscode} 
                        onChange={e => setLoginPasscode(e.target.value)} 
                        className="bg-transparent w-full outline-none font-bold text-lg dark:text-white placeholder-gray-400"
                        placeholder="Passcode"
                      />
                  </div>
              </div>

              {loginError && <p className="text-red-500 font-bold text-center text-sm mb-4 bg-red-50 dark:bg-red-500/10 p-2 rounded-lg">{loginError}</p>}

              <button 
                onClick={handleLogin}
                disabled={!loginId || !loginPasscode || isLoading}
                className="w-full bg-royal text-white py-4 rounded-xl font-bold disabled:opacity-50 flex justify-center shadow-lg shadow-royal/30"
              >
                  {isLoading ? <Loader2 className="animate-spin" /> : "Secure Login"}
              </button>
              
              <p className="mt-6 text-center text-xs text-gray-400">
                  Forgot User ID? Please register again.
              </p>
          </div>
      )
  }

  // --- NEW REGISTRATION FLOW ---

  if (step === 'register_mobile') {
      return (
          <div className="p-6 h-screen bg-white dark:bg-deep pt-12 animate-slide-up">
              <button onClick={() => setStep('welcome')} className="mb-6 text-gray-400 flex items-center gap-2 text-sm font-bold"><ArrowRight className="rotate-180" size={16} /> Back</button>
              
              <h2 className="text-2xl font-bold dark:text-white mb-2">{t('auth.enter_mobile', language)}</h2>
              <p className="text-sm text-gray-500 mb-8">{t('auth.otp_sent', language)}</p>

              <div className="bg-gray-50 dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-white/10 flex items-center gap-4 mb-8 focus-within:ring-2 ring-royal transition-all">
                   <div className="flex items-center gap-2 pr-4 border-r border-gray-300 dark:border-gray-600">
                       <span className="text-lg">🇮🇳</span>
                       <span className="text-lg font-bold text-gray-500">+91</span>
                   </div>
                   <input 
                      type="tel" 
                      placeholder="00000 00000" 
                      maxLength={10} 
                      value={mobile} 
                      onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0,10))} 
                      className="w-full bg-transparent outline-none text-xl font-bold dark:text-white placeholder-gray-300 tracking-wider"
                      autoFocus 
                   />
              </div>

              <button 
                onClick={handleSendOTP} 
                disabled={mobile.length < 10 || isLoading} 
                className="w-full bg-royal text-white py-4 rounded-xl font-bold shadow-lg shadow-royal/30 disabled:opacity-50 flex justify-center items-center gap-2"
              >
                  {isLoading ? <Loader2 className="animate-spin" /> : <>{t('auth.get_otp', language)} <ArrowRight size={20} /></>}
              </button>
              
              <p className="text-center text-xs text-gray-400 mt-6 px-4">
                  Carrier SMS charges may apply. We do not share your number with third parties.
              </p>
          </div>
      );
  }

  if (step === 'register_otp') {
      return (
          <div className="p-6 h-screen bg-white dark:bg-deep pt-12 animate-slide-up">
              <button onClick={() => setStep('register_mobile')} className="mb-6 text-gray-400 flex items-center gap-2 text-sm font-bold"><ArrowRight className="rotate-180" size={16} /> Back</button>

              <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold dark:text-white mb-2">{t('auth.verify_otp', language)}</h2>
                  <p className="text-sm text-gray-500">
                      Code sent to <span className="text-royal font-bold">+91 {mobile}</span>
                  </p>
              </div>

              <div className="flex justify-center gap-2 mb-8">
                  {otp.map((digit, idx) => (
                      <input 
                          key={idx}
                          ref={el => otpInputRefs.current[idx] = el}
                          type="text" 
                          maxLength={1} 
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(idx, e)}
                          className="w-12 h-14 rounded-xl border-2 border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-slate-800 text-center text-xl font-bold focus:border-royal focus:ring-4 ring-royal/10 outline-none transition-all dark:text-white"
                      />
                  ))}
              </div>

              {otpError && <p className="text-red-500 font-bold text-center text-sm mb-6 bg-red-50 dark:bg-red-500/10 p-2 rounded-lg animate-pulse">{otpError}</p>}

              <button 
                  onClick={() => handleVerifyOTP()} 
                  disabled={otp.join('').length < 6 || isLoading}
                  className="w-full bg-royal text-white py-4 rounded-xl font-bold shadow-lg shadow-royal/30 disabled:opacity-50 flex justify-center"
              >
                  {isLoading ? <Loader2 className="animate-spin" /> : "Verify & Continue"}
              </button>

              <div className="mt-8 text-center">
                  <p className="text-sm text-gray-500 mb-2">Didn't receive code?</p>
                  {otpTimer > 0 ? (
                      <p className="text-sm font-bold text-royal flex items-center justify-center gap-2">
                          <RefreshCw size={14} className="animate-spin" /> Resend in 00:{otpTimer < 10 ? `0${otpTimer}` : otpTimer}
                      </p>
                  ) : (
                      <button onClick={handleSendOTP} className="text-sm font-bold text-royal hover:underline">Resend OTP</button>
                  )}
              </div>
          </div>
      );
  }

  if (step === 'register_profile') {
      return (
          <div className="p-6 h-screen bg-white dark:bg-deep pt-12 animate-slide-up overflow-y-auto">
              
              <h2 className="text-2xl font-bold dark:text-white mb-2">{t('auth.setup_profile', language)}</h2>
              <p className="text-sm text-gray-500 mb-6">{t('auth.complete_details', language)}</p>

              <div className="space-y-4 mb-8">
                  <div>
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label>
                      <input type="text" placeholder="Enter Full Name" value={name} onChange={e => setName(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-slate-800 rounded-xl outline-none dark:text-white border border-gray-100 dark:border-white/5 focus:border-royal mt-1" />
                  </div>

                  <div>
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
                      <input type="email" placeholder="Enter Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-slate-800 rounded-xl outline-none dark:text-white border border-gray-100 dark:border-white/5 focus:border-royal mt-1" />
                  </div>
                  
                  <div>
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">State</label>
                      <select value={state} onChange={e => setState(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-slate-800 rounded-xl outline-none dark:text-white border border-gray-100 dark:border-white/5 focus:border-royal appearance-none mt-1">
                           <option value="">Select State</option>
                           {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                       <div>
                           <label className="text-xs font-bold text-gray-500 uppercase ml-1">City</label>
                           <input type="text" placeholder="Enter City" value={city} onChange={e => setCity(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-slate-800 rounded-xl outline-none dark:text-white border border-gray-100 dark:border-white/5 focus:border-royal mt-1" />
                       </div>
                       <div>
                           <label className="text-xs font-bold text-gray-500 uppercase ml-1">Pincode</label>
                           <input type="text" placeholder="000000" maxLength={6} value={pincode} onChange={e => setPincode(e.target.value.replace(/\D/g, ''))} className="w-full p-4 bg-gray-50 dark:bg-slate-800 rounded-xl outline-none dark:text-white border border-gray-100 dark:border-white/5 focus:border-royal mt-1" />
                       </div>
                  </div>
              </div>

              <button onClick={handleRegisterProfile} disabled={!name || !city || !state || !pincode || !email} className="w-full bg-royal text-white py-4 rounded-xl font-bold shadow-lg shadow-royal/30 disabled:opacity-50">{t('btn.next', language)}</button>
          </div>
      )
  }

  if (step === 'mpin') {
      return (
          <div className="p-6 h-screen bg-white dark:bg-deep pt-12 animate-slide-up">
              <h2 className="text-2xl font-bold dark:text-white mb-2">{t('auth.secure_app', language)}</h2>
              <p className="text-sm text-gray-500 mb-8">{t('auth.set_mpin', language)}</p>
              
              <div className="flex justify-center mb-8">
                  <input 
                    type="password" 
                    maxLength={4} 
                    value={newMpin} 
                    onChange={e => setNewMpin(e.target.value.replace(/\D/g, '').slice(0,4))}
                    className="text-center text-4xl tracking-[1em] font-bold bg-transparent border-b-2 border-gray-200 dark:border-white/20 w-48 py-2 focus:border-royal outline-none dark:text-white"
                    autoFocus
                  />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-start gap-3 mb-8">
                  <Fingerprint className="text-royal shrink-0" />
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                      <p className="font-bold mb-1">{t('auth.enable_bio', language)}</p>
                      <p>{t('auth.bio_desc', language)}</p>
                  </div>
              </div>

              <button onClick={handleMpinSet} disabled={newMpin.length < 4} className="w-full bg-royal text-white py-4 rounded-xl font-bold disabled:opacity-50 shadow-lg shadow-royal/30">{t('auth.finish', language)}</button>
          </div>
      )
  }

  // --- SUCCESS NEON POPUP ---
  if (step === 'success' && createdUser) {
      return (
        <div className="flex flex-col h-screen bg-deep relative overflow-hidden items-center justify-center p-6 text-center animate-fade-in">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-royal/30 via-deep to-deep z-0"></div>
            
            <div className="relative z-10 w-full max-w-sm">
                <div className="mb-4 flex justify-center">
                    <div className="w-24 h-24 rounded-full border-4 border-electric shadow-[0_0_30px_#28E7FF] flex items-center justify-center bg-deep animate-pulse-slow">
                        <CheckCircle size={50} className="text-electric" />
                    </div>
                </div>

                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-electric to-royal drop-shadow-[0_0_10px_rgba(40,231,255,0.8)] mb-1 animate-pulse-slow">
                    Registration Complete!
                </h2>
                <p className="text-white text-sm opacity-80 mb-6">Important: Save your credentials below to Login.</p>
                
                {/* ID CARD FOR SCREENSHOT */}
                <div className="bg-black/40 backdrop-blur-xl border border-white/20 p-6 rounded-2xl space-y-4 shadow-2xl mb-8 transform hover:scale-105 transition-transform duration-500 relative group">
                     <div className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full animate-bounce shadow-lg shadow-red-500/50">DO NOT LOSE THIS</div>
                     
                     <div className="flex justify-between items-center border-b border-white/10 pb-4">
                         <div className="text-left">
                             <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">USER ID (For Login)</p>
                             <p className="text-2xl font-mono font-bold text-electric tracking-wide">{createdUser.id}</p>
                         </div>
                         <div className="p-2 bg-white/5 rounded-lg active:bg-white/10 cursor-pointer" onClick={() => navigator.clipboard.writeText(createdUser.id)}>
                             <Copy size={16} className="text-gray-400" />
                         </div>
                     </div>

                     {createdUser.passcode && (
                        <div className="flex justify-between items-center pt-2">
                             <div className="text-left">
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">PASSCODE (For Login)</p>
                                <p className="text-xl font-mono font-bold text-white tracking-widest">{createdUser.passcode}</p>
                             </div>
                             <div className="p-2 bg-white/5 rounded-lg active:bg-white/10 cursor-pointer" onClick={() => navigator.clipboard.writeText(createdUser.passcode || '')}>
                                 <Copy size={16} className="text-gray-400" />
                             </div>
                        </div>
                     )}

                     <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-gray-400">
                         <Camera size={14} />
                         <span>Take a Screenshot to Save</span>
                     </div>
                </div>

                <button onClick={handleFinalContinue} className="w-full bg-gradient-to-r from-royal to-electric text-deep py-4 rounded-xl font-black shadow-[0_0_20px_rgba(40,231,255,0.5)] active:scale-95 transition-transform flex items-center justify-center gap-2">
                    Proceed to Dashboard <ArrowRight size={20} />
                </button>
            </div>
        </div>
      );
  }

  return null;
}
