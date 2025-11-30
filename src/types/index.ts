export interface RawTransaction {
  'Customer ID': string;
  'Transaction Date': string;
  'Transaction Type': string;
  'Transaction Amount': string;
  'Account Balance': string;
  'Age': string;
  'Gender': string;
  'Account Type': string;
  'Branch ID': string;
  'Date Of Account Opening': string;
  'Account Balance After Transaction': string;
}

export interface CleanedTransaction {
  customerId: number;
  transactionDate: Date | null;
  transactionType: string;
  transactionAmount: number;
  accountBalance: number;
  customerAge: number;
  customerGender: 'Male' | 'Female' | 'Other';
  accountType: string;
  branchCode: string;
  accountOpeningDate: Date | null;
  balanceAfterTransaction: number;
}

export interface Anomaly {
  transaction: CleanedTransaction;
  type: 'high-value' | 'low-value' | 'new-customer-high-value';
  reason: string;
}

export interface CustomerLTV {
  customerId: number;
  totalVolume: number;
  activeMonths: number;
  valuePerMonth: number;
  firstTransactionDate: Date | null;
  lastTransactionDate: Date | null;
}