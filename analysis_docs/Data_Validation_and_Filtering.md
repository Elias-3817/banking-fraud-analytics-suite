# Data Validator Module 
This document outlines the validation process applied to the transaction dataset. The goal was to filter out invalid records and produce a high-quality, reliable dataset for analysis.

## Validation Criteria
The validator module enforces several key rules to ensure data integrity. Invalid records are logged with specific error messages and excluded from the final dataset.

- **Age Range**: Customer age must be within the logical range of 18 to 120 years.

- **Positive Transaction Amount**: All transaction amounts (deposits, withdrawals, and transfers) must be positive values greater than zero.

- **Balance Reconciliation**: The `balanceAfterTransaction` must logically follow from the `accountBalance` and `transactionAmount`.

    - Deposits: `accountBalance` + `transactionAmount` = `balanceAfterTransaction`

    - Withdrawals: `accountBalance` - `transactionAmount` = `balanceAfterTransaction`

    - A 0.01 tolerance is used to handle potential floating-point rounding differences. This is especially useful in an ideal situation with varied currencies that use cents. In a purely Kenyan context where cents aren't typically used, this check would be less critical but remains a good practice for robust financial data handling.

- **Age Consistency**: A customer's age must progress logically over time. The validator uses a customer's first transaction as a reference point and verifies the age in subsequent records against the time elapsed.

The complete validation logic is implemented in the [src/services/datavalidator.ts](../src/services/dataValidator.ts) file.

## Testing and Results
The validator was executed against the full dataset of 5,000 records using a test script.

The validation process identified 1,705 invalid records, retaining 3,295 valid transactions for analysis.

The full test script can be found in [src/services/dataValidator.test.ts.](../src/services/dataValidator.test.ts)


Sample Errors from the Test Run:
```
  'Invalid Record (ID: 1): Balance after withdrawal (2770.99) does not match 1313.38 - 1457.61 = -144.2299999999998.',
  'Invalid Record (ID: 3): Balance after deposit (7437.97) does not match 8277.88 + 839.91 = 9117.789999999999.',
  'Invalid Record (ID: 4): Balance after withdrawal (12396.1) does not match 7487.21 - 4908.89 = 2578.3199999999997.',
  'Invalid Record (ID: 7): Balance after deposit (470.82) does not match 4005.72 + 3534.9 = 7540.62.',
  'Invalid Record (ID: 8): Balance after deposit (1003.58) does not match 1458.45 + 454.87 = 1913.3200000000002.',
  'Invalid Record (ID: 11): Balance after withdrawal (7239.88) does not match 5930.75 - 1309.13 = 4621.62.',
  'Invalid Record (ID: 17): Age 5 is outside the valid range (18-120).',
  'Invalid Record (ID: 18): Balance after deposit (5678.32) does not match 9012.31 + 3333.99 = 12346.3.',
  'Invalid Record (ID: 20): Balance after deposit (-738.93) does not match 194.36 + 933.29 = 1127.65.',
  'Invalid Record (ID: 23): Balance after deposit (536.82) does not match 829.7 + 292.88 = 1122.58.'
```
## Summary
The validation module successfully filters the dataset based on the defined criteria. The transparent error logging clearly documents why each record was discarded, ensuring the final validTransactions dataset is both clean and reliable.