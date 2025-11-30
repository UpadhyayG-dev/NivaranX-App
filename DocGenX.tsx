
import React, { useState, useEffect } from 'react';
import { DocumentItem, Language } from '../types';
import { Lock, FileText, Image, Upload, Cloud, ShieldCheck, MoreVertical, Search, Filter, Trash2, KeyRound, Loader2 } from 'lucide-react';
import { t } from '../services/translationService';
import { validateMPIN } from '../services/authService';

// Web Crypto API helpers for AES-GCM Encryption
const deriveKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey("raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveKey"]);
    return window.crypto.subtle.deriveKey(
        { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
};

const encryptData = async (data: string, password: string): Promise<string> => {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);
    const enc = new TextEncoder();
    const encrypted = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(data));
    
    // Combine salt + iv + ciphertext for storage (simple concatenation with delimiter or length prefix)
    // Using simple JSON structure converted to Base64 for ease
    const pack = {
        s: Array.from(salt),
        iv: Array.from(iv),
        d: Array.from(new Uint8Array(encrypted))
    };
    return btoa(JSON.stringify(pack));
};

const decryptData = async (encryptedBase64: string, password: string): Promise<string | null> => {
    try {
        const pack = JSON.parse(atob(encryptedBase64));
        const salt = new Uint8Array(pack.s);
        const iv = new Uint8Array(pack.iv);
        const data = new Uint8Array(pack.d);
        
        const key = await deriveKey(password, salt);
        const decrypted = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
        return new TextDecoder().decode(decrypted);
    } catch (e) {
        console.error("Decryption Failed", e);
        return null;
    }
};

