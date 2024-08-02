import pool from '../db.js';

export const getDesignations = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM designations');
    res.json(result.rows);
  } catch (err) {
    console.error('Database query error:', err.message);
    res.status(500).send('Server error');
  }
};

export const createDesignation = async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).send('Title and description are required');
  }

  try {
    const result = await pool.query(
      'INSERT INTO designations (title, description) VALUES ($1, $2) RETURNING *',
      [title, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Database insert error:', err.message);
    res.status(500).send('Server error');
  }
};

export const updateDesignation = async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).send('Title and description are required');
  }

  try {
    const result = await pool.query(
      'UPDATE designations SET title = $1, description = $2 WHERE id = $3 RETURNING *',
      [title, description, id]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Database update error:', err.message);
    res.status(500).send('Server error');
  }
};

export const deleteDesignation = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM designations WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error('Database delete error:', err.message);
    res.status(500).send('Server error');
  }
};
