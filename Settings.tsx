
import React, { useState } from 'react';
import { ThemeMode, FontMode, Language } from '../types';
import { Moon, Sun, Monitor, Type, Globe, Bell, Trash2, Info, Smartphone, Check, Lock, ChevronRight, ShieldCheck, Download, Flag, Zap, Sunset, Leaf, Crown, Candy, Settings2, Shield, Layout } from 'lucide-react';
import { t } from '../services/translationService';
import { validateMPIN, setMPIN } from '../services/authService';

interface SettingsProps {
    theme: ThemeMode;
    setTheme: (t: ThemeMode) => void;
    language: Language;
    setLanguage: (l: Language) => void;
    font: FontMode;
    setFont: (f: FontMode) => void;
    canInstall?: boolean;
    installPwa?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ theme, setTheme, language, setLanguage, font, setFont, canInstall, installPwa }) => {
    const [activeTab, setActiveTab] = useState<'general' | 'security' | 'app'>('general');
    
    // MPIN Edit State
    const [isChangingPin, setIsChangingPin] = useState(false);
    const [oldPin, setOldPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [pinStep, setPinStep] = useState<'verify' | 'new'>('verify');
    const [pinMsg, setPinMsg] = useState('');

    const handleChangeMpin = () => {
        if (pinStep === 'verify') {
            if (validateMPIN(oldPin)) {
                setPinStep('new');
                setPinMsg('');
            } else {
                setPinMsg('Incorrect Old MPIN');
            }
        } else {
            if (newPin.length === 4) {
                setMPIN(newPin);
                setIsChangingPin(false);
                setOldPin('');
                setNewPin('');
                setPinStep('verify');
                alert("MPIN Updated Successfully!");
            } else {
                setPinMsg('Enter 4 digit PIN');
            }
        }
    };

    const ThemeOption = ({ mode, label, icon: Icon, color }: any) => (
        <button 
            onClick={() => setTheme(mode)}
            className={`flex-1 flex flex-col items-center p-3 rounded-xl border transition-all active:scale-95 min-w-[80px] ${
                theme === mode 
                ? 'border-royal bg-royal/10 text-royal shadow-sm' 
                : 'border-gray-200 dark:border-white/10 bg-white dark:bg-deep-light text-gray-500 dark:text-gray-400'
            }`}
        >
            <div className={`p-2 rounded-full mb-2 ${theme === mode ? 'bg-royal text-white' : 'bg-gray-100 dark:bg-white/5'}`}>
               <Icon size={20} />
            </div>
            <span className="text-[10px] font-bold whitespace-nowrap">{label}</span>
        </button>
    );

    const Row = ({ icon: Icon, label, value, onClick, danger, active }: any) => (
        <div onClick={onClick} className={`flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5 last:border-0 active:bg-gray-50 dark:active:bg-white/5 transition-colors cursor-pointer ${danger ? 'text-red-500' : 'text-gray-800 dark:text-white'} ${active ? 'bg-royal/5' : ''}`}>
            <div className="flex items-center gap-3">
                {Icon && <Icon size={20} className={danger ? 'text-red-500' : active ? 'text-royal' : 'text-gray-500 dark:text-gray-400'} />}
                <span className={`text-sm font-medium ${active ? 'text-royal font-bold' : ''}`}>{label}</span>
            </div>
            {active && <Check size={16} className="text-royal" />}
            {value && <span className="text-xs text-gray-400">{value}</span>}
        </div>
    );

    return (
        <div className="pb-24 space-y-4 animate-fade-in bg-gray-50 dark:bg-deep min-h-screen">
            <div className="p-4 bg-white dark:bg-deep sticky top-0 z-20 border-b border-gray-100 dark:border-white/5">
                <h2 className="text-2xl font-black dark:text-white px-1 mb-4">{t('settings', language)}</h2>
                
                {/* Tabs */}
                <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-xl">
                    <button 
                        onClick={() => setActiveTab('general')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'general' ? 'bg-white dark:bg-slate-700 shadow text-royal' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        <Settings2 size={14} /> General
                    </button>
                    <button 
                        onClick={() => setActiveTab('security')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'security' ? 'bg-white dark:bg-slate-700 shadow text-royal' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        <Shield size={14} /> Security
                    </button>
                    <button 
                        onClick={() => setActiveTab('app')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'app' ? 'bg-white dark:bg-slate-700 shadow text-royal' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        <Layout size={14} /> App
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-6">
                
                {/* GENERAL SETTINGS */}
                {activeTab === 'general' && (
                    <div className="space-y-6 animate-slide-up">
                        {/* INSTALL PROMPT */}
                        {canInstall && (
                             <div className="bg-gradient-to-r from-royal to-electric p-4 rounded-2xl shadow-lg text-white flex items-center justify-between animate-pulse-slow">
                                 <div className="flex items-center gap-3">
                                     <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                         <Download size={24} className="text-white" />
                                     </div>
                                     <div>
                                         <h3 className="font-bold text-sm">Install App</h3>
                                         <p className="text-xs opacity-90">Get the full experience</p>
                                     </div>
                                 </div>
                                 <button onClick={installPwa} className="bg-white text-royal px-4 py-2 rounded-lg font-bold text-xs shadow-md">
                                     Install
                                 </button>
                             </div>
                        )}

                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1 tracking-wider">{t('settings.lang', language)}</h3>
                            <div className="bg-white dark:bg-deep-light rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden">
                                <Row icon={Globe} label="English" active={language === 'en'} onClick={() => setLanguage('en')} />
                                <Row icon={Globe} label="Hindi (हिंदी)" active={language === 'hi'} onClick={() => setLanguage('hi')} />
                                <Row icon={Globe} label="Bhojpuri (भोजपुरी)" active={language === 'bh'} onClick={() => setLanguage('bh')} />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1 tracking-wider">{t('settings.font', language)}</h3>
                            <div className="bg-white dark:bg-deep-light rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden">
                                 <Row label="Inter (Default)" active={font === 'inter'} onClick={() => setFont('inter')} />
                                 <div className="font-poppins"><Row label="Poppins" active={font === 'poppins'} onClick={() => setFont('poppins')} /></div>
                                 <div className="font-roboto"><Row label="Roboto" active={font === 'roboto'} onClick={() => setFont('roboto')} /></div>
                                 <div className="font-opensans"><Row label="Open Sans" active={font === 'opensans'} onClick={() => setFont('opensans')} /></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* SECURITY SETTINGS */}
                {activeTab === 'security' && (
                    <div className="space-y-6 animate-slide-up">
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1 tracking-wider">{t('settings.security', language)}</h3>
                            <div className="bg-white dark:bg-deep-light rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden">
                                {!isChangingPin ? (
                                    <div onClick={() => setIsChangingPin(true)} className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Lock size={20} className="text-gray-500 dark:text-gray-400" />
                                            <span className="text-sm font-medium dark:text-white">{t('settings.change_mpin', language)}</span>
                                        </div>
                                        <ChevronRight size={16} className="text-gray-400" />
                                    </div>
                                ) : (
                                    <div className="p-4 bg-gray-50 dark:bg-white/5 animate-fade-in">
                                        <h4 className="text-sm font-bold dark:text-white mb-2">{pinStep === 'verify' ? t('settings.enter_old', language) : t('settings.enter_new', language)}</h4>
                                        <div className="flex gap-2 mb-3">
                                             <input 
                                                type="password" 
                                                maxLength={4} 
                                                value={pinStep === 'verify' ? oldPin : newPin}
                                                onChange={e => pinStep === 'verify' ? setOldPin(e.target.value) : setNewPin(e.target.value)}
                                                className="w-full p-3 rounded-xl border border-gray-200 dark:border-white/10 dark:bg-deep text-center font-bold tracking-widest outline-none focus:border-royal dark:text-white"
                                                placeholder="****"
                                                autoFocus
                                             />
                                        </div>
                                        {pinMsg && <p className="text-xs text-red-500 font-bold mb-2">{pinMsg}</p>}
                                        <div className="flex gap-2">
                                            <button onClick={() => { setIsChangingPin(false); setPinStep('verify'); setOldPin(''); }} className="flex-1 py-2 text-xs font-bold text-gray-500 border border-gray-200 dark:border-white/10 rounded-lg">{t('btn.cancel', language)}</button>
                                            <button onClick={handleChangeMpin} className="flex-1 py-2 text-xs font-bold bg-royal text-white rounded-lg shadow-lg shadow-royal/20">{t('btn.next', language)}</button>
                                        </div>
                                    </div>
                                )}
                                <div className="p-4 border-t border-gray-100 dark:border-white/5">
                                    <div className="flex items-center justify-between">
                                         <div className="flex items-center gap-3">
                                             <ShieldCheck size={20} className="text-gray-500 dark:text-gray-400" />
                                             <span className="text-sm font-medium dark:text-white">{t('settings.two_factor', language)}</span>
                                         </div>
                                         <div className="w-10 h-6 bg-royal rounded-full p-1 cursor-pointer">
                                            <div className="w-4 h-4 bg-white rounded-full translate-x-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* APP SETTINGS */}
                {activeTab === 'app' && (
                    <div className="space-y-6 animate-slide-up">
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1 tracking-wider">{t('settings.theme', language)}</h3>
                            <div className="grid grid-cols-3 gap-3">
                                <ThemeOption mode="light" label="Light" icon={Sun} />
                                <ThemeOption mode="dark" label="Dark" icon={Moon} />
                                <ThemeOption mode="amoled" label="AMOLED" icon={Smartphone} />
                                <ThemeOption mode="blue-cyan" label="Cyber" icon={Monitor} />
                                <ThemeOption mode="minimal" label="Minimal" icon={Type} />
                                <ThemeOption mode="indian" label="India" icon={Flag} />
                                <ThemeOption mode="neon" label="Neon" icon={Zap} />
                                <ThemeOption mode="sunset" label="Sunset" icon={Sunset} />
                                <ThemeOption mode="eco" label="Eco" icon={Leaf} />
                                <ThemeOption mode="gold" label="Gold" icon={Crown} />
                                <ThemeOption mode="candy" label="Candy" icon={Candy} />
                            </div>
                        </div>

                        <div className="space-y-3">
                             <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1 tracking-wider">Storage</h3>
                             <div className="bg-white dark:bg-deep-light rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden">
                                <Row icon={Trash2} label={t('settings.cache', language)} value="24 MB" />
                                <Row icon={Info} label={t('settings.version', language)} value="v1.4.0" />
                             </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;
    