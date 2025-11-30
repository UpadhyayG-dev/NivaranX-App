
import { 
  Flag, Map, Percent, Landmark, Shield, Zap, File, Activity, 
  GraduationCap, Briefcase, Scale, Palette, Monitor, Rocket, Cpu, 
  Sprout, Truck, Home 
} from 'lucide-react';
import { ServiceCategory, ServiceItem } from '../types';

// Helper to generate realistic data based on service name context
const getDetails = (name: string): { info: string, docs: string[], charges: string } => {
  const n = name.toLowerCase();
  
  let info = "Official application and processing service.";
  let docs = ["Aadhaar Card", "Mobile Number"];
  let charges = "₹50.00";

  if (n.includes("pan")) {
    info = "Apply for New PAN, Correction, or e-PAN reprint instantly.";
    docs = ["Aadhaar Card", "Passport Photo", "Signature"];
    charges = "₹107.00";
  } else if (n.includes("passport")) {
    info = "Complete Passport assistance for New, Re-issue, or Tatkal.";
    docs = ["Aadhaar Card", "Pan Card", "10th Marksheet", "Birth Certificate"];
    charges = "₹1500.00 (Govt Fee)";
  } else if (n.includes("certificate")) {
    info = "State government authorized certificate issuance.";
    docs = ["Aadhaar Card", "Ration Card", "Self Declaration", "Photo"];
    charges = "₹30.00";
  } else if (n.includes("itr") || n.includes("gst")) {
    info = "Professional CA assisted filing.";
    docs = ["PAN Card", "Bank Statement", "Form 16"];
    charges = "₹499.00";
  } else if (n.includes("ticket") || n.includes("booking")) {
    info = "Instant booking with confirmed status check.";
    docs = ["ID Proof (Aadhaar/PAN)"];
    charges = "As per Ticket Fare";
  } else if (n.includes("job") || n.includes("resume")) {
    info = "Professional employment services.";
    docs = ["Education Certificates", "Photo", "ID Proof"];
    charges = "Free / ₹99.00";
  } else if (n.includes("design") || n.includes("logo")) {
    info = "AI-powered and expert design services.";
    docs = ["Brand Name", "Preference Details"];
    charges = "₹199.00";
  } else if (n.includes("website") || n.includes("app")) {
    info = "Tech development services.";
    docs = ["Requirements Doc"];
    charges = "Custom Quote";
  } else if (n.includes("recharge") || n.includes("bill")) {
    info = "Secure bill payment and recharges.";
    docs = ["Consumer Number"];
    charges = "No Extra Fee";
  }

  return { info, docs, charges };
};

