import { useState, useEffect, useCallback } from 'react';
import { UtensilsCrossed, Sparkles, MapPin, ShoppingCart, Send, Leaf, Wheat } from 'lucide-react';

const DIETARY_ICONS = { V: '🟢', VG: '🌱', GF: '🌾' };
const DIETARY_LABELS = { V: 'Vegetarian', VG: 'Vegan', GF: 'Gluten-Free' };
const CAT_LABELS = { mains: '🍔 Mains', drinks: '🍺 Drinks', snacks: '🍿 Snacks' };

export default function FoodTab() {
  const [menu, setMenu] = useState(null);
  const [cart, setCart] = useState([]);
  const [recs, setRecs] = useState([]);
  const [recLoading, setRecLoading] = useState(false);
  const [section, setSection] = useState('A2');
  const [seat, setSeat] = useState('14');
  const [order, setOrder] = useState(null);
  const [activeCategory, setActiveCategory] = useState('mains');

  useEffect(() => {
    fetch('/api/food/menu')
      .then(r => r.json())
      .then(d => setMenu(d.data))
      .catch(() => setMenu({ items: [], grouped: { mains: [], drinks: [], snacks: [] } }));
  }, []);

  const addToCart = useCallback((item) => {
    setCart(prev => [...prev, item]);
  }, []);

  const removeFromCart = useCallback((index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  }, []);

  const getRecommendations = useCallback(async () => {
    setRecLoading(true);
    try {
      const res = await fetch('/api/food/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: 'match day food', dietary: [], budget: 25 }),
      });
      const data = await res.json();
      setRecs(data.data?.recommendations || []);
    } catch { setRecs([]); }
    setRecLoading(false);
  }, []);

  const placeOrder = useCallback(async () => {
    if (cart.length === 0) return;
    try {
      const res = await fetch('/api/food/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart.map(i => i.id), section, seat }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
        setCart([]);
      }
    } catch { /* handled by UI */ }
  }, [cart, section, seat]);

  const total = cart.reduce((sum, i) => sum + i.price, 0);

  if (!menu) return <div className="food-loading">Loading menu...</div>;

  return (
    <div className="food-tab">
      {/* BLE Location indicator */}
      <div className="food-location" role="status">
        <MapPin size={14} aria-hidden="true" />
        <span>📍 You are in <strong>Section {section}</strong>, Row {seat}</span>
        <span className="food-location-tag">BLE Beacon</span>
      </div>

      {/* AI Recommendations */}
      <div className="food-ai-row">
        <button className="food-ai-btn" onClick={getRecommendations} disabled={recLoading} aria-label="Get AI food recommendations">
          <Sparkles size={14} aria-hidden="true" />
          {recLoading ? 'Thinking...' : 'AI Suggest'}
        </button>
        {recs.length > 0 && (
          <div className="food-recs" role="list" aria-label="AI recommendations">
            {recs.map((r, i) => (
              <div key={i} className="food-rec" role="listitem">
                <strong>{r.name}</strong>
                <span className="food-rec-reason">{r.reason}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category tabs */}
      <div className="food-cats" role="tablist">
        {Object.entries(CAT_LABELS).map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={activeCategory === key}
            className={`food-cat ${activeCategory === key ? 'active' : ''}`}
            onClick={() => setActiveCategory(key)}
          >{label}</button>
        ))}
      </div>

      {/* Menu items */}
      <div className="food-menu" role="list" aria-label="Food menu">
        {(menu.grouped[activeCategory] || []).map(item => (
          <div key={item.id} className="food-item" role="listitem">
            <div className="food-item-info">
              <span className="food-item-name">{item.name}</span>
              <span className="food-item-dietary">
                {item.dietary.map(d => (
                  <span key={d} className="food-dietary-badge" title={DIETARY_LABELS[d]}>{DIETARY_ICONS[d]} {d}</span>
                ))}
              </span>
            </div>
            <span className="food-item-price">${item.price}</span>
            <button className="food-add-btn" onClick={() => addToCart(item)} aria-label={`Add ${item.name} to cart`}>+</button>
          </div>
        ))}
      </div>

      {/* Order confirmation */}
      {order && (
        <div className="food-order-confirm" role="alert">
          <div className="food-order-header">✅ Order #{order.orderId}</div>
          <div className="food-order-details">
            <span>Total: <strong>${order.total} AUD</strong></span>
            <span>Delivery to: <strong>{order.section}, Seat {order.seat}</strong></span>
            <span>ETA: <strong>{order.estimatedDelivery}</strong> (Prep {order.prepTime} + Walk {order.deliveryWalk})</span>
          </div>
        </div>
      )}

      {/* Cart */}
      {cart.length > 0 && (
        <div className="food-cart">
          <div className="food-cart-header">
            <ShoppingCart size={14} aria-hidden="true" />
            <span>{cart.length} items — ${total} AUD</span>
          </div>
          <div className="food-cart-items">
            {cart.map((item, i) => (
              <span key={i} className="food-cart-chip">
                {item.name} <button onClick={() => removeFromCart(i)} aria-label={`Remove ${item.name}`}>×</button>
              </span>
            ))}
          </div>
          <div className="food-cart-actions">
            <div className="food-seat-inputs">
              <input className="food-seat-input" value={section} onChange={e => setSection(e.target.value)} placeholder="Section" aria-label="Section" />
              <input className="food-seat-input" value={seat} onChange={e => setSeat(e.target.value)} placeholder="Seat" aria-label="Seat number" />
            </div>
            <button className="food-order-btn" onClick={placeOrder}>
              <Send size={14} aria-hidden="true" /> Order to Seat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
