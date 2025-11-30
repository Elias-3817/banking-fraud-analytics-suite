
import path from 'path';
import { parse } from 'csv-parse/sync';
import { parseTransactionData, RawTransaction } from './dataParser.js';
import { validateAndFilterTransactions } from './dataValidator.js';
import {
    getMonthlyVolumeByBranch,
    detectAnomalousTransactions,
    calculateCustomerLTV,
} from './analytics.js';
import { getDirname, loadCSV } from '../../eda/eda.js'; 

async function main() {
    //  Data Loading and Preparation 
    console.log('--- Loading and Preparing Data ---');
    const { __dirname } = getDirname();
    const csvPath = path.join(__dirname, '../data/Comprehensive_Banking_Database.csv');
    const rawCsv = loadCSV(csvPath);

    const rawRecords = parse(rawCsv, {
        columns: true,
        skip_empty_lines: true,
    }) as RawTransaction[];

    const cleanedData = parseTransactionData(rawRecords);
    const { validTransactions } = validateAndFilterTransactions(cleanedData);
    console.log(`Found ${validTransactions.length} valid transactions to analyze.\n`);

    // Run Analytics Functions 
    console.log('--- Running Analytics Functions ---\n');

    // Test getMonthlyVolumeByBranch
    const branchVolume = getMonthlyVolumeByBranch(validTransactions);
    
    // Test detectAnomalousTransactions
    const anomalies = detectAnomalousTransactions(validTransactions, {
        firstTransactionThreshold: 150_000,
        historyThreshold: 5,
    });

    // Test calculateCustomerLTV
    const customerLTVs = calculateCustomerLTV(validTransactions);

    // Generate Reports 
    console.log('======================================');
    console.log('        Analytics Report');
    console.log('======================================\n');

    // Report for Monthly Volume by Branch
    console.log('--- Monthly Volume by Branch (Sample) ---');
    const firstBranchCode = branchVolume.keys().next().value;
    if (firstBranchCode) {
        const sampleBranchData = branchVolume.get(firstBranchCode);
        console.log(`Sample data for Branch ID: ${firstBranchCode}`);
        console.log(sampleBranchData);
    }
    console.log('--------------------------------------\n');

    // Report for Anomaly Detection
    console.log('--- Anomaly Detection Report ---');
    console.log(`Total anomalous transactions found: ${anomalies.length}`);
    console.log('Sample Anomalies (first 5):');
    anomalies.slice(0, 5).forEach(anomaly => {
        console.log(`- [${anomaly.type}] ${anomaly.reason}`);
    });
    console.log('--------------------------------------\n');
    
    // Report for Customer LTV
    console.log('--- Customer LTV Report ---');
    console.log(`Calculated LTV for ${customerLTVs.length} customers.`);
    console.log('Top 5 Customers by Value Per Month:');
    customerLTVs.slice(0, 5).forEach(customer => {
        console.log(
            `- Customer ID: ${customer.customerId}, Value/Month: KES ${customer.valuePerMonth.toFixed(2)}, Total Volume: KES ${customer.totalVolume.toFixed(2)} (${customer.activeMonths} months)`
        );
    });
    console.log('--------------------------------------\n');
}

main().catch(err => {
    console.error('Error running analytics test:', err);
    process.exit(1);
});