// Helper to build the ServiceItem
const createService = (name: string): ServiceItem => {
  const { info, docs, charges } = getDetails(name);
  return { name, info, documents: docs, charges };
};

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'national',
    title: 'National Services',
    icon: Flag,
    gradient: 'from-blue-600 to-indigo-700',
    services: [
      "PAN Card (New/Correction/Reprint/e-PAN)",
      "Aadhaar Services (Update/Download/PVC/Center Locator)",
      "Passport Services (New/Renewal/Tatkal/Status)",
      "Voter ID (New/Correction/Download/Track)",
      "Ration Card (New/Update/Member Add/Download)",
      "Driving Licence (New/Renewal/Duplicate/International Permit)",
      "DigiLocker Services",
      "UAN / PF Services",
      "ESIC Services",
      "NPS (National Pension System)",
      "NPCI Linking",
      "National Scholarship Portal",
      "PM Schemes Apply",
      "PM-Kisan Status",
      "Ayushman Bharat Card",
      "FASTag KYC"
    ].map(createService)
  },
  {
    id: 'state',
    title: 'State Services',
    icon: Map,
    gradient: 'from-green-600 to-emerald-700',
    services: [
      "State Caste Certificate",
      "Income Certificate",
      "Residential Certificate",
      "Birth Certificate",
      "Death Certificate",
      "Character Certificate",
      "Land Records (Bhulekh / Jamabandi / Khasra-Khatauni)",
      "Local Ration Card Services",
      "State Scholarship",
      "Labour Card",
      "Disability Certificate",
      "State Govt Scheme Applications",
      "Vehicle RC Search",
      "Local Municipal Services"
    ].map(createService)
  },
  {
    id: 'tax',
    title: 'Tax & Finance',
    icon: Percent,
    gradient: 'from-orange-500 to-red-600',
    services: [
      "ITR Filing",
      "GST Registration / Return Filing",
      "PAN–Aadhaar Linking",
      "Form 16 Upload",
      "TDS/TCS Services",
      "AIS/TIS Download",
      "Bank Statement Analyzer",
      "Digital Signature (DSC) Apply",
      "UPI ID Setup",
      "Loan Eligibility Check"
    ].map(createService)
  },
  {
    id: 'banking',
    title: 'Banking Services',
    icon: Landmark,
    gradient: 'from-purple-600 to-violet-700',
    services: [
      "Bank Account Opening (Video KYC)",
      "Passbook Download",
      "Mini Statement",
      "ATM Card Apply / Block",
      "NetBanking Setup",
      "KYC Update",
      "Balance Check",
      "Bank Transfer Services",
      "PMJDY Services",
      "Rupay / Visa Card Services"
    ].map(createService)
  },
  {
    id: 'insurance',
    title: 'Insurance',
    icon: Shield,
    gradient: 'from-teal-500 to-cyan-600',
    services: [
      "LIC Premium Payment",
      "LIC Policy Status",
      "Health Insurance Apply",
      "Motor Insurance (New/Renewal)",
      "PMJJY / PMSBY Registration",
      "Ayushman Card Services",
      "Travel Insurance",
      "Term Insurance Plans"
    ].map(createService)
  },
  {
    id: 'utility',
    title: 'Utility Services',
    icon: Zap,
    gradient: 'from-yellow-500 to-orange-500',
    services: [
      "Electricity Bill Pay",
      "Gas Booking (Indane/BPCL/HP)",
      "Water Bill",
      "Sewerage/Property Tax",
      "LPG Subsidy Status",
      "Recharge (Mobile/DTH)",
      "FASTag Recharge",
      "Broadband Bill"
    ].map(createService)
  },
  {
    id: 'booking',
    title: 'Booking Services',
    icon: File,
    gradient: 'from-pink-500 to-rose-600',
    services: [
      "Railway Ticket Booking",
      "Flight Booking",
      "Bus Booking",
      "Hotel Booking",
      "Tatkal Availability Checker",
      "Online Events Booking",
      "Passport Appointment",
      "Hospital Appointment"
    ].map(createService)
  },
  {
    id: 'healthcare',
    title: 'Healthcare',
    icon: Activity,
    gradient: 'from-red-500 to-pink-600',
    services: [
      "Ayushman Card",
      "ABHA ID",
      "Cowin Vaccination Certificate",
      "Hospital Finder",
      "Online Doctor Consultation",
      "Lab Test Booking",
      "Blood Bank Finder",
      "Health Insurance Claims"
    ].map(createService)
  },
  {
    id: 'education',
    title: 'Education',
    icon: GraduationCap,
    gradient: 'from-blue-500 to-cyan-500',
    services: [
      "Scholarship Apply",
      "DigiLocker Marksheet Download",
      "NIOS/CBSE/State Board Services",
      "School/College Admission Forms",
      "Online Courses",
      "Competitive Exam Forms",
      "Student ID Card",
      "Exam Results"
    ].map(createService)
  },
  {
    id: 'employment',
    title: 'Employment',
    icon: Briefcase,
    gradient: 'from-gray-700 to-gray-900',
    services: [
      "NCS Job Portal",
      "CSC VLE Registration",
      "e-Shram Card",
      "Labour Card",
      "Employment Exchange Registration",
      "Resume/CV Maker",
      "Job Application Tracker",
      "Gig Worker ID"
    ].map(createService)
  },
  {
    id: 'legal',
    title: 'Legal Services',
    icon: Scale,
    gradient: 'from-slate-600 to-slate-800',
    services: [
      "Court Case Status",
      "FIR Copy Download",
      "Police Verification",
      "Legal Draft Templates",
      "Rent Agreement",
      "Affidavit Creation",
      "Advocate Consultation",
      "Cyber Crime Reporting"
    ].map(createService)
  },
  {
    id: 'design',
    title: 'Design Services',
    icon: Palette,
    gradient: 'from-fuchsia-500 to-purple-600',
    services: [
      "Logo Maker",
      "Poster/Banner Maker",
      "Visiting Card Maker",
      "Social Media Post Maker",
      "Certificate Maker",
      "ID Card Maker",
      "YouTube Thumbnail Maker",
      "Photo Editor"
    ].map(createService)
  },
  {
    id: 'it',
    title: 'IT Services',
    icon: Monitor,
    gradient: 'from-indigo-500 to-blue-600',
    services: [
      "Domain Purchase",
      "Website Builder",
      "Hosting Setup",
      "SSL Setup",
      "Email Hosting",
      "App Development Requests",
      "Software Installation Support",
      "Cloud Storage Setup"
    ].map(createService)
  },
  {
    id: 'startup',
    title: 'Startup Services',
    icon: Rocket,
    gradient: 'from-amber-500 to-orange-600',
    services: [
      "MSME (Udyam) Registration",
      "Trademark Apply",
      "Startup India Registration",
      "Business Plan Maker",
      "GST/IT Compliance Tools",
      "Company Registration Guide",
      "Logo + Branding Kit",
      "Pitch Deck Maker"
    ].map(createService)
  },
  {
    id: 'smart',
    title: 'Smart Services',
    icon: Cpu,
    gradient: 'from-violet-500 to-fuchsia-500',
    services: [
      "OCR Text Extractor",
      "PDF Tools (Merge/Split/Compress)",
      "Image Resize",
      "e-Signature Maker",
      "QR Code Generator",
      "Document Scanner",
      "AI Chat Assistant",
      "Data Converter Tools"
    ].map(createService)
  },
  {
    id: 'agriculture',
    title: 'Agriculture',
    icon: Sprout,
    gradient: 'from-green-500 to-lime-600',
    services: [
      "PM-Kisan Status",
      "Kisan Credit Card",
      "Soil Health Card",
      "Crop Insurance",
      "Fertilizer Subsidy",
      "Tractor Loan Apply",
      "MandI Price Check",
      "Farmer ID Card"
    ].map(createService)
  },
  {
    id: 'transport',
    title: 'Transport',
    icon: Truck,
    gradient: 'from-zinc-600 to-zinc-800',
    services: [
      "DL Services",
      "RC Services",
      "Vehicle Fitness Certificate",
      "Pollution Certificate (PUC)",
      "Vehicle Fine Status",
      "FASTag Services",
      "Vehicle Owner Details",
      "Driving Test Slot Booking"
    ].map(createService)
  },
  {
    id: 'housing',
    title: 'Housing',
    icon: Home,
    gradient: 'from-sky-500 to-blue-600',
    services: [
      "PMAY Registration",
      "Property Tax",
      "Rent Agreement",
      "House Loan Apply",
      "Land Records Check",
      "RERA Services",
      "Water & Sewerage Services",
      "House Map Approval"
    ].map(createService)
  }
];
