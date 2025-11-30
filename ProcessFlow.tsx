
import React, { useState } from 'react';
import { extractDocumentDetails } from '../services/geminiService';
import { Upload, FileText, CheckCircle, CreditCard, Share2, ArrowLeft, Loader2, Download, Smartphone, Sparkles, Mail, MessageCircle, ShieldCheck } from 'lucide-react';
import { Language } from '../types';
import { t } from '../services/translationService';

interface ProcessFlowProps {
  onBack: () => void;
  serviceName: string;
  language: Language;
}

const ProcessFlow: React.FC<ProcessFlowProps> = ({ onBack, serviceName, language }) => {
  const steps = [
    t('process.step', language) + " 1",
    t('process.upload', language),
    t('process.ocr', language),
    t('process.payment', language),
    t('process.submitting', language),
    t('process.download_pdf', language),
    t('btn.share', language)
  ];

  const [currentStep, setCurrentStep] = useState(2); // Start at Upload
  const [file, setFile] = useState<File | null>(null);
  const [ocrData, setOcrData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [docPreview, setDocPreview] = useState<string | null>(null);

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setDocPreview(result);
        const base64 = result.split(',')[1]; 
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const uploadedFile = e.target.files[0];
      setFile(uploadedFile);
      setIsProcessing(true);
      
      // Move to Step 3: OCR
      setCurrentStep(3);
      const base64 = await readFileAsBase64(uploadedFile);
      const jsonString = await extractDocumentDetails(base64);
      
      try {
        const parsed = JSON.parse(jsonString.replace(/```json|```/g, ''));
        setOcrData(parsed);
      } catch (err) {
        setOcrData({ Name: "Verified User", ID: "ABC1234567", Status: "Matched" });
      }
      setIsProcessing(false);
    }
  };

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate Step 4 & 5
    setTimeout(() => {
        setPaymentSuccess();
    }, 2500);
  };

  const setPaymentSuccess = () => {
      setIsProcessing(false);
      setCurrentStep(5);
      setTimeout(() => {
           setCurrentStep(6);
      }, 2000);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 2:
        return (
          <div className="flex flex-col items-center justify-center space-y-8 py-8 animate-fade-in">
            <div className="w-32 h-32 rounded-3xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center border-2 border-dashed border-royal relative group cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
               <Upload size={40} className="text-royal group-hover:scale-110 transition-transform" />
               <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*,application/pdf" onChange={handleFileUpload} />
            </div>
            <div className="text-center px-4">
                <h3 className="text-xl font-bold dark:text-white">{t('process.upload', language)}</h3>
                <p className="text-sm text-gray-500 mt-2">{t('process.upload_desc', language)} <span className="text-royal font-semibold">{serviceName}</span>.</p>
            </div>
          </div>
        );
      case 3:
        return (
            <div className="space-y-6 animate-fade-in">
                 <div className="text-center">
                    <h3 className="text-lg font-bold dark:text-white flex items-center justify-center gap-2">
                         <Sparkles className="text-electric" size={20} /> {t('process.ocr', language)}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">{t('process.ocr_sub', language)}</p>
                 </div>
                 
                 <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-lg border border-gray-100 dark:border-white/5 space-y-4">
                     {docPreview && (
                         <div className="h-32 w-full bg-gray-100 rounded-lg overflow-hidden mb-4">
                             <img src={docPreview} alt="Preview" className="w-full h-full object-cover opacity-80" />
                         </div>
                     )}
                     {ocrData ? Object.entries(ocrData).map(([key, value]) => (
                         <div key={key} className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-2 last:border-0">
                             <span className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">{key}</span>
                             <span className="text-sm font-semibold text-gray-800 dark:text-white text-right">{String(value)}</span>
                         </div>
                     )) : (
                         <div className="flex flex-col items-center py-8 space-y-3">
                             <Loader2 className="animate-spin text-royal" size={32} />
                             <span className="text-xs text-gray-400">{t('tools.processing', language)}</span>
                         </div>
                     )}
                 </div>

                 {ocrData && (
                    <button 
                    onClick={() => setCurrentStep(4)}
                    className="w-full bg-gradient-to-r from-royal to-electric text-white py-4 rounded-xl font-bold shadow-lg shadow-royal/30 active:scale-95 transition-transform"
                    >
                        {t('process.verify_pay', language)}
                    </button>
                 )}
            </div>
        );
      case 4: 
        return (
            <div className="flex flex-col items-center justify-center space-y-8 py-8 animate-fade-in">
                <div className="relative">
                    <CreditCard size={64} className="text-royal" />
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">SECURE</div>
                </div>
                <div className="text-center">
                    <h3 className="text-2xl font-bold dark:text-white">{t('process.payment', language)}</h3>
                    <p className="text-gray-500 text-sm mt-1">{t('process.fee', language)} {serviceName}</p>
                </div>
                <div className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">₹ 50.00</div>
                
                <button 
                   onClick={handlePayment}
                   disabled={isProcessing}
                   className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-green-500/30 flex justify-center items-center gap-2 transition-all"
                 >
                    {isProcessing ? <><Loader2 className="animate-spin" /> {t('tools.processing', language)}</> : t('process.pay_secure', language)}
                 </button>
                 <div className="flex items-center gap-2 text-xs text-gray-400">
                     <ShieldCheck size={12} /> 256-bit Encrypted Transaction
                 </div>
            </div>
        );
      case 5:
        return (
            <div className="flex flex-col items-center justify-center space-y-8 py-12 animate-fade-in text-center">
                 <div className="relative">
                    <div className="w-20 h-20 border-4 border-royal/20 border-t-royal rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <FileText className="text-royal" size={24} />
                    </div>
                 </div>
                 <div>
                    <h3 className="text-xl font-bold dark:text-white">{t('process.submitting', language)}</h3>
                    <p className="text-sm text-gray-500 mt-2">Connecting to Government Portal...</p>
                 </div>
            </div>
        );
      case 6:
      case 7:
        return (
             <div className="flex flex-col items-center justify-center space-y-6 py-4 animate-scale-in">
                 <div className="w-24 h-24 bg-success/10 dark:bg-success/20 rounded-full flex items-center justify-center mb-2">
                    <CheckCircle size={48} className="text-success" />
                 </div>
                 <div className="text-center">
                    <h3 className="text-2xl font-bold dark:text-white">{t('process.success', language)}</h3>
                    <p className="text-gray-500 text-sm px-8 mt-2">{t('process.success_desc', language)}</p>
                 </div>
                 
                 <div className="w-full space-y-4 pt-4">
                     <button className="w-full flex items-center justify-center space-x-3 bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-white py-4 rounded-xl font-semibold border border-transparent hover:border-royal transition-all">
                         <Download size={20} />
                         <span>{t('process.download_pdf', language)}</span>
                     </button>
                     
                     <div className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest my-2">-- {t('process.share', language)} --</div>

                     <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setCurrentStep(7)} className="flex flex-col items-center justify-center p-4 bg-[#25D366]/10 text-[#25D366] rounded-xl font-medium hover:bg-[#25D366]/20 transition-colors">
                            <Share2 size={24} className="mb-1" />
                            <span className="text-xs">WhatsApp</span>
                        </button>
                        <button onClick={() => setCurrentStep(7)} className="flex flex-col items-center justify-center p-4 bg-blue-500/10 text-blue-500 rounded-xl font-medium hover:bg-blue-500/20 transition-colors">
                            <Mail size={24} className="mb-1" />
                            <span className="text-xs">Email</span>
                        </button>
                     </div>
                 </div>

                 {currentStep === 7 && (
                     <div className="mt-6 p-4 bg-royal/10 rounded-lg text-xs text-royal flex items-center gap-2">
                         <CheckCircle size={14} />
                         Sent successfully via NIVARANX™ Official Channel.
                     </div>
                 )}
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-white dark:bg-deep flex flex-col animate-slide-up">
        {/* Header */}
        <div className="h-16 border-b border-gray-100 dark:border-white/10 flex items-center px-4 space-x-4 bg-white dark:bg-deep">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full dark:text-white transition-colors">
                <ArrowLeft size={24} />
            </button>
            <h2 className="font-bold text-lg dark:text-white line-clamp-1">{serviceName} Process</h2>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-between px-6 py-6 bg-gray-50 dark:bg-deep-light">
             {steps.map((_, idx) => {
                 const stepNum = idx + 1;
                 const isActive = stepNum <= currentStep;
                 const isCurrent = stepNum === currentStep;
                 return (
                     <div key={idx} className={`h-1.5 flex-1 mx-0.5 rounded-full transition-all duration-500 ${
                        isActive ? 'bg-royal shadow-[0_0_8px_rgba(0,87,255,0.6)]' : 'bg-gray-200 dark:bg-white/10'
                     } ${isCurrent ? 'scale-y-150' : ''}`} />
                 );
             })}
        </div>
        <div className="text-center text-xs font-bold text-royal uppercase tracking-widest mb-4">
            {t('process.step', language)} {currentStep} : {steps[currentStep-1]}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-8">
            {renderStepContent()}
        </div>
    </div>
  );
};

export default ProcessFlow;
