const express = require('express');
const router = express.Router();
const { db, executeMySQL } = require('../config/database.cjs');
const { requireAdminAuth } = require('../middleware/auth.cjs');

// GET All Coupons
router.get('/api/coupons', requireAdminAuth, async (req, res) => {
  try {
    let rows = await executeMySQL('SELECT * FROM coupons ORDER BY id DESC');
    if (!rows || rows.length === 0) {
      rows = db.prepare('SELECT * FROM coupons ORDER BY id DESC').all() || [];
    }
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Create Coupon
router.post('/api/coupons', requireAdminAuth, async (req, res) => {
  try {
    const data = req.body;
    let {
      code, discount_type = 'PERCENTAGE', discount_value = 0,
      min_spend_inr, coupon_category = 'amount_off_order', applies_to_type = 'all',
      target_ids = '[]', max_uses = null, one_per_customer = 0,
      start_date = null, end_date = null, description = null,
      buy_qty = 1, get_qty = 1, get_discount_type = 'FREE', free_shipping = 0,
      expiry_date
    } = data;

    if (!code) return res.status(400).json({ error: 'Coupon code is required' });

    if (coupon_category === 'free_shipping') {
      free_shipping = 1;
      discount_value = 0;
    }

    const min_spend = min_spend_inr || 0;
    const final_expiry = expiry_date || end_date || null;
    const usage_limit = max_uses;

    const cleanCode = String(code).trim().toUpperCase();
    const specific_ids_str = typeof target_ids === 'string' ? target_ids : JSON.stringify(target_ids);

    const query = `INSERT INTO coupons (
      code, discount_type, discount_value, min_spend, max_discount, 
      expiry_date, usage_limit, applies_to, specific_ids,
      coupon_category, free_shipping, description, start_date, end_date,
      max_uses, one_per_customer, buy_qty, get_qty, get_discount_type, 
      applies_to_type, target_ids
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      cleanCode, discount_type, discount_value, min_spend, null,
      final_expiry, usage_limit, applies_to_type, specific_ids_str,
      coupon_category, free_shipping, description, start_date, end_date,
      max_uses, one_per_customer, buy_qty, get_qty, get_discount_type,
      applies_to_type, specific_ids_str
    ];

    const myRes = await executeMySQL(query, values);
    const newId = myRes ? myRes.insertId : Date.now();

    try {
      db.prepare(`INSERT OR REPLACE INTO coupons (
        id, code, discount_type, discount_value, min_spend, max_discount, 
        expiry_date, usage_limit, applies_to, specific_ids,
        coupon_category, free_shipping, description, start_date, end_date,
        max_uses, one_per_customer, buy_qty, get_qty, get_discount_type, 
        applies_to_type, target_ids
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(newId, ...values);
    } catch (e) {}

    res.json({ id: newId, code: cleanCode, discount_type, discount_value });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT Update Coupon
router.put('/api/coupons/:id', requireAdminAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    let { 
      code, discount_type, discount_value, min_spend_inr, 
      coupon_category, applies_to_type, target_ids, max_uses, one_per_customer, 
      start_date, end_date, description, buy_qty, get_qty, get_discount_type, 
      free_shipping, expiry_date, active, is_active 
    } = data;
    
    const cleanCode = code ? String(code).trim().toUpperCase() : undefined;
    
    if (coupon_category === 'free_shipping') {
      free_shipping = 1;
      discount_value = 0;
    }

    const min_spend = min_spend_inr !== undefined ? min_spend_inr : undefined;
    const final_expiry = expiry_date !== undefined ? expiry_date : (end_date !== undefined ? end_date : undefined);
    const usage_limit = max_uses !== undefined ? max_uses : undefined;
    
    let final_is_active = is_active;
    if (final_is_active === undefined && active !== undefined) {
      final_is_active = active;
    }

    const specific_ids_str = target_ids !== undefined ? (typeof target_ids === 'string' ? target_ids : JSON.stringify(target_ids)) : undefined;

    await executeMySQL(
      `UPDATE coupons SET 
        code = COALESCE(?, code), 
        discount_type = COALESCE(?, discount_type), 
        discount_value = COALESCE(?, discount_value), 
        min_spend = COALESCE(?, min_spend), 
        expiry_date = COALESCE(?, expiry_date), 
        usage_limit = COALESCE(?, usage_limit), 
        is_active = COALESCE(?, is_active),
        coupon_category = COALESCE(?, coupon_category),
        free_shipping = COALESCE(?, free_shipping),
        description = COALESCE(?, description),
        start_date = COALESCE(?, start_date),
        end_date = COALESCE(?, end_date),
        max_uses = COALESCE(?, max_uses),
        one_per_customer = COALESCE(?, one_per_customer),
        buy_qty = COALESCE(?, buy_qty),
        get_qty = COALESCE(?, get_qty),
        get_discount_type = COALESCE(?, get_discount_type),
        applies_to_type = COALESCE(?, applies_to_type),
        target_ids = COALESCE(?, target_ids),
        applies_to = COALESCE(?, applies_to),
        specific_ids = COALESCE(?, specific_ids)
       WHERE id = ?`,
      [
        cleanCode, discount_type, discount_value, min_spend, final_expiry, 
        usage_limit, final_is_active, coupon_category, free_shipping, description, 
        start_date, end_date, max_uses, one_per_customer, buy_qty, get_qty, 
        get_discount_type, applies_to_type, specific_ids_str, applies_to_type, specific_ids_str, 
        id
      ]
    );

    try {
      db.prepare(`UPDATE coupons SET 
        code = COALESCE(?, code), 
        discount_type = COALESCE(?, discount_type), 
        discount_value = COALESCE(?, discount_value), 
        min_spend = COALESCE(?, min_spend), 
        expiry_date = COALESCE(?, expiry_date), 
        usage_limit = COALESCE(?, usage_limit), 
        is_active = COALESCE(?, is_active),
        coupon_category = COALESCE(?, coupon_category),
        free_shipping = COALESCE(?, free_shipping),
        description = COALESCE(?, description),
        start_date = COALESCE(?, start_date),
        end_date = COALESCE(?, end_date),
        max_uses = COALESCE(?, max_uses),
        one_per_customer = COALESCE(?, one_per_customer),
        buy_qty = COALESCE(?, buy_qty),
        get_qty = COALESCE(?, get_qty),
        get_discount_type = COALESCE(?, get_discount_type),
        applies_to_type = COALESCE(?, applies_to_type),
        target_ids = COALESCE(?, target_ids),
        applies_to = COALESCE(?, applies_to),
        specific_ids = COALESCE(?, specific_ids)
       WHERE id = ?`).run(
        cleanCode, discount_type, discount_value, min_spend, final_expiry, 
        usage_limit, final_is_active, coupon_category, free_shipping, description, 
        start_date, end_date, max_uses, one_per_customer, buy_qty, get_qty, 
        get_discount_type, applies_to_type, specific_ids_str, applies_to_type, specific_ids_str, 
        id
      );
    } catch (e) {}

    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Validate Coupon
router.post('/api/coupons/validate', async (req, res) => {
  try {
    const { code, cart_subtotal, order_amount } = req.body;
    if (!code) return res.status(400).json({ error: 'Code is required' });

    const cleanCode = String(code).trim().toUpperCase();
    let coupon = null;

    const myRows = await executeMySQL('SELECT * FROM coupons WHERE UPPER(code) = ? AND (is_active IS NULL OR is_active = 1)', [cleanCode]);
    if (myRows && myRows.length > 0) {
      coupon = myRows[0];
    } else {
      coupon = db.prepare('SELECT * FROM coupons WHERE UPPER(code) = ? AND (is_active IS NULL OR is_active = 1)').get(cleanCode);
    }

    if (!coupon) {
      return res.status(404).json({ valid: false, error: 'Invalid or inactive coupon code' });
    }

    // Check expiry
    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
      return res.status(400).json({ valid: false, error: 'Coupon has expired' });
    }

    // Check usage limit
    if (coupon.usage_limit > 0 && (coupon.used_count || 0) >= coupon.usage_limit) {
      return res.status(400).json({ valid: false, error: 'Coupon usage limit reached' });
    }

    // Check min spend
    const subtotal = Number(cart_subtotal || order_amount || 0);
    const minSpend = Number(coupon.min_spend || coupon.min_order_amount || 0);
    
    if (minSpend > 0 && subtotal < minSpend) {
      return res.status(400).json({ valid: false, error: \`Minimum spend of ₹\${minSpend} required\` });
    }

    // Calculate discount
    let discount = 0;
    const type = (coupon.discount_type || '').toUpperCase();
    if (type === 'PERCENT' || type === 'PERCENTAGE') {
      discount = (subtotal * Number(coupon.discount_value)) / 100;
      if (coupon.max_discount > 0 && discount > Number(coupon.max_discount)) {
        discount = Number(coupon.max_discount);
      }
    } else {
      discount = Number(coupon.discount_value);
    }
    
    const isFreeShipping = coupon.free_shipping == 1 || coupon.coupon_category === 'free_shipping';

    res.json({
      valid: true,
      code: coupon.code,
      discount_amount: Math.min(discount, subtotal),
      discount: Math.min(discount, subtotal),
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      free_shipping: isFreeShipping,
      coupon_id: coupon.id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Coupon
router.delete('/api/coupons/:id', requireAdminAuth, async (req, res) => {
  try {
    const id = req.params.id;
    await executeMySQL('DELETE FROM coupons WHERE id = ?', [id]);
    try {
      db.prepare('DELETE FROM coupons WHERE id = ?').run(id);
    } catch (e) {}
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
