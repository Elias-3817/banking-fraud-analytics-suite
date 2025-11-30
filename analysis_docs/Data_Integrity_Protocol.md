# Strategy for Handling Data Quality Issues
This document outlines the strategies for identifying and handling three key data quality issues as required by the challenge.


## 1. A single customer has different ages recorded across transactions
**Strategy**: A simple check for age differences is insufficient, as a customer's age should legitimately increase over time. A more robust, time-aware validation model is required.

My strategy involves a two-pass approach:
- Establish an Anchor Point: In the first pass, I iterate through all transactions to find the earliest recorded transaction for each unique Customer ID. This record's age and date become the trusted "anchor point" for that customer.

- Calculate and Validate Expected Age: In the second pass, for every transaction, I calculate the years that have passed between its date and the customer's anchor date. This is used to compute an expectedAge. The transaction is flagged as inconsistent only if the recorded customerAge differs from the expectedAge by more than one year, which allows for birthdays.

Code Snippet 

```TypeScript
// Inside a filter loop for each transaction:
const reference = customerReferencePoints.get(customerId); // Get the anchor point
if (reference && transactionDate) {
    const yearsPassed = (transactionDate.getTime() - reference.date.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    const expectedAge = reference.age + Math.floor(yearsPassed);

    // If the difference is greater than 1, it's a true inconsistency.
    if (Math.abs(customerAge - expectedAge) > 1) {
        // Flag record as invalid
    }
}
```

## 2. The account balance does not mathematically reconcile

**Strategy**: To verify account balance reconciliation, transactions must be processed sequentially for each customer.
My high-level design for this is as follows:

- Group and Sort: First, group all transactions by Customer ID, then sort each customer's transactions chronologically by Transaction Date.

- Iterative Check: Iterate through the sorted transactions for each customer, starting from the second record. For each transaction, apply the formula: previous_balance + (transaction_amount * transaction_direction) where direction is +1 for deposits and -1 for withdrawals/transfers.

- Flag on Mismatch: If the calculated balance does not match the Account Balance recorded in the current transaction (allowing for a small epsilon for floating-point inaccuracies), the transaction is flagged for review.

```Typescript
const signedAmount = transaction.type === 'deposit' 
    ? transaction.amount 
    : -transaction.amount;

const expectedBalance = prevBalance + signedAmount;

if (Math.abs(expectedBalance - transaction.balance) > 0.01) {
    // Flag as mismatch
}
```

## 3. Duplicate transaction records are present
**Strategy**: The most effective way to handle duplicates is to define a unique signature for each transaction and filter out any subsequent records with the same signature.
My design is as follows:

- Define Uniqueness: A duplicate is defined as a record with the same Customer ID, Transaction Date, Transaction Type, and Transaction Amount.

- Create a Composite Key: For each transaction, create a unique string-based key by concatenating these core fields (e.g., "123-2023-05-15T10:00:00Z-50.75-withdrawal").

- Track and Filter: Iterate through the dataset. Store the key of each transaction in a Set. If a key is encountered that already exists in the Set, that record is a duplicate and is filtered out.

## 4. Extra duplicate enhancement
**Strategy**: In real banking data, near-duplicates may occur if the same transaction is logged multiple times within a short window.

**Example**: Same customer, same amount, timestamps within a small window (e.g., 5 seconds).

**Solution**: After sorting by date, compare each transaction with its neighbor. If both conditions hold, flag as fuzzy duplicates.

```Typescript
if (
    customerId === prev.customerId &&
    Math.abs(amount - prev.amount) <= 0.01 &&
    Math.abs(date.getTime() - prev.date.getTime()) <= 5000
) {
    // Fuzzy duplicate detected
}
```