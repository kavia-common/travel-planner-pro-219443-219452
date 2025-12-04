import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

/**
 * PUBLIC_INTERFACE
 * Packing List with themed cards and progress indicators (baseline demo).
 */
const PackingList = () => {
  const items = [
    { id: 1, name: 'Passport', done: true },
    { id: 2, name: 'Charger', done: false },
    { id: 3, name: 'Jacket', done: false },
  ];
  const completed = items.filter(i => i.done).length;
  const pct = Math.round((completed / items.length) * 100);

  return (
    <div className="grid grid-1-2-3">
      <Card title="Packing Progress" headerRight={<span className="badge">{pct}%</span>}>
        <div className="progress">
          <div className="bar" style={{ width: `${pct}%` }} />
        </div>
      </Card>

      <Card title="Essentials" headerRight={<span className="badge badge--amber">Carry-on</span>}>
        <ul style={{ listStyle:'none', padding:0, margin:0 }}>
          {items.map(item => (
            <li key={item.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(17,24,39,0.08)'}}>
              <span>{item.name}</span>
              <span className={`chip ${item.done ? '' : 'chip--amber'}`}>{item.done ? 'Packed' : 'Todo'}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4" style={{ display:'flex', gap:12 }}>
          <Button variant="primary">Add Item</Button>
          <Button variant="ghost">Quick Add</Button>
        </div>
      </Card>
    </div>
  );
};

export default PackingList;
