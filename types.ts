

export type ViewState = 
  | 'dashboard' 
  | 'explore' 
  | 'insight' 
  | 'updates' 
  | 'nexafeed' 
  | 'menu' 
  | 'docgenx' 
  | 'process_flow' 
  | 'tools'
  | 'profile'
  | 'settings'
  | 'help'
  | 'legal';

export type ThemeMode = 'light' | 'dark' | 'amoled' | 'blue-cyan' | 'minimal' | 'indian' | 'neon' | 'sunset' | 'eco' | 'gold' | 'candy';
export type FontMode = 'inter' | 'poppins' | 'roboto' | 'opensans' | 'lato';
export type Language = 'en' | 'hi' | 'bh';

export interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: any; // Lucide icon component
}

export interface ServiceItem {
  name: string;
  info: string;
  documents: string[];
  charges: string;
}

export interface ServiceCategory {
  id: string;
  title: string;
  icon: any;
  gradient: string;
  services: ServiceItem[];
}

export interface Post {
  id: string;
  user: string;
  avatar: string;
  title: string;
  thumbnail?: string;
  likes: number;
  comments: number;
  tags: string[];
  type: 'video' | 'article';
}

export interface DocumentItem {
  id: string;
  name: string;
  date: string;
  size: string;
  type: 'pdf' | 'img' | 'doc';
  isEncrypted: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface FounderDetails {
  name: string;
  role: string;
  message: string;
  journey: string;
}

export interface Tool {
  id: string;
  name: string;
  icon: any;
  color: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  city: string;
  state?: string;
  pincode?: string;
  id: string;
  passcode?: string;
  avatar: string;
}