import React from 'react';
import { Home, History, Send, CreditCard, Settings, Wallet } from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'accounts', label: 'Accounts', icon: Wallet },
  { id: 'transactions', label: 'History', icon: History },
  { id: 'cards', label: 'Cards', icon: CreditCard },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function MobileNav({ activeTab, setActiveTab }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center py-3 px-5 ${
              activeTab === item.id ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <item.icon className="h-6 w-6" />
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}