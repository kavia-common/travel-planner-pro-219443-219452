import React, { useMemo, useState } from 'react';
import Button from '../common/Button';
import PackingItem from './PackingItem';

/**
 * PUBLIC_INTERFACE
 * Category section showing items for a category, progress, and an add-item form.
 */
export default function PackingCategory({
  name,
  items,
  categories,
  onAddItem,
  onTogglePacked,
  onChangeQuantity,
  onChangeNotes,
  onChangeCategory,
  onDeleteItem,
}) {
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState(1);

  const stats = useMemo(() => {
    const total = items.length;
    const packed = items.filter((i) => i.packed).length;
    const pct = total === 0 ? 0 : Math.round((packed / total) * 100);
    return { total, packed, pct };
  }, [items]);

  const addQuick = async () => {
    const payloadName = newName.trim();
    if (!payloadName) return;
    await onAddItem({ name: payloadName, quantity: newQty, category: name });
    setNewName('');
    setNewQty(1);
  };

  return (
    <section className="transition-base" style={{ marginBottom: 16 }}>
      <header
        style={{
          padding: '10px 12px',
          borderRadius: 10,
          background: 'linear-gradient(180deg, rgba(37,99,235,0.08), #fff)',
          border: '1px solid rgba(37,99,235,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ fontWeight: 700 }}>{name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ minWidth: 120 }}>
            <div style={{ height: 8, background: '#E5E7EB', borderRadius: 8 }}>
              <div style={{ width: `${stats.pct}%`, height: 8, background: '#2563EB', borderRadius: 8 }} />
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>
            {stats.packed}/{stats.total} packed
          </div>
        </div>
      </header>

      <div role="list" aria-label={`${name} items`} style={{ display: 'grid', gap: 8, marginTop: 10 }}>
        {items.length === 0 ? (
          <div className="text-muted" style={{ fontSize: 14, padding: '8px 4px' }}>No items in this category yet.</div>
        ) : (
          items.map((it) => (
            <PackingItem
              key={it.id}
              item={it}
              categories={categories}
              onTogglePacked={onTogglePacked}
              onChangeQuantity={onChangeQuantity}
              onChangeNotes={onChangeNotes}
              onChangeCategory={onChangeCategory}
              onDelete={onDeleteItem}
            />
          ))
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
        <input
          aria-label={`Add item to ${name}`}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder={`Add to ${name} and press Enter`}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addQuick();
          }}
          style={{
            flex: 1,
            border: '1px solid rgba(17,24,39,0.12)',
            borderRadius: 8,
            padding: '8px 10px',
          }}
        />
        <div aria-label="Quantity" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Button variant="ghost" onClick={() => setNewQty((q) => Math.max(1, q - 1))}>-</Button>
          <div style={{ minWidth: 28, textAlign: 'center' }}>{newQty}</div>
          <Button variant="ghost" onClick={() => setNewQty((q) => Math.max(1, q + 1))}>+</Button>
        </div>
        <Button variant="primary" onClick={addQuick}>Add</Button>
      </div>
    </section>
  );
}
