import pool from '../db.js';

export const getSampleUsers = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const result = await pool.query('SELECT * FROM sample_users');
    res.json(result.rows);
  } catch (err) {
    console.error('Database query error:', err.message);
    res.status(500).send('Server error');
  }
};

export const createSampleUser = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('Unauthorized');
  }

  const { name, age, designation_id } = req.body;
  if (!name || !age || !designation_id) {
    return res.status(400).send('Name, age, and designation are required');
  }

  try {
    const result = await pool.query(
      'INSERT INTO sample_users (name, age, designation_id) VALUES ($1, $2, $3) RETURNING *',
      [name, age, designation_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Database insert error:', err.message);
    res.status(500).send('Server error');
  }
};

export const updateSampleUser = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('Unauthorized');
  }

  const { id } = req.params;
  const { name, age, designation_id } = req.body;
  if (!name || !age || !designation_id) {
    return res.status(400).send('Name, age, and designation are required');
  }

  try {
    const result = await pool.query(
      'UPDATE sample_users SET name = $1, age = $2, designation_id = $3 WHERE id = $4 RETURNING *',
      [name, age, designation_id, id]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Database update error:', err.message);
    res.status(500).send('Server error');
  }
};

export const deleteSampleUser = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('Unauthorized');
  }

  const { id } = req.params;

  try {
    await pool.query('DELETE FROM sample_users WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error('Database delete error:', err.message);
    res.status(500).send('Server error');
  }
};

export const getSampleUserNames = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const query = `
      SELECT su.name, d.title, a.address
      FROM sample_users su
      JOIN designations d ON su.designation_id = d.id
      JOIN addresses a ON su.addresses_id = a.id;
    `;

    
    // SELECT su.name, d.title
    // FROM sample_users su
    // JOIN designations d ON su.designation_id = d.id;

    const result = await pool.query(query);
    res.json(result.rows); // Return the rows as is since they contain name, address, and designation
  } catch (err) {
    console.error('Database query error:', err.message);
    res.status(500).send('Server error');
  }
};













// import pool from '../db.js';

// export const getSampleUsers = async (req, res) => {
//   if (!req.session.userId) {
//     return res.status(401).send('Unauthorized');
//   }

//   try {
//     const result = await pool.query('SELECT * FROM sample_users');
//     res.json(result.rows);
//   } catch (err) {
//     console.error('Database query error:', err.message);
//     res.status(500).send('Server error');
//   }
// };

// export const createSampleUser = async (req, res) => {
//   if (!req.session.userId) {
//     return res.status(401).send('Unauthorized');
//   }

//   const { name, age, designation_id } = req.body;
//   if (!name || !age || !designation_id) {
//     return res.status(400).send('Name, age, and designation are required');
//   }

//   try {
//     const result = await pool.query(
//       'INSERT INTO sample_users (name, age, designation_id) VALUES ($1, $2, $3) RETURNING *',
//       [name, age, designation_id]
//     );
//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     console.error('Database insert error:', err.message);
//     res.status(500).send('Server error');
//   }
// };

// export const updateSampleUser = async (req, res) => {
//   if (!req.session.userId) {
//     return res.status(401).send('Unauthorized');
//   }

//   const { id } = req.params;
//   const { name, age, designation_id } = req.body;
//   if (!name || !age || !designation_id) {
//     return res.status(400).send('Name, age, and designation are required');
//   }

//   try {
//     const result = await pool.query(
//       'UPDATE sample_users SET name = $1, age = $2, designation_id = $3 WHERE id = $4 RETURNING *',
//       [name, age, designation_id, id]
//     );
//     res.status(200).json(result.rows[0]);
//   } catch (err) {
//     console.error('Database update error:', err.message);
//     res.status(500).send('Server error');
//   }
// };

// export const deleteSampleUser = async (req, res) => {
//   if (!req.session.userId) {
//     return res.status(401).send('Unauthorized');
//   }

//   const { id } = req.params;

//   try {
//     await pool.query('DELETE FROM sample_users WHERE id = $1', [id]);
//     res.status(204).send();
//   } catch (err) {
//     console.error('Database delete error:', err.message);
//     res.status(500).send('Server error');
//   }
// };





// export const getSampleUserNames = async (req, res) => {
//   if (!req.session.userId) {
//     return res.status(401).send('Unauthorized');
//   }

//   try {
//     const result = await pool.query('SELECT name FROM sample_users');
//     // Assuming result.rows contains an array of objects with a `name` property
//     res.json(result.rows.map(row => ({ name: row.name }))); // Ensure only `name` is included
//   } catch (err) {
//     console.error('Database query error:', err.message);
//     res.status(500).send('Server error');
//   }
// };
