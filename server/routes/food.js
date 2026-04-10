/**
 * Food & Beverage Route — Seat-to-Seat Ordering
 * 
 * GET  /api/food/menu      → Full categorized menu
 * POST /api/food/recommend  → AI-personalized suggestions (Gemini / Gemma 3 simulation)
 * POST /api/food/order      → Place order with seat delivery ETA
 */

const express = require('express');
const router = express.Router();
const { getModel, FOOD_SYSTEM_INSTRUCTION } = require('../services/gemini');
const { logEvent } = require('../middleware/logging');
const { recordMetric } = require('../services/monitoring');

/** Full venue menu */
const MENU = [
  { id: 1, name: 'Classic Burger', price: 12, category: 'mains', dietary: [], prep: 8 },
  { id: 2, name: 'Loaded Nachos', price: 10, category: 'mains', dietary: ['V'], prep: 6 },
  { id: 3, name: 'Fish & Chips', price: 14, category: 'mains', dietary: [], prep: 10 },
  { id: 4, name: 'Meat Pie', price: 8, category: 'mains', dietary: [], prep: 5 },
  { id: 5, name: 'Hot Dog', price: 7, category: 'mains', dietary: [], prep: 3 },
  { id: 6, name: 'Vegan Wrap', price: 11, category: 'mains', dietary: ['VG', 'GF'], prep: 7 },
  { id: 7, name: 'Caesar Salad', price: 9, category: 'mains', dietary: ['V'], prep: 5 },
  { id: 8, name: 'Craft Beer', price: 9, category: 'drinks', dietary: [], prep: 1 },
  { id: 9, name: 'Soft Drink', price: 5, category: 'drinks', dietary: ['V', 'GF'], prep: 1 },
  { id: 10, name: 'Water', price: 3, category: 'drinks', dietary: ['V', 'GF'], prep: 0 },
  { id: 11, name: 'Coffee', price: 6, category: 'drinks', dietary: ['V'], prep: 3 },
  { id: 12, name: 'Chips & Dip', price: 6, category: 'snacks', dietary: ['V'], prep: 2 },
  { id: 13, name: 'Popcorn', price: 5, category: 'snacks', dietary: ['V', 'GF'], prep: 1 },
  { id: 14, name: 'Ice Cream', price: 7, category: 'snacks', dietary: ['V'], prep: 2 },
];

/** Concession zones with delivery walk times (minutes) per section */
const DELIVERY_TIMES = {
  VIP: 3, A1: 5, A2: 6, B1: 8, B2: 7, C1: 9, C2: 10, D1: 6, D2: 7,
};

// ─── GET /api/food/menu ────────────────────────────────────────────────
router.get('/menu', (req, res) => {
  const grouped = {
    mains: MENU.filter(i => i.category === 'mains'),
    drinks: MENU.filter(i => i.category === 'drinks'),
    snacks: MENU.filter(i => i.category === 'snacks'),
  };
  res.json({ success: true, data: { items: MENU, grouped, currency: 'AUD' } });
});

// ─── POST /api/food/recommend ──────────────────────────────────────────
router.post('/recommend', async (req, res) => {
  const { preferences = '', dietary = [], budget } = req.body;

  try {
    const model = getModel('gemini-2.0-flash');
    const menuText = MENU.map(i =>
      `${i.name} ($${i.price}) [${i.dietary.join(',') || 'none'}] - ${i.category}`
    ).join('\n');

    const prompt = `Given this stadium menu:\n${menuText}\n\nUser preferences: ${preferences || 'none specified'}\nDietary: ${dietary.join(', ') || 'no restrictions'}\nBudget: ${budget ? `$${budget}` : 'flexible'}\n\nRecommend 3 items as a JSON array with fields: id, name, reason (1 sentence why). Only return the JSON array, no markdown.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: FOOD_SYSTEM_INSTRUCTION }] },
    });

    const text = result.response.text().trim();
    let recommendations;
    try {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```/g, '').trim();
      recommendations = JSON.parse(cleaned);
    } catch {
      recommendations = [
        { id: 2, name: 'Loaded Nachos', reason: 'Popular crowd favorite, great value at $10.' },
        { id: 8, name: 'Craft Beer', reason: 'Perfect match-day choice.' },
        { id: 13, name: 'Popcorn', reason: 'Light snack, gluten-free friendly.' },
      ];
    }

    recordMetric('food_recommendation_count', 1);
    res.json({ success: true, data: { recommendations, aiPowered: true, model: 'Gemma 3 (simulated via Gemini)' } });

  } catch (err) {
    console.error('[FOOD] Recommendation error:', err.message);
    logEvent('ERROR', 'Food recommendation failed', { error: err.message });
    // Fallback recommendations
    res.json({
      success: true,
      data: {
        recommendations: [
          { id: 1, name: 'Classic Burger', reason: 'Stadium favorite — our #1 seller.' },
          { id: 8, name: 'Craft Beer', reason: 'Locally brewed, perfect for match day.' },
          { id: 6, name: 'Vegan Wrap', reason: 'Healthy option, gluten-free & plant-based.' },
        ],
        aiPowered: false,
        model: 'fallback',
      },
    });
  }
});

// ─── POST /api/food/order ──────────────────────────────────────────────
router.post('/order', (req, res) => {
  const { items, section, seat } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'At least one item is required' });
  }
  if (!section || typeof section !== 'string') {
    return res.status(400).json({ error: 'Section is required (e.g. A1, B2, VIP)' });
  }

  const sectionKey = section.toUpperCase();
  const walkTime = DELIVERY_TIMES[sectionKey] || 8;
  const maxPrep = Math.max(...items.map(id => {
    const item = MENU.find(m => m.id === id);
    return item ? item.prep : 5;
  }));
  const totalETA = maxPrep + walkTime;

  const orderItems = items.map(id => MENU.find(m => m.id === id)).filter(Boolean);
  const total = orderItems.reduce((sum, i) => sum + i.price, 0);

  const order = {
    orderId: `ORD-${Date.now().toString(36).toUpperCase()}`,
    items: orderItems.map(i => ({ name: i.name, price: i.price })),
    total,
    section: sectionKey,
    seat: seat || 'General',
    estimatedDelivery: `${totalETA} min`,
    status: 'confirmed',
    prepTime: `${maxPrep} min`,
    deliveryWalk: `${walkTime} min`,
  };

  logEvent('INFO', 'Food order placed', { orderId: order.orderId, total, section: sectionKey });
  recordMetric('food_orders_total', 1);

  res.json({ success: true, data: order });
});

module.exports = router;