const DocGenX: React.FC<{ language: Language }> = ({ language }) => {
  const CATEGORIES = [t('doc.tab.all', language), t('doc.tab.identity', language), t('doc.tab.education', language), t('doc.tab.finance', language)];
  const [activeTab, setActiveTab] = useState(CATEGORIES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  
  // Upload & Encryption State
  const [isUploading, setIsUploading] = useState(false);
  const [showMpinModal, setShowMpinModal] = useState(false);
  const [uploadPin, setUploadPin] = useState('');
  const [pendingFile, setPendingFile] = useState<{file: File, base64: string} | null>(null);
  const [pinError, setPinError] = useState('');
  const [processingMsg, setProcessingMsg] = useState('');

  // Decryption State
  const [viewingDoc, setViewingDoc] = useState<string | null>(null);

  // Load docs from LocalStorage on mount
  useEffect(() => {
      const stored = localStorage.getItem('nx_docs');
      if (stored) {
          try {
              setDocs(JSON.parse(stored));
          } catch(e) { console.error(e); }
      }
  }, []);

  const saveDocs = (newDocs: DocumentItem[]) => {
      setDocs(newDocs);
      localStorage.setItem('nx_docs', JSON.stringify(newDocs));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = (ev) => {
             if (ev.target?.result) {
                 setPendingFile({ file, base64: ev.target.result as string });
                 setShowMpinModal(true);
                 setUploadPin('');
                 setPinError('');
             }
          };
          reader.readAsDataURL(file);
      }
  };

  const handleEncryptAndSave = async () => {
      if (!validateMPIN(uploadPin)) {
          setPinError('Incorrect MPIN');
          return;
      }
      if (!pendingFile) return;

      setIsUploading(true);
      setProcessingMsg('Encrypting with AES-256...');

      // Wait a tick to show UI update
      await new Promise(r => setTimeout(r, 500));

      try {
          // Encrypt the Base64 data string
          const encryptedContent = await encryptData(pendingFile.base64, uploadPin);
          
          const newDoc: DocumentItem = {
              id: Date.now().toString(),
              name: pendingFile.file.name,
              date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
              size: (pendingFile.file.size / 1024 / 1024).toFixed(2) + ' MB',
              type: pendingFile.file.type.includes('pdf') ? 'pdf' : 'img',
              isEncrypted: true
          };

          // Store Metadata in 'nx_docs' and Content in 'nx_doc_data_[id]'
          // We separate content to avoid hitting single localStorage key limits too fast, though 5MB limit still applies overall.
          // For a real app, IndexedDB is better, but localStorage works for small files in this demo.
          try {
              localStorage.setItem(`nx_doc_data_${newDoc.id}`, encryptedContent);
              saveDocs([newDoc, ...docs]);
              
              setProcessingMsg('Saved to Secure Vault!');
              setTimeout(() => {
                  setIsUploading(false);
                  setShowMpinModal(false);
                  setPendingFile(null);
                  setUploadPin('');
              }, 800);
          } catch (e) {
              alert("Storage Full! Cannot save document.");
              setIsUploading(false);
          }

      } catch (e) {
          console.error(e);
          setPinError("Encryption Failed");
          setIsUploading(false);
      }
  };

  const handleDelete = (id: string) => {
      if(confirm("Are you sure you want to delete this document?")) {
          const newDocs = docs.filter(d => d.id !== id);
          saveDocs(newDocs);
          localStorage.removeItem(`nx_doc_data_${id}`);
      }
  };

  const handleView = async (doc: DocumentItem) => {
      const pin = prompt("Enter MPIN to Decrypt:");
      if (!pin) return;
      
      if (!validateMPIN(pin)) {
          alert("Incorrect MPIN. Access Denied.");
          return;
      }

      const encrypted = localStorage.getItem(`nx_doc_data_${doc.id}`);
      if (!encrypted) {
          alert("Document data not found.");
          return;
      }

      const decrypted = await decryptData(encrypted, pin);
      if (decrypted) {
          // Open in new tab or download
          const link = document.createElement('a');
          link.href = decrypted;
          link.download = doc.name;
          link.click();
      } else {
          alert("Decryption failed. Data might be corrupted or wrong MPIN.");
      }
  };

  const filteredDocs = docs.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pb-20 relative">
        <div className="bg-gradient-to-br from-royal to-deep p-6 text-white rounded-b-3xl shadow-lg">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2"><Lock size={24} className="text-electric" /> {t('doc.genx', language)}</h2>
                    <p className="text-sm opacity-80 mt-1">{t('doc.vault', language)}</p>
                </div>
                <div className="bg-white/10 p-2 rounded-lg backdrop-blur-md">
                    <ShieldCheck className="text-electric" size={24} />
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
                 <div className="relative">
                    <button className="w-full bg-white text-royal py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform">
                        <Upload size={18} /> {t('btn.upload', language)}
                    </button>
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileSelect} accept="image/*,application/pdf" />
                 </div>
                 <button className="bg-royal-dark/50 border border-white/20 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform">
                     <Cloud size={18} /> {t('doc.sync', language)}
                 </button>
            </div>
        </div>

        <div className="p-4 space-y-4">
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                {CATEGORIES.map(cat => (
                    <button 
                        key={cat} 
                        onClick={() => setActiveTab(cat)}
                        className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                            activeTab === cat ? 'bg-royal text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder={t('doc.search', language)} 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 pl-10 pr-4 py-3 rounded-xl border border-gray-100 dark:border-white/5 outline-none dark:text-white focus:ring-1 focus:ring-royal"
                />
            </div>

             <h3 className="font-bold text-gray-800 dark:text-white flex items-center justify-between text-sm mt-2">
                 {t('doc.stored', language)}
                 <span className="text-[10px] font-bold text-royal bg-royal/10 px-2 py-1 rounded-md">{filteredDocs.length} {t('doc.encrypted', language)}</span>
             </h3>
             
             {filteredDocs.length > 0 ? filteredDocs.map(doc => (
                 <div key={doc.id} onClick={() => handleView(doc)} className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 active:scale-[0.99] transition-transform cursor-pointer">
                     <div className="flex items-center space-x-4">
                         <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${doc.type === 'pdf' ? 'bg-red-50 text-red-500 dark:bg-red-900/20' : 'bg-blue-50 text-blue-500 dark:bg-blue-900/20'}`}>
                             {doc.type === 'pdf' ? <FileText size={24} /> : <Image size={24} />}
                         </div>
                         <div>
                             <h4 className="font-bold text-sm dark:text-white line-clamp-1">{doc.name}</h4>
                             <p className="text-[10px] text-gray-400 mt-0.5">{doc.date} • {doc.size} • <span className="text-green-500 font-medium">AES-256</span></p>
                         </div>
                     </div>
                     <button onClick={(e) => {e.stopPropagation(); handleDelete(doc.id);}} className="text-gray-400 p-2 hover:bg-red-50 hover:text-red-500 dark:hover:bg-white/5 rounded-full transition-colors">
                         <Trash2 size={18} />
                     </button>
                 </div>
             )) : (
                 <div className="text-center py-10 text-gray-400 text-sm flex flex-col items-center gap-2">
                     <Lock size={32} className="opacity-20" />
                     {t('doc.empty', language)}
                 </div>
             )}

             <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-100 dark:border-yellow-900/30 flex gap-3 items-start">
                 <Lock size={16} className="text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
                 <p className="text-xs text-yellow-700 dark:text-yellow-500 leading-relaxed">
                     {t('doc.security_note', language)}
                 </p>
             </div>
        </div>

        {/* MPIN Encryption Modal */}
        {showMpinModal && (
            <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
                <div className="bg-white dark:bg-deep-light w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-scale-in">
                    <h3 className="text-xl font-bold dark:text-white flex items-center gap-2 mb-2">
                        <KeyRound className="text-royal" /> Encrypt & Save
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">Enter your MPIN to encrypt this document. You will need it to decrypt later.</p>
                    
                    <div className="space-y-4">
                        <input 
                            type="password" 
                            placeholder="Enter 4-Digit MPIN" 
                            value={uploadPin}
                            onChange={(e) => setUploadPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            maxLength={4}
                            autoFocus
                            className="w-full text-center text-2xl font-bold tracking-widest p-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 outline-none focus:border-royal dark:text-white"
                        />
                        {pinError && <p className="text-red-500 text-xs font-bold text-center">{pinError}</p>}
                        
                        <div className="flex gap-3 mt-4">
                            <button 
                                onClick={() => {setShowMpinModal(false); setPendingFile(null);}} 
                                className="flex-1 py-3 text-gray-500 font-bold text-sm bg-gray-100 dark:bg-white/5 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleEncryptAndSave}
                                disabled={isUploading || uploadPin.length < 4}
                                className="flex-1 py-3 text-white font-bold text-sm bg-royal rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isUploading ? <Loader2 className="animate-spin" /> : <><Lock size={16} /> Encrypt</>}
                            </button>
                        </div>
                        {processingMsg && <p className="text-center text-xs text-royal font-bold animate-pulse">{processingMsg}</p>}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default DocGenX;
