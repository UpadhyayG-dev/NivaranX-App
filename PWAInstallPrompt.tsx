import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface Props {
  deferredPrompt: any;
  onInstall: () => void;
}

export const PWAInstallPrompt: React.FC<Props> = ({ deferredPrompt, onInstall }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (deferredPrompt) {
      // Show prompt after a 3-second delay to not block initial app interaction
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [deferredPrompt]);

  const handleInstall = () => {
    onInstall();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[60] bg-[#0F1633] text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between animate-slide-up border border-white/10 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-royal to-electric p-2.5 rounded-xl shadow-lg">
           <Smartphone size={24} className="text-white" />
        </div>
        <div>
          <h3 className="font-bold text-sm">Install NIVARANX™</h3>
          <p className="text-[10px] text-gray-300">Add to Home Screen for faster access</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={handleInstall}
          className="bg-white text-royal px-4 py-2 rounded-lg font-bold text-xs shadow-md active:scale-95 transition-transform flex items-center gap-1"
        >
          <Download size={14} /> Install
        </button>
        <button 
            onClick={() => setIsVisible(false)} 
            className="p-2 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-full"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};
