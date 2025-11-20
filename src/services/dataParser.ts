
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

export function parseAmount(amount: string | null | undefined): number {
    if (!amount) {
        console.warn(`[Data Parser] Invalid amount found: "${amount}". Defaulting to 0.`);
        return 0;
    }
    const cleanedString = amount.replace(/[^0-9.-]+/g, "");
    if (cleanedString === "") {
        console.warn(`[Data Parser] Invalid amount found: "${amount}". Defaulting to 0.`);
        return 0;
    }
    const value = parseFloat(cleanedString);
    if (isNaN(value)) {
        console.warn(`[Data Parser] Could not parse amount from: "${amount}". Defaulting to 0.`);
        return 0;
    }
    return value;
}

export function normalizeGender(gender: string | null | undefined): 'Male' | 'Female' | 'Other' {
    if (!gender) {
        return 'Other';
    }
    const lowerGender = gender.toLowerCase().trim();
    switch (lowerGender) {
        case 'm':
        case 'male':
            return 'Male';
        case 'f':
        case 'female':
            return 'Female';
        default:
            return 'Other';
    }
}

export function parseDate(dateString: string | null | undefined): Date | null {
    if (!dateString) {
        return null;
    }
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
}

export function parseTransactionData(rawData: RawTransaction[]): CleanedTransaction[] {
    return rawData.map(record => {
        const customerId = parseInt(record['Customer ID'], 10);
        const customerAge = parseInt(record['Age'], 10);

        if (isNaN(customerId)) {
            console.warn(`[Data Parser] Invalid Customer ID found: "${record['Customer ID']}". Defaulting to 0.`);
        }
        if (isNaN(customerAge)) {
            console.warn(`[Data Parser] Invalid Age found: "${record['Age']}". Defaulting to 0.`);
        }

        return {
            customerId: isNaN(customerId) ? 0 : customerId,
            transactionDate: parseDate(record['Transaction Date']),
            transactionType: record['Transaction Type'] || 'Unknown',
            transactionAmount: parseAmount(record['Transaction Amount']),
            accountBalance: parseAmount(record['Account Balance']),
            customerAge: isNaN(customerAge) ? 0 : customerAge,
            customerGender: normalizeGender(record['Gender']),
            accountType: record['Account Type'] || 'Unknown',
            branchCode: record['Branch ID'] || 'Unknown', 
            accountOpeningDate: parseDate(record['Date Of Account Opening']),
            balanceAfterTransaction: parseAmount(record['Account Balance After Transaction'])
        };
    });
}