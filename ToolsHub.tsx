import React, { useState, useRef, useEffect } from 'react';
import { Tool, Language } from '../types';
import { 
  FilePlus, Scissors, Minimize2, Image, Scan, PenTool, QrCode, CreditCard, 
  FileText, ArrowLeft, Download, RefreshCw, Upload, Check, X, Trash2, File,
  RotateCw, Crop, Wand2, Camera, ArrowUp, ArrowDown, Palette, Sliders,
  Maximize, Layers, UserSquare, Briefcase, GraduationCap, Hexagon, Eye, Grid, Type, Move,
  Mail, Phone, MapPin, Sparkles, LayoutTemplate, Aperture, Barcode, HelpCircle, AlertCircle,
  Search, ArrowRight, Printer, Save, Eraser, CheckCircle, Edit2, Loader2, TextCursor
} from 'lucide-react';
import { generateAILogo, extractDocumentDetails } from '../services/geminiService';
import { t } from '../services/translationService';

// Declare types for global libraries loaded via CDN in index.html
declare global {
  interface Window {
    PDFLib: any;
    html2canvas: any;
    jspdf: any;
  }
}

const ToolsHub: React.FC<{ language: Language }> = ({ language }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const TOOLS = [
    { id: '1', name: t('tool.merge', language), icon: FilePlus, color: 'text-red-500', category: 'PDF', desc: 'Combine multiple PDFs into one.', bg: 'bg-red-50 dark:bg-red-900/20' },
    { id: '2', name: t('tool.split', language), icon: Scissors, color: 'text-orange-500', category: 'PDF', desc: 'Extract pages from PDF.', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { id: '3', name: t('tool.compress', language), icon: Minimize2, color: 'text-green-500', category: 'PDF', desc: 'Reduce file size.', bg: 'bg-green-50 dark:bg-green-900/20' },
    { id: '5', name: t('tool.scanner', language), icon: Scan, color: 'text-blue-500', category: 'Image', desc: 'Scan docs clearly.', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { id: '4', name: t('tool.image', language), icon: Image, color: 'text-purple-500', category: 'Image', desc: 'Resize & Convert images.', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { id: '9', name: t('tool.resume', language), icon: Briefcase, color: 'text-royal', category: 'Maker', desc: 'Build professional CV.', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { id: '8', name: t('tool.idcard', language), icon: UserSquare, color: 'text-teal-500', category: 'Maker', desc: 'Create ID Cards.', bg: 'bg-teal-50 dark:bg-teal-900/20' },
    { id: '10', name: t('tool.logo', language), icon: Sparkles, color: 'text-pink-500', category: 'Maker', desc: 'AI Brand Logos.', bg: 'bg-pink-50 dark:bg-pink-900/20' },
    { id: '6', name: t('tool.signature', language), icon: PenTool, color: 'text-gray-500', category: 'Utils', desc: 'Digital Signatures.', bg: 'bg-gray-100 dark:bg-gray-800' },
    { id: '7', name: t('tool.qr', language), icon: QrCode, color: 'text-black dark:text-white', category: 'Utils', desc: 'Generate QR Codes.', bg: 'bg-gray-200 dark:bg-gray-700' },
  ];

  const filteredTools = TOOLS.filter(tool => 
    (activeCategory === 'All' || tool.category === activeCategory) &&
    tool.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const RESUME_TEMPLATES = [
    { id: 'modern', name: 'Modern Blue', class: 'bg-white font-sans' },
    { id: 'classic', name: 'Classic Serif', class: 'bg-gray-50 font-serif' },
    { id: 'creative', name: 'Creative Dark', class: 'bg-slate-900 text-white font-sans' },
    { id: 'minimal', name: 'Minimalist', class: 'bg-white border-l-8 border-black font-sans' },
  ];

  const ID_TEMPLATES = [
    { id: 'corp', name: 'Corporate', gradient: 'from-blue-600 to-blue-800' },
    { id: 'student', name: 'Student', gradient: 'from-green-500 to-teal-600' },
    { id: 'govt', name: 'Government', gradient: 'from-orange-500 to-red-600' },
    { id: 'tech', name: 'Tech Startup', gradient: 'from-purple-600 to-indigo-800' },
    { id: 'visitor', name: 'Visitor', gradient: 'from-gray-600 to-gray-800' }
  ];

  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMsg, setProcessingMsg] = useState('');

  // Common Tool State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // PDF Merge State
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);

  // Image Tools State
  const [imageToolMode, setImageToolMode] = useState<'menu' | 'compress' | 'resize' | 'convert'>('menu');
  const [compressionQuality, setCompressionQuality] = useState(80);
  const [resizeDim, setResizeDim] = useState({ width: 0, height: 0, maintainAspect: true });
  const [originalDim, setOriginalDim] = useState({ width: 0, height: 0 });
  const [targetFormat, setTargetFormat] = useState<'jpg' | 'png' | 'webp'>('jpg');
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);

  // Scanner State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scannerImage, setScannerImage] = useState<string | null>(null);
  const [scanFilter, setScanFilter] = useState<'none' | 'grayscale' | 'bw' | 'high-contrast'>('none');

  // Signature State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureImg, setSignatureImg] = useState<string | null>(null);
  const [penColor, setPenColor] = useState('#000000');
  const [penWidth, setPenWidth] = useState(3);
  const [penLineCap, setPenLineCap] = useState<'round' | 'square'>('round');
  const [extractedText, setExtractedText] = useState<string | null>(null);

  // QR State
  const [qrText, setQrText] = useState('');
  const [generatedQr, setGeneratedQr] = useState('');
  const [qrColor, setQrColor] = useState('#000000');
  const [qrBg, setQrBg] = useState('#FFFFFF');

  // ID Card State
  const idCardRef = useRef<HTMLDivElement>(null);
  const [idDetails, setIdDetails] = useState({ name: 'JOHN DOE', role: 'EMPLOYEE', idNo: 'EMP-001', address: '123 Tech Park' });
  const [idPhoto, setIdPhoto] = useState<string | null>(null);
  const [activeIdTemplate, setActiveIdTemplate] = useState(ID_TEMPLATES[0]);

  // AI Logo Maker State
  const [logoPrompt, setLogoPrompt] = useState('');
  const [logoStyle, setLogoStyle] = useState('Modern');
  const [generatedLogos, setGeneratedLogos] = useState<string[]>([]);

  // Resume Maker State
  const resumeRef = useRef<HTMLDivElement>(null);
  const [activeResumeTemplate, setActiveResumeTemplate] = useState(RESUME_TEMPLATES[0]);
  const [resumeData, setResumeData] = useState({
      fullName: 'Rishi Upadhyay',
      email: 'rishi@example.com',
      phone: '+91 98765 43210',
      city: 'Mumbai, India',
      summary: 'Passionate software engineer with 5 years of experience in full-stack development. Dedicated to building efficient and scalable web applications.',
      skills: 'React, TypeScript, Node.js, Python, Cloud Computing, UI/UX Design',
      experience: 'Senior Developer at TechCorp (2020 - Present)\n• Led a team of 5 developers.\n• Improved app performance by 40%.\n\nJunior Dev at StartUp Inc (2018 - 2020)\n• Developed core features for the MVP.',
      education: 'B.Tech in Computer Science\nIIT Bombay (2014 - 2018)\n\nHigh School\nDelhi Public School (2012-2014)'
  });

  const handleToolClick = (tool: any) => {
      setActiveTool(tool);
      setIsProcessing(false);
      setProcessingMsg('');
      setUploadedFile(null);
      setFilePreview(null);
      setPdfFiles([]);
      setMergedPdfUrl(null);
      setImageToolMode('menu');
      setProcessedImageUrl(null);
      setScannerImage(null);
      setIsCameraActive(false);
      setSignatureImg(null);
      setQrText('');
      setGeneratedQr('');
      setIdDetails({ name: 'JOHN DOE', role: 'EMPLOYEE', idNo: 'EMP-001', address: '123 Tech Park' });
      setIdPhoto(null);
      setLogoPrompt('');
      setGeneratedLogos([]);
      setExtractedText(null);
  };

  const handleSingleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'pdf') => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setUploadedFile(file);
          if (type === 'image') {
              const reader = new FileReader();
              reader.onload = (ev) => {
                  setFilePreview(ev.target?.result as string);
                  const img = new window.Image();
                  img.onload = () => {
                      setOriginalDim({ width: img.width, height: img.height });
                      setResizeDim({ width: img.width, height: img.height, maintainAspect: true });
                  };
                  img.src = ev.target?.result as string;
              };
              reader.readAsDataURL(file);
          }
      }
  };

  const handleMultiplePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          const files = Array.from(e.target.files);
          setPdfFiles(prev => [...prev, ...files]);
      }
  };

  const handleResizeChange = (dim: 'width' | 'height', value: number) => {
    if (resizeDim.maintainAspect && originalDim.width > 0) {
        const ratio = originalDim.width / originalDim.height;
        if (dim === 'width') {
            setResizeDim({ ...resizeDim, width: value, height: Math.round(value / ratio) });
        } else {
            setResizeDim({ ...resizeDim, height: value, width: Math.round(value * ratio) });
        }
    } else {
        setResizeDim({ ...resizeDim, [dim]: value });
    }
  };

  const handleRealPdfMerge = async () => {
    if (pdfFiles.length < 2) return;
    setIsProcessing(true);
    setProcessingMsg("Merging PDFs...");

    try {
        const { PDFDocument } = window.PDFLib;
        const mergedPdf = await PDFDocument.create();

        for (const file of pdfFiles) {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page: any) => mergedPdf.addPage(page));
        }

        const pdfBytes = await mergedPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setMergedPdfUrl(url);
    } catch (e) {
        console.error("Merge Error", e);
        alert("Failed to merge. Ensure files are valid PDFs.");
    } finally {
        setIsProcessing(false);
    }
  };

  const handleImageProcess = () => {
    if (!filePreview || !uploadedFile) return;
    setIsProcessing(true);
    setProcessingMsg("Processing Image...");

    const img = new window.Image();
    img.src = filePreview;
    img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = originalDim.width;
        let height = originalDim.height;

        if (imageToolMode === 'resize') {
            width = resizeDim.width;
            height = resizeDim.height;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        let mimeType = 'image/jpeg';
        if (imageToolMode === 'convert') {
             mimeType = `image/${targetFormat}`;
        } else if (uploadedFile.type) {
             mimeType = uploadedFile.type;
        }

        let quality = 0.92;
        if (imageToolMode === 'compress') {
             quality = compressionQuality / 100;
        }

        const dataUrl = canvas.toDataURL(mimeType, quality);
        setProcessedImageUrl(dataUrl);
        setIsProcessing(false);
    };
  };

  const startCamera = async () => {
      setIsCameraActive(true);
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.play();
          }
      } catch (e) {
          console.error("Camera Error", e);
          setIsCameraActive(false);
          alert("Could not access camera.");
      }
  };

  const captureCamera = () => {
      if (videoRef.current) {
          const canvas = document.createElement('canvas');
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
             if (scanFilter === 'grayscale') ctx.filter = 'grayscale(100%)';
             if (scanFilter === 'bw') ctx.filter = 'grayscale(100%) contrast(200%)';
             if (scanFilter === 'high-contrast') ctx.filter = 'contrast(200%)';
             
             ctx.drawImage(videoRef.current, 0, 0);
             setScannerImage(canvas.toDataURL('image/jpeg'));
             stopCamera();
          }
      }
  };

  const stopCamera = () => {
      if (videoRef.current && videoRef.current.srcObject) {
          (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
      setIsCameraActive(false);
  };

  const downloadScannerPdf = async () => {
      if (!scannerImage) return;
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.addImage(scannerImage, 'JPEG', 10, 10, 190, 0);
      doc.save('scanned_doc.pdf');
  };

  const downloadIdCard = async () => {
      if (!idCardRef.current) return;
      setIsProcessing(true);
      setProcessingMsg("Generating ID Card...");
      
      try {
          const canvas = await window.html2canvas(idCardRef.current, { useCORS: true, scale: 2 });
          const imgData = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = imgData;
          link.download = `ID_${idDetails.idNo}.png`;
          link.click();
      } catch (e) {
          console.error(e);
      } finally {
          setIsProcessing(false);
      }
  };
  
  const downloadResume = async () => {
      if (!resumeRef.current) return;
      setIsProcessing(true);
      setProcessingMsg("Generating Resume PDF...");
      try {
          const canvas = await window.html2canvas(resumeRef.current, { scale: 2 });
          const imgData = canvas.toDataURL('image/png');
          const { jsPDF } = window.jspdf;
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          pdf.save(`${resumeData.fullName.replace(/\s+/g, '_')}_Resume.pdf`);
      } catch (e) {
          console.error(e);
          alert("Failed to generate PDF");
      } finally {
          setIsProcessing(false);
      }
  };

  const generateQR = () => {
      if(!qrText) return;
      setIsProcessing(true);
      setProcessingMsg("Generating Code...");
      setTimeout(() => {
          setGeneratedQr(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrText)}&color=${qrColor.replace('#', '')}&bgcolor=${qrBg.replace('#', '')}&margin=10`);
          setIsProcessing(false);
      }, 800);
  };

  const handleGenerateAILogo = async () => {
      if (!logoPrompt) return;
      setIsProcessing(true);
      setProcessingMsg("Designing unique logo options...");
      setGeneratedLogos([]);

      // Generate 2 variations for better user options
      const promises = [1, 2].map(i => generateAILogo(`${logoPrompt}. Style: ${logoStyle}. Variation ${i}. Make it iconic and distinct.`));
      const results = await Promise.all(promises);
      
      setGeneratedLogos(results.filter(url => url !== null) as string[]);
      setIsProcessing(false);
  };

  // --- Signature Logic ---
  const getCoords = (e: any) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const clientX = e.nativeEvent.touches ? e.nativeEvent.touches[0].clientX : e.nativeEvent.clientX;
      const clientY = e.nativeEvent.touches ? e.nativeEvent.touches[0].clientY : e.nativeEvent.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e: any) => {
      e.preventDefault();
      setIsDrawing(true);
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
          const {x, y} = getCoords(e);
          ctx.beginPath();
          ctx.moveTo(x, y);
      }
  };

  const draw = (e: any) => {
      e.preventDefault();
      if (!isDrawing) return;
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
          const {x, y} = getCoords(e);
          ctx.lineTo(x, y);
          ctx.stroke();
      }
  };

  const stopDrawing = () => {
      setIsDrawing(false);
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) ctx.closePath();
  };

  const clearSignature = () => {
      const canvas = canvasRef.current;
      if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      setSignatureImg(null);
      setExtractedText(null);
  };

  const saveSignature = () => {
      const canvas = canvasRef.current;
      if (canvas) {
          const dataUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = 'signature.png';
          link.click();
      }
  };

  const analyzeSignature = async () => {
      if (!canvasRef.current) return;
      setIsProcessing(true);
      setProcessingMsg("Analyzing Text...");
      setExtractedText(null);
      
      try {
          const base64 = canvasRef.current.toDataURL('image/jpeg').split(',')[1];
          const text = await extractDocumentDetails(base64, "Transcribe the handwritten text or signature in this image precisely.");
          setExtractedText(text);
      } catch (e) {
          console.error(e);
          setExtractedText("Failed to analyze.");
      } finally {
          setIsProcessing(false);
      }
  };

  useEffect(() => {
    if (activeTool?.id === '6' && !signatureImg && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if(!ctx) return;
        
        const dpr = window.devicePixelRatio || 1;
        if (canvas.width !== canvas.offsetWidth * dpr) {
             const rect = canvas.getBoundingClientRect();
             canvas.width = rect.width * dpr;
             canvas.height = rect.height * dpr;
             ctx.scale(dpr, dpr);
        }

        ctx.lineCap = penLineCap;
        ctx.lineJoin = 'round';
        ctx.lineWidth = penWidth;
        ctx.strokeStyle = penColor;
        
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseleave', stopDrawing);
        
        canvas.addEventListener('touchstart', startDrawing, { passive: false });
        canvas.addEventListener('touchmove', draw, { passive: false });
        canvas.addEventListener('touchend', stopDrawing);

        return () => {
            canvas.removeEventListener('mousedown', startDrawing);
            canvas.removeEventListener('mousemove', draw);
            canvas.removeEventListener('mouseup', stopDrawing);
            canvas.removeEventListener('mouseleave', stopDrawing);
            
            canvas.removeEventListener('touchstart', startDrawing);
            canvas.removeEventListener('touchmove', draw);
            canvas.removeEventListener('touchend', stopDrawing);
        };
    }
  }, [activeTool, penColor, penWidth, penLineCap]);

  return (
    <div className="pb-24 animate-fade-in bg-gray-50 dark:bg-deep min-h-screen">
       {/* Tool Active Header */}
       {activeTool ? (
           <div className="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-deep border-b border-gray-100 dark:border-white/10 p-4 flex items-center shadow-md animate-slide-up">
               <button onClick={() => handleToolClick(null)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 dark:text-white mr-2">
                   <ArrowLeft size={24} />
               </button>
               <div>
                   <h2 className="text-lg font-bold dark:text-white flex items-center gap-2">
                       <activeTool.icon size={20} className={activeTool.color} /> {activeTool.name}
                   </h2>
               </div>
           </div>
       ) : (
           <div className="bg-white dark:bg-deep p-6 pb-4 border-b border-gray-100 dark:border-white/10 sticky top-0 z-30">
               <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-royal to-electric">Tools Hub</h2>
               <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                   {['All', 'PDF', 'Image', 'Maker', 'Utils'].map(cat => (
                       <button 
                         key={cat} 
                         onClick={() => setActiveCategory(cat)}
                         className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-royal text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400'}`}
                       >
                           {cat}
                       </button>
                   ))}
               </div>
               <div className="relative mt-2">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search tools..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-white/5 rounded-xl pl-10 pr-4 py-2 text-sm outline-none dark:text-white"
                    />
               </div>
           </div>
       )}

       <div className={`p-4 ${activeTool ? 'pt-20' : ''}`}>
           {!activeTool ? (
               <div className="grid grid-cols-2 gap-4">
                   {filteredTools.map(tool => (
                       <button 
                         key={tool.id} 
                         onClick={() => handleToolClick(tool)}
                         className="bg-white dark:bg-deep-light p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex flex-col items-center text-center space-y-3 hover:shadow-lg transition-all active:scale-[0.98]"
                       >
                           <div className={`p-3 rounded-xl ${tool.bg} ${tool.color}`}>
                               <tool.icon size={28} />
                           </div>
                           <div>
                               <h3 className="font-bold text-sm text-gray-800 dark:text-white">{tool.name}</h3>
                               <p className="text-[10px] text-gray-400 leading-tight mt-1">{tool.desc}</p>
                           </div>
                       </button>
                   ))}
               </div>
           ) : (
               <div className="max-w-2xl mx-auto space-y-6">
                   {/* PDF MERGE */}
                   {activeTool.id === '1' && (
                       <div className="space-y-6 animate-fade-in">
                           <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors relative">
                               <input type="file" multiple accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleMultiplePdfUpload} />
                               <FilePlus size={40} className="mx-auto text-gray-400 mb-2" />
                               <p className="text-sm font-bold text-gray-600 dark:text-gray-300">Tap to Select PDFs</p>
                               <p className="text-xs text-gray-400 mt-1">Select 2 or more files</p>
                           </div>
                           
                           {pdfFiles.length > 0 && (
                               <div className="space-y-2">
                                   {pdfFiles.map((f, i) => (
                                       <div key={i} className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-100 dark:border-white/5">
                                           <span className="text-xs font-medium dark:text-white truncate max-w-[200px]">{f.name}</span>
                                           <button onClick={() => setPdfFiles(pdfFiles.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-500"><Trash2 size={16} /></button>
                                       </div>
                                   ))}
                               </div>
                           )}

                           <button 
                                onClick={handleRealPdfMerge}
                                disabled={pdfFiles.length < 2 || isProcessing}
                                className="w-full bg-royal text-white py-4 rounded-xl font-bold shadow-lg shadow-royal/30 disabled:opacity-50 flex items-center justify-center gap-2"
                           >
                                {isProcessing ? <><RefreshCw className="animate-spin" /> Merging...</> : "Merge PDFs"}
                           </button>

                           {mergedPdfUrl && (
                               <a href={mergedPdfUrl} download="merged_nivaranx.pdf" className="block w-full bg-green-500 text-white py-4 rounded-xl font-bold shadow-lg text-center">
                                   Download Merged PDF
                               </a>
                           )}
                       </div>
                   )}

                   {/* SCANNER */}
                   {activeTool.id === '5' && (
                       <div className="space-y-6 animate-fade-in">
                           {!isCameraActive && !scannerImage && (
                               <button onClick={startCamera} className="w-full h-64 bg-gray-100 dark:bg-slate-800 rounded-2xl flex flex-col items-center justify-center gap-4 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                                   <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                                       <Camera size={32} className="text-white" />
                                   </div>
                                   <p className="font-bold text-gray-500 dark:text-gray-400">Tap to Start Camera</p>
                               </button>
                           )}

                           {isCameraActive && (
                               <div className="relative rounded-2xl overflow-hidden bg-black shadow-xl">
                                   <video ref={videoRef} className="w-full h-auto" autoPlay playsInline muted></video>
                                   <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6">
                                       <select 
                                         value={scanFilter} 
                                         onChange={(e) => setScanFilter(e.target.value as any)}
                                         className="bg-black/60 text-white text-xs rounded-full px-4 py-2 backdrop-blur-md border border-white/20 outline-none"
                                       >
                                           <option value="none">Original</option>
                                           <option value="grayscale">Grayscale</option>
                                           <option value="bw">B & W</option>
                                           <option value="high-contrast">High Contrast</option>
                                       </select>
                                       <button onClick={captureCamera} className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-white/20 backdrop-blur-sm active:scale-90 transition-transform"></button>
                                       <button onClick={stopCamera} className="bg-red-500/80 text-white p-3 rounded-full backdrop-blur-md"><X size={20} /></button>
                                   </div>
                               </div>
                           )}

                           {scannerImage && (
                               <div className="space-y-4">
                                   <img src={scannerImage} alt="Scanned" className="w-full rounded-2xl shadow-lg border border-gray-200 dark:border-white/10" />
                                   <div className="flex gap-4">
                                       <button onClick={() => setScannerImage(null)} className="flex-1 py-3 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-white rounded-xl font-bold">Retake</button>
                                       <button onClick={downloadScannerPdf} className="flex-1 py-3 bg-royal text-white rounded-xl font-bold shadow-lg shadow-royal/30">Save as PDF</button>
                                   </div>
                               </div>
                           )}
                       </div>
                   )}

                   {/* AI LOGO MAKER */}
                   {activeTool.id === '10' && (
                       <div className="space-y-6 animate-fade-in">
                           <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 space-y-4">
                               <div>
                                   <label className="text-xs font-bold text-gray-500 uppercase">Brand Name & Description</label>
                                   <textarea 
                                       value={logoPrompt}
                                       onChange={(e) => setLogoPrompt(e.target.value)}
                                       className="w-full mt-2 p-3 bg-gray-50 dark:bg-slate-900 rounded-xl outline-none dark:text-white border border-transparent focus:border-royal transition-all resize-none h-24 text-sm"
                                       placeholder="e.g. 'NivaranX'. A futuristic shield logo with blue and electric cyan colors."
                                   />
                               </div>
                               
                               <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Logo Style</label>
                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                        {['Modern', 'Minimalist', '3D', 'Vintage', 'Abstract', 'Badge'].map(style => (
                                            <button 
                                               key={style}
                                               onClick={() => setLogoStyle(style)}
                                               className={`py-2 px-3 rounded-lg text-[10px] sm:text-xs font-bold border transition-all ${logoStyle === style ? 'bg-royal text-white border-royal' : 'bg-gray-50 dark:bg-slate-900 text-gray-500 border-transparent'}`}
                                            >
                                                {style}
                                            </button>
                                        ))}
                                    </div>
                               </div>

                               <button 
                                   onClick={handleGenerateAILogo}
                                   disabled={isProcessing || !logoPrompt}
                                   className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-pink-500/30 active:scale-95 transition-transform flex items-center justify-center gap-2"
                               >
                                   {isProcessing ? <><RefreshCw className="animate-spin" /> Designing...</> : <><Sparkles /> Generate Logos</>}
                               </button>
                           </div>

                           {generatedLogos.length > 0 && (
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                   {generatedLogos.map((url, idx) => (
                                       <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex flex-col items-center">
                                           <div className="w-full aspect-square bg-gray-50 dark:bg-black/20 rounded-xl mb-4 flex items-center justify-center p-4">
                                               <img src={url} alt={`Logo ${idx}`} className="max-w-full max-h-full object-contain drop-shadow-lg" />
                                           </div>
                                           <a 
                                               href={url} 
                                               download={`Logo_Option_${idx+1}.png`}
                                               className="w-full bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-white py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                                           >
                                               <Download size={14} /> Download Option {idx+1}
                                           </a>
                                       </div>
                                   ))}
                               </div>
                           )}
                       </div>
                   )}

                   {/* RESUME MAKER */}
                   {activeTool.id === '9' && (
                       <div className="space-y-6 animate-fade-in">
                            {/* Templates */}
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                {RESUME_TEMPLATES.map(t => (
                                    <button 
                                        key={t.id} 
                                        onClick={() => setActiveResumeTemplate(t)}
                                        className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition-colors ${activeResumeTemplate.id === t.id ? 'bg-royal text-white border-royal' : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10'}`}
                                    >
                                        {t.name}
                                    </button>
                                ))}
                            </div>

                            {/* Inputs */}
                            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-white/5 space-y-4">
                                <h3 className="font-bold text-sm dark:text-white flex items-center gap-2"><Edit2 size={16} /> Edit Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <input value={resumeData.fullName} onChange={e => setResumeData({...resumeData, fullName: e.target.value})} placeholder="Full Name" className="p-3 bg-gray-50 dark:bg-slate-900 rounded-xl text-xs dark:text-white outline-none" />
                                    <input value={resumeData.phone} onChange={e => setResumeData({...resumeData, phone: e.target.value})} placeholder="Phone" className="p-3 bg-gray-50 dark:bg-slate-900 rounded-xl text-xs dark:text-white outline-none" />
                                </div>
                                <input value={resumeData.email} onChange={e => setResumeData({...resumeData, email: e.target.value})} placeholder="Email" className="w-full p-3 bg-gray-50 dark:bg-slate-900 rounded-xl text-xs dark:text-white outline-none" />
                                <textarea value={resumeData.summary} onChange={e => setResumeData({...resumeData, summary: e.target.value})} placeholder="Summary" className="w-full p-3 bg-gray-50 dark:bg-slate-900 rounded-xl text-xs dark:text-white outline-none h-20 resize-none" />
                                <textarea value={resumeData.experience} onChange={e => setResumeData({...resumeData, experience: e.target.value})} placeholder="Experience" className="w-full p-3 bg-gray-50 dark:bg-slate-900 rounded-xl text-xs dark:text-white outline-none h-24 resize-none" />
                            </div>

                            {/* Live Preview */}
                            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-200 dark:bg-black p-4">
                                <div ref={resumeRef} className={`w-full aspect-[1/1.414] shadow-2xl p-8 text-xs ${activeResumeTemplate.class} origin-top transform scale-[1] sm:scale-100`}>
                                     <h1 className="text-2xl font-bold uppercase tracking-wider mb-1">{resumeData.fullName}</h1>
                                     <p className="opacity-70 mb-4 flex gap-4 text-[10px]">
                                         <span>{resumeData.email}</span>
                                         <span>{resumeData.phone}</span>
                                         <span>{resumeData.city}</span>
                                     </p>
                                     <hr className="border-black/10 mb-4" />
                                     
                                     <div className="mb-4">
                                         <h4 className="font-bold uppercase tracking-widest text-[10px] opacity-50 mb-1">Professional Summary</h4>
                                         <p className="leading-relaxed opacity-80">{resumeData.summary}</p>
                                     </div>
                                     <div className="mb-4">
                                         <h4 className="font-bold uppercase tracking-widest text-[10px] opacity-50 mb-1">Experience</h4>
                                         <p className="leading-relaxed opacity-80 whitespace-pre-wrap">{resumeData.experience}</p>
                                     </div>
                                      <div className="mb-4">
                                         <h4 className="font-bold uppercase tracking-widest text-[10px] opacity-50 mb-1">Education</h4>
                                         <p className="leading-relaxed opacity-80 whitespace-pre-wrap">{resumeData.education}</p>
                                     </div>
                                </div>
                            </div>

                            <button onClick={downloadResume} className="w-full bg-royal text-white py-4 rounded-xl font-bold shadow-lg shadow-royal/30 flex items-center justify-center gap-2">
                                {isProcessing ? <Loader2 className="animate-spin" /> : <><Download size={20} /> Download Resume PDF</>}
                            </button>
                       </div>
                   )}

                   {/* SIGNATURE */}
                   {activeTool.id === '6' && (
                       <div className="space-y-6 animate-fade-in">
                           <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 relative group">
                               <canvas 
                                    ref={canvasRef} 
                                    className="w-full h-64 bg-white rounded-xl touch-none cursor-crosshair border border-dashed border-gray-200"
                                    style={{ background: 'white' }} 
                               />
                               <div className="absolute top-4 right-4 flex gap-2">
                                   <button onClick={clearSignature} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600"><Eraser size={20} /></button>
                               </div>
                           </div>
                           
                           <div className="flex flex-col gap-4 px-2">
                               <div className="flex items-center justify-between">
                                   <div className="flex gap-2">
                                       {['#000000', '#0057FF', '#FF0000', '#008000'].map(c => (
                                           <button 
                                            key={c} 
                                            onClick={() => setPenColor(c)}
                                            className={`w-8 h-8 rounded-full border-2 ${penColor === c ? 'border-gray-400 scale-110' : 'border-transparent'}`}
                                            style={{ background: c }}
                                           />
                                       ))}
                                   </div>
                                   <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
                                       <button onClick={() => setPenLineCap('round')} className={`px-3 py-1 text-xs font-bold rounded ${penLineCap === 'round' ? 'bg-white shadow text-black' : 'text-gray-500'}`}>Round</button>
                                       <button onClick={() => setPenLineCap('square')} className={`px-3 py-1 text-xs font-bold rounded ${penLineCap === 'square' ? 'bg-white shadow text-black' : 'text-gray-500'}`}>Square</button>
                                   </div>
                               </div>
                               <input type="range" min="1" max="10" value={penWidth} onChange={e => setPenWidth(Number(e.target.value))} className="w-full accent-royal" />
                           </div>
                           
                           <div className="grid grid-cols-2 gap-4">
                               <button 
                                    onClick={analyzeSignature} 
                                    disabled={isProcessing}
                                    className="w-full bg-electric/10 text-electric border border-electric/20 py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                               >
                                   {isProcessing ? <Loader2 className="animate-spin" /> : <><TextCursor size={20} /> Extract Text (AI)</>}
                               </button>
                               <button onClick={saveSignature} className="w-full bg-royal text-white py-4 rounded-xl font-bold shadow-lg shadow-royal/30">Download Signature</button>
                           </div>

                           {extractedText && (
                               <div className="p-4 bg-gray-100 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-white/10">
                                   <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">AI Analysis Result</h4>
                                   <p className="text-sm dark:text-white whitespace-pre-wrap">{extractedText}</p>
                               </div>
                           )}
                       </div>
                   )}

                   {/* QR GENERATOR */}
                   {activeTool.id === '7' && (
                       <div className="space-y-6 animate-fade-in">
                           <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 space-y-4">
                               <input 
                                value={qrText}
                                onChange={e => setQrText(e.target.value)}
                                placeholder="Enter Text or URL"
                                className="w-full p-4 bg-gray-50 dark:bg-slate-900 rounded-xl outline-none dark:text-white"
                               />
                               <div className="flex gap-4">
                                   <div className="flex-1">
                                       <label className="text-xs font-bold text-gray-500 uppercase">Color</label>
                                       <input type="color" value={qrColor} onChange={e => setQrColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer mt-1" />
                                   </div>
                                   <div className="flex-1">
                                       <label className="text-xs font-bold text-gray-500 uppercase">Background</label>
                                       <input type="color" value={qrBg} onChange={e => setQrBg(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer mt-1" />
                                   </div>
                               </div>
                               <button onClick={generateQR} className="w-full bg-black dark:bg-white dark:text-black text-white py-4 rounded-xl font-bold">Generate QR</button>
                           </div>
                           
                           {generatedQr && (
                               <div className="flex flex-col items-center gap-4 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                                   <img src={generatedQr} alt="QR" className="w-48 h-48 mix-blend-multiply" />
                                   <a href={generatedQr} download="qr_code.png" className="text-blue-500 font-bold text-sm hover:underline">Download PNG</a>
                               </div>
                           )}
                       </div>
                   )}
                   
                   {/* ID CARD MAKER */}
                   {activeTool.id === '8' && (
                       <div className="space-y-6 animate-fade-in">
                           <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                               {ID_TEMPLATES.map(t => (
                                   <button 
                                    key={t.id} 
                                    onClick={() => setActiveIdTemplate(t)}
                                    className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-colors ${activeIdTemplate.id === t.id ? 'bg-royal text-white' : 'bg-gray-200 dark:bg-white/10 dark:text-white'}`}
                                   >
                                       {t.name}
                                   </button>
                               ))}
                           </div>

                           <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-white/5 space-y-4">
                               <div className="flex gap-4">
                                   <div className="w-20 h-20 bg-gray-100 dark:bg-slate-900 rounded-xl flex items-center justify-center relative overflow-hidden group cursor-pointer border border-dashed border-gray-300 dark:border-gray-600">
                                       {idPhoto ? <img src={idPhoto} className="w-full h-full object-cover" /> : <Camera className="text-gray-400" />}
                                       <input type="file" className="absolute inset-0 opacity-0" onChange={(e) => handleSingleFileUpload(e, 'image')} />
                                   </div>
                                   <div className="flex-1 space-y-2">
                                       <input value={idDetails.name} onChange={e => setIdDetails({...idDetails, name: e.target.value.toUpperCase()})} placeholder="FULL NAME" className="w-full p-2 bg-gray-50 dark:bg-slate-900 rounded-lg text-xs font-bold dark:text-white" />
                                       <input value={idDetails.role} onChange={e => setIdDetails({...idDetails, role: e.target.value.toUpperCase()})} placeholder="ROLE" className="w-full p-2 bg-gray-50 dark:bg-slate-900 rounded-lg text-xs font-bold dark:text-white" />
                                   </div>
                               </div>
                               <div className="grid grid-cols-2 gap-4">
                                    <input value={idDetails.idNo} onChange={e => setIdDetails({...idDetails, idNo: e.target.value.toUpperCase()})} placeholder="ID NO" className="w-full p-2 bg-gray-50 dark:bg-slate-900 rounded-lg text-xs font-bold dark:text-white" />
                                    <input value={idDetails.address} onChange={e => setIdDetails({...idDetails, address: e.target.value})} placeholder="ADDRESS" className="w-full p-2 bg-gray-50 dark:bg-slate-900 rounded-lg text-xs font-bold dark:text-white" />
                               </div>
                           </div>

                           {/* Preview Card */}
                           <div className="flex justify-center">
                               <div ref={idCardRef} className={`w-[320px] h-[200px] rounded-2xl shadow-2xl overflow-hidden relative bg-gradient-to-br ${activeIdTemplate.gradient} text-white`}>
                                   {/* Design Elements */}
                                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                   <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-10 -mb-10"></div>
                                   
                                   <div className="p-5 h-full flex items-center gap-4 relative z-10">
                                       <div className="w-24 h-28 bg-white/20 backdrop-blur-sm rounded-xl overflow-hidden border border-white/30 shadow-sm shrink-0">
                                           {uploadedFile && filePreview ? <img src={filePreview} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><UserSquare size={30} className="text-white/50" /></div>}
                                       </div>
                                       <div className="flex-1 min-w-0">
                                           <h3 className="font-black text-lg leading-tight truncate">{idDetails.name}</h3>
                                           <p className="text-xs font-medium opacity-80 mb-2">{idDetails.role}</p>
                                           <div className="space-y-1">
                                               <p className="text-[9px] opacity-60 uppercase tracking-widest">ID Number</p>
                                               <p className="text-sm font-mono font-bold">{idDetails.idNo}</p>
                                               <p className="text-[9px] opacity-60 uppercase tracking-widest mt-1">Address</p>
                                               <p className="text-[10px] truncate leading-tight">{idDetails.address}</p>
                                           </div>
                                       </div>
                                   </div>
                               </div>
                           </div>

                           <button onClick={downloadIdCard} className="w-full bg-teal-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-teal-500/30">Download ID Card</button>
                       </div>
                   )}

                   {/* IMAGE TOOLS */}
                   {activeTool.id === '4' && (
                       <div className="space-y-6 animate-fade-in">
                           <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 text-center">
                               {!filePreview ? (
                                   <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 relative cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5">
                                       <input type="file" accept="image/*" onChange={(e) => handleSingleFileUpload(e, 'image')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                       <Image size={40} className="mx-auto text-gray-400 mb-2" />
                                       <p className="font-bold text-gray-500">Upload Image</p>
                                   </div>
                               ) : (
                                   <div className="space-y-4">
                                       <img src={filePreview} alt="Preview" className="h-48 mx-auto object-contain rounded-lg border border-gray-200" />
                                       <button onClick={() => setFilePreview(null)} className="text-red-400 text-xs font-bold hover:underline">Remove</button>
                                   </div>
                               )}
                           </div>
                           
                           {filePreview && (
                               <div className="grid grid-cols-3 gap-3">
                                   <button onClick={() => setImageToolMode('resize')} className={`p-3 rounded-xl border font-bold text-xs ${imageToolMode === 'resize' ? 'bg-royal text-white border-royal' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300'}`}>Resize</button>
                                   <button onClick={() => setImageToolMode('compress')} className={`p-3 rounded-xl border font-bold text-xs ${imageToolMode === 'compress' ? 'bg-royal text-white border-royal' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300'}`}>Compress</button>
                                   <button onClick={() => setImageToolMode('convert')} className={`p-3 rounded-xl border font-bold text-xs ${imageToolMode === 'convert' ? 'bg-royal text-white border-royal' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300'}`}>Convert</button>
                               </div>
                           )}

                           {imageToolMode === 'resize' && filePreview && (
                               <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-white/5 space-y-4">
                                   <div className="flex gap-4">
                                       <div><label className="text-xs font-bold text-gray-500">Width</label><input type="number" value={resizeDim.width} onChange={e => handleResizeChange('width', Number(e.target.value))} className="w-full p-2 bg-gray-50 dark:bg-slate-900 rounded-lg dark:text-white outline-none" /></div>
                                       <div><label className="text-xs font-bold text-gray-500">Height</label><input type="number" value={resizeDim.height} onChange={e => handleResizeChange('height', Number(e.target.value))} className="w-full p-2 bg-gray-50 dark:bg-slate-900 rounded-lg dark:text-white outline-none" /></div>
                                   </div>
                                   <div className="flex items-center gap-2">
                                       <input type="checkbox" checked={resizeDim.maintainAspect} onChange={e => setResizeDim({...resizeDim, maintainAspect: e.target.checked})} className="accent-royal" />
                                       <span className="text-xs dark:text-gray-300">Maintain Aspect Ratio</span>
                                   </div>
                               </div>
                           )}

                           {imageToolMode === 'compress' && filePreview && (
                               <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-white/5 space-y-2">
                                   <div className="flex justify-between"><span className="text-xs font-bold text-gray-500">Quality</span><span className="text-xs font-bold text-royal">{compressionQuality}%</span></div>
                                   <input type="range" min="10" max="100" value={compressionQuality} onChange={e => setCompressionQuality(Number(e.target.value))} className="w-full accent-royal" />
                               </div>
                           )}

                           {imageToolMode === 'convert' && filePreview && (
                               <div className="flex gap-2">
                                   {['jpg', 'png', 'webp'].map(fmt => (
                                       <button key={fmt} onClick={() => setTargetFormat(fmt as any)} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase border ${targetFormat === fmt ? 'bg-royal text-white border-royal' : 'bg-white dark:bg-slate-800 dark:text-white'}`}>{fmt}</button>
                                   ))}
                               </div>
                           )}

                           {filePreview && imageToolMode !== 'menu' && (
                               <button onClick={handleImageProcess} className="w-full bg-royal text-white py-4 rounded-xl font-bold shadow-lg shadow-royal/30">Process Image</button>
                           )}

                           {processedImageUrl && (
                               <div className="flex flex-col items-center gap-4 bg-green-50 dark:bg-green-900/10 p-6 rounded-2xl border border-green-200 dark:border-green-900/30">
                                   <CheckCircle className="text-green-500" size={32} />
                                   <p className="font-bold text-green-700 dark:text-green-400">Processing Complete!</p>
                                   <a href={processedImageUrl} download={`processed_image.${targetFormat === 'jpg' ? 'jpeg' : targetFormat}`} className="px-6 py-2 bg-green-500 text-white rounded-lg font-bold text-sm">Download</a>
                               </div>
                           )}
                       </div>
                   )}

               </div>
           )}
       </div>
    </div>
  );
};

export default ToolsHub;