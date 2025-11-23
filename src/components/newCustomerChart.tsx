import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Label } from 'recharts';
import { formatMonth } from '../utils/formatters.ts';
import { CustomerLTV } from '../types';

interface NewCustomerChartProps {
  data: CustomerLTV[];
}

export function NewCustomerChart({ data }: NewCustomerChartProps) {
  const chartData = useMemo(() => {
    const monthlyNewCustomers: { [month: string]: number } = {};

    for (const customer of data) {
      if (customer.firstTransactionDate) {
        const date = customer.firstTransactionDate;
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const monthKey = `${year}-${month}`;
        
        monthlyNewCustomers[monthKey] = (monthlyNewCustomers[monthKey] || 0) + 1;
      }
    }

    return Object.entries(monthlyNewCustomers)
      .map(([month, count]) => ({ month, "New Customers": count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
        <XAxis dataKey="month" tickFormatter={formatMonth}>
           <Label value="Month" offset={-15} position="insideBottom" />
        </XAxis>
        <YAxis allowDecimals={false}>
          <Label value="Count of New Customers" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
        </YAxis>
        <Tooltip />
        <Bar dataKey="New Customers" fill="var(--accent-color)" />
      </BarChart>
    </ResponsiveContainer>
  );
}