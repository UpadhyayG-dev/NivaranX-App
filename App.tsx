import React, { useState, useEffect } from 'react';
import SonicAI from './SonicAI';
import AppLock from './AppLock';
import AppTour from './AppTour';
import PWAInstallPrompt from './PWAInstallPrompt';
import ProcessFlow from './views/ProcessFlow';
import NexaFeed from './views/NexaFeed';
import DocGenX from './views/DocGenX';
import ToolsHub from './views/ToolsHub';
import Profile from './views/Profile';
import Settings from './views/Settings';
import AuthFlow from './views/AuthFlow';
import Explore from './views/Explore';
import Help from './views/Help';
import { ViewState, ThemeMode, UserProfile, FontMode, Language } from './types';
import { 
  Users, Search, Mic, MapPin, Phone, Shield, Lock, 
  ArrowRight, Activity, Settings as SettingsIcon,
  HelpCircle, FileText, LayoutGrid, Info, Clock, CheckCircle, Mail, MessageCircle, ChevronDown, ChevronUp,
  ShieldCheck, Zap, Globe, Eye, Server, Layers, Cpu
} from 'lucide-react';
import { getSession } from './services/authService';
import { t } from './services/translationService';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';

// --- MOCK DATA ---
const HELPLINE_NUMBERS = [
  { name: 'Police', number: '100', icon: Shield, color: 'text-red-500' },
  { name: 'Ambulance', number: '108', icon: Activity, color: 'text-blue-500' },
  { name: 'Women', number: '1091', icon: Users, color: 'text-pink-500' },
  { name: 'Cyber', number: '1930', icon: Lock, color: 'text-orange-500' },
];

const CATEGORIES = [
  "National", "State", "Tax & Finance", "Banking", "Insurance", "Utility", 
  "Booking", "Healthcare", "Education", "Employment", "Legal", "Design", 
  "IT Services", "Startup", "Smart", "Agriculture", "Housing"
];

// --- SUB COMPONENTS ---

