import { CustomerLTV } from '../types'; // Import from the central types file
import { formatCurrency } from '../utils/formatters';

interface TopCustomersTableProps {
  data: CustomerLTV[];
  count?: number;
}

export function TopCustomersTable({ data, count = 10 }: TopCustomersTableProps) {
  const topCustomers = data.slice(0, count);

  if (!topCustomers || topCustomers.length === 0) {
    return <p>No customer data available.</p>;
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Customer ID</th>
            <th>Value per Month</th>
            <th>Total Volume</th>
            <th>Active Months</th>
          </tr>
        </thead>
        <tbody>
          {topCustomers.map((customer) => (
            <tr key={customer.customerId}>
              <td>{customer.customerId}</td>
              <td>{formatCurrency(customer.valuePerMonth)}</td>
              <td>{formatCurrency(customer.totalVolume)}</td>
              <td>{customer.activeMonths}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}