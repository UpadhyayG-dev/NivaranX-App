import React, { useState } from 'react';
import { Search, ArrowRight, ChevronLeft, FileText, CheckCircle, Wallet, ArrowUpRight, Grid, Mic, Loader2 } from 'lucide-react';
import { SERVICE_CATEGORIES } from '../services/serviceData';
import { ServiceCategory, ServiceItem, Language } from '../types';
import { t } from '../services/translationService';

interface ExploreProps {
  onServiceSelect: (serviceName: string) => void;
  language: Language;
}

export default function Explore({ onServiceSelect, language }: ExploreProps) {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | null>(null);
  const [activeService, setActiveService] = useState<ServiceItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);

  // Flatten services for global search
  const allServices = SERVICE_CATEGORIES.flatMap(cat => 
    cat.services.map(s => ({ ...s, categoryGradient: cat.gradient, categoryName: cat.title }))
  );

  const filteredServices = allServices.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApply = (serviceName: string) => {
    onServiceSelect(serviceName);
  };

  const handleBack = () => {
    if (activeService) {
      setActiveService(null);
    } else if (activeCategory) {
      setActiveCategory(null);
    } else {
      // already at root
    }
  };

  const startVoiceSearch = () => {
    // Check browser support for SpeechRecognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      // Set language based on app language
      recognition.lang = language === 'hi' ? 'hi-IN' : (language === 'bh' ? 'hi-IN' : 'en-US');
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        // Fallback or alert could be added here
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      alert("Voice search is not supported in this browser.");
    }
  };

  // 1. DETAIL VIEW (Apply Screen)
  if (activeService) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-deep animate-slide-up pb-20">
        <div className={`h-48 bg-gradient-to-br ${activeCategory?.gradient || 'from-royal to-deep'} relative rounded-b-[40px] shadow-lg`}>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="p-6 pt-10 text-white relative z-10">
            <button onClick={handleBack} className="bg-white/20 p-2 rounded-full backdrop-blur-md mb-4 hover:bg-white/30 transition-colors">
               <ChevronLeft size={24} />
            </button>
            <h1 className="text-2xl font-black leading-tight">{activeService.name}</h1>
            <p className="text-white/80 text-sm mt-2">{activeService.info}</p>
          </div>
        </div>

        <div className="px-6 -mt-10 relative z-20 space-y-6">
           {/* Documents Card */}
           <div className="bg-white dark:bg-deep-light p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-white/5">
              <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
                 <FileText size={20} className="text-royal" /> {t('process.upload', language)}
              </h3>
              <ul className="space-y-3">
                 {activeService.documents.map((doc, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                        <CheckCircle size={16} className="text-green-500 shrink-0" />
                        {doc}
                    </li>
                 ))}
              </ul>
           </div>

           {/* Charges Card */}
           <div className="bg-white dark:bg-deep-light p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-between">
               <div>
                  <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                     <Wallet size={20} className="text-green-600" /> Charges
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Govt Fee + Processing</p>
               </div>
               <div className="text-xl font-black text-gray-800 dark:text-white">
                  {activeService.charges}
               </div>
           </div>

           {/* Sticky Apply Button */}
           <button 
              onClick={() => handleApply(activeService.name)}
              className="w-full bg-royal text-white py-4 rounded-xl font-bold shadow-lg shadow-royal/30 flex items-center justify-center gap-2 active:scale-95 transition-transform"
           >
              Apply Now <ArrowRight size={20} />
           </button>
        </div>
      </div>
    );
  }

  // 2. CATEGORY LIST VIEW (Services in a specific category)
  if (activeCategory && !searchQuery) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-deep animate-slide-up pb-20">
         <div className={`bg-gradient-to-r ${activeCategory.gradient} p-6 pb-12 rounded-b-3xl shadow-lg relative overflow-hidden`}>
             <div className="absolute top-0 right-0 p-10 opacity-10">
                 <activeCategory.icon size={120} color="white" />
             </div>
             <div className="relative z-10">
                 <button onClick={handleBack} className="bg-white/20 text-white p-2 rounded-full backdrop-blur-md mb-4 hover:bg-white/30 transition-colors">
                    <ChevronLeft size={24} />
                 </button>
                 <h1 className="text-2xl font-black text-white">{activeCategory.title}</h1>
                 <p className="text-white/80 text-sm mt-1">{activeCategory.services.length} Services Available</p>
             </div>
         </div>

         <div className="px-4 -mt-6 relative z-20 space-y-3">
             {activeCategory.services.map((service, idx) => (
                 <button 
                    key={idx}
                    onClick={() => setActiveService(service)}
                    className="w-full bg-white dark:bg-deep-light p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-between group active:scale-95 transition-all"
                    style={{ animation: `fadeIn 0.3s ease-out forwards ${idx * 0.05}s`, opacity: 0 }}
                 >
                     <div className="text-left">
                         <h3 className="font-bold text-sm text-gray-800 dark:text-white group-hover:text-royal transition-colors">{service.name}</h3>
                         <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{service.info}</p>
                     </div>
                     <div className="bg-gray-50 dark:bg-white/5 p-2 rounded-full text-gray-400 group-hover:bg-royal group-hover:text-white transition-colors">
                         <ArrowRight size={16} />
                     </div>
                 </button>
             ))}
         </div>
      </div>
    );
  }

  // 3. MAIN EXPLORE GRID (Root State)
  return (
    <div className="p-4 space-y-6 pb-20 animate-fade-in bg-gray-50 dark:bg-deep min-h-screen">
      
      {/* Search Header */}
      <div className="space-y-4">
          <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black dark:text-white">{t('nav.explore', language)}</h2>
              <div className="bg-royal/10 dark:bg-royal/20 p-2 rounded-full text-royal">
                  <Grid size={20} />
              </div>
          </div>
          
          <div className="relative group z-30">
              <Search className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-royal transition-colors" size={20} />
              <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 775+ services..." 
                  className="w-full bg-white dark:bg-deep-light rounded-2xl py-3 pl-12 pr-12 shadow-sm border border-gray-100 dark:border-white/5 focus:ring-2 focus:ring-royal/50 outline-none dark:text-white transition-all" 
              />
              <button
                onClick={startVoiceSearch}
                className={`absolute right-3 top-2.5 p-1.5 rounded-full transition-all duration-300 ${isListening ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30' : 'bg-royal/10 text-royal hover:bg-royal hover:text-white'}`}
                title="Voice Search"
              >
                  {isListening ? <Loader2 size={18} className="animate-spin" /> : <Mic size={18} />}
              </button>
          </div>
      </div>

      {/* SEARCH RESULTS MODE */}
      {searchQuery ? (
          <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Search Results</h3>
              {filteredServices.length > 0 ? filteredServices.map((service: any, idx) => (
                   <button 
                      key={idx}
                      onClick={() => { setActiveService(service); setSearchQuery(''); }}
                      className="w-full bg-white dark:bg-deep-light p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-between group"
                   >
                       <div className="text-left">
                           <h3 className="font-bold text-sm text-gray-800 dark:text-white">{service.name}</h3>
                           <span className={`text-[10px] px-2 py-0.5 rounded bg-gradient-to-r ${service.categoryGradient} text-white mt-1 inline-block`}>
                               {service.categoryName}
                           </span>
                       </div>
                       <ArrowUpRight size={18} className="text-gray-300 group-hover:text-royal transition-colors" />
                   </button>
              )) : (
                   <div className="text-center py-10 text-gray-400">No services found matching "{searchQuery}"</div>
              )}
          </div>
      ) : (
          /* CATEGORY GRID MODE */
          <div className="grid grid-cols-2 gap-4">
              {SERVICE_CATEGORIES.map((cat, idx) => (
                  <button 
                      key={cat.id}
                      onClick={() => setActiveCategory(cat)}
                      className="group relative overflow-hidden bg-white dark:bg-deep-light rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5 hover:shadow-lg transition-all active:scale-[0.98] text-left h-36 flex flex-col justify-between"
                  >
                      {/* Gradient Background on Hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                      
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                          <cat.icon size={20} />
                      </div>

                      <div>
                          <h3 className="font-bold text-sm text-gray-800 dark:text-white leading-tight group-hover:text-royal dark:group-hover:text-electric transition-colors">
                              {cat.title}
                          </h3>
                          <p className="text-[10px] text-gray-400 mt-1">{cat.services.length}+ Services</p>
                      </div>

                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                          <ArrowRight size={16} className="text-gray-400 dark:text-gray-300" />
                      </div>
                  </button>
              ))}
          </div>
      )}
    </div>
  );
}