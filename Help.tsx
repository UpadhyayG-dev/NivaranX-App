
import React, { useState } from 'react';
import { MessageCircle, Mail, Phone, MapPin, Search, ChevronDown, ChevronUp, Send, HelpCircle, FileText } from 'lucide-react';
import { Language } from '../types';
import { t } from '../services/translationService';

interface HelpProps {
  language: Language;
}

export default function Help({ language }: HelpProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const FAQS = [
    { q: t('faq.q1', language), a: t('faq.a1', language) },
    { q: t('faq.q2', language), a: t('faq.a2', language) },
    { q: t('faq.q3', language), a: t('faq.a3', language) },
    { q: t('faq.q4', language), a: t('faq.a4', language) },
  ];

  const filteredFaqs = FAQS.filter(f => 
    f.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitTicket = () => {
    if (ticketSubject && ticketDesc) {
      setIsSubmitted(true);
      setTimeout(() => {
        setTicketSubject('');
        setTicketDesc('');
        setIsSubmitted(false);
        alert("Ticket Raised Successfully! ID: TKT-" + Math.floor(Math.random() * 10000));
      }, 2000);
    }
  };

  return (
    <div className="pb-24 animate-fade-in bg-gray-50 dark:bg-deep min-h-screen">
      {/* Hero Header */}
      <div className="bg-royal p-6 pb-12 rounded-b-[40px] shadow-lg text-center relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
         <h2 className="text-2xl font-black text-white mb-2 relative z-10">{t('help.support', language)}</h2>
         <p className="text-white/80 text-sm relative z-10">We are here to help you 24/7</p>
         
         <div className="relative max-w-md mx-auto mt-6 z-10">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('help.search', language)}
                className="w-full bg-white rounded-full py-3 pl-12 pr-4 shadow-lg text-gray-800 outline-none focus:ring-4 focus:ring-white/30 transition-all"
            />
         </div>
      </div>

      <div className="px-4 -mt-6 relative z-20 space-y-6 max-w-lg mx-auto">
         
         {/* Direct Support Card */}
         <div className="bg-white dark:bg-deep-light rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-white/5 flex flex-col items-center text-center space-y-4">
            <div className="w-14 h-14 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center shadow-inner">
                <MessageCircle size={28} />
            </div>
            <div>
                <h3 className="font-bold dark:text-white text-lg">{t('help.chat', language)}</h3>
                <p className="text-xs text-gray-500 mt-1">{t('help.chat_desc', language)}</p>
            </div>
            <button 
                onClick={() => window.open('https://wa.me/918603980072', '_blank')}
                className="bg-[#25D366] text-white px-8 py-3 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-[#20bd5a] transition-colors shadow-lg shadow-green-500/30"
            >
                <MessageCircle size={18} /> {t('help.open_whatsapp', language)}
            </button>
        </div>

        {/* FAQs */}
        <div className="space-y-3">
             <h3 className="font-bold text-gray-800 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2 ml-1">
                 <HelpCircle size={16} className="text-royal" /> {t('help.faq', language)}
             </h3>
             {filteredFaqs.map((item, index) => (
                 <div key={index} className="bg-white dark:bg-deep-light rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-white/5 transition-all">
                     <button 
                        onClick={() => toggleFaq(index)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                     >
                         <span className="font-bold text-sm text-gray-800 dark:text-white pr-4">{item.q}</span>
                         {activeFaq === index ? <ChevronUp size={18} className="text-royal shrink-0" /> : <ChevronDown size={18} className="text-gray-400 shrink-0" />}
                     </button>
                     {activeFaq === index && (
                         <div className="p-4 pt-0 text-xs text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                             {item.a}
                         </div>
                     )}
                 </div>
             ))}
        </div>

        {/* Raise Ticket */}
        <div className="space-y-3">
             <h3 className="font-bold text-gray-800 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2 ml-1">
                 <FileText size={16} className="text-orange-500" /> {t('help.raise_ticket', language)}
             </h3>
             <div className="bg-white dark:bg-deep-light p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 space-y-4">
                 <input 
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-slate-900 p-3 rounded-xl text-sm outline-none dark:text-white border border-transparent focus:border-royal transition-colors" 
                    placeholder={t('help.subject', language)} 
                 />
                 <textarea 
                    value={ticketDesc}
                    onChange={(e) => setTicketDesc(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-slate-900 p-3 rounded-xl text-sm outline-none h-28 dark:text-white border border-transparent focus:border-royal transition-colors resize-none" 
                    placeholder={t('help.desc', language)} 
                 />
                 <button 
                    onClick={handleSubmitTicket}
                    disabled={!ticketSubject || !ticketDesc || isSubmitted}
                    className="w-full bg-royal text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-royal/20 active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100"
                 >
                    {isSubmitted ? "Submitting..." : <>{t('help.submit', language)} <Send size={16} /></>}
                 </button>
             </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white dark:bg-deep-light p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 space-y-3 text-sm">
             <h4 className="font-bold dark:text-white mb-2">{t('help.contact', language)}</h4>
             <div className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                 <Mail size={18} className="text-royal" />
                 <span className="dark:text-gray-300">info.upadhyayg@gmail.com</span>
             </div>
             <div className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                 <Phone size={18} className="text-royal" />
                 <span className="dark:text-gray-300">+91-8603980072</span>
             </div>
             <div className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                 <MapPin size={18} className="text-royal" />
                 <span className="dark:text-gray-300">Nabinagar, Aurangabad, Bihar – 824302</span>
             </div>
        </div>

        <div className="text-center text-[10px] text-gray-400 pb-4">
            NIVARANX™ Support Team • v1.2.0
        </div>
      </div>
    </div>
  );
}
