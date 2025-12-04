import React from 'react';
import Card from '../common/Card';

/**
 * PUBLIC_INTERFACE
 * Budget Dashboard styled with themed cards and progress (baseline demo).
 */
const BudgetDashboard = () => {
  const total = 1500;
  const spent = 620;
  const pct = Math.round((spent / total) * 100);

  return (
    <div className="grid grid-1-2-3">
      <Card title="Budget Summary" headerRight={<span className="badge">{pct}% used</span>}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
          <div>
            <div className="text-muted" style={{ fontSize:'14px' }}>Total</div>
            <div style={{ fontWeight:800, fontSize:'20px' }}>${total}</div>
          </div>
          <div>
            <div className="text-muted" style={{ fontSize:'14px' }}>Spent</div>
            <div style={{ fontWeight:800, fontSize:'20px', color:'var(--color-primary)' }}>${spent}</div>
          </div>
        </div>
        <div className="mt-4 progress">
          <div className="bar" style={{ width: `${pct}%`, background:'var(--color-secondary)' }} />
        </div>
      </Card>

      <Card title="Recent Expenses" headerRight={<span className="chip">3 items</span>}>
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Coffee</td>
                <td><span className="chip">Food</span></td>
                <td>$8</td>
              </tr>
              <tr>
                <td>Metro</td>
                <td><span className="chip">Transport</span></td>
                <td>$12</td>
              </tr>
              <tr>
                <td>Museum</td>
                <td><span className="chip chip--amber">Activity</span></td>
                <td>$30</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default BudgetDashboard;
