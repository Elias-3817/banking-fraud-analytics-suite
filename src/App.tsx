import { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { Activity, Users, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react'; 
import { parseTransactionData } from './services/dataParser';
import { validateAndFilterTransactions } from './services/dataValidator';
import {
  calculateCustomerLTV,
  detectAnomalousTransactions,
  getMonthlyVolumeByBranch,
} from './services/analytics';
import { CustomerLTV, Anomaly, RawTransaction } from './types';
import { formatCurrency } from './utils/formatters';
import { TopCustomersTable } from './components/topCustomersTable.tsx';
import { AnomalyMonitor } from './components/anomalyMonitorChart.tsx';
import { BranchPerformanceChart } from './components/branchPerformanceChart.tsx';
import { TransactionTrendChart } from './components/transactionTrendChart.tsx';
import { NewCustomerChart } from './components/newCustomerChart.tsx';
import './App.css';

interface AnalyticsData {
  customerLTVs: CustomerLTV[];
  anomalies: Anomaly[];
  branchVolume: Map<string, Map<string, number>>;
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAndProcessData() {
      try {
        const response = await fetch('/Comprehensive_Banking_Database.csv');
        if (!response.ok) throw new Error('Failed to fetch CSV data.');
        const csvText = await response.text();
        
        const rawRecords = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
        }).data as RawTransaction[];

        console.log('1. Parsing data...');
        const cleanedData = parseTransactionData(rawRecords);
        
        console.log('2. Validating data...');
        const { validTransactions } = validateAndFilterTransactions(cleanedData);

        console.log('3. Running analytics...');
        const customerLTVs = calculateCustomerLTV(validTransactions);
        const anomalies = detectAnomalousTransactions(validTransactions);
        const branchVolume = getMonthlyVolumeByBranch(validTransactions);

        setAnalyticsData({ customerLTVs, anomalies, branchVolume });
        setIsLoading(false);
        console.log('4. Data processing complete!');
      } catch (err: any) {
        console.error('Data pipeline error:', err);
        setError(err.message || 'Failed to load or process data.');
        setIsLoading(false);
      }
    }
    loadAndProcessData();
  }, []);

  const kpiValues = useMemo(() => {
    if (!analyticsData) return { totalVolume: 0, totalAnomalies: 0, totalCustomers: 0 };
    
    const totalVolume = Array.from(analyticsData.branchVolume.values())
      .flatMap(monthlyMap => Array.from(monthlyMap.values()))
      .reduce((sum, volume) => sum + volume, 0);

    return {
      totalVolume,
      totalAnomalies: analyticsData.anomalies.length,
      totalCustomers: analyticsData.customerLTVs.length,
    };
  }, [analyticsData]);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <h1>Initializing Nexus Engine...</h1>
        <p>Processing Transaction Stream</p>
      </div>
    );
  }
  
  if (error) {
    return <div className="loading-screen"><h1>System Error: {error}</h1></div>;
  }
  
  if (!analyticsData) {
    return <div className="loading-screen"><h1>No analytics data available.</h1></div>;
  }

  return (
    <div className="dashboard-container">
      {/* PROFESSIONAL HEADER */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>NEXUS <span className="light-text">INTELLIGENCE</span></h1>
          <p>Real-time Financial Risk Monitor</p>
        </div>
        <div className="header-right">
           <div className="status-indicator">
              <span className="dot"></span> System Live
           </div>
           <div className="user-avatar">EL</div>
        </div>
      </header>
      
      {/* KPI CARDS */}
      <section className="kpi-row">
        <div className="kpi-card">
            <div className="kpi-icon-wrapper"><DollarSign size={20} color="#2563eb" /></div>
          <h3>Total Volume (YTD)</h3>
          <p className="kpi-value">{formatCurrency(kpiValues.totalVolume)}</p>
        </div>
        <div className="kpi-card danger-card">
            <div className="kpi-icon-wrapper"><AlertTriangle size={20} color="#ef4444" /></div>
          <h3>Risk Anomalies</h3>
          <p className="kpi-value danger-text">{kpiValues.totalAnomalies}</p>
        </div>
        <div className="kpi-card">
            <div className="kpi-icon-wrapper"><Users size={20} color="#2563eb" /></div>
          <h3>Active Customers</h3>
          <p className="kpi-value">{kpiValues.totalCustomers}</p>
        </div>
      </section>

      {/* MAIN GRID */}
      <main className="dashboard-grid">
         <div className="grid-item span-2">
          <h2><AlertTriangle size={18} /> Risk & Anomaly Feed</h2>
          <AnomalyMonitor data={analyticsData.anomalies} />
        </div>
        <div className="grid-item">
          <h2><Users size={18} /> High-Velocity VIPs</h2>
         <TopCustomersTable data={analyticsData.customerLTVs} count={10} />
        </div>
        <div className="grid-item span-2">
          <h2><TrendingUp size={18} /> Branch Performance Leaderboard</h2>
          <BranchPerformanceChart data={analyticsData.branchVolume} />
        </div>
        <div className="grid-item">
          <h2><Activity size={18} /> Acquisition Trend</h2>
          <NewCustomerChart data={analyticsData.customerLTVs} />
        </div>
        
        <div className="grid-item">
          <h2><Activity size={18} /> Overall Transaction Trends</h2>
          <TransactionTrendChart data={analyticsData.branchVolume} />
        </div> 
      </main>
    </div>
  );
}

export default App;