const Dashboard: React.FC<{ onServiceSelect: (s: string) => void, language: Language }> = ({ onServiceSelect, language }) => {
  const [search, setSearch] = useState('');
  
  // Filter Categories based on search
  const filteredCats = CATEGORIES.filter(c => c.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 p-4 animate-fade-in pb-20">
      {/* Intro Slider Mock */}
      <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-lg group">
        <div className="absolute inset-0 bg-gradient-to-r from-royal to-deep flex flex-col justify-center p-6 text-white z-10">
           <div className="bg-white/20 backdrop-blur-md w-fit px-2 py-1 rounded text-[10px] font-bold uppercase mb-2">{t('dash.new_platform', language)}</div>
           <h2 className="text-2xl font-black mb-2 leading-tight">{t('app.name', language)}<br/><span className="text-electric font-light">Digital Empowerment</span></h2>
           <p className="text-xs opacity-90 max-w-[80%] mb-4">{t('dash.connect', language)}</p>
           <button onClick={() => onServiceSelect('Featured')} className="bg-white text-royal px-5 py-2 rounded-lg text-xs font-bold w-fit shadow-lg hover:bg-gray-100 transition-colors flex items-center gap-2">
              {t('btn.get_started', language)} <ArrowRight size={14} />
           </button>
        </div>
        <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1000" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40 group-hover:scale-110 transition-transform duration-700" alt="Banner" />
      </div>

      {/* Search */}
      <div className="relative group z-20">
        <Search className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-royal transition-colors" size={20} />
        <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('dash.search', language)} 
            className="w-full bg-white dark:bg-deep-light rounded-xl py-3 pl-12 pr-12 shadow-sm border border-gray-100 dark:border-white/5 focus:ring-2 focus:ring-royal/50 outline-none dark:text-white transition-all" 
        />
        <button className="absolute right-3 top-2.5 p-1 bg-royal/10 rounded-full text-royal hover:bg-royal hover:text-white transition-colors">
            <Mic size={18} />
        </button>
        
        {/* Search Results Dropdown */}
        {search && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-deep-light rounded-xl shadow-xl border border-gray-100 dark:border-white/5 overflow-hidden max-h-60 overflow-y-auto animate-slide-up">
                {filteredCats.length > 0 ? filteredCats.map(cat => (
                    <div key={cat} onClick={() => onServiceSelect(cat)} className="p-3 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer dark:text-white border-b border-gray-50 dark:border-white/5 last:border-0">
                        {cat}
                    </div>
                )) : (
                    <div className="p-4 text-center text-gray-400 text-xs">No services found</div>
                )}
            </div>
        )}
      </div>

      {/* Essential Helpline */}
      <div>
        <h3 className="font-bold text-gray-800 dark:text-white mb-3 flex items-center text-sm uppercase tracking-wide"><Phone size={16} className="mr-2 text-royal" /> {t('dash.helpline', language)}</h3>
        <div className="grid grid-cols-4 gap-2">
          {HELPLINE_NUMBERS.map((h, i) => (
            <div key={i} onClick={() => window.open(`tel:${h.number}`)} className="bg-white dark:bg-deep-light p-3 rounded-xl flex flex-col items-center justify-center shadow-sm border border-gray-100 dark:border-white/5 active:scale-95 transition-transform cursor-pointer">
               <div className={`p-2 rounded-full bg-gray-50 dark:bg-white/5 mb-2 ${h.color}`}>
                   <h.icon size={18} />
               </div>
               <span className="text-[10px] font-medium dark:text-gray-300 text-center leading-tight">{h.name}</span>
               <span className="text-xs font-bold text-gray-900 dark:text-white mt-1">{h.number}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Instant Services GPS */}
      <div>
         <div className="flex justify-between items-end mb-3">
            <h3 className="font-bold text-gray-800 dark:text-white flex items-center text-sm uppercase tracking-wide"><MapPin size={16} className="mr-2 text-electric" /> {t('dash.instant', language)}</h3>
            <span className="text-[10px] text-royal font-bold bg-royal/10 px-2 py-1 rounded animate-pulse">{t('dash.gps', language)}</span>
         </div>
         <div className="bg-white dark:bg-deep-light p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 space-y-3">
            {['Nearest Police Station', 'Nearest Hospital', 'Nearest Fire Station', 'Pharmacy'].map((item, i) => (
              <div key={i} className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 last:border-0 pb-2">
                 <span className="text-sm dark:text-gray-200 font-medium">{item}</span>
                 <button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item)}`)} className="text-[10px] bg-royal text-white px-3 py-1.5 rounded-full font-bold hover:bg-royal-dark transition-colors flex items-center gap-1">
                     <MapPin size={10} /> {t('dash.nav', language)}
                 </button>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

const Insight: React.FC<{ language: Language }> = ({ language }) => {
    
    const BenefitCard = ({ icon: Icon, title, color }: any) => (
        <div className="bg-white dark:bg-deep-light p-4 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm flex flex-col items-center text-center">
            <div className={`p-3 rounded-full mb-3 ${color} bg-opacity-10`}>
                <Icon size={24} className={color.replace('bg-', 'text-')} />
            </div>
            <h4 className="font-bold text-xs dark:text-white">{title}</h4>
        </div>
    );

    const Step = ({ num, title }: any) => (
        <div className="flex items-center gap-4 relative z-10">
            <div className="w-8 h-8 rounded-full bg-royal text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-lg shadow-royal/20">
                {num}
            </div>
            <div className="bg-white dark:bg-deep-light p-3 rounded-xl border border-gray-100 dark:border-white/5 flex-1 shadow-sm">
                <span className="text-sm font-semibold dark:text-gray-200">{title}</span>
            </div>
        </div>
    );

    return (
        <div className="p-4 space-y-8 pb-24 animate-fade-in">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-royal to-deep rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-electric/20 rounded-full blur-2xl"></div>
            <h2 className="text-2xl font-bold mb-2 relative z-10">{t('insight.about', language)}</h2>
            <p className="text-sm opacity-90 leading-relaxed mb-4 relative z-10">
                {t('app.name', language)} is a Next-Generation Digital Empowerment Platform designed to make Government, Financial, and Utility Services easily accessible to every Indian citizen.
            </p>
            <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/10 relative z-10 grid grid-cols-2 gap-4">
                <div>
                    <h3 className="font-bold text-electric text-[10px] mb-1 uppercase tracking-wider">{t('insight.parent', language)}</h3>
                    <p className="text-xs font-semibold">UPADHYAYG™</p>
                </div>
                <div>
                    <h3 className="font-bold text-electric text-[10px] mb-1 uppercase tracking-wider">{t('insight.vision', language)}</h3>
                    <p className="text-xs font-semibold">25 Crore+ Citizens</p>
                </div>
            </div>
            <div className="mt-3 text-[10px] opacity-70 text-center font-mono">{t('insight.reg', language)}</div>
            </div>

            {/* Why NivaranX Grid */}
            <div className="space-y-4">
                <h3 className="font-bold text-lg dark:text-white pl-1 border-l-4 border-royal">{t('insight.why', language)}</h3>
                <div className="grid grid-cols-2 gap-3">
                    <BenefitCard icon={Layers} title={t('insight.why_1', language)} color="bg-blue-500 text-blue-500" />
                    <BenefitCard icon={Zap} title={t('insight.why_2', language)} color="bg-yellow-500 text-yellow-500" />
                    <BenefitCard icon={Cpu} title={t('insight.why_3', language)} color="bg-purple-500 text-purple-500" />
                    <BenefitCard icon={Eye} title={t('insight.why_4', language)} color="bg-green-500 text-green-500" />
                </div>
            </div>

            {/* Process Flow */}
            <div className="space-y-4">
                <h3 className="font-bold text-lg dark:text-white pl-1 border-l-4 border-royal">{t('insight.how', language)}</h3>
                <div className="relative pl-4 space-y-6">
                    <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-gray-200 dark:bg-white/10 -z-0"></div>
                    <Step num="1" title={t('insight.step_1', language)} />
                    <Step num="2" title={t('insight.step_2', language)} />
                    <Step num="3" title={t('insight.step_3', language)} />
                    <Step num="4" title={t('insight.step_4', language)} />
                    <Step num="5" title={t('insight.step_5', language)} />
                    <Step num="6" title={t('insight.step_6', language)} />
                </div>
            </div>

            {/* Founder Section */}
            <div className="space-y-4">
                <h3 className="font-bold text-lg dark:text-white pl-1 border-l-4 border-royal">{t('insight.founder', language)}</h3>
                <div className="bg-white dark:bg-deep-light rounded-xl p-6 shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-royal/5 rounded-bl-full -mr-8 -mt-8"></div>
                    <div className="flex items-center space-x-4 mb-6 relative z-10">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-gray-200 to-gray-400 overflow-hidden border-4 border-white dark:border-slate-700 shadow-md">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Founder" alt="Founder" className="w-full h-full" />
                        </div>
                        <div>
                            <h4 className="font-bold text-xl dark:text-white">Rishi Upadhyay</h4>
                            <p className="text-xs text-royal font-bold uppercase tracking-wider">Founder, UPADHYAYG™</p>
                            <p className="text-[10px] text-gray-500 mt-1">Nabinagar, Aurangabad, Bihar</p>
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5 relative">
                         <span className="text-4xl text-royal/20 absolute -top-2 -left-2 font-serif">"</span>
                         <p className="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed text-center px-2">
                             {t('insight.founder_quote', language)}
                         </p>
                         <span className="text-4xl text-royal/20 absolute -bottom-4 -right-2 font-serif">"</span>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
                <h3 className="font-bold text-lg dark:text-white pl-1 border-l-4 border-royal">{t('insight.story', language)}</h3>
                <div className="bg-white dark:bg-deep-light rounded-xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
                    <div className="relative border-l-2 border-royal/20 pl-6 space-y-8 ml-2">
                        <div>
                            <span className="absolute -left-[9px] w-4 h-4 rounded-full bg-royal border-4 border-white dark:border-deep shadow-sm"></span>
                            <p className="text-xs font-bold text-royal mb-1 bg-royal/10 w-fit px-2 py-0.5 rounded">19 July 2025</p>
                            <h4 className="font-bold text-sm dark:text-white">Commencement</h4>
                            <p className="text-xs text-gray-500 mt-1">Official Launch of NIVARANX™</p>
                        </div>
                        <div>
                            <span className="absolute -left-[9px] w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600 border-4 border-white dark:border-deep"></span>
                            <p className="text-xs font-bold text-gray-400 mb-1">Sep 2025</p>
                            <h4 className="font-bold text-sm dark:text-white">Scaling Up</h4>
                            <p className="text-xs text-gray-500 mt-1">Integration of 775+ Services</p>
                        </div>
                         <div>
                            <span className="absolute -left-[9px] w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600 border-4 border-white dark:border-deep"></span>
                            <p className="text-xs font-bold text-gray-400 mb-1">2030</p>
                            <h4 className="font-bold text-sm dark:text-white">Vision 2030</h4>
                            <p className="text-xs text-gray-500 mt-1">25 Crore+ Citizens, 100% Automation</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="space-y-4">
                <h3 className="font-bold text-lg dark:text-white">{t('insight.faqs', language)}</h3>
                <div className="space-y-3">
                    {[
                        {q: "How secure is my data?", a: "We use 256-bit AES encryption for all local files in DocGenX. Your data stays on your device."},
                        {q: "Is payment processed by NivaranX?", a: "No, we use secure RBI-compliant payment gateways directly linked to service providers."},
                        {q: "Can I use the app offline?", a: "Yes, downloaded documents and tools are available offline."}
                    ].map((faq, i) => (
                        <div key={i} className="bg-white dark:bg-deep-light p-4 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm">
                            <h4 className="font-bold text-sm dark:text-white mb-2 flex items-start gap-2"><HelpCircle size={16} className="text-royal mt-0.5 shrink-0" /> {faq.q}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 pl-6 leading-relaxed">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const Menu: React.FC<{ setView: (v: ViewState) => void, language: Language }> = ({ setView, language }) => {
    const MenuItem = ({ icon: Icon, labelKey, onClick, color }: any) => (
        <button onClick={onClick} className="flex flex-col items-center justify-center bg-white dark:bg-deep-light p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <div className={`p-3 rounded-full bg-gray-50 dark:bg-white/5 mb-2 ${color}`}>
                <Icon size={24} />
            </div>
            <span className="text-xs font-semibold dark:text-white">{t(labelKey, language)}</span>
        </button>
    );

    return (
        <div className="p-4 space-y-6 pb-20 animate-fade-in">
            <h2 className="text-2xl font-bold dark:text-white">{t('nav.menu', language)}</h2>
            <div className="grid grid-cols-2 gap-4">
                <MenuItem labelKey="tools.hub" icon={LayoutGrid} color="text-royal" onClick={() => setView('tools')} />
                <MenuItem labelKey="doc.genx" icon={Lock} color="text-electric" onClick={() => setView('docgenx')} />
                {/* Insight Tab Inside Menu */}
                <button onClick={() => setView('insight')} className="flex flex-col items-center justify-center bg-white dark:bg-deep-light p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <div className="p-3 rounded-full bg-gray-50 dark:bg-white/5 mb-2 text-blue-400">
                        <Info size={24} />
                    </div>
                    <span className="text-xs font-semibold dark:text-white">Insight</span>
                </button>
                <MenuItem labelKey="help.support" icon={HelpCircle} color="text-green-500" onClick={() => setView('help')} />
                <MenuItem labelKey="settings" icon={SettingsIcon} color="text-gray-500" onClick={() => setView('settings')} />
                <MenuItem labelKey="legal" icon={FileText} color="text-orange-500" onClick={() => setView('legal')} />
                <MenuItem labelKey="profile" icon={Users} color="text-purple-500" onClick={() => setView('profile')} />
            </div>
        </div>
    );
};

const Updates: React.FC<{ language: Language }> = ({ language }) => (
    <div className="p-4 space-y-4 pb-20">
         <h2 className="text-2xl font-bold dark:text-white">{t('nav.updates', language)}</h2>
         <div className="space-y-4">
             {[1,2,3].map(i => (
                 <div key={i} className="bg-white dark:bg-deep-light p-4 rounded-xl shadow-sm border-l-4 border-royal flex gap-4">
                     <div className="flex-1">
                         <span className="text-[10px] font-bold text-royal bg-royal/10 px-2 py-1 rounded">NEWS</span>
                         <h4 className="font-bold text-sm dark:text-white mt-2">New Scheme for Rural Education launched today.</h4>
                         <p className="text-xs text-gray-500 mt-1">Ministry of Education announces digital initiatives...</p>
                     </div>
                 </div>
             ))}
         </div>
    </div>
);

const Legal: React.FC<{ language: Language }> = ({ language }) => {
    const [tab, setTab] = useState<'privacy' | 'terms' | 'data'>('privacy');
    
    return (
        <div className="p-4 space-y-4 pb-24 animate-fade-in h-full flex flex-col">
            <h2 className="text-2xl font-bold dark:text-white">{t('legal', language)}</h2>
            
            <div className="flex gap-2 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
                <button onClick={() => setTab('privacy')} className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${tab === 'privacy' ? 'bg-white dark:bg-slate-700 shadow text-royal' : 'text-gray-500'}`}>{t('legal.privacy', language)}</button>
                <button onClick={() => setTab('terms')} className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${tab === 'terms' ? 'bg-white dark:bg-slate-700 shadow text-royal' : 'text-gray-500'}`}>{t('legal.terms', language)}</button>
                <button onClick={() => setTab('data')} className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${tab === 'data' ? 'bg-white dark:bg-slate-700 shadow text-royal' : 'text-gray-500'}`}>{t('legal.data', language)}</button>
            </div>

            <div className="flex-1 bg-white dark:bg-deep-light rounded-xl p-6 border border-gray-100 dark:border-white/5 overflow-y-auto">
                {tab === 'privacy' && (
                    <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white">{t('legal.privacy', language)}</h3>
                        <p>NIVARANX™ is committed to protecting your privacy. This policy explains how we handle your personal information.</p>
                        <h4 className="font-bold text-gray-800 dark:text-white mt-2">Data Collection</h4>
                        <p>We collect basic details like Name, Mobile, and City to provide services. Documents uploaded are processed via secure OCR and not permanently stored on our servers unless saved to DocGenX.</p>
                    </div>
                )}
                {tab === 'terms' && (
                    <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white">{t('legal.terms', language)}</h3>
                        <p>By using the NIVARANX™ platform, you agree to abide by these terms.</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Users must provide authentic information.</li>
                            <li>Misuse of the automated form filling for fraudulent activities is prohibited.</li>
                            <li>Service fees paid are non-refundable once the application is submitted.</li>
                        </ul>
                    </div>
                )}
                 {tab === 'data' && (
                    <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white">{t('legal.data', language)}</h3>
                        <p>All sensitive data is encrypted using AES-256 standards.</p>
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg flex gap-3 items-start border border-blue-100 dark:border-blue-900/30">
                            <ShieldCheck className="text-blue-500 shrink-0" size={20} />
                            <p className="text-xs">Your documents in DocGenX are locally encrypted on your device. Only you hold the decryption key (MPIN).</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MAIN APP ---

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [selectedService, setSelectedService] = useState<string>('');
  
  // Auto-Save Settings Integration
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => (localStorage.getItem('nx_theme') as ThemeMode) || 'light');
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('nx_lang') as Language) || 'en');
  const [font, setFont] = useState<FontMode>(() => (localStorage.getItem('nx_font') as FontMode) || 'inter');

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  
  const [isSonicOpen, setIsSonicOpen] = useState(false);
  const [isSonicVoiceMode, setIsSonicVoiceMode] = useState(false);
  
  const [showTour, setShowTour] = useState(false);
  
  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Check Session & Settings
  useEffect(() => {
    const session = getSession();
    if (session) {
      setUser(session);
      setIsAuthenticated(true);
    } else {
        setIsLocked(false);
    }

    // Check if tour needed
    const tourDone = localStorage.getItem('nx_tour_completed');
    if (!tourDone && session) {
        setShowTour(true);
    }
  }, []);

  // Listen for PWA Install Prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        setDeferredPrompt(null);
      });
    }
  };

  // Persist Settings
  useEffect(() => {
    localStorage.setItem('nx_theme', themeMode);
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem('nx_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('nx_font', font);
  }, [font]);

  // Apply Theme & Font & Update Meta Tag
  useEffect(() => {
    document.documentElement.className = '';
    
    if (themeMode === 'dark' || themeMode === 'amoled' || themeMode === 'blue-cyan') {
      document.documentElement.classList.add('dark');
    }
    
    document.documentElement.classList.add(`theme-${themeMode}`);
    document.documentElement.classList.add(`font-${font}`);

    // Dynamic Theme Color for Mobile Browsers
    const metaThemeColor = document.querySelector("meta[name=theme-color]");
    if (metaThemeColor) {
      const colors: Record<ThemeMode, string> = {
        'light': '#0057FF',
        'dark': '#0F1633',
        'amoled': '#000000',
        'blue-cyan': '#0A0F2C',
        'minimal': '#ffffff',
        'indian': '#e65100',
        'neon': '#000000',
        'sunset': '#1a1a2e',
        'eco': '#1a4d2e',
        'gold': '#332b00',
        'candy': '#33001b'
      };
      metaThemeColor.setAttribute("content", colors[themeMode]);
    }
  }, [themeMode, font]);

  const handleLoginSuccess = (userProfile: UserProfile) => {
    setUser(userProfile);
    setIsAuthenticated(true);
    setIsLocked(false);
    setCurrentView('dashboard');
    
    // Show tour on first login
    if (!localStorage.getItem('nx_tour_completed')) {
        setShowTour(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('nivaranx_session');
    setIsAuthenticated(false);
    setUser(null);
    setIsLocked(false);
  };

  const handleServiceSelect = (serviceName: string) => {
    setSelectedService(serviceName);
    setCurrentView('process_flow');
  };

  // Correctly activate Sonic AI in Voice Mode
  const handleVoiceActivate = () => {
      setIsSonicOpen(true);
      setIsSonicVoiceMode(true);
  };
  
  const handleChatToggle = () => {
      setIsSonicVoiceMode(false);
      setIsSonicOpen(!isSonicOpen);
  };

  const closeTour = () => {
      setShowTour(false);
      localStorage.setItem('nx_tour_completed', 'true');
  };

  if (!isAuthenticated) {
    return <AuthFlow onLoginSuccess={handleLoginSuccess} language={language} />;
  }
  
  if (isLocked) {
      return <AppLock onUnlock={() => setIsLocked(false)} language={language} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard onServiceSelect={handleServiceSelect} language={language} />;
      case 'explore': return <Explore onServiceSelect={handleServiceSelect} language={language} />;
      case 'insight': return <Insight language={language} />;
      case 'updates': return <Updates language={language} />;
      case 'nexafeed': return <NexaFeed />;
      case 'menu': return <Menu setView={setCurrentView} language={language} />;
      case 'docgenx': return <DocGenX language={language} />;
      case 'tools': return <ToolsHub language={language} />;
      case 'process_flow': return <ProcessFlow serviceName={selectedService} onBack={() => setCurrentView('explore')} language={language} />;
      case 'profile': return <Profile onLogout={handleLogout} language={language} />;
      case 'settings': return <Settings theme={themeMode} setTheme={setThemeMode} language={language} setLanguage={setLanguage} font={font} setFont={setFont} canInstall={!!deferredPrompt} installPwa={handleInstallClick} />;
      case 'help': return <Help language={language} />;
      case 'legal': return <Legal language={language} />;
      default: return <div className="p-10 text-center dark:text-white">Coming Soon</div>;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      setCurrentView={setCurrentView} 
      isDark={themeMode !== 'light' && themeMode !== 'minimal'}
      onSonicToggle={handleChatToggle}
      language={language}
    >
      {renderContent()}
      <SonicAI 
        onNavigate={setCurrentView} 
        isOpen={isSonicOpen} 
        onToggle={handleChatToggle} 
        voiceMode={isSonicVoiceMode}
        onVoiceActivate={handleVoiceActivate}
        language={language}
      />
      {showTour && <AppTour onClose={closeTour} language={language} />}
      <PWAInstallPrompt deferredPrompt={deferredPrompt} onInstall={handleInstallClick} />
    </Layout>
  );
}
