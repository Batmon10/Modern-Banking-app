interface LogEntry {
  id: string;
  type: 'account' | 'transaction' | 'card' | 'auth' | 'user';
  action: string;
  details: string;
  userEmail: string;
  timestamp: string;
  amount?: number;
  status?: string;
}

export const logBankActivity = (
  type: LogEntry['type'],
  action: string,
  details: string,
  userEmail: string,
  amount?: number,
  status?: string
) => {
  const logs = JSON.parse(localStorage.getItem('bankLogs') || '[]');
  
  const newLog: LogEntry = {
    id: Math.random().toString(36).substr(2, 9),
    type,
    action,
    details,
    userEmail,
    timestamp: new Date().toISOString(),
    ...(amount !== undefined && { amount }),
    ...(status && { status })
  };

  logs.unshift(newLog); // Add to beginning of array
  
  // Keep only last 1000 logs to prevent localStorage from getting too large
  if (logs.length > 1000) {
    logs.pop();
  }

  localStorage.setItem('bankLogs', JSON.stringify(logs));
};