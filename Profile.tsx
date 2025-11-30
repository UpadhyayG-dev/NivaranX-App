
import React, { useState, useRef } from 'react';
import { User, Mail, Phone, MapPin, Edit2, Shield, Lock, LogOut, ChevronRight, FileText, Activity, Camera } from 'lucide-react';
import { UserProfile, Language } from '../types';
import { setSession, isBiometricEnabled, setBiometricEnabled as saveBioAuth } from '../services/authService';
import { t } from '../services/translationService';

interface ProfileProps {
    onLogout: () => void;
    language: Language;
}

const Profile: React.FC<ProfileProps> = ({ onLogout, language }) => {
    // Mock User Data
    const [user, setUser] = useState<UserProfile>(() => {
        const saved = localStorage.getItem('nivaranx_session');
        return saved ? JSON.parse(saved) : {
            name: 'Rishi Upadhyay',
            email: 'rishi.nivaranx@gmail.com',
            phone: '+91 8603980072',
            city: 'Aurangabad, Bihar',
            id: 'NX-824302',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NivaranX'
        };
    });
    
    const [isEditing, setIsEditing] = useState(false);
    const [bioEnabled, setBioEnabled] = useState(isBiometricEnabled());
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = () => {
        setIsEditing(false);
        setSession(user);
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                if(ev.target?.result) {
                    const newUser = { ...user, avatar: ev.target.result as string };
                    setUser(newUser);
                    setSession(newUser);
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const toggleBiometric = () => {
        const newState = !bioEnabled;
        setBioEnabled(newState);
        saveBioAuth(newState);
    };

    const StatCard = ({ icon: Icon, label, value, color }: any) => (
        <div className="flex-1 bg-white dark:bg-deep-light p-3 rounded-xl shadow-sm border border-gray-100 dark:border-white/10 flex flex-col items-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <div className={`p-2 rounded-full bg-gray-50 dark:bg-white/5 mb-2 ${color}`}>
                <Icon size={18} />
            </div>
            <span className="text-xl font-bold dark:text-white">{value}</span>
            <span className="text-[10px] text-gray-400 uppercase font-bold">{label}</span>
        </div>
    );

    return (
        <div className="pb-24 animate-fade-in">
            {/* Header */}
            <div className="bg-white dark:bg-deep pt-6 pb-8 px-6 border-b border-gray-100 dark:border-white/10 text-center">
                <div className="relative w-28 h-28 mx-auto mb-4 group">
                    <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full border-4 border-royal/20 object-cover shadow-lg" />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-1 right-1 bg-royal text-white p-2.5 rounded-full shadow-lg hover:bg-royal-dark transition-colors"
                    >
                        <Camera size={16} />
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                </div>
                {isEditing ? (
                    <div className="space-y-3 max-w-xs mx-auto animate-fade-in">
                        <input value={user.name} onChange={e => setUser({...user, name: e.target.value})} className="w-full text-center border-b-2 border-royal outline-none bg-transparent font-bold dark:text-white text-lg py-1" placeholder={t('auth.fullname', language)} />
                        <input value={user.city} onChange={e => setUser({...user, city: e.target.value})} className="w-full text-center border-b border-gray-300 dark:border-gray-700 outline-none bg-transparent text-sm dark:text-gray-300 py-1" placeholder={t('auth.city', language)} />
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-black dark:text-white">{user.name}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{user.city}</p>
                        <div className="inline-block bg-royal/10 dark:bg-royal/20 px-3 py-1 rounded-full text-xs font-bold text-royal mt-3 border border-royal/20">
                            ID: {user.id}
                        </div>
                    </>
                )}
                <button 
                    onClick={isEditing ? handleSave : () => setIsEditing(true)} 
                    className={`text-xs font-bold mt-5 px-6 py-2 rounded-full transition-colors ${isEditing ? 'bg-royal text-white shadow-md' : 'text-royal hover:bg-royal/5'}`}
                >
                    {isEditing ? t('profile.save_changes', language) : t('profile.edit_profile', language)}
                </button>
            </div>

            <div className="p-4 space-y-6">
                {/* Stats */}
                <div className="flex gap-4">
                    <StatCard icon={Activity} label={t('profile.stats.services', language)} value="12" color="text-blue-500" />
                    <StatCard icon={FileText} label={t('profile.stats.docs', language)} value="5" color="text-orange-500" />
                    <StatCard icon={Shield} label={t('profile.stats.requests', language)} value="2" color="text-green-500" />
                </div>

                {/* Info List */}
                <div className="bg-white dark:bg-deep-light rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-white/10">
                    <div className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center gap-4">
                        <Phone size={20} className="text-gray-400" />
                        <div className="flex-1">
                            <p className="text-xs text-gray-400 uppercase font-bold">{t('profile.mobile', language)}</p>
                            {isEditing ? (
                                <input value={user.phone} onChange={e => setUser({...user, phone: e.target.value})} className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 outline-none dark:text-white text-sm" />
                            ) : (
                                <p className="text-sm font-medium dark:text-white">{user.phone}</p>
                            )}
                        </div>
                    </div>
                    <div className="p-4 flex items-center gap-4">
                        <Mail size={20} className="text-gray-400" />
                        <div className="flex-1">
                            <p className="text-xs text-gray-400 uppercase font-bold">{t('profile.email', language)}</p>
                            {isEditing ? (
                                <input value={user.email} onChange={e => setUser({...user, email: e.target.value})} className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 outline-none dark:text-white text-sm" />
                            ) : (
                                <p className="text-sm font-medium dark:text-white">{user.email}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Security */}
                <h3 className="font-bold dark:text-white text-sm uppercase pl-2 flex items-center gap-2"><Lock size={14} className="text-royal" /> {t('profile.security', language)}</h3>
                <div className="bg-white dark:bg-deep-light rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-white/10">
                    <div className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Lock size={20} className="text-royal" />
                            <span className="text-sm font-medium dark:text-white">{t('profile.app_lock', language)}</span>
                        </div>
                        <span className="text-xs text-green-500 font-bold bg-green-500/10 px-2 py-1 rounded">{t('profile.enabled', language)}</span>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Shield size={20} className="text-royal" />
                            <span className="text-sm font-medium dark:text-white">{t('profile.bio_login', language)}</span>
                        </div>
                        <div onClick={toggleBiometric} className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-colors ${bioEnabled ? 'bg-royal' : 'bg-gray-300 dark:bg-white/20'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${bioEnabled ? 'translate-x-5' : ''}`} />
                        </div>
                    </div>
                </div>

                <button onClick={onLogout} className="w-full py-4 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-xl font-bold flex items-center justify-center gap-2 border border-red-100 dark:border-red-500/20 active:scale-95 transition-transform">
                    <LogOut size={20} /> {t('profile.logout', language)}
                </button>
            </div>
        </div>
    );
};

export default Profile;
