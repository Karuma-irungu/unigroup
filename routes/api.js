'use strict';
const express  = require('express');
const validator = require('validator');
const { stmts } = require('../db');
const { sendEnquiryNotification, sendEnquiryConfirmation } = require('../middleware/mailer');

const router = express.Router();

// ─── POST /api/enquiry ─────────────────────────────────────
router.post('/enquiry', async (req, res) => {
  try {
    const { name, company, phone, email, service, message } = req.body;

    // ── Validation ──
    const errors = [];
    if (!name  || String(name).trim().length < 2)    errors.push('Name must be at least 2 characters.');
    if (!email || !validator.isEmail(String(email)))  errors.push('A valid email address is required.');
    if (!message || String(message).trim().length < 10) errors.push('Message must be at least 10 characters.');

    if (errors.length) {
      return res.status(422).json({ ok: false, errors });
    }

    const data = {
      name:    String(name).trim().slice(0, 120),
      company: company ? String(company).trim().slice(0, 120) : null,
      phone:   phone   ? String(phone).trim().slice(0, 30)   : null,
      email:   String(email).trim().toLowerCase().slice(0, 200),
      service: service ? String(service).trim().slice(0, 80)  : null,
      message: String(message).trim().slice(0, 2000),
      ip:      req.ip,
    };

    // ── Save to DB ──
    const result = stmts.insertEnquiry.run(data);

    // ── Send emails (non-blocking, swallow errors so form still succeeds) ──
    Promise.allSettled([
      sendEnquiryNotification(data),
      sendEnquiryConfirmation(data),
    ]).then(results => {
      results.forEach((r, i) => {
        if (r.status === 'rejected') {
          console.error(`Email ${i} failed:`, r.reason?.message);
        }
      });
    });

    return res.json({ ok: true, id: result.lastInsertRowid });
  } catch (err) {
    console.error('Enquiry error:', err);
    return res.status(500).json({ ok: false, errors: ['Server error. Please try again.'] });
  }
});


// ─── GET /api/admin/enquiries ──────────────────────────────
// Simple token-gated admin endpoint to list all enquiries
router.get('/admin/enquiries', (req, res) => {
  const token = req.headers['x-admin-token'];
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ ok: false, error: 'Unauthorised' });
  }
  const rows = stmts.listEnquiries.all();
  res.json({ ok: true, count: rows.length, enquiries: rows });
});

// ─── PATCH /api/admin/enquiries/:id ───────────────────────
router.patch('/admin/enquiries/:id', (req, res) => {
  const token = req.headers['x-admin-token'];
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ ok: false, error: 'Unauthorised' });
  }
  const allowed = ['new', 'in-progress', 'resolved'];
  const { status } = req.body;
  if (!allowed.includes(status)) {
    return res.status(422).json({ ok: false, error: 'Invalid status' });
  }
  stmts.updateStatus.run(status, req.params.id);
  res.json({ ok: true });
});

// ─── GET /api/health ──────────────────────────────────────
router.get('/health', (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

module.exports = router;
