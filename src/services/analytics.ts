import type { CleanedTransaction } from '../types';

/**
 * Calculates the total transaction volume for each branch, aggregated by month.
 * @param data An array of cleaned transaction objects.
 * @returns A nested map: `branchCode → month (YYYY-MM) → total volume`.
 */
export function getMonthlyVolumeByBranch(
  data: CleanedTransaction[]
): Map<string, Map<string, number>> {
  const branchVolumes = new Map<string, Map<string, number>>();

  for (const transaction of data) {
    if (!transaction.transactionDate || !transaction.branchCode) {
      continue;
    }

    const { branchCode, transactionAmount, transactionDate: date } = transaction;

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const monthKey = `${year}-${month}`;

    const monthlyVolumes = branchVolumes.get(branchCode) ?? new Map<string, number>();
    const currentVolume = monthlyVolumes.get(monthKey) ?? 0;

    monthlyVolumes.set(monthKey, currentVolume + transactionAmount);
    branchVolumes.set(branchCode, monthlyVolumes);
  }

  return branchVolumes;
}

export interface Anomaly {
  transaction: CleanedTransaction;
  type: 'high-value' | 'low-value' | 'new-customer-high-value';
  reason: string;
}

/**
 * Detects unusual customer transactions using a hybrid, two-pass model for correctness.
 * - Pass 1: Builds a complete statistical profile (mean, std dev) for all customers.
 * - Pass 2: Compares each transaction against the customer's final profile.
 * This ensures all transactions, including early ones, are evaluated correctly.
 *
 * @param data An array of cleaned transaction objects.
 * @param options Configuration for anomaly detection thresholds.
 * @returns An array of `Anomaly` objects detailing each flagged transaction.
 */
export function detectAnomalousTransactions(
  data: CleanedTransaction[],
  options: {
    stdDevThreshold?: number;
    historyThreshold?: number;
    firstTransactionThreshold?: number;
  } = {}
): Anomaly[] {
  const {
    stdDevThreshold = 3,
    historyThreshold = 3,
    firstTransactionThreshold = 150_000,
  } = options;

  const customerStats = new Map<number, { mean: number; stdDev: number; count: number }>();
  const customerTransactions = new Map<number, number[]>();
  const anomalies: Anomaly[] = [];

  //  PASS 1: Build a complete statistical profile for every customer 
  for (const transaction of data) {
    const { customerId, transactionAmount } = transaction;
    const transactions = customerTransactions.get(customerId) ?? [];
    transactions.push(transactionAmount);
    customerTransactions.set(customerId, transactions);
  }

  for (const [customerId, amounts] of customerTransactions.entries()) {
    const count = amounts.length;
    if (count >= historyThreshold) {
      const sum = amounts.reduce((acc, val) => acc + val, 0);
      const mean = sum / count;
      const variance = amounts.map(val => Math.pow(val - mean, 2)).reduce((acc, val) => acc + val, 0) / count;
      const stdDev = Math.sqrt(variance);
      customerStats.set(customerId, { mean, stdDev, count });
    }
  }

  //  PASS 2: Check every transaction against the final profiles 
  for (const transaction of data) {
    const { customerId, transactionAmount } = transaction;
    const stats = customerStats.get(customerId);
    const historyCount = customerTransactions.get(customerId)?.length ?? 0;

    // Case 1: Is this an established customer with a valid statistical profile?
    if (stats && stats.stdDev > 0) {
      const deviation = (transactionAmount - stats.mean) / stats.stdDev;
      if (Math.abs(deviation) > stdDevThreshold) {
        const type = deviation > 0 ? 'high-value' : 'low-value';
        const direction = type === 'high-value' ? 'ABOVE' : 'BELOW';
        const reason = `Customer ${customerId}: Tx of ${transactionAmount.toFixed(2)} is ${Math.abs(deviation).toFixed(1)} std devs ${direction} their avg of ${stats.mean.toFixed(2)}.`;
        console.warn(`[ANOMALY] ${reason}`);
        anomalies.push({ transaction, type, reason });
      }
    } 
    // Case 2: Is this a new customer? Check their early transactions against the global threshold.
    else if (historyCount < historyThreshold) {
        if (transactionAmount > firstTransactionThreshold) {
          const reason = `Customer ${customerId} (New): Early transaction of ${transactionAmount.toFixed(2)} exceeds global threshold of ${firstTransactionThreshold.toFixed(2)}.`;
          console.warn(`[ANOMALY] ${reason}`);
          anomalies.push({ transaction, type: 'new-customer-high-value', reason });
        }
    }
  }
  return anomalies;
}

export interface CustomerLTV {
  customerId: number;
  totalVolume: number;
  activeMonths: number;
  valuePerMonth: number;
  firstTransactionDate: Date | null;
  lastTransactionDate: Date | null;
}

/**
 * Calculates LTV metrics, including a tenure-normalized "value per month"
 * to better assess customer velocity and future potential.
 *
 * @param data An array of cleaned transaction objects.
 * @returns A sorted array of `CustomerLTV` objects, from highest to lowest `valuePerMonth`.
 */
export function calculateCustomerLTV(data: CleanedTransaction[]): CustomerLTV[] {
  const customerData = new Map<number, {
    totalVolume: number;
    minDate: Date | null;
    maxDate: Date | null;
  }>();

  for (const transaction of data) {
    const { customerId, transactionAmount, transactionDate: date } = transaction;
    const currentData = customerData.get(customerId) ?? {
      totalVolume: 0,
      minDate: null,
      maxDate: null,
    };

    currentData.totalVolume += transactionAmount;

    if (date) {
      if (!currentData.minDate || date < currentData.minDate) currentData.minDate = date;
      if (!currentData.maxDate || date > currentData.maxDate) currentData.maxDate = date;
    }
    
    customerData.set(customerId, currentData);
  }

  const ltvArray: CustomerLTV[] = [];
  for (const [customerId, data] of customerData.entries()) {
    let activeMonths = 0;
    if (data.minDate && data.maxDate) {
      const diffTime = Math.abs(data.maxDate.getTime() - data.minDate.getTime());
      activeMonths = Math.round(diffTime / (1000 * 60 * 60 * 24 * 30.44)) + 1;
    }

    const valuePerMonth = activeMonths > 0 ? data.totalVolume / activeMonths : data.totalVolume;

    ltvArray.push({
      customerId,
      totalVolume: data.totalVolume,
      activeMonths,
      valuePerMonth,
      firstTransactionDate: data.minDate,
      lastTransactionDate: data.maxDate,
    });
  }

  return ltvArray.sort((a, b) => b.valuePerMonth - a.valuePerMonth);
}