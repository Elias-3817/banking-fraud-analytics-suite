import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

// Utility functions

//Returns _filename and __dirname for environment
export function getDirname() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  return { __filename, __dirname };
}

// Synchronously reads a CSV file and returns its raw string content
 export function loadCSV(filepath: string): string {
  try {
    const rawData = fs.readFileSync(filepath, 'utf8');
    return rawData;
  } catch (err) {
    console.error(`Error reading CSV at ${filepath}:`, err);
    throw err; // stop execution if CSV cannot be read
  }
}

// Parses CSV string into array of objects with header columns as keys
function parseCSV(rawData: string) {
  return parse(rawData, {
    columns: true,
    skip_empty_lines: true,
  });
}

// Logs basic column info and counts missing values per column
function columnOverview(records: any[]) {
  const cols = Object.keys(records[0]);
//console.log("Columns:", cols);
  console.log("Number of columns:", cols.length);


  const missingCounts: Record<string, number> = {};
  for (const row of records) {
    for (const col of cols) {
      const val = row[col];            // grab value
      const isMissing = !val || val.trim() === "";
      if (isMissing) {
        missingCounts[col] = (missingCounts[col] || 0) + 1;
      }
    }
  }
  console.log("Missing values per column:", missingCounts);
// return missingCounts
}


// Numeric summary: min, max, mean
function numericSummary(records: any[], columns: string[]) {
  for (const col of columns) {
    const nums = records.map(r => parseFloat(r[col])).filter(n => !isNaN(n)); // remove non-numeric or empty values
    if (nums.length === 0) continue;                                           //Skip non-numeric or empty values
    const sum = nums.reduce((a, b) => a + b, 0);
    const mean = sum / nums.length;
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    console.log(`Numeric summary for ${col}: min=${min}, max=${max}, mean=${mean.toFixed(2)}`);
  }
}

// Counts unique values for categorical columns
function categoricalSummary(records: any[], columns: string[]) {
  for (const col of columns) {
    const counts: Record<string, number> = {};
    records.forEach(r => counts[r[col]] = (counts[r[col]] || 0) + 1);
    console.log(`Categorical summary for ${col}:`, counts);
  }
}

// Finds earliest and latest dates in columns
function dateSummary(records: any[], columns: string[]) {
  for (const col of columns) {
    const dates = records.map(r => new Date(r[col])).filter(d => !isNaN(d.getTime()));
    if (dates.length === 0) continue;
    const earliest = new Date(Math.min(...dates.map(d => d.getTime())));
    const latest = new Date(Math.max(...dates.map(d => d.getTime())));
    console.log(`Date summary for ${col}: earliest=${earliest.toDateString()}, latest=${latest.toDateString()}`);
  }
}

// Counts number of unique numeric values
function numericUniqueCounts(records: any[], columns: string[]) {
  for (const col of columns) {
    const unique = new Set(records.map(r => r[col]));
    console.log(`Unique values for ${col}: ${unique.size}`);
  }
}

// Prints top N most frequent categorical values
function topNCategorical(records: any[], columns: string[], n = 5) {
  for (const col of columns) {
    const counts: Record<string, number> = {};
    records.forEach(r => counts[r[col]] = (counts[r[col]] || 0) + 1);
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    console.log(`Top ${n} values for ${col}:`, sorted.slice(0, n));
  }
}

// Checks for negative numbers in numeric columns (important for balances)
function checkNegatives(records: any[], columns: string[]) {
  for (const col of columns) {
    const negatives = records.filter(r => parseFloat(r[col]) < 0);
    if (negatives.length > 0) {
      console.log(`Column ${col} has ${negatives.length} negative values`);
    }
  }
}

// Calculates pairwise correlation between numeric columns
function simpleCorrelation(records: any[], columns: string[]) {
  const nums: number[][] = columns.map(col =>
    records.map(r => parseFloat(r[col]) || 0)
  );

  console.log("Numeric correlations (pairwise):");
  for (let i = 0; i < columns.length; i++) {
    for (let j = i + 1; j < columns.length; j++) {
      const xi = nums[i];
      const xj = nums[j];
      if (!xi || !xj || xi.length === 0 || xj.length === 0) {
        console.log(`${columns[i]} vs ${columns[j]}: insufficient data`);
        continue;
      }
      const meanXi = xi.reduce((a, b) => a + b, 0) / xi.length;
      const meanXj = xj.reduce((a, b) => a + b, 0) / xj.length;
      const cov = xi.map((v, k) => xj[k] !== undefined ? (v - meanXi) * (xj[k] - meanXj) : 0).reduce((a, b) => a + b, 0) / xi.length;
      const stdXi = Math.sqrt(xi.map(v => (v - meanXi) ** 2).reduce((a, b) => a + b, 0) / xi.length);
      const stdXj = Math.sqrt(xj.map(v => (v - meanXj) ** 2).reduce((a, b) => a + b, 0) / xj.length);
      const corr = cov / (stdXi * stdXj);
      console.log(`${columns[i]} vs ${columns[j]}: ${corr.toFixed(2)}`);
    }
  }
}



// Main function: orchestrates loading, parsing, and all summaries
function main() {
  const { __dirname } = getDirname();
  const filepath = join(__dirname, '../data/Comprehensive_Banking_Database.csv');

  // Load CSV
  const rawData = loadCSV(filepath);

  // Parse CSV
  const records = parseCSV(rawData); //5000 rows


   columnOverview(records); // 0 missing values and 40 columns

   numericSummary(records,[
    "Age", "Account Balance", "Transaction Amount", 
    "Account Balance After Transaction", "Loan Amount", 
    "Interest Rate", "Credit Limit", "Credit Card Balance", 
    "Minimum Payment Due", "Rewards Points"
    ]);

    categoricalSummary(records, [
    "Gender", "Account Type", "Transaction Type", 
    "Loan Type", "Loan Status", "Card Type", 
    "Feedback Type", "Resolution Status"
  ]);

   dateSummary(records, [
    "Date Of Account Opening", "Last Transaction Date", 
    "Transaction Date", "Approval/Rejection Date", 
    "Last Credit Card Payment Date", "Feedback Date", 
    "Resolution Date"
  ]);

  numericUniqueCounts(records, ["Account Balance After Transaction", "Transaction Amount", "Loan Amount"]);
  topNCategorical(records, ["Gender", "Account Type", "Transaction Type"], 5);
  checkNegatives(records, ["Account Balance After Transaction", "Transaction Amount", "Loan Amount"]);
  simpleCorrelation(records, ["Age","Account Balance","Transaction Amount"]);
}
// main();
