// routes/users.js
import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error('Database query error:', err.message);
    res.status(500).send('Server error');
  }
});

router.post('/', async (req, res) => {
  const { username, password } = req.body;
  // ... existing code to add a user ...
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;
  // ... existing code to update a user ...
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  // ... existing code to delete a user ...
});

export default router;
