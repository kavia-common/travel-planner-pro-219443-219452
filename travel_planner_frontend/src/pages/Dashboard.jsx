import React from 'react';
import Card from '../components/common/Card';

/**
 * PUBLIC_INTERFACE
 * Dashboard overview using themed cards (baseline demo).
 */
const Dashboard = () => {
  return (
    <div className="grid grid-1-2-3">
      <Card title="Next Trip" headerRight={<span className="badge">Upcoming</span>}>
        <div className="text-muted">No trip selected</div>
      </Card>
      <Card title="Tasks" headerRight={<span className="chip chip--amber">2 pending</span>}>
        <ul style={{ margin:0, paddingLeft:18 }}>
          <li>Choose dates</li>
          <li>Book hotel</li>
        </ul>
      </Card>
      <Card title="Budget" headerRight={<span className="badge">$0 / $1500</span>}>
        <div className="progress"><div className="bar" style={{ width:'0%' }} /></div>
      </Card>
    </div>
  );
};

export default Dashboard;
