import type { CleanedTransaction } from './dataParser.js';

export interface ValidationResult {
    validTransactions: CleanedTransaction[];
    invalidRecordCount: number;
    errorLog: string[];
}

interface CustomerReferencePoint {
    age: number;
    date: Date;
}


export function validateAndFilterTransactions(transactions: CleanedTransaction[]): ValidationResult {
    const errorLog: string[] = [];
    const customerReferencePoints = new Map<number, CustomerReferencePoint>();

    // This first loop builds the age reference map.
    for (const transaction of transactions) {
        // We only care about transactions that have a valid date to establish a reference point.
        if (transaction.transactionDate) {
            const customerId = transaction.customerId;
            const currentReference = customerReferencePoints.get(customerId);

            // Set the reference point to the transaction with the earliest date.
            if (!currentReference || (transaction.transactionDate < currentReference.date)) {
                customerReferencePoints.set(customerId, {
                    age: transaction.customerAge,
                    date: transaction.transactionDate,
                });
            }
        }
    }

    const validTransactions = transactions.filter(transaction => {
        const { 
            customerId, 
            customerAge, 
            transactionType, 
            transactionAmount, 
            transactionDate, 
            accountBalance, 
            balanceAfterTransaction 
        } = transaction;
        
        // Check for a valid date first. 
        if (!transactionDate) {
            const reason = `Invalid Record (ID: ${customerId}): Missing or invalid transaction date.`;
            errorLog.push(reason);
            return false;
        }

        if (customerAge < 18 || customerAge > 120) {
            const reason = `Invalid Record (ID: ${customerId}): Age ${customerAge} is outside the valid range (18-120).`;
            errorLog.push(reason);
            return false;
        }

        if (transactionAmount <= 0) {
            const reason = `Invalid Record (ID: ${customerId}): Transaction amount is not positive (${transactionAmount}).`;
            errorLog.push(reason);
            return false;
        }

        const type = transactionType.toLowerCase();

        if (type === 'deposit') {
            const expectedBalance = accountBalance + transactionAmount;
            if (Math.abs(balanceAfterTransaction - expectedBalance) > 0.01) {
                const reason = `Invalid Record (ID: ${customerId}): Balance after deposit (${balanceAfterTransaction}) does not match ${accountBalance} + ${transactionAmount} = ${expectedBalance}.`;
                errorLog.push(reason);
                return false;
            }
        } else if (type === 'withdrawal') {
            const expectedBalance = accountBalance - transactionAmount;
            if (Math.abs(balanceAfterTransaction - expectedBalance) > 0.01) {
                const reason = `Invalid Record (ID: ${customerId}): Balance after withdrawal (${balanceAfterTransaction}) does not match ${accountBalance} - ${transactionAmount} = ${expectedBalance}.`;
                errorLog.push(reason);
                return false;
            }
        } else if (type === 'transfer') {
            const plus = accountBalance + transactionAmount;
            const minus = accountBalance - transactionAmount;
            if (Math.abs(balanceAfterTransaction - plus) > 0.01 && Math.abs(balanceAfterTransaction - minus) > 0.01) {
                const reason = `Invalid Record (ID: ${customerId}): Balance after transfer (${balanceAfterTransaction}) is not consistent with ${accountBalance} ± ${transactionAmount}.`;
                errorLog.push(reason);
                return false;
            }
        } else {
            const reason = `Invalid Record (ID: ${customerId}): Unknown transaction type '${transactionType}'.`;
            errorLog.push(reason);
            return false;
        }

        const reference = customerReferencePoints.get(customerId);
        if (reference) { 
            const yearsPassed = (transactionDate.getTime() - reference.date.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
            const expectedAge = reference.age + Math.floor(yearsPassed);

            if (Math.abs(customerAge - expectedAge) > 1) {
                const reason = `Invalid Record (ID: ${customerId}): Inconsistent age. Expected ~${expectedAge}, but found ${customerAge}.`;
                errorLog.push(reason);
                return false;
            }
        }

        return true;
    });

    if (errorLog.length > 0) {
        console.warn(`[Data Validator] Found ${errorLog.length} invalid records.`);
    }

    return {
        validTransactions,
        invalidRecordCount: transactions.length - validTransactions.length,
        errorLog,
    };
}