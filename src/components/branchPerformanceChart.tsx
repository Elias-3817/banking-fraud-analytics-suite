import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Label } from 'recharts';
import { formatLargeNumber } from '../utils/formatters';

interface BranchPerformanceChartProps {
  data: Map<string, Map<string, number>>;
}

export function BranchPerformanceChart({ data }: BranchPerformanceChartProps) {
  const chartData = useMemo(() => {
    // This is the logic that was missing.
    // 1. Create an empty array to hold the chart data.
    const branchTotals: { name: string; volume: number }[] = [];
    
    // 2. Loop through the Map from our analytics.
    for (const [branchCode, monthlyMap] of data.entries()) {
      // 3. For each branch, sum up all the monthly volumes.
      const totalVolume = Array.from(monthlyMap.values()).reduce((sum, volume) => sum + volume, 0);
      branchTotals.push({ name: branchCode, volume: totalVolume });
    }
    
    // 4. Sort the results to create the leaderboard effect.
    return branchTotals.sort((a, b) => b.volume - a.volume);
  }, [data]); // The hook re-runs only when the main data changes.

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 40, left: 20, bottom: 20 }}>
        <XAxis type="number" tickFormatter={formatLargeNumber}>
          <Label value="Total Volume (KES)" offset={-15} position="insideBottom" />
        </XAxis>
        <YAxis type="category" dataKey="name" width={80}>
          <Label value="Branch ID" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
        </YAxis>
        <Tooltip formatter={(value: number) => [new Intl.NumberFormat().format(value), 'Total Volume']} />
        <Bar dataKey="volume" fill="var(--accent-color)" />
      </BarChart>
    </ResponsiveContainer>
  );
}