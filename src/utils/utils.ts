export type Gender = 'Male' | 'Female' | 'Other';
export type AccountType = 'Savings' | 'Current';
export type TransactionType = 'Deposit' | 'Withdrawal' | 'Transfer';

export interface TransactionRecord {
  customerId: string;
  transactionDate: Date;
  transactionType: TransactionType;
  transactionAmount: number;
  accountBalance: number;
  customerAge: number;
  customerGender: Gender;
  accountType: AccountType;
  branchCode: string;
  accountOpeningDate: Date;
  transactionDescription?: string;
}
