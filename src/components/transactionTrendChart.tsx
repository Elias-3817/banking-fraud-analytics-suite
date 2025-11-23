import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Label } from 'recharts';
import { formatLargeNumber, formatMonth } from '../utils/formatters.ts';


interface TransactionTrendChartProps {
  data: Map<string, Map<string, number>>;
}

export function TransactionTrendChart({ data }: TransactionTrendChartProps) {
  const chartData = useMemo(() => {
    const monthlyTotals: { [month: string]: number } = {};
    
    for (const monthlyMap of data.values()) {
      for (const [month, volume] of monthlyMap.entries()) {
        monthlyTotals[month] = (monthlyTotals[month] || 0) + volume;
      }
    }

    return Object.entries(monthlyTotals)
      .map(([month, volume]) => ({ month, volume }))
      .sort((a, b) => a.month.localeCompare(b.month)); // Sort chronologically
  }, [data]);

   return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 40, bottom: 20 }}>
        <XAxis dataKey="month" tickFormatter={formatMonth}>
           <Label value="Month" offset={-15} position="insideBottom" />
        </XAxis>
        <YAxis tickFormatter={formatLargeNumber}>
           <Label value="Total Volume (KES)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
        </YAxis>
        <Tooltip formatter={(value: number) => [new Intl.NumberFormat().format(value), 'Total Volume']} />
        <Line type="monotone" dataKey="volume" stroke="var(--accent-color)" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};
