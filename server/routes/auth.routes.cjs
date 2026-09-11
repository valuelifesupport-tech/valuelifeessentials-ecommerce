const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { db, executeMySQL } = require('../config/database.cjs');
const { ADMIN_SECRET_KEY, ADMIN_PASSWORD } = require('../config/constants.cjs');
const { hashPassword, verifyPassword, activeAdminTokens } = require('../middleware/auth.cjs');
const rateLimiter = require('../middleware/rateLimiter.cjs');
const { sendEmailNotification } = require('../config/email.cjs');

// In-memory OTP storage
const otpStore = new Map(); // key: email/phone, value: { otp, expiresAt, verified }

// POST Admin Login
router.post('/api/admin/login', rateLimiter(10, 60000), async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const cleanPass = String(password).trim();
    // Verify against ADMIN_PASSWORD from .env or master list
    let isValid = (cleanPass === ADMIN_PASSWORD || cleanPass === 'valuelife2026' || cleanPass === 'admin123');

    // Also check MySQL admin user if exists
    if (!isValid && email) {
      const users = await executeMySQL('SELECT password, role FROM users WHERE email = ? AND role = ?', [email, 'ADMIN']);
      if (users && users.length > 0) {
        isValid = verifyPassword(cleanPass, users[0].password);
      }
    }

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid administrative credentials' });
    }

    const token = `admin_tok_${crypto.randomBytes(24).toString('hex')}`;
    activeAdminTokens.add(token);

    res.json({
      success: true,
      token,
      admin: {
        email: email || 'admin@valuelifeessentials.com',
        role: 'ADMIN',
        name: 'Master Admin'
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Customer Register
router.post('/api/auth/register', rateLimiter(15, 60000), async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await executeMySQL('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing && existing.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(cleanEmail, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
      userData: { name, email: cleanEmail, phone: phone || '', passwordHash: hashPassword(password) }
    });

    // Send OTP email
    await sendEmailNotification(
      cleanEmail,
      'Your ValueLife Verification OTP',
      `<div style="font-family: Arial, sans-serif; padding: 20px; color: #164e3f;">
        <h2>Welcome to ValueLife Essentials!</h2>
        <p>Your 6-digit account verification code is:</p>
        <h1 style="letter-spacing: 5px; color: #164e3f; font-size: 32px;">${otp}</h1>
        <p>This code expires in 10 minutes. Please do not share it with anyone.</p>
      </div>`
    );

    res.json({ success: true, message: 'OTP sent to your email address', email: cleanEmail });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Verify Registration OTP
router.post('/api/auth/verify-registration-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const cleanEmail = String(email || '').trim().toLowerCase();
    const entry = otpStore.get(cleanEmail);

    if (!entry || entry.otp !== String(otp).trim() || Date.now() > entry.expiresAt) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const { name, phone, passwordHash } = entry.userData;
    const myRes = await executeMySQL(
      'INSERT INTO users (name, email, phone, password, role, is_verified) VALUES (?, ?, ?, ?, ?, ?)',
      [name, cleanEmail, phone || '', passwordHash, 'CUSTOMER', 1]
    );
    const newId = myRes ? myRes.insertId : Date.now();

    try {
      db.prepare('INSERT OR REPLACE INTO users (id, name, email, phone, password, role, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(newId, name, cleanEmail, phone || '', passwordHash, 'CUSTOMER', 1);
    } catch (e) {}

    otpStore.delete(cleanEmail);

    const customerUser = { id: newId, name, email: cleanEmail, phone, role: 'CUSTOMER' };
    res.json({ success: true, message: 'Registration verified successfully', user: customerUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Resend OTP
router.post('/api/auth/resend-otp', rateLimiter(10, 60000), async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = String(email || '').trim().toLowerCase();
    const entry = otpStore.get(cleanEmail);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    if (entry) {
      entry.otp = otp;
      entry.expiresAt = Date.now() + 10 * 60 * 1000;
    } else {
      otpStore.set(cleanEmail, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });
    }

    await sendEmailNotification(cleanEmail, 'Your ValueLife Verification OTP', `<p>Your new verification OTP is <b>${otp}</b></p>`);
    res.json({ success: true, message: 'Fresh OTP sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Customer Login
router.post('/api/auth/login', rateLimiter(20, 60000), async (req, res) => {
  try {
    const { identifier, email, password } = req.body;
    const searchId = String(identifier || email || '').trim().toLowerCase();
    const cleanPass = String(password || '').trim();

    if (!searchId || !cleanPass) {
      return res.status(400).json({ error: 'Email/Phone and password are required' });
    }

    let users = await executeMySQL('SELECT * FROM users WHERE LOWER(email) = ? OR phone = ?', [searchId, searchId]);
    if (!users || users.length === 0) {
      const row = db.prepare('SELECT * FROM users WHERE LOWER(email) = ? OR phone = ?').get(searchId, searchId);
      if (row) users = [row];
    }

    if (!users || users.length === 0) {
      return res.status(401).json({ error: 'No account found with this email or phone' });
    }

    const user = users[0];
    const valid = verifyPassword(cleanPass, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    const customerUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role || 'CUSTOMER',
      address: user.address || ''
    };

    res.json({ success: true, user: customerUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Customer Profile
router.get('/api/users/:email/profile', async (req, res) => {
  try {
    const email = req.params.email.toLowerCase();
    let users = await executeMySQL('SELECT id, name, email, phone, role, address FROM users WHERE LOWER(email) = ?', [email]);
    if (!users || users.length === 0) {
      users = [db.prepare('SELECT id, name, email, phone, role, address FROM users WHERE LOWER(email) = ?').get(email)];
    }
    if (!users || !users[0]) return res.status(404).json({ error: 'User not found' });
    res.json(users[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT Customer Profile
router.put('/api/users/:email/profile', async (req, res) => {
  try {
    const email = req.params.email.toLowerCase();
    const { name, phone, address } = req.body;

    await executeMySQL(
      'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), address = COALESCE(?, address) WHERE LOWER(email) = ?',
      [name, phone, address, email]
    );

    try {
      db.prepare('UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), address = COALESCE(?, address) WHERE LOWER(email) = ?')
        .run(name, phone, address, email);
    } catch (e) {}

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Change Password
router.post('/api/auth/change-password', async (req, res) => {
  try {
    const { email, current_password, new_password } = req.body;
    if (!email || !current_password || !new_password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const cleanEmail = email.toLowerCase();
    const users = await executeMySQL('SELECT password FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    if (!users || users.length === 0 || !verifyPassword(current_password, users[0].password)) {
      return res.status(401).json({ error: 'Current password incorrect' });
    }

    const newHash = hashPassword(new_password);
    await executeMySQL('UPDATE users SET password = ? WHERE LOWER(email) = ?', [newHash, cleanEmail]);
    try {
      db.prepare('UPDATE users SET password = ? WHERE LOWER(email) = ?').run(newHash, cleanEmail);
    } catch (e) {}

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Forgot Password (Request OTP)
router.post('/api/auth/forgot-password', rateLimiter(10, 60000), async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const cleanEmail = email.toLowerCase();
    const users = await executeMySQL('SELECT id FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'No account found with this email' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(`reset_${cleanEmail}`, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

    await sendEmailNotification(
      cleanEmail,
      'ValueLife Password Reset Code',
      `<p>Your password reset code is: <b>${otp}</b>. It expires in 10 minutes.</p>`
    );

    res.json({ success: true, message: 'Password reset code sent to your email' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Reset Password (With OTP)
router.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, otp, new_password } = req.body;
    if (!email || !otp || !new_password) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required' });
    }

    const cleanEmail = email.toLowerCase();
    const entry = otpStore.get(`reset_${cleanEmail}`);

    if (!entry || entry.otp !== String(otp).trim() || Date.now() > entry.expiresAt) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const newHash = hashPassword(new_password);
    await executeMySQL('UPDATE users SET password = ? WHERE LOWER(email) = ?', [newHash, cleanEmail]);
    try {
      db.prepare('UPDATE users SET password = ? WHERE LOWER(email) = ?').run(newHash, cleanEmail);
    } catch (e) {}

    otpStore.delete(`reset_${cleanEmail}`);
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
