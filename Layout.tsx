
import React from 'react';
import { ViewState, Language } from '../types';
import { Home, Compass, Bell, Menu as MenuIcon, Video, Sparkles } from 'lucide-react';
import { t } from '../services/translationService';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  isDark: boolean;
  onSonicToggle: () => void;
  language: Language;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setCurrentView, isDark, onSonicToggle, language }) => {
  
  const NavItem = ({ view, icon: Icon, label }: { view: ViewState; icon: any; label: string }) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => setCurrentView(view)}
        className={`group relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-500 ease-out active:scale-90 ${
          isActive ? 'text-royal dark:text-electric' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
        }`}
      >
        {/* Top Active Indicator */}
        <span className={`absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-b-full bg-gradient-to-r from-royal to-electric shadow-[0_4px_12px_rgba(0,87,255,0.5)] transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${
            isActive ? 'opacity-100 translate-y-2' : 'opacity-0 -translate-y-4'
        }`} />
        
        {/* Icon Container with Background */}
        <div className={`p-2.5 rounded-2xl transition-all duration-500 relative overflow-hidden ${
            isActive 
            ? 'bg-royal/10 dark:bg-electric/10 -translate-y-1.5 shadow-lg shadow-royal/10 dark:shadow-electric/10' 
            : 'group-hover:bg-gray-50 dark:group-hover:bg-white/5'
        }`}>
            {isActive && <div className="absolute inset-0 bg-royal/20 dark:bg-electric/20 blur-md rounded-full opacity-50 animate-pulse-slow" />}
            <Icon 
              size={24} 
              strokeWidth={isActive ? 2.5 : 2} 
              className={`relative z-10 transition-transform duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${isActive ? 'scale-110 drop-shadow-sm' : 'group-hover:scale-110'}`} 
            />
        </div>
        
        {/* Label */}
        <span className={`text-[10px] font-medium transition-all duration-300 mt-1 transform ${isActive ? 'font-bold opacity-100 translate-y-0 text-royal dark:text-electric' : 'opacity-70 translate-y-1'}`}>
            {label}
        </span>
      </button>
    );
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-deep transition-colors duration-300">
      {/* Header */}
      <header className="flex-none h-16 bg-white/80 dark:bg-deep/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-4 sticky top-0 z-40 transition-colors duration-300">
        <div className="flex items-center gap-3">
            <button onClick={() => setCurrentView('profile')} className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm active:scale-95 transition-transform">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${localStorage.getItem('nivaranx_user_name') || 'NivaranX'}`} alt="Profile" className="w-full h-full" />
            </button>
            <div className="flex flex-col w-[160px]">
                 <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-royal to-electric drop-shadow-sm leading-none w-full text-center">NIVARANX™</h1>
                 <div className="flex justify-between w-full px-0.5 mt-0.5">
                    {t('app.tagline', language).split(' ').map((word, i) => (
                        <span key={i} className="text-[7px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">{word}</span>
                    ))}
                 </div>
            </div>
        </div>

        <div className="flex items-center gap-2">
            <button 
                onClick={onSonicToggle}
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-royal to-electric flex items-center justify-center text-white shadow-lg shadow-royal/30 animate-pulse-slow hover:shadow-royal/50 transition-shadow"
            >
                <Sparkles size={20} />
            </button>
        </div>
      </header>

      {/* Main Content Scrollable Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide bg-gray-50 dark:bg-deep relative">
         <div className="max-w-md mx-auto min-h-full">
            {children}
         </div>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="flex-none h-[5.5rem] pb-2 bg-white/90 dark:bg-[#0B1021]/90 backdrop-blur-xl border-t border-gray-100 dark:border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.3)] z-50 transition-colors duration-300">
        <div className="flex justify-around items-center h-full px-2 max-w-md mx-auto">
          <NavItem view="dashboard" icon={Home} label={t('nav.home', language)} />
          <NavItem view="explore" icon={Compass} label={t('nav.explore', language)} />
          <NavItem view="nexafeed" icon={Video} label={t('nav.nexafeed', language)} />
          <NavItem view="updates" icon={Bell} label={t('nav.updates', language)} />
          <NavItem view="menu" icon={MenuIcon} label={t('nav.menu', language)} />
        </div>
      </nav>
    </div>
  );
};

export default Layout;
