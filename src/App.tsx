import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Auth } from './views/Auth';
import { Dashboard } from './views/Dashboard';
import { SalesTracker } from './views/SalesTracker';
import { SchemeFinder } from './views/SchemeFinder';
import { Chatbot } from './views/Chatbot';
import { Profile } from './views/Profile';
import { api, type UserProfile } from './services/api';

function App() {
  const [user, setUser] = useState<UserProfile | null>(() => api.getCurrentUser());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [refreshInsightsTrigger, setRefreshInsightsTrigger] = useState<number>(0);

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('vendorsaathi-theme', theme);
  }, [theme]);

  const handleAuthSuccess = (authenticatedUser: UserProfile) => {
    setUser(authenticatedUser);
    setActiveTab('dashboard');
    // Trigger dashboard refresh on login
    setRefreshInsightsTrigger(prev => prev + 1);
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
  };

  // Render view based on active navigation tab
  const renderTabContent = () => {
    if (!user) return null;

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            user={user} 
            apiService={api} 
            refreshTrigger={refreshInsightsTrigger} 
            setActiveTab={setActiveTab}
          />
        );
      case 'sales':
        return (
          <SalesTracker 
            user={user} 
            apiService={api} 
            onRefreshInsights={() => setRefreshInsightsTrigger(prev => prev + 1)} 
          />
        );
      case 'schemes':
        return <SchemeFinder apiService={api} />;
      case 'chat':
        return <Chatbot apiService={api} />;
      case 'profile':
        return <Profile user={user} setUser={setUser} apiService={api} />;
      default:
        return (
          <Dashboard 
            user={user} 
            apiService={api} 
            refreshTrigger={refreshInsightsTrigger} 
            setActiveTab={setActiveTab}
          />
        );
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#030712] flex items-center justify-center p-4 transition-colors duration-200 relative overflow-hidden">
        {/* Subtle premium background glow spots */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none hidden dark:block"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-teal-500/5 blur-[120px] pointer-events-none hidden dark:block"></div>
        <div className="relative z-10 w-full flex justify-center">
          <Auth onAuthSuccess={handleAuthSuccess} apiService={api} />
        </div>
      </div>
    );
  }

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      user={user}
      onLogout={handleLogout}
      theme={theme}
      setTheme={setTheme}
    >
      {renderTabContent()}
    </Layout>
  );
}

export default App;
