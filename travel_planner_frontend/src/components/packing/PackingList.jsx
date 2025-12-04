import React, { useEffect, useMemo, useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { packingService, defaultCategories } from '../../services/packingService';
import PackingCategory from './PackingCategory';

/**
 * PUBLIC_INTERFACE
 * PackingList renders categorized packing items with overall and per-category progress.
 */
export default function PackingList({ tripId }) {
  const [categories, setCategories] = useState(defaultCategories());
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catInput, setCatInput] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const data = await packingService.listByTrip(tripId);
      if (!mounted) return;
      setCategories(data.categories || defaultCategories());
      setItems(data.items || []);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [tripId]);

  const groups = useMemo(() => {
    const map = new Map();
    for (const c of categories) map.set(c, []);
    for (const it of items) {
      const c = it.category && map.has(it.category) ? it.category : categories[0] || 'Misc';
      map.get(c).push(it);
    }
    return map;
  }, [categories, items]);

  const overall = useMemo(() => {
    const total = items.length;
    const packed = items.filter((i) => i.packed).length;
    const pct = total === 0 ? 0 : Math.round((packed / total) * 100);
    return { total, packed, pct };
  }, [items]);

  async function addItem(payload) {
    const res = await packingService.addItem(tripId, payload);
    // If backend returned full state, prefer it; otherwise mutate locally by refetch
    if (res && res.items && res.categories) {
      setItems(res.items);
      setCategories(res.categories);
    } else {
      const data = await packingService.listByTrip(tripId);
      setItems(data.items);
      setCategories(data.categories);
    }
  }

  async function updateItem(itemId, patch) {
    const res = await packingService.updateItem(tripId, itemId, patch);
    if (res && res.items && res.categories) {
      setItems(res.items);
      setCategories(res.categories);
    } else {
      const data = await packingService.listByTrip(tripId);
      setItems(data.items);
      setCategories(data.categories);
    }
  }

  async function removeItem(itemId) {
    const res = await packingService.removeItem(tripId, itemId);
    if (res && res.items && res.categories) {
      setItems(res.items);
      setCategories(res.categories);
    } else {
      const data = await packingService.listByTrip(tripId);
      setItems(data.items);
      setCategories(data.categories);
    }
  }

  async function addCategory() {
    const name = catInput.trim();
    if (!name) return;
    const res = await packingService.addCategory(tripId, name);
    if (res && res.items && res.categories) {
      setItems(res.items);
      setCategories(res.categories);
    } else {
      const data = await packingService.listByTrip(tripId);
      setItems(data.items);
      setCategories(data.categories);
    }
    setCatInput('');
  }

  const onTogglePacked = (id, packed) => updateItem(id, { packed });
  const onChangeQuantity = (id, qty) => updateItem(id, { quantity: qty });
  const onChangeNotes = (id, notes) => updateItem(id, { notes });
  const onChangeCategory = (id, category) => updateItem(id, { category });
  const onDeleteItem = (id) => removeItem(id);

  return (
    <Card
      title="Packing List"
      subtitle={loading ? 'Loading…' : `${overall.packed}/${overall.total} packed`}
      footer={
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ flex: 1, maxWidth: 380, display: 'flex', gap: 8 }}>
            <input
              aria-label="Add category"
              placeholder="New category (e.g., Shoes)"
              value={catInput}
              onChange={(e) => setCatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addCategory(); }}
              style={{ flex: 1, border: '1px solid rgba(17,24,39,0.12)', borderRadius: 8, padding: '8px 10px' }}
            />
            <Button onClick={addCategory}>Add Category</Button>
          </div>
        </div>
      }
    >
      <div style={{ marginBottom: 14 }}>
        <div style={{ height: 10, background: '#E5E7EB', borderRadius: 10 }}>
          <div style={{ width: `${overall.pct}%`, height: 10, background: 'linear-gradient(90deg,#2563EB,#F59E0B)', borderRadius: 10 }} />
        </div>
        <div className="text-muted" style={{ fontSize: 12, marginTop: 6 }}>
          Overall progress: {overall.pct}%
        </div>
      </div>

      {items.length === 0 && (
        <div className="text-muted" style={{ padding: '8px 4px' }}>
          No packing items yet. Use the forms below each category to add your first item.
        </div>
      )}

      <div style={{ display: 'grid', gap: 12 }}>
        {categories.map((c) => {
          const list = groups.get(c) || [];
          return (
            <div key={c} style={{ background: 'var(--color-surface)', padding: 8, borderRadius: 12, border: '1px solid rgba(17,24,39,0.06)' }}>
              <CategoryLazy
                name={c}
                items={list}
                categories={categories}
                onAddItem={addItem}
                onTogglePacked={onTogglePacked}
                onChangeQuantity={onChangeQuantity}
                onChangeNotes={onChangeNotes}
                onChangeCategory={onChangeCategory}
                onDeleteItem={onDeleteItem}
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// Lazy boundary to keep initial bundle small if needed
function CategoryLazy(props) {
  return <PackingCategory {...props} />;
}


