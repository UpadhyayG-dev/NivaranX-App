
import { UserProfile } from '../types';

const SESSION_KEY = 'nivaranx_session';
const MPIN_KEY = 'nivaranx_mpin';
const REG_USER_KEY = 'nivaranx_reg_user'; // Simulates a database for the registered user

// OTP Simulation Keys
const OTP_STORAGE_KEY = 'nivaranx_otp_storage';

interface OtpRecord {
    otp: string;
    expiresAt: number;
    attempts: number;
    mobile: string;
}

export const getSession = (): UserProfile | null => {
  const data = localStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
};

export const setSession = (user: UserProfile) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

// --- OTP SERVICE (SIMULATED BACKEND) ---

export const requestOTP = async (mobile: string): Promise<{ status: 'ok' | 'error', requestId?: string, dev_otp?: string, message?: string }> => {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));

    // Basic Validation
    if (!mobile || mobile.length < 10) {
        return { status: 'error', message: 'Invalid mobile number' };
    }

    // Generate Request ID (UUID simulation)
    const requestId = 'req_' + Math.random().toString(36).substr(2, 9);
    
    // Generate Secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Expiry: 5 minutes from now
    const expiresAt = Date.now() + 5 * 60 * 1000;

    // Store in "DB" (LocalStorage)
    const record: OtpRecord = {
        otp,
        expiresAt,
        attempts: 0,
        mobile
    };
    
    // In a real app, this would be a server-side map or Redis
    // We use a simple object in localStorage for persistence across reloads
    const storage = JSON.parse(localStorage.getItem(OTP_STORAGE_KEY) || '{}');
    storage[requestId] = record;
    localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(storage));

    // In PROD, 'dev_otp' would NOT be returned.
    // In DEV/DEMO, we return it for testing/auto-fill.
    return { 
        status: 'ok', 
        requestId, 
        dev_otp: otp, // For Demo Only
        message: 'OTP sent successfully'
    };
};

export const verifyOTP = async (requestId: string, otp: string): Promise<{ status: 'ok' | 'error', message?: string }> => {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));

    const storage = JSON.parse(localStorage.getItem(OTP_STORAGE_KEY) || '{}');
    const record = storage[requestId] as OtpRecord | undefined;

    if (!record) {
        return { status: 'error', message: 'Invalid or expired request' };
    }

    // Check Expiry
    if (Date.now() > record.expiresAt) {
        return { status: 'error', message: 'OTP has expired. Please resend.' };
    }

    // Check Attempts
    if (record.attempts >= 3) {
        return { status: 'error', message: 'Too many incorrect attempts. Request new OTP.' };
    }

    // Check OTP
    if (record.otp === otp) {
        // Success! Remove record to prevent replay
        delete storage[requestId];
        localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(storage));
        return { status: 'ok', message: 'OTP Verified' };
    } else {
        // Increment attempts
        record.attempts += 1;
        storage[requestId] = record;
        localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(storage));
        return { status: 'error', message: `Invalid OTP. ${3 - record.attempts} attempts left.` };
    }
};

// --- REGISTRATION & LOGIN LOGIC ---

export const registerUser = (user: UserProfile) => {
    // In a real app, this would send data to a backend.
    // Here we store it locally so the user can login with the generated ID/Passcode.
    localStorage.setItem(REG_USER_KEY, JSON.stringify(user));
    setSession(user); // Auto login after registration
};

export const authenticateUser = (userId: string, passcode: string): { success: boolean, user?: UserProfile } => {
    const storedData = localStorage.getItem(REG_USER_KEY);
    
    if (storedData) {
        const user = JSON.parse(storedData) as UserProfile;
        // Case-insensitive check for ID, exact match for Passcode
        if (user.id.toUpperCase() === userId.toUpperCase() && user.passcode === passcode) {
            return { success: true, user };
        }
    }

    return { success: false };
};

export const getMPIN = (): string | null => {
    return localStorage.getItem(MPIN_KEY);
};

export const validateMPIN = (input: string): boolean => {
    const stored = localStorage.getItem(MPIN_KEY);
    return stored === input;
};

export const setMPIN = (mpin: string) => {
    localStorage.setItem(MPIN_KEY, mpin);
};

export const isBiometricEnabled = (): boolean => {
    return localStorage.getItem('nx_bio_enabled') === 'true';
};

export const setBiometricEnabled = (enabled: boolean) => {
    localStorage.setItem('nx_bio_enabled', String(enabled));
};

// --- ID GENERATION LOGIC ---

const STATE_CODES: Record<string, string> = {
  'Bihar': 'BH',
  'Uttar Pradesh': 'UP',
  'Delhi': 'DL',
  'Maharashtra': 'MH',
  'Karnataka': 'KA',
  'Tamil Nadu': 'TN',
  'West Bengal': 'WB',
  'Gujarat': 'GJ',
  'Rajasthan': 'RJ',
  'Madhya Pradesh': 'MP',
  'Punjab': 'PB',
  'Haryana': 'HR',
  'Jharkhand': 'JH',
  'Odisha': 'OD',
  'Chhattisgarh': 'CG'
};

const getRandomNum = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const generateUserID = (stateName: string): string => {
  const stateCode = STATE_CODES[stateName] || 'IN'; // Default IN for India
  const rand1 = getRandomNum(10, 99);
  const rand2 = getRandomNum(10, 99);
  // Format: NVX<Random><StateCode><Random> -> NVX12BH52
  return `NVX${rand1}${stateCode}${rand2}`;
};

export const generatePasscode = (cityName: string): string => {
  // City Code: Uppercase, remove spaces, take first 3 chars. 
  const cleanCity = (cityName || '').replace(/[^a-zA-Z]/g, '').toUpperCase();
  const cityCode = cleanCity.length >= 3 ? cleanCity.slice(0, 3) : (cleanCity + 'X').slice(0, 3);
  const rand = getRandomNum(10, 99);
  // Format: NVX12<CityCode><Random>
  return `NVX12${cityCode}${rand}`;
};
