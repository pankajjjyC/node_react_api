// routes/designation.js
import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const result = await pool.query('SELECT * FROM designations');
    res.json(result.rows);
  } catch (err) {
    console.error('Database query error:', err.message);
    res.status(500).send('Server error');
  }
});

router.post('/', async (req, res) => {
  const { title, description } = req.body;
  // ... code to add a designation ...
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  // ... code to update a designation ...
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  // ... code to delete a designation ...
});

export default router;
