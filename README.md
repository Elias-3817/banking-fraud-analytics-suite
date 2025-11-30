# Banking Analytics Suite

A specialized financial intelligence platform designed to ingest high-volume transaction data, detect fraud anomalies in real-time, and calculate Customer Lifetime Value (LTV).

This project simulates a modern FinTech dashboard environment, featuring a robust ETL (Extract, Transform, Load) pipeline built entirely in TypeScript, coupled with a reactive frontend for immediate business insight.

## 📊 Dashboard Overview

### 🚀 Key System Capabilities

### 1. Defensive Data Ingestion & ETL

Financial data is rarely perfect. This system implements a strict "Defensive Coding" strategy to handle the realities of dirty banking data.

ACID-Compliance Simulation: [DataValidator.ts](/src/services/dataValidator.ts) enforces strict logical consistency, ensuring account balances reconcile mathematically with transaction history before data enters the store.

Floating Point Sanitization: Handles JavaScript's native floating-point math errors (e.g., 0.1 + 0.2 !== 0.3) to ensure cent-level accuracy in financial reporting.

Edge Case Resolution: Automatically isolates duplicate transactions and future-dated timestamp errors.

[📄 Read the Data Integrity Protocol](/analysis_docs/Data_Integrity_Protocol.md)

### 2. Algorithmic Fraud Detection

The core engine moves beyond simple threshold checks, utilizing statistical analysis to flag risk.

Anomaly Detection: Implements a custom outlier detection algorithm (utilizing Standard Deviation and Z-Scores) to flag high-velocity transactions that deviate from a customer's historical behavior.

Pattern Recognition: Identifies "Structure of Funds" patterns, such as rapid-fire micro-transactions often associated with money laundering or account takeovers.

### 3. Customer Value Modeling

LTV Calculation: The system computes Customer Lifetime Value dynamically, segmenting users into "High Velocity" and "Dormant" cohorts to aid marketing retention strategies.

[📄 View the Strategic Business Report](/analysis_docs/Strategic_Business_Report.md)

## 🏗 Architecture & Performance

High-Volume Optimization

Processing 10,000+ transaction rows in the browser requires optimized memory management.

Stream-Based Processing: The architecture mimics server-side streams to process CSV data row-by-row, preventing heap overflows.

O(1) Lookups: Utilizes HashMaps and Sets for customer ID referencing, reducing complexity from O(n²) to O(n) for validation routines.

[📄 Read the Performance Architecture](/analysis_docs/Performance_Architecture.md)

System Design RFC (Real-Time Scaling)

While the current iteration uses batch processing, the system includes a complete Request for Comments (RFC) for scaling to a WebSocket-driven architecture using Apache Druid for sub-second latency.

[📄 View the System Design RFC](/analysis_docs/System_Design.md)

## 🛠 Tech Stack

- Frontend Core: React 18, TypeScript

- Build Tooling: Vite

- Visualization: Recharts (Customized for financial time-series data)

- Data Parsing: Papaparse (Configured for web workers)

- Testing: Vitest / tsx

## 💻 Setup & Installation

To run the analytics suite locally:

### 1. Clone the repository
git clone [https://github.com/hf-analytics/nexus-banking-suite.git](https://github.com/hf-analytics/nexus-banking-suite.git)

### 2. Install dependencies
npm install

### 3. Launch the Intelligence Dashboard
npm run dev

 *Dashboard will launch at http://localhost:5173*


## Running the Validation Suite

The repository includes a suite of test scripts to verify the integrity of the financial calculations.

### Run the Data Validator integrity check
[npx tsx src/services/dataValidator.test.ts](/src/services/dataValidator.test.ts)

### Run the Analytics Engine calculations
[npx tsx src/services/analytics.test.ts](/src/services/analytics.ts)


## 🔮 Roadmap

- v2.0: Implementation of global context slicers (Date Range, Branch ID).

- Security: Role-Based Access Control (RBAC) integration for separating "Branch Manager" vs. "HQ Executive" views.

- Interactivity: Drill-down logic for the "Branch Volume Leaderboard" to inspect specific transaction logs.

🔗 Live Demo

Launch Live Dashboard
(Note: Data is mocked for demonstration purposes)