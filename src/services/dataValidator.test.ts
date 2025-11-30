
import path from 'path';
import { parse } from 'csv-parse/sync';
import { parseTransactionData, RawTransaction } from './dataParser.js';
import { validateAndFilterTransactions } from './dataValidator.js';
import { getDirname, loadCSV } from '../../eda/eda.js'; 

async function main() {
  //  Get directory 
  const { __dirname } = getDirname();

  //  Build path to the CSV 
  const csvPath = path.join(__dirname, '../data/Comprehensive_Banking_Database.csv');

  // Load CSV as string 
  const rawCsv = loadCSV(csvPath); 

  //  Parse CSV string into RawTransaction
  const rawRecords = parse(rawCsv, {
    columns: true,
    skip_empty_lines: true,
  }) as RawTransaction[];

  //  Convert rawRecords -> CleanedTransaction[] using our parser
  const cleaned = parseTransactionData(rawRecords);

  // Validate & filter (returns ValidationResult)
  const result = validateAndFilterTransactions(cleaned);

  //  Report
  console.log('==== Validation Report ====');
  console.log(`Valid transactions: ${result.validTransactions.length}`);
  console.log(`Invalid records: ${result.invalidRecordCount}`);
  console.log('Sample Errors:', result.errorLog.slice(0, 10));
}

main().catch(err => {
  console.error('Error running validator test:', err);
  process.exit(1);
});
