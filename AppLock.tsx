import React, { useState, useEffect } from 'react';
import { Lock, Fingerprint, Delete } from 'lucide-react';
import { getMPIN } from '../services/authService';
import { Language } from '../types';
import { t } from '../services/translationService';

interface AppLockProps {
  onUnlock: () => void;
  language: Language;
}

const AppLock: React.FC<AppLockProps> = ({ onUnlock, language }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [storedPin, setStoredPin] = useState<string | null>(null);

  useEffect(() => {
    const s = getMPIN();
    setStoredPin(s || '1234'); // Default 1234 if not set
  }, []);

  const handleNum = (num: number) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);
      if (newPin.length === 4) {
        validate(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const validate = (inputPin: string) => {
    if (inputPin === storedPin) {
      setTimeout(onUnlock, 200);
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-royal dark:bg-deep flex flex-col items-center justify-center text-white p-6 animate-fade-in">
      <div className="mb-8 flex flex-col items-center">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-md">
          <Lock size={32} />
        </div>
        <h2 className="text-xl font-bold">{t('auth.locked', language)}</h2>
        <p className="text-sm opacity-70 mt-1">{t('auth.mpin', language)}</p>
      </div>

      <div className="flex gap-4 mb-8">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`w-4 h-4 rounded-full border-2 transition-colors ${
            i < pin.length 
              ? error ? 'bg-red-500 border-red-500' : 'bg-white border-white' 
              : 'border-white/30'
          }`} />
        ))}
      </div>
      
      {error && <p className="text-red-300 text-sm font-bold mb-6 animate-pulse">Incorrect MPIN</p>}

      <div className="grid grid-cols-3 gap-6 w-full max-w-xs">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button 
            key={num} 
            onClick={() => handleNum(num)}
            className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-2xl font-bold backdrop-blur-sm transition-colors"
          >
            {num}
          </button>
        ))}
        <button className="w-16 h-16 flex items-center justify-center text-white/50">
           <Fingerprint size={32} />
        </button>
        <button 
          onClick={() => handleNum(0)}
          className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-2xl font-bold backdrop-blur-sm transition-colors"
        >
          0
        </button>
        <button 
            onClick={handleDelete}
            className="w-16 h-16 flex items-center justify-center text-white hover:text-red-400 transition-colors"
        >
           <Delete size={28} />
        </button>
      </div>
      
      <p className="mt-12 text-xs opacity-50 uppercase tracking-widest font-bold">{t('auth.forgot', language)}</p>
    </div>
  );
};

export default AppLock;