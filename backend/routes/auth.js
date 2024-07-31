// routes/auth.js
import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../db.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  // ... existing registration code ...
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  // ... existing login code ...
});

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Logout error');
    }
    res.status(200).send('Logout successful');
  });
});

export default router;
