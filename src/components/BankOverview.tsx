import React, { useState, useEffect } from 'react';
import { DollarSign, Users, Wallet, CreditCard, PiggyBank, TrendingUp, Activity } from 'lucide-react';
import AccountsManagement from './AccountsManagement';

interface BankStats {
  totalBalance: number;
  totalAccounts: number;
  totalUsers: number;
  totalCards: number;
  checkingAccounts: number;
  savingsAccounts: number;
  averageBalance: number;
}

export default function BankOverview() {
  const [showAccountsManagement, setShowAccountsManagement] = useState(false);
  const [bankStats, setBankStats] = useState<BankStats>({
    totalBalance: 0,
    totalAccounts: 0,
    totalUsers: 0,
    totalCards: 0,
    checkingAccounts: 0,
    savingsAccounts: 0,
    averageBalance: 0
  });

  useEffect(() => {
    loadBankStats();
  }, [showAccountsManagement]); // Reload stats when returning from accounts management

  const loadBankStats = () => {
    const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const cards = JSON.parse(localStorage.getItem('cards') || '[]');

    const totalBalance = accounts.reduce((sum: number, acc: any) => sum + acc.balance, 0);
    const checkingAccounts = accounts.filter((acc: any) => acc.type === 'checking').length;
    const savingsAccounts = accounts.filter((acc: any) => acc.type === 'savings').length;

    setBankStats({
      totalBalance,
      totalAccounts: accounts.length,
      totalUsers: users.filter((user: any) => !user.isAdmin).length,
      totalCards: cards.length,
      checkingAccounts,
      savingsAccounts,
      averageBalance: accounts.length ? totalBalance / accounts.length : 0
    });
  };

  if (showAccountsManagement) {
    return <AccountsManagement onBack={() => setShowAccountsManagement(false)} />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Bank Overview</h2>
      
      {/* Rest of the component remains the same */}
    </div>
  );
}