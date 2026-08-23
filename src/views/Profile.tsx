import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Briefcase, Lock, Save, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { BUSINESS_TYPES } from '../services/mockData';
import type { UserProfile } from '../services/api';

interface ProfileProps {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  apiService: {
    getCurrentVendor: () => Promise<UserProfile>;
    updateVendorDetails: (data: { name?: string; businessType?: string; location?: string }) => Promise<UserProfile>;
    changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  };
}

export const Profile: React.FC<ProfileProps> = ({ user, setUser, apiService }) => {
  // Profile Form State
  const [name, setName] = useState(user.name);
  const [businessType, setBusinessType] = useState(user.businessType);
  const [location, setLocation] = useState(user.location);
  
  // Password Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Status States
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Fetch fresh vendor details from database on mount
  useEffect(() => {
    const fetchFreshVendor = async () => {
      setProfileLoading(true);
      try {
        const fresh = await apiService.getCurrentVendor();
        setName(fresh.name);
        setBusinessType(fresh.businessType);
        setLocation(fresh.location);
        // Sync global app state with fresh database values
        setUser(fresh);
      } catch (err: any) {
        console.error('Error fetching current vendor:', err);
        setProfileError('Server se details load nahi ho saki.');
      } finally {
        setProfileLoading(false);
      }
    };
    fetchFreshVendor();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    
    if (!name.trim()) {
      setProfileError('Name khali nahi ho sakta');
      return;
    }
    if (!location.trim()) {
      setProfileError('Location khali nahi ho sakti');
      return;
    }

    setProfileLoading(true);
    try {
      const updated = await apiService.updateVendorDetails({
        name: name.trim(),
        businessType,
        location: location.trim()
      });
      setUser(updated);
      setProfileSuccess('Profile details successfully update ho gayi hain! 👍');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err: any) {
      setProfileError(err.message || 'Details update karne me dikkat aayi.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!oldPassword) {
      setPasswordError('Kripya purana password dalein');
      return;
    }
    if (newPassword.length < 4) {
      setPasswordError('Naya password kam se kam 4 characters ka hona chahiye');
      return;
    }

    setPasswordLoading(true);
    try {
      await apiService.changePassword(oldPassword, newPassword);
      setPasswordSuccess('Password successfully change ho gaya! 🔑');
      setOldPassword('');
      setNewPassword('');
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err: any) {
      setPasswordError(err.message || 'Password change nahi ho paya. Kripya old password check karein.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto transition-colors duration-200">
      {/* Title */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <User className="text-emerald-500 stroke-[2.5]" size={20} />
        <h2 className="text-md font-bold text-slate-800 dark:text-white">Profile Settings / प्रोफ़ाइल सेटिंग्स</h2>
      </div>

      {/* 1. Update Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/60 dark:border-slate-800 space-y-4">
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5 uppercase tracking-wide">
          <Briefcase size={16} className="text-slate-400" />
          <span>Vendor details / विक्रेता विवरण</span>
        </h3>

        {profileError && (
          <div className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/40 p-3.5 rounded-xl text-xs font-semibold flex items-center space-x-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{profileError}</span>
          </div>
        )}
        {profileSuccess && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 p-3.5 rounded-xl text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 size={14} className="shrink-0" />
            <span>{profileSuccess}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          {/* Phone Field (Read Only) */}
          <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/80 p-3 rounded-xl select-none opacity-60">
            <Phone size={16} className="text-slate-400 shrink-0" />
            <div className="flex-1">
              <span className="block text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase">Mobile Number (Non-editable)</span>
              <span className="font-bold text-slate-500 dark:text-slate-400 text-xs">{user.phone}</span>
            </div>
          </div>

          {/* Name Input */}
          <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus-within:border-emerald-400 focus-within:bg-white dark:focus-within:bg-slate-900 p-3 rounded-xl transition-all">
            <User size={16} className="text-slate-400 shrink-0" />
            <div className="flex-1">
              <span className="block text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase">Aapka Naam / Name</span>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-transparent border-none outline-none font-bold text-xs w-full p-0 text-slate-700 dark:text-slate-250 focus:ring-0 focus:ring-offset-0"
                disabled={profileLoading}
              />
            </div>
          </div>

          {/* Business Type Select */}
          <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus-within:border-emerald-400 focus-within:bg-white dark:focus-within:bg-slate-900 p-3 rounded-xl transition-all">
            <Briefcase size={16} className="text-slate-400 shrink-0" />
            <div className="flex-1">
              <span className="block text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase">Vyapar / Business Type</span>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="bg-transparent border-none outline-none font-bold text-xs w-full p-0 text-slate-700 dark:text-slate-250 focus:ring-0 focus:ring-offset-0 cursor-pointer dark:bg-slate-900"
                disabled={profileLoading}
              >
                {BUSINESS_TYPES.map((b) => (
                  <option key={b.id} value={b.id} className="dark:bg-slate-900">
                    {b.icon} {b.name} ({b.hindiName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location Input */}
          <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus-within:border-emerald-400 focus-within:bg-white dark:focus-within:bg-slate-900 p-3 rounded-xl transition-all">
            <MapPin size={16} className="text-slate-400 shrink-0" />
            <div className="flex-1">
              <span className="block text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase">Bazar ka Naam / Location</span>
              <input
                type="text"
                placeholder="e.g. Chandni Chowk, Delhi"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-transparent border-none outline-none font-bold text-xs w-full p-0 text-slate-700 dark:text-slate-250 focus:ring-0 focus:ring-offset-0"
                disabled={profileLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={profileLoading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-sm active:scale-98 transition-all text-xs"
          >
            <Save size={14} />
            <span>Save Profile (प्रोफ़ाइल सुरक्षित करें)</span>
          </button>
        </form>
      </div>

      {/* 2. Change Password Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/60 dark:border-slate-800 space-y-4">
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5 uppercase tracking-wide">
          <KeyRound size={16} className="text-slate-400" />
          <span>Security / पासवर्ड बदलें</span>
        </h3>

        {passwordError && (
          <div className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/40 p-3.5 rounded-xl text-xs font-semibold flex items-center space-x-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}
        {passwordSuccess && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 p-3.5 rounded-xl text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 size={14} className="shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          {/* Old Password */}
          <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus-within:border-emerald-400 focus-within:bg-white dark:focus-within:bg-slate-900 p-3 rounded-xl transition-all">
            <Lock size={16} className="text-slate-400 shrink-0" />
            <div className="flex-1">
              <span className="block text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase">Purana Password / Old Password</span>
              <input
                type="password"
                placeholder="Enter current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="bg-transparent border-none outline-none font-bold text-xs w-full p-0 text-slate-700 dark:text-slate-250 focus:ring-0 focus:ring-offset-0"
                disabled={passwordLoading}
              />
            </div>
          </div>

          {/* New Password */}
          <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus-within:border-emerald-400 focus-within:bg-white dark:focus-within:bg-slate-900 p-3 rounded-xl transition-all">
            <Lock size={16} className="text-slate-400 shrink-0" />
            <div className="flex-1">
              <span className="block text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase">Naya Password / New Password</span>
              <input
                type="password"
                placeholder="Enter new password (4+ characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-transparent border-none outline-none font-bold text-xs w-full p-0 text-slate-700 dark:text-slate-250 focus:ring-0 focus:ring-offset-0"
                disabled={passwordLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-sm active:scale-98 transition-all text-xs"
          >
            <KeyRound size={14} />
            <span>Change Password (पासवर्ड अपडेट करें)</span>
          </button>
        </form>
      </div>
    </div>
  );
};
