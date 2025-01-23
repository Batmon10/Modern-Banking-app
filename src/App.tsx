import React, { useState, useEffect } from 'react';
import { Wallet, ChevronDown, User, CreditCard, Settings as SettingsIcon, HelpCircle, LogOut, Moon, Sun } from 'lucide-react';
import MobileNav from './components/MobileNav';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Settings from './components/Settings';
import Cards from './components/Cards';
import Accounts from './components/Accounts';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import SignUp from './components/SignUp';
import TwoFactorAuth from './components/TwoFactorAuth';
import AccountSetup from './components/AccountSetup';
import { logBankActivity } from './utils/logger';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showAccountSetup, setShowAccountSetup] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const handleLoginSuccess = (userEmail: string) => {
    setEmail(userEmail);
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.email === userEmail);
    const isAdminUser = user?.isAdmin || false;
    setIsAdmin(isAdminUser);

    if (isAdminUser) {
      setShowTwoFactor(true);
      logBankActivity('auth', 'Admin Login Attempt', 'Admin user initiated 2FA verification', userEmail);
    } else {
      // Check if user has any accounts
      const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
      const userAccounts = accounts.filter((acc: any) => acc.userEmail === userEmail);
      
      if (userAccounts.length === 0) {
        setShowAccountSetup(true);
        logBankActivity('auth', 'New User Login', 'User redirected to account setup', userEmail);
      } else {
        setShowTwoFactor(true);
        logBankActivity('auth', 'User Login Attempt', 'User initiated 2FA verification', userEmail);
      }
    }
  };

  const handle2FASuccess = () => {
    setIsAuthenticated(true);
    setShowTwoFactor(false);
    localStorage.setItem('currentUserEmail', email);
    
    logBankActivity(
      'auth',
      isAdmin ? 'Admin Login Success' : 'User Login Success',
      '2FA verification successful',
      email,
      undefined,
      'success'
    );
  };

  const handleSignUpSuccess = () => {
    setShowSignUp(false);
    setShowAccountSetup(true);
    logBankActivity('user', 'New User Registration', 'User successfully registered', email);
  };

  const handleAccountSetupComplete = () => {
    setShowAccountSetup(false);
    setShowTwoFactor(true);
    logBankActivity('account', 'Account Setup Complete', 'Initial account setup completed', email);
  };

  const handleLogout = () => {
    logBankActivity(
      'auth',
      isAdmin ? 'Admin Logout' : 'User Logout',
      'User logged out successfully',
      email
    );
    
    setIsAuthenticated(false);
    setShowTwoFactor(false);
    setShowAccountSetup(false);
    setEmail('');
    setIsAdmin(false);
    localStorage.removeItem('currentUserEmail');
  };

  const menuItems = isAdmin ? [
    { icon: LogOut, label: 'Logout', action: handleLogout }
  ] : [
    { icon: User, label: 'My Accounts', action: () => setActiveTab('accounts') },
    { icon: CreditCard, label: 'My Cards', action: () => setActiveTab('cards') },
    { icon: SettingsIcon, label: 'Settings', action: () => setActiveTab('settings') },
    { icon: HelpCircle, label: 'Help & Support', action: () => window.open('mailto:support@fluxbank.com') },
    { icon: LogOut, label: 'Logout', action: handleLogout }
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      {!isAuthenticated ? (
        <>
          {showSignUp ? (
            <SignUp 
              onSuccess={handleSignUpSuccess} 
              onBack={() => setShowSignUp(false)} 
              darkMode={darkMode}
              onToggleDarkMode={toggleDarkMode}
            />
          ) : showAccountSetup ? (
            <AccountSetup 
              email={email} 
              onComplete={handleAccountSetupComplete} 
              darkMode={darkMode}
              onToggleDarkMode={toggleDarkMode}
            />
          ) : showTwoFactor ? (
            <TwoFactorAuth 
              email={email} 
              onSuccess={handle2FASuccess} 
              onBack={() => setShowTwoFactor(false)} 
              darkMode={darkMode}
              onToggleDarkMode={toggleDarkMode}
              isAdmin={isAdmin}
            />
          ) : (
            <Login 
              onSuccess={handleLoginSuccess} 
              onSignUp={() => setShowSignUp(true)} 
              darkMode={darkMode}
              onToggleDarkMode={toggleDarkMode}
            />
          )}
        </>
      ) : (
        <div className={darkMode ? 'bg-gray-900' : 'bg-slate-50'}>
          <header className={`bg-white dark:bg-gray-800 shadow-sm px-4 py-3 flex items-center justify-between relative`}>
            <div className="flex items-center">
              <Wallet className={`h-8 w-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <span className={`ml-2 text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                FluxBank
              </span>
              {isAdmin && (
                <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded">
                  Admin
                </span>
              )}
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className={`flex items-center space-x-2 ${
                  darkMode ? 'text-gray-200 hover:text-white' : 'text-gray-600 hover:text-gray-800'
                } focus:outline-none`}
              >
                <User className="h-5 w-5" />
                <span>{email}</span>
                <ChevronDown className={`h-4 w-4 transform transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1" role="menu">
                    {menuItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          item.action();
                          setShowDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm ${
                          darkMode 
                            ? 'text-gray-200 hover:bg-gray-700' 
                            : 'text-gray-700 hover:bg-gray-100'
                        } flex items-center space-x-2`}
                        role="menuitem"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </header>

          <main className="pb-20">
            {isAdmin ? (
              <AdminDashboard />
            ) : (
              <>
                {activeTab === 'dashboard' && <Dashboard />}
                {activeTab === 'accounts' && <Accounts />}
                {activeTab === 'transactions' && <Transactions />}
                {activeTab === 'cards' && <Cards />}
                {activeTab === 'settings' && <Settings />}
              </>
            )}
          </main>

          {!isAdmin && <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />}

          <button
            onClick={toggleDarkMode}
            className="fixed bottom-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          >
            {darkMode ? (
              <Sun className="h-6 w-6" />
            ) : (
              <Moon className="h-6 w-6" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}