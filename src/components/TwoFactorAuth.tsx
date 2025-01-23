import React, { useState, useEffect } from 'react';
import { Shield, ArrowLeft, AlertCircle } from 'lucide-react';

interface TwoFactorAuthProps {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  isAdmin: boolean;
}

export default function TwoFactorAuth({ email, onSuccess, onBack, darkMode, isAdmin }: TwoFactorAuthProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [remainingTime, setRemainingTime] = useState(30);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = isAdmin ? 3 : 5; // Stricter limit for admin users

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (attempts >= maxAttempts) {
      setError(`Too many failed attempts. Please try again later.`);
      return;
    }

    // For demo purposes, any 6-digit code will work
    if (code.length === 6 && /^\d+$/.test(code)) {
      onSuccess();
    } else {
      setAttempts(prev => prev + 1);
      setError(`Invalid code. ${maxAttempts - attempts - 1} attempts remaining.`);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 ${
      darkMode ? 'bg-gray-900' : 'bg-slate-50'
    }`}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <button
          onClick={onBack}
          className={`absolute top-4 left-4 p-2 ${
            darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="flex justify-center">
          <Shield className={`h-12 w-12 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
        </div>
        <h2 className={`mt-6 text-center text-3xl font-extrabold ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {isAdmin ? 'Admin Verification Required' : 'Two-Factor Authentication'}
        </h2>
        <p className={`mt-2 text-center text-sm ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {isAdmin 
            ? 'Please enter your admin verification code'
            : `Enter the verification code sent to ${email}`
          }
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className={`py-8 px-4 shadow sm:rounded-lg sm:px-10 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="code" className={`block text-sm font-medium ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Verification Code
              </label>
              <div className="mt-1">
                <input
                  id="code"
                  name="code"
                  type="text"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="000000"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/30 p-2 rounded">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={attempts >= maxAttempts}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  attempts >= maxAttempts
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                Verify
              </button>
            </div>

            <div className={`text-center text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Code expires in {remainingTime} seconds
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}