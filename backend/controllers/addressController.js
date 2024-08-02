import pool from '../db.js';

export const getAddresses = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const result = await pool.query('SELECT * FROM addresses');
    res.json(result.rows);
  } catch (err) {
    console.error('Database query error:', err.message);
    res.status(500).send('Server error');
  }
};

export const createAddress = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('Unauthorized');
  }

  const { name, address } = req.body;
  if (!name || !address) {
    return res.status(400).send('Name and address are required');
  }

  try {
    const result = await pool.query(
      'INSERT INTO addresses (name, address) VALUES ($1, $2) RETURNING *',
      [name, address]
    );

    const newAddress = result.rows[0];

    // Update sample_users table with the new address_id
    await pool.query(
      'UPDATE sample_users SET addresses_id = $1 WHERE name = $2',
      [newAddress.id, newAddress.name]
    );

    res.status(201).json(newAddress);
  } catch (err) {
    console.error('Database insert error:', err.message);
    res.status(500).send('Server error');
  }
};

export const updateAddress = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('Unauthorized');
  }

  const { id } = req.params;
  const { name, address } = req.body;
  if (!name || !address) {
    return res.status(400).send('Name and address are required');
  }

  try {
    const result = await pool.query(
      'UPDATE addresses SET name = $1, address = $2 WHERE id = $3 RETURNING *',
      [name, address, id]
    );

    const updatedAddress = result.rows[0];

    // Update sample_users table with the new address_id
    await pool.query(
      'UPDATE sample_users SET addresses_id = $1 WHERE name = $2',
      [updatedAddress.id, updatedAddress.name]
    );

    res.status(200).json(updatedAddress);
  } catch (err) {
    console.error('Database update error:', err.message);
    res.status(500).send('Server error');
  }
};

export const deleteAddress = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('Unauthorized');
  }

  const { id } = req.params;

  try {
    // Get the name associated with the address before deleting
    const result = await pool.query('SELECT name FROM addresses WHERE id = $1', [id]);
    const address = result.rows[0];

    if (address) {
      // Set address_id to null in sample_users where the name matches
      await pool.query('UPDATE sample_users SET addresses_id = NULL WHERE name = $1', [address.name]);

      // Delete the address
      await pool.query('DELETE FROM addresses WHERE id = $1', [id]);
    }

    res.status(204).send();
  } catch (err) {
    console.error('Database delete error:', err.message);
    res.status(500).send('Server error');
  }
};





