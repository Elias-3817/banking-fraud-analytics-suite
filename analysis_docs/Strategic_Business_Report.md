# Strategic Business Report

This document outlines the data analysis and aggregation strategies used to answer key business questions for senior management. The approach for each question is designed to transform raw, transactional data into clear, actionable business intelligence. The proposed visualizations are chosen to effectively communicate these findings.

## 1. Identifying Underperforming Branches

**Strategy**:
To identify underperforming branches, a multi-metric approach is necessary to provide a balanced view. Relying on a single metric can be misleading.

1. Aggregate Core Metrics: First, I would group all valid transactions by `branchCode`. For each branch, I would calculate three key performance indicators (KPIs):

    - **Total Transaction Volume**: The sum of all `transactionAmount`s. This is the primary indicator of economic activity.

    - **Total Transaction Count**: The total number of transactions. This measures customer traffic and engagement.

    - New Customer Acquisition: The count of unique customers whose `accountOpeningDate` falls within a recent period (e.g., the last 12 months), grouped by branch.    This                measures branch growth.

2. **Rank and Compare**: After calculating these KPIs for all branches, I would rank the branches for each metric. An underperforming branch is one that consistently ranks in the bottom quartile (bottom 25%) across these multiple KPIs, particularly Total Volume and New Customer Acquisition.


**Visualization**: A multi-metric scatter plot or a ranked bar chart.

**Details**: For a scatter plot, the X-axis would be Total Transaction Volume and the Y-axis would be New Customer Acquisition, with each bubble representing a branch. This would quickly reveal branches that have low volume and low growth. A simple ranked bar chart, as described in  [*Q7_Visualizations_Rationale*](../analysis_docs/Q7_Visualizations_Rationale.md) , also effectively highlights the underperforming branches.



## 2. Segmenting High-Value Customers

**Strategy**:
Identifying high-value customers requires looking beyond simple historical totals and considering the velocity and potential of their economic activity.

1. **Calculate Tenure-Normalized Value**: As implemented in the `calculateCustomerLTV` function in  [*Analytics.ts*](../src/services/analytics.ts) , I will group all transactions by `customerId`. For each customer, I will calculate:

    - **Total Transaction Volume**: The historical sum of their transactions.

    - `valuePerMonth`: The Total Volume normalized by the customer's active tenure in months. This metric is a powerful proxy for a customer's current and future potential value, eg., A customer who's been at the company for 10 years and LTV is 2,000,000 would have a value per month worth 16,666. While one who joined 10 months ago with a similar LTV would have 200,000

2. **Segment into Tiers**: Using the calculated valuePerMonth, I will segment customers into tiers (e.g., Platinum, Gold, Silver, Bronze) using percentile-based ranking. For example:

    - **Platinum Tier (Top 5%)**: These are the most valuable, highest-velocity clients.

    - **Gold Tier (Next 15%)**: High-potential clients.

    - The remaining customers would be segmented accordingly.


**Visualization**: The "Top 50 High-Value Customers" Table, as designed in [*Q7_Visualizations_Rationale*](../analysis_docs/Q7_Visualizations_Rationale.md).

**Details**: This table is the direct, actionable output of this segmentation strategy. It would be sorted by valuePerMonth and would list the customer ID, their tier, and other relevant details, providing a clear list for the bank's premium client and retention teams.

## 3. Finding Seasonal Trends in Banking Activity

**Strategy:**
To identify seasonal trends, transaction data must be aggregated over a consistent time series and analyzed for recurring patterns.

1. **Aggregate by Time Period:** Using the `getMonthlyVolumeByBranch` logic as a foundation in [*Analytics.ts*](../src/services/analytics.ts), I would aggregate the `Transaction Amount` and `Transaction Count` for the entire bank across a monthly time series.

2. **Analyze for Cyclical Patterns:** I would analyze this time-series data to identify recurring peaks and troughs. For example, a consistent spike in transaction volume every December would indicate a strong holiday spending trend. A dip every February might be a predictable post-holiday slowdown.

3. **Deeper Analysis:** For a more granular view, I would further segment this trend data by Transaction Type (e.g., are deposits or withdrawals driving the seasonal trend?) and by Branch ID to see if seasonality affects all regions equally.

**Visualization**: The "Transaction Trends Over Time" Line Chart, as designed in  [*Q7_Visualizations_Rationale*](../analysis_docs/Q7_Visualizations_Rationale.md)

**Details**: This chart is the ideal tool for visualizing seasonality. The X-axis would represent time (months), and the Y-axis would represent Total Transaction Volume. The resulting line graph would clearly illustrate any cyclical patterns, enabling management to make data-driven decisions about staffing, marketing campaigns, and cash flow management.



## STRATEGY VALIDATION & PROOF OF CONCEPT

To prove the effectiveness of the anomaly detection strategy, a test was conducted using a modified version of the dataset provided where the first three transactions were edited to have anomalously high values while remaining mathematically valid. The [*Analytics.test.ts*](../src/services/analytics.test.ts) script was then executed to process the data.

The following console output confirms that the detectAnomalousTransactions function successfully identified and flagged these records as new-customer-high-value anomalies, demonstrating that the hybrid detection model is working as designed.

The raw output is a Map data structure, which would be formatted into a clean table or chart in the final UI.

## CONSOLE OUTPUT:

```bash
--- Loading and Preparing Data ---
[Data Validator] Found 1706 invalid records.
Found 3294 valid transactions to analyze.

--- Running Analytics Functions ---

[ANOMALY] Customer 1 (New): First transaction of 200000.00 exceeds global threshold of 150000.00.
[ANOMALY] Customer 2 (New): First transaction of 250000.00 exceeds global threshold of 150000.00.
[ANOMALY] Customer 3 (New): First transaction of 180000.00 exceeds global threshold of 150000.00.
======================================
        Analytics Report
======================================

--- Monthly Volume by Branch (Sample) ---
Sample data for Branch ID: 43
Map(10) {
  '2023-12' => 203958.46,
  '2023-07' => 7972.21,
  '2023-01' => 20523.14,
  '2023-02' => 14978.07,
  '2023-11' => 11864.93,
  '2023-10' => 9409.669999999998,
  '2023-08' => 15271.41,
  '2023-05' => 17630.61,
  '2023-09' => 4402.89,
  '2023-04' => 4598.86
}
--------------------------------------

--- Anomaly Detection Report ---
Total anomalous transactions found: 3
Sample Anomalies (first 5):
- [new-customer-high-value] Customer 1 (New): First transaction of 200000.00 exceeds global threshold of 150000.00.
- [new-customer-high-value] Customer 2 (New): First transaction of 250000.00 exceeds global threshold of 150000.00.
- [new-customer-high-value] Customer 3 (New): First transaction of 180000.00 exceeds global threshold of 150000.00.
--------------------------------------

--- Customer LTV Report ---
Calculated LTV for 3294 customers.
Top 5 Customers by Value Per Month:
- Customer ID: 2, Value/Month: KES 250000.00, Total Volume: KES 250000.00 (1 months)
- Customer ID: 1, Value/Month: KES 200000.00, Total Volume: KES 200000.00 (1 months)
- Customer ID: 3, Value/Month: KES 180000.00, Total Volume: KES 180000.00 (1 months)
- Customer ID: 2817, Value/Month: KES 4998.29, Total Volume: KES 4998.29 (1 months)
- Customer ID: 1137, Value/Month: KES 4998.12, Total Volume: KES 4998.12 (1 months)
```