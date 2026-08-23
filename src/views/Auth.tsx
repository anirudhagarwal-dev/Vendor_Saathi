import React, { useState } from 'react';
import { User, Phone, MapPin, Lock, UserPlus, LogIn, Eye, EyeOff } from 'lucide-react';
import { BUSINESS_TYPES } from '../services/mockData';
import type { UserProfile } from '../services/api';
import logoAndName from '../assets/logoAndName.png';

interface AuthProps {
  onAuthSuccess: (user: UserProfile) => void;
  apiService: {
    login: (phone: string, passwordHash: string) => Promise<UserProfile>;
    register: (name: string, phone: string, businessType: string, location: string, passwordHash: string) => Promise<UserProfile>;
  };
}

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess, apiService }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Registration specific fields
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState(BUSINESS_TYPES[0].id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Simple validation
    if (!phone || phone.length < 10) {
      setError('Kripya 10-digit Mobile Number dalein (Enter valid 10-digit mobile number)');
      return;
    }
    if (!password || password.length < 4) {
      setError('Password kam se kam 4 characters ka hona chahiye (Password must be 4+ chars)');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const user = await apiService.login(phone, password);
        onAuthSuccess(user);
      } else {
        if (!name) {
          setError('Kripya apna Naam dalein (Please enter your name)');
          setLoading(false);
          return;
        }
        if (!location) {
          setError('Kripya apna Bazar / City dalein (Please enter location)');
          setLoading(false);
          return;
        }
        const user = await apiService.register(name, phone, selectedBusiness, location, password);
        onAuthSuccess(user);
      }
    } catch (err: any) {
      setError(err.message || 'Kuch galat hua. Kripya fir se koshish karein.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-800 flex flex-col md:flex-row overflow-hidden transition-all duration-300 min-h-[600px] animate-fadeIn">
      
      {/* Left Branding Panel (42% width) */}
      <div className="hidden md:flex md:w-[42%] bg-gradient-to-b from-emerald-900 via-emerald-950 to-slate-950 p-10 text-white flex-col justify-between relative overflow-hidden select-none">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
        <div className="absolute top-1/4 right-0 w-48 h-48 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none"></div>

        <div className="z-10 flex flex-col h-full justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-white/95 p-1 px-3 rounded-xl border border-emerald-500/10 shadow-xs flex items-center justify-center">
              <img 
                src={logoAndName} 
                alt="VendorSaathi - AI-Powered Business Assistant" 
                className="h-8 w-auto object-contain" 
              />
            </div>
          </div>

          {/* Headline */}
          <div className="my-8 space-y-3">
            <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-white">
              A smarter way to <br />
              <span className="text-emerald-400">run your business.</span>
            </h2>
            <p className="text-xs text-slate-350 leading-relaxed font-semibold">
              Dukandaro aur Patri walo ka digital saathi.
            </p>
          </div>

          {/* Feature List */}
          <div className="space-y-4 pt-6 border-t border-slate-800/60">
            {/* Feature 1 */}
            <div className="flex items-start space-x-3.5 group cursor-pointer transition-all duration-200 hover:translate-x-1.5">
              <div className="bg-emerald-500/10 text-emerald-450 p-2 rounded-xl border border-emerald-500/20 group-hover:bg-emerald-500/20 group-hover:text-emerald-300 transition-all duration-200">
                <span className="text-xs block leading-none">📊</span>
              </div>
              <div>
                <span className="font-bold text-white block text-xs tracking-wide">Daily Khata-Bahi (खाता-बही)</span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5 leading-none">Track your sales and expenses effortlessly.</span>
              </div>
            </div>
            {/* Feature 2 */}
            <div className="flex items-start space-x-3.5 group cursor-pointer transition-all duration-200 hover:translate-x-1.5">
              <div className="bg-emerald-500/10 text-emerald-450 p-2 rounded-xl border border-emerald-500/20 group-hover:bg-emerald-500/20 group-hover:text-emerald-300 transition-all duration-200">
                <span className="text-xs block leading-none">🔮</span>
              </div>
              <div>
                <span className="font-bold text-white block text-xs tracking-wide">AI Demand Forecast (मांग पूर्वानुमान)</span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5 leading-none">Know what your customers may need next.</span>
              </div>
            </div>
            {/* Feature 3 */}
            <div className="flex items-start space-x-3.5 group cursor-pointer transition-all duration-200 hover:translate-x-1.5">
              <div className="bg-emerald-500/10 text-emerald-450 p-2 rounded-xl border border-emerald-500/20 group-hover:bg-emerald-500/20 group-hover:text-emerald-300 transition-all duration-200">
                <span className="text-xs block leading-none">🔍</span>
              </div>
              <div>
                <span className="font-bold text-white block text-xs tracking-wide">Sarkari Scheme Finder (सरकारी योजनाएं)</span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5 leading-none">Find schemes and eligibility details easily.</span>
              </div>
            </div>
            {/* Feature 4 */}
            <div className="flex items-start space-x-3.5 group cursor-pointer transition-all duration-200 hover:translate-x-1.5">
              <div className="bg-emerald-500/10 text-emerald-455 p-2 rounded-xl border border-emerald-500/20 group-hover:bg-emerald-500/20 group-hover:text-emerald-300 transition-all duration-200">
                <span className="text-xs block leading-none">💬</span>
              </div>
              <div>
                <span className="font-bold text-white block text-xs tracking-wide">AI Assistant Chatbot (मददगार चैटबॉट)</span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5 leading-none">Ask business questions in simple Hinglish language.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Login/Register Panel */}
      <div className="p-6 md:p-10 flex-1 flex flex-col justify-center bg-white dark:bg-slate-900 transition-colors duration-200 relative overflow-y-auto max-h-[90vh]">
        
        {/* Segmented Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl mb-6 shadow-2xs border border-slate-200/40 dark:border-slate-800/80 shrink-0">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-2 text-[10px] md:text-xs font-extrabold rounded-lg transition-all duration-200 ${
              isLogin 
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-450 shadow-xs scale-[1.01]' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-200'
            }`}
          >
            LOGIN (लॉग इन)
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-2 text-[10px] md:text-xs font-extrabold rounded-lg transition-all duration-200 ${
              !isLogin 
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-450 shadow-xs scale-[1.01]' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-200'
            }`}
          >
            CREATE ACCOUNT (नया खाता)
          </button>
        </div>

        {/* Mobile Header Branding (Visible on mobile only) */}
        <div className="flex md:hidden justify-center mb-5 shrink-0">
          <div className="bg-white dark:bg-white/95 p-1 px-3 rounded-xl border border-slate-150/80 shadow-2xs">
            <img 
              src={logoAndName} 
              alt="VendorSaathi - AI-Powered Business Assistant" 
              className="h-8 w-auto object-contain" 
            />
          </div>
        </div>

        {/* Greeting */}
        <div className="text-center md:text-left mb-6 space-y-1 shrink-0">
          <h3 className="text-md font-extrabold text-slate-800 dark:text-white flex items-center justify-center md:justify-start space-x-1.5">
            <span>{isLogin ? 'Welcome Back' : 'Create Account'}</span>
            <span className="inline-block animate-bounce">👋</span>
          </h3>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
            {isLogin ? 'Login to continue to your dashboard / ...' : 'Fill details below to register your business / ...'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 text-red-700 dark:text-red-450 p-3 rounded-r-xl text-xs font-semibold animate-pulse mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col justify-center">
          {/* REGISTRATION FIELDS */}
          {!isLogin && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase mb-1.5 tracking-wider">
                  Apna Naam / Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <User size={14} />
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all duration-200"
                    required={!isLogin}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase mb-1.5 tracking-wider">
                  Apka Vyapar / Business Type
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {BUSINESS_TYPES.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBusiness(b.id)}
                      className={`p-2.5 rounded-xl border text-left flex flex-col justify-between h-18 transition-all duration-200 ${
                        selectedBusiness === b.id
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500/20 shadow-2xs'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                      }`}
                    >
                      <span className="text-lg leading-none">{b.icon}</span>
                      <div>
                        <div className="text-[10px] font-bold text-slate-800 dark:text-slate-200 leading-tight">{b.name}</div>
                        <div className="text-[8px] text-slate-450 dark:text-slate-500 font-semibold leading-none mt-0.5">{b.hindiName}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase mb-1.5 tracking-wider">
                  Bazar / Location
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <MapPin size={14} />
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. Chandni Chowk, Delhi"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all duration-200"
                    required={!isLogin}
                  />
                </div>
              </div>
            </div>
          )}

          {/* COMMON FIELDS: Phone, Password */}
          <div className="space-y-4">
            <div>
              <label className="block text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase mb-1.5 tracking-wider">
                Mobile Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <Phone size={14} />
                </span>
                <input
                  type="tel"
                  pattern="[0-9]{10}"
                  placeholder="Enter 10-digit number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all duration-200 tracking-wider"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase mb-1.5 tracking-wider">
                Pin / Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <Lock size={14} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 4 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all duration-200 font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition-colors"
                  title={showPassword ? 'Hide Password' : 'Show Password'}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-slate-200 disabled:to-slate-200 dark:disabled:from-slate-800 dark:disabled:to-slate-800 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-sm hover:shadow active:scale-98 hover:-translate-y-0.5 transition-all duration-200 text-xs mt-6 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>{isLogin ? 'Logging in (प्रवेश कर रहे हैं)...' : 'Registering (पंजीकरण कर रहे हैं)...'}</span>
              </>
            ) : (
              <>
                <span>{isLogin ? 'Login Karein (प्रवेश करें)' : 'Register Karein (खाता बनाएं)'}</span>
                {isLogin ? <LogIn size={15} /> : <UserPlus size={15} />}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
