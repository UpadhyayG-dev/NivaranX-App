
import React, { useState } from 'react';
import { X, ArrowRight, ShieldCheck, Sparkles, LayoutGrid, FileText } from 'lucide-react';
import { Language } from '../types';

interface AppTourProps {
  onClose: () => void;
  language: Language;
}

const AppTour: React.FC<AppTourProps> = ({ onClose, language }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to NIVARANX™",
      desc: "Your all-in-one digital empowerment platform. Let's take a quick tour of what you can do.",
      icon: ShieldCheck,
      color: "text-royal"
    },
    {
      title: "Meet Sonic AI",
      desc: "Tap the sparkle button or use the voice toggle in the header to ask anything or navigate hands-free.",
      icon: Sparkles,
      color: "text-electric"
    },
    {
      title: "Tools Hub",
      desc: "Edit PDFs, Create IDs, Generate Resumes, and more. A complete utility suite in your pocket.",
      icon: LayoutGrid,
      color: "text-purple-500"
    },
    {
      title: "DocGenX Secure Vault",
      desc: "Store your documents with bank-grade encryption. Auto-organize and access offline.",
      icon: FileText,
      color: "text-green-500"
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const CurrentIcon = steps[step].icon;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white dark:bg-deep-light w-full max-w-sm rounded-3xl p-6 shadow-2xl relative z-10 border border-white/20 animate-scale-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white">
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center space-y-6 py-6">
          <div className={`w-20 h-20 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center ${steps[step].color} mb-2 shadow-inner`}>
             <CurrentIcon size={40} className="animate-pulse-slow" />
          </div>
          
          <div>
            <h3 className="text-xl font-black dark:text-white mb-2">{steps[step].title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{steps[step].desc}</p>
          </div>

          <div className="flex gap-2 justify-center w-full pt-4">
             {steps.map((_, i) => (
               <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? `w-8 ${steps[step].color.replace('text-', 'bg-')}` : 'w-2 bg-gray-200 dark:bg-white/10'}`} />
             ))}
          </div>

          <button 
            onClick={handleNext}
            className="w-full bg-royal text-white py-4 rounded-2xl font-bold shadow-lg shadow-royal/30 flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            {step === steps.length - 1 ? "Get Started" : "Next"} <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppTour;
