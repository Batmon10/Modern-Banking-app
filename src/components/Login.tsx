import React, { useState, useEffect } from 'react';
import { Shield, Moon, Sun } from 'lucide-react';

interface LoginProps {
  onSuccess: (email: string) => void;
  onSignUp: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function Login({ onSuccess, onSignUp, darkMode, onToggleDarkMode }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Initialize admin account if it doesn't exist
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const adminExists = users.some((user: any) => user.email === '6570');
    
    if (!adminExists) {
      users.push({
        firstName: 'Admin',
        lastName: 'User',
        email: '6570',
        password: '6570',
        phone: '1234567890',
        isAdmin: true,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('users', JSON.stringify(users));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: { email: string; password: string }) => 
      u.email === email && u.password === password
    );

    if (user) {
      onSuccess(email);
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 ${
      darkMode ? 'bg-gray-900' : 'bg-slate-50'
    }`}>
      <button
        onClick={onToggleDarkMode}
        className="fixed bottom-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
      >
        {darkMode ? (
          <Sun className="h-6 w-6" />
        ) : (
          <Moon className="h-6 w-6" />
        )}
      </button>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Shield className={`h-12 w-12 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
        </div>
        <h2 className={`mt-6 text-center text-3xl font-extrabold ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Sign in to FluxBank
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className={`py-8 px-4 shadow sm:rounded-lg sm:px-10 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className={`block text-sm font-medium ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="text"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className={`block text-sm font-medium ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign In
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${
                  darkMode ? 'border-gray-700' : 'border-gray-300'
                }`} />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 ${
                  darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-500'
                }`}>
                  New to FluxBank?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={onSignUp}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium ${
                  darkMode 
                    ? 'text-blue-400 bg-gray-700 hover:bg-gray-600' 
                    : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                Create an account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}