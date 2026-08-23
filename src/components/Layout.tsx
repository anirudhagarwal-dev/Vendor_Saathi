import React, { useState, useEffect } from 'react';
import { 
  Home, 
  IndianRupee, 
  Search, 
  MessageSquare, 
  User, 
  Sun,
  Moon,
  LogIn
} from 'lucide-react';
import type { UserProfile } from '../services/api';
import logo from '../assets/logo.png';
import logoAndName from '../assets/logoAndName.png';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserProfile | null;
  onLogout: () => Promise<void>;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  user, 
  onLogout,
  theme,
  setTheme
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutError, setLogoutError] = useState('');

  const handleConfirmLogout = React.useCallback(async () => {
    if (logoutLoading) return;
    setLogoutLoading(true);
    setLogoutError('');
    try {
      await onLogout();
      setLogoutModalOpen(false);
    } catch (err: any) {
      console.error('Logout error:', err);
      setLogoutError(err.message || 'Logout failed. Please try again.');
    } finally {
      setLogoutLoading(false);
    }
  }, [logoutLoading, onLogout]);

  // Keyboard controls for modal accessibility
  useEffect(() => {
    if (!logoutModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLogoutModalOpen(false);
      } else if (e.key === 'Enter') {
        handleConfirmLogout();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [logoutModalOpen, handleConfirmLogout]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-24 md:pb-8 transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between transition-colors duration-200">
        
        {/* Brand Logo */}
        <div className="flex items-center cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          {/* Desktop Logo + Name */}
          <div className="hidden md:flex bg-white dark:bg-white/95 p-1 px-2.5 rounded-xl border border-slate-100/80 shadow-2xs items-center justify-center">
            <img 
              src={logoAndName} 
              alt="VendorSaathi - AI-Powered Business Assistant" 
              className="h-9 w-auto object-contain" 
            />
          </div>
          {/* Mobile Logo Only */}
          <div className="flex md:hidden bg-white dark:bg-white/95 p-1 rounded-xl border border-slate-100/80 shadow-2xs items-center justify-center">
            <img 
              src={logo} 
              alt="VendorSaathi logo" 
              className="h-8 w-8 object-contain" 
            />
          </div>
        </div>

        {/* Desktop Navigation */}
        {user && (
          <div className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'dashboard' 
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Ghar / घर
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'sales' 
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Bikri / बिक्री
            </button>
            <button
              onClick={() => setActiveTab('schemes')}
              className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'schemes' 
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Yojana / योजना
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'chat' 
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Chat / चैट
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'profile' 
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Profile / प्रोफाइल
            </button>
          </div>
        )}

        {/* Right Side Header Items */}
        {user && (
          <div className="flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none"
              title={theme === 'light' ? 'Dark Mode / डार्क मोड' : 'Light Mode / लाइट मोड'}
              aria-label="Theme toggle"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Profile Dropdown Container */}
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)} 
                className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors focus:outline-none text-left"
              >
                <div className="bg-emerald-50 dark:bg-emerald-950/80 p-2 rounded-xl text-emerald-600 dark:text-emerald-400 shadow-inner">
                  <User size={16} className="stroke-[2.5]" />
                </div>
                <div className="hidden sm:block text-slate-700 dark:text-slate-300">
                  <span className="block text-xs font-bold leading-none">{user.name}</span>
                  <span className="block text-[8px] font-semibold tracking-wide text-slate-400 uppercase mt-0.5">
                    {user.businessType.replace('_', ' ')}
                  </span>
                </div>
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg py-2 z-40 transition-all duration-150">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
                      <p className="text-[9px] text-slate-400 truncate mt-0.5">{user.phone}</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Profile Settings
                    </button>
                    
                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Change Password
                    </button>

                    <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                    <button
                      onClick={() => {
                        setLogoutError('');
                        setLogoutLoading(false);
                        setLogoutModalOpen(true);
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                    >
                      Logout / लॉगआउट
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-5 md:max-w-3xl lg:max-w-6xl">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      {user && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] px-2 py-1.5 transition-colors duration-200">
          <div className="max-w-md mx-auto flex justify-around items-center">
            {/* Dashboard Tab */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
                activeTab === 'dashboard' 
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 font-bold' 
                  : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
              }`}
            >
              <Home size={20} className={activeTab === 'dashboard' ? 'stroke-[2.2]' : 'stroke-[1.8]'} />
              <span className="text-[10px] mt-1 font-medium tracking-tight">Ghar / घर</span>
            </button>

            {/* Sales Tracker Tab */}
            <button
              onClick={() => setActiveTab('sales')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
                activeTab === 'sales' 
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 font-bold' 
                  : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
              }`}
            >
              <IndianRupee size={20} className={activeTab === 'sales' ? 'stroke-[2.2]' : 'stroke-[1.8]'} />
              <span className="text-[10px] mt-1 font-medium tracking-tight">Bikri / बिक्री</span>
            </button>

            {/* Schemes Tab */}
            <button
              onClick={() => setActiveTab('schemes')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
                activeTab === 'schemes' 
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 font-bold' 
                  : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
              }`}
            >
              <Search size={20} className={activeTab === 'schemes' ? 'stroke-[2.2]' : 'stroke-[1.8]'} />
              <span className="text-[10px] mt-1 font-medium tracking-tight">Yojana / योजना</span>
            </button>

            {/* Chatbot Tab */}
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
                activeTab === 'chat' 
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 font-bold' 
                  : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
              }`}
            >
              <div className="relative">
                <MessageSquare size={20} className={activeTab === 'chat' ? 'stroke-[2.2]' : 'stroke-[1.8]'} />
                <span className="absolute -top-1 -right-1 flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                </span>
              </div>
              <span className="text-[10px] mt-1 font-medium tracking-tight">Chat / चैट</span>
            </button>

            {/* Profile Tab */}
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
                activeTab === 'profile' 
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 font-bold' 
                  : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
              }`}
            >
              <User size={20} className={activeTab === 'profile' ? 'stroke-[2.2]' : 'stroke-[1.8]'} />
              <span className="text-[10px] mt-1 font-medium tracking-tight">Profile / प्रोफाइल</span>
            </button>
          </div>
        </nav>
      )}

      {/* Logout Confirmation Modal */}
      {logoutModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/60 backdrop-blur-xs animate-fadeIn">
          {/* Backdrop click closer */}
          <div className="absolute inset-0" onClick={() => !logoutLoading && setLogoutModalOpen(false)} />
          
          {/* Modal Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-800 p-6 max-w-sm w-full text-center relative z-10 animate-scaleIn space-y-4">
            <div className="mx-auto bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400 p-3 rounded-full w-12 h-12 flex items-center justify-center shadow-inner">
              <LogIn size={20} className="rotate-180 text-red-500" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xs font-extrabold text-slate-805 dark:text-white uppercase tracking-wider">
                Logout karein? / लॉगआउट करें?
              </h3>
              <p className="text-[11px] text-slate-450 dark:text-slate-500 font-semibold leading-relaxed">
                Kya aap VendorSaathi se logout karna chahte hain?
              </p>
            </div>

            {logoutError && (
              <div className="bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-2.5 rounded-r-xl text-[10px] font-semibold text-left animate-pulse">
                {logoutError}
              </div>
            )}

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                disabled={logoutLoading}
                onClick={() => setLogoutModalOpen(false)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel (रद्द करें)
              </button>
              <button
                type="button"
                disabled={logoutLoading}
                onClick={handleConfirmLogout}
                className="flex-1 py-2.5 px-4 bg-[#DC2626] hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-sm hover:shadow active:scale-98 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-1.5"
              >
                {logoutLoading ? (
                  <>
                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Logout...</span>
                  </>
                ) : (
                  <span>Logout (लॉगआउट)</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
