import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';

interface Transaction {
  id: string;
  accountId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  category: string;
  date: string;
  status: 'completed' | 'pending';
}

interface AccountTransactionsProps {
  accountId: string;
  onClose: () => void;
}

export default function AccountTransactions({ accountId, onClose }: AccountTransactionsProps) {
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);

  React.useEffect(() => {
    const allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const accountTransactions = allTransactions.filter(
      (transaction: Transaction) => transaction.accountId === accountId
    );
    setTransactions(accountTransactions.sort((a: Transaction, b: Transaction) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));
  }, [accountId]);

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Transaction History</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-white border rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'credit' ? (
                          <ArrowDownLeft className={`h-5 w-5 ${
                            transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                          }`} />
                        ) : (
                          <ArrowUpRight className={`h-5 w-5 ${
                            transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                          }`} />
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium">{transaction.description}</p>
                        <div className="flex items-center mt-1">
                          <span className="text-sm text-gray-500">
                            {new Date(transaction.date).toLocaleDateString()}
                          </span>
                          <span className="mx-2 text-gray-300">•</span>
                          <span className="text-sm text-gray-500">
                            {transaction.category}
                          </span>
                          {transaction.status === 'pending' && (
                            <>
                              <span className="mx-2 text-gray-300">•</span>
                              <span className="text-sm text-yellow-600 flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                Pending
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className={`font-semibold ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}
                      ${Math.abs(transaction.amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No transactions found for this account
            </div>
          )}
        </div>
      </div>
    </div>
  );
}