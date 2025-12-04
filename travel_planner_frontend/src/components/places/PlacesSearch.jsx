import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

/**
 * PUBLIC_INTERFACE
 * Places Search with themed input, actions, and result chips (baseline demo).
 */
const PlacesSearch = () => {
  const [q, setQ] = useState('');
  const results = [];

  return (
    <Card title="Find Places" headerRight={<span className="badge">Beta</span>}>
      <div style={{ display:'flex', gap:12, marginBottom:12 }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search places..." className="input" />
        <Button variant="primary">Search</Button>
        <Button variant="ghost">Filters</Button>
      </div>
      <div>
        {results.length === 0 ? (
          <div className="text-muted">Try searching for "cafes in Tokyo"</div>
        ) : (
          results.map(r => (
            <div key={r.id} className="card" style={{ marginBottom:'12px' }}>
              <div className="card-body" style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontWeight:700 }}>{r.name}</div>
                  <div className="text-muted" style={{ fontSize:'14px' }}>{r.address}</div>
                </div>
                <div className="chip">{r.type}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default PlacesSearch;
