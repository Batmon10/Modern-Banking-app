import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, CheckCircle, Clock, XCircle, Eye, EyeOff, MoreVertical, Ban, Power } from 'lucide-react';

interface Card {
  id: string;
  type: 'savings' | 'plus' | 'advance' | 'business' | 'black';
  cardType: 'credit' | 'debit';
  number: string;
  expiryDate: string;
  status: 'active' | 'inactive';
  nameOnCard: string;
  userEmail: string;
}

interface CardApplication {
  id: string;
  type: 'savings' | 'plus' | 'advance' | 'business' | 'black';
  cardType: 'credit' | 'debit';
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
  userEmail: string;
  monthlyIncome: number;
  employment: string;
  nameOnCard: string;
}

interface Account {
  type: string;
  balance: number;
}

const cardTypes = [
  { type: 'savings', name: 'Savings Card', minBalance: 0, description: 'Basic card for your everyday needs' },
  { type: 'plus', name: 'Plus Card', minBalance: 500, description: 'Enhanced benefits and rewards' },
  { type: 'advance', name: 'Advance Card', minBalance: 550, description: 'Premium features and travel benefits' },
  { type: 'business', name: 'Business Card', minBalance: 10000, description: 'Designed for business expenses' },
  { type: 'black', name: 'Black Card', minBalance: 50000, description: 'Exclusive privileges and concierge service' }
];

export default function Cards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [applications, setApplications] = useState<CardApplication[]>([]);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'savings',
    cardType: 'debit' as const,
    monthlyIncome: '',
    employment: '',
    nameOnCard: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showDropdown, setShowDropdown] = useState<{[key: string]: boolean}>({});
  const [visibleCardNumbers, setVisibleCardNumbers] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const currentUserEmail = localStorage.getItem('currentUserEmail');
    
    // Load cards
    const storedCards = JSON.parse(localStorage.getItem('cards') || '[]');
    const userCards = storedCards.filter((card: Card) => 
      card.userEmail === currentUserEmail
    );
    setCards(userCards);

    // Load applications
    const storedApplications = JSON.parse(localStorage.getItem('cardApplications') || '[]');
    const userApplications = storedApplications.filter((app: CardApplication) => 
      app.userEmail === currentUserEmail
    );
    setApplications(userApplications);

    // Load accounts
    const storedAccounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    const userAccounts = storedAccounts.filter((acc: any) => 
      acc.userEmail === currentUserEmail
    );
    setAccounts(userAccounts);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentUserEmail = localStorage.getItem('currentUserEmail');
    setError('');

    // Check minimum balance requirement
    const selectedCardType = cardTypes.find(ct => ct.type === formData.type);
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    if (!selectedCardType) {
      setError('Invalid card type selected');
      return;
    }

    if (totalBalance < selectedCardType.minBalance) {
      setError(`Minimum balance requirement of $${selectedCardType.minBalance.toLocaleString()} not met. Your total balance: $${totalBalance.toLocaleString()}`);
      return;
    }

    if (!formData.nameOnCard.trim()) {
      setError('Please enter the name to appear on the card');
      return;
    }
    
    const newApplication: CardApplication = {
      id: Math.random().toString(36).substr(2, 9),
      type: formData.type,
      cardType: formData.cardType,
      status: 'pending',
      appliedAt: new Date().toISOString(),
      userEmail: currentUserEmail!,
      monthlyIncome: Number(formData.monthlyIncome),
      employment: formData.employment,
      nameOnCard: formData.nameOnCard
    };

    const applications = JSON.parse(localStorage.getItem('cardApplications') || '[]');
    applications.push(newApplication);
    localStorage.setItem('cardApplications', JSON.stringify(applications));

    setApplications(prev => [...prev, newApplication]);
    setShowApplicationForm(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const formatCardNumber = (number: string | undefined, visible: boolean) => {
    if (!number) return '';
    if (visible) {
      return number.match(/.{1,4}/g)?.join(' ') || number;
    }
    return `•••• •••• •••• ${number.slice(-4)}`;
  };

  const toggleCardNumberVisibility = (cardId: string) => {
    setVisibleCardNumbers(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const toggleDropdown = (e: React.MouseEvent, cardId: string) => {
    e.stopPropagation();
    setShowDropdown(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const handleDropdownAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
    setShowDropdown({});
  };

  const updateCardStatus = (cardId: string, status: 'active' | 'inactive') => {
    const updatedCards = cards.map(card => {
      if (card.id === cardId) {
        return { ...card, status };
      }
      return card;
    });
    localStorage.setItem('cards', JSON.stringify(updatedCards));
    setCards(updatedCards);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Rest of the component remains the same until the card display section */}
      
      {!showApplicationForm && (
        <>
          {/* Active Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {cards.map((currentCard) => (
              <div key={currentCard.id} className="bg-gradient-to-r from-blue-600 to-blue-400 p-6 rounded-xl text-white relative">
                <div className="flex justify-between items-start mb-4">
                  <CreditCard className="h-8 w-8" />
                  <div className="relative">
                    <button
                      onClick={(e) => toggleDropdown(e, currentCard.id)}
                      className="p-1 hover:bg-blue-500 rounded-full"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    
                    {showDropdown[currentCard.id] && (
                      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[100]">
                        <div className="py-1">
                          <button
                            onClick={(e) => handleDropdownAction(e, () => toggleCardNumberVisibility(currentCard.id))}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {visibleCardNumbers[currentCard.id] ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Hide Card Number
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Show Card Number
                              </>
                            )}
                          </button>
                          {currentCard.status === 'active' ? (
                            <button
                              onClick={(e) => handleDropdownAction(e, () => updateCardStatus(currentCard.id, 'inactive'))}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Block Card
                            </button>
                          ) : (
                            <button
                              onClick={(e) => handleDropdownAction(e, () => updateCardStatus(currentCard.id, 'active'))}
                              className="flex items-center w-full px-4 py-2 text-sm text-green-600 hover:bg-gray-100"
                            >
                              <Power className="h-4 w-4 mr-2" />
                              Unblock Card
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="text-xl tracking-wider">
                    {formatCardNumber(currentCard.number, visibleCardNumbers[currentCard.id])}
                  </div>
                  <div className="text-sm">{currentCard.nameOnCard}</div>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs opacity-75">Valid Thru</div>
                      <div>{currentCard.expiryDate}</div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center mb-1">
                        {currentCard.status === 'active' ? (
                          <CheckCircle className="h-5 w-5 text-green-300" />
                        ) : (
                          <Ban className="h-5 w-5 text-red-300" />
                        )}
                        <span className="ml-2 capitalize">{currentCard.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-3 right-3 text-xs font-bold tracking-widest opacity-50">
                  {currentCard.cardType?.toUpperCase() || 'DEBIT'}
                </div>
              </div>
            ))}
          </div>

          {/* Rest of the component remains the same */}
        </>
      )}
      
      {/* Rest of the component remains the same */}
    </div>
  );
}