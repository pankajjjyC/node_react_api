import express from 'express';
import session from 'express-session';
import bcrypt from 'bcrypt';
import pool from './db.js'; // Ensure this is the correct path to db.js

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session management
app.use(session({
  secret: 'your_secret_key', // Replace with a strong secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Use `secure: true` if using HTTPS
}));

// Registration endpoint
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send('Username and password are required');
  }

  try {
    // Check if the user already exists
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length > 0) {
      return res.status(400).send('User already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into the database
    await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);

    res.status(201).send('User registered successfully');
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).send('Server error');
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send('Username and password are required');
  }

  try {
    // Check if the user exists
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).send('Invalid username or password');
    }

    // Compare passwords
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).send('Invalid username or password');
    }

    // Set session data
    req.session.userId = user.id;
    res.status(200).send('Login successful');
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).send('Server error');
  }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Logout error');
    }
    res.status(200).send('Logout successful');
  });
});

// Get current logged-in user
app.get('/api/current-user', (req, res) => {
  if (req.session.userId) {
    res.json({ userId: req.session.userId });
  } else {
    res.status(401).send('Not logged in');
  }
});

// Users endpoints
app.get('/api/users', async (req, res) => {
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

app.post('/api/users', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('Unauthorized');
  }

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send('Username and password are required');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
      [username, hashedPassword]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Database insert error:', err.message);
    res.status(500).send('Server error');
  }
});

app.put('/api/users/:id', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('Unauthorized');
  }

  const { id } = req.params;
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send('Username and password are required');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'UPDATE users SET username = $1, password = $2 WHERE id = $3 RETURNING *',
      [username, hashedPassword, id]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Database update error:', err.message);
    res.status(500).send('Server error');
  }
});

app.delete('/api/users/:id', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('Unauthorized');
  }

  const { id } = req.params;

  try {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error('Database delete error:', err.message);
    res.status(500).send('Server error');
  }
});

// Sample Users endpoints
app.get('/api/user', async (req, res) => {
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
});

app.post('/api/user', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('Unauthorized');
  }

  const { name, age } = req.body;
  if (!name || !age) {
    return res.status(400).send('Name and age are required');
  }

  try {
    const result = await pool.query(
      'INSERT INTO sample_users (name, age) VALUES ($1, $2) RETURNING *',
      [name, age]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Database insert error:', err.message);
    res.status(500).send('Server error');
  }
});

app.put('/api/user/:id', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('Unauthorized');
  }

  const { id } = req.params;
  const { name, age } = req.body;
  if (!name || !age) {
    return res.status(400).send('Name and age are required');
  }

  try {
    const result = await pool.query(
      'UPDATE sample_users SET name = $1, age = $2 WHERE id = $3 RETURNING *',
      [name, age, id]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Database update error:', err.message);
    res.status(500).send('Server error');
  }
});

app.delete('/api/user/:id', async (req, res) => {
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
});

// Designation endpoints
app.get('/api/designation', async (req, res) => {
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

app.post('/api/designation', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('Unauthorized');
  }

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
});

app.put('/api/designation/:id', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('Unauthorized');
  }

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
});

app.delete('/api/designation/:id', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('Unauthorized');
  }

  const { id } = req.params;

  try {
    await pool.query('DELETE FROM designations WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error('Database delete error:', err.message);
    res.status(500).send('Server error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});











// // Import necessary modules
// import express from 'express';
// import session from 'express-session';
// import bcrypt from 'bcrypt';
// import pool from './db.js'; // Ensure this is the correct path to db.js

// const app = express();
// const port = process.env.PORT || 3000;

// // Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));


// // Session management
// app.use(session({
//   secret: 'your_secret_key', // Replace with a strong secret key
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: false } // Use `secure: true` if using HTTPS
// }));

// // Routes

// // Registration endpoint
// app.post('/api/register', async (req, res) => {
//   const { username, password } = req.body;

//   if (!username || !password) {
//     return res.status(400).send('Username and password are required');
//   }

//   try {
//     // Check if the user already exists
//     const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
//     if (result.rows.length > 0) {
//       return res.status(400).send('User already exists');
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Insert new user into the database
//     await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);

//     res.status(201).send('User registered successfully');
//   } catch (err) {
//     console.error('Registration error:', err.message);
//     res.status(500).send('Server error');
//   }
// });

// // Login endpoint
// app.post('/api/login', async (req, res) => {
//   const { username, password } = req.body;

//   if (!username || !password) {
//     return res.status(400).send('Username and password are required');
//   }

//   try {
//     // Check if the user exists
//     const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
//     if (result.rows.length === 0) {
//       return res.status(401).send('Invalid username or password');
//     }

//     // Compare passwords
//     const user = result.rows[0];
//     const match = await bcrypt.compare(password, user.password);
//     if (!match) {
//       return res.status(401).send('Invalid username or password');
//     }

//     // Set session data
//     req.session.userId = user.id;
//     res.status(200).send('Login successful');
//   } catch (err) {
//     console.error('Login error:', err.message);
//     res.status(500).send('Server error');
//   }
// });

// // Logout endpoint
// app.post('/api/logout', (req, res) => {
//   req.session.destroy(err => {
//     if (err) {
//       return res.status(500).send('Logout error');
//     }
//     res.status(200).send('Logout successful');
//   });
// });

// // Protected route
// app.get('/api/user', async (req, res) => {
//   if (!req.session.userId) {
//     return res.status(401).send('Unauthorized');
//   }

//   try {
//     const result = await pool.query('SELECT * FROM sample_users'); // Adjust the query to match your table structure
//     res.json(result.rows);
//   } catch (err) {
//     console.error('Database query error:', err.message);
//     res.status(500).send('Server error');
//   }
// });

// // Insert a new user into sample_users
// app.post('/api/user', async (req, res) => {
//   if (!req.session.userId) {
//     return res.status(401).send('Unauthorized');
//   }

//   const { name, age } = req.body;
//   if (!name || !age) {
//     return res.status(400).send('Name and age are required');
//   }

//   try {
//     const result = await pool.query(
//       'INSERT INTO sample_users (name, age) VALUES ($1, $2) RETURNING *',
//       [name, age]
//     );
//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     console.error('Database insert error:', err.message);
//     res.status(500).send('Server error');
//   }
// });

// // Update an existing user in sample_users
// app.put('/api/user/:id', async (req, res) => {
//   if (!req.session.userId) {
//     return res.status(401).send('Unauthorized');
//   }

//   const { id } = req.params;
//   const { name, age } = req.body;
//   if (!name || !age) {
//     return res.status(400).send('Name and age are required');
//   }

//   try {
//     const result = await pool.query(
//       'UPDATE sample_users SET name = $1, age = $2 WHERE id = $3 RETURNING *',
//       [name, age, id]
//     );
//     res.status(200).json(result.rows[0]);
//   } catch (err) {
//     console.error('Database update error:', err.message);
//     res.status(500).send('Server error');
//   }
// });

// // Delete a user from sample_users
// app.delete('/api/user/:id', async (req, res) => {
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
// });

// // Get current logged-in user
// app.get('/api/current-user', (req, res) => {
//   if (req.session.user) {
//     res.json({ username: req.session.user });
//   } else {
//     res.status(401).send('Not logged in');
//   }
// });





// // Add these routes in your backend/index.js file

// // Get all users
// app.get('/api/users', async (req, res) => {
//   if (!req.session.userId) {
//     return res.status(401).send('Unauthorized');
//   }

//   try {
//     const result = await pool.query('SELECT * FROM users');
//     res.json(result.rows);
//   } catch (err) {
//     console.error('Database query error:', err.message);
//     res.status(500).send('Server error');
//   }
// });

// // Add a new user
// app.post('/api/users', async (req, res) => {
//   if (!req.session.userId) {
//     return res.status(401).send('Unauthorized');
//   }

//   const { username, password } = req.body;
//   if (!username || !password) {
//     return res.status(400).send('Username and password are required');
//   }

//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const result = await pool.query(
//       'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
//       [username, hashedPassword]
//     );
//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     console.error('Database insert error:', err.message);
//     res.status(500).send('Server error');
//   }
// });

// // Update an existing user
// app.put('/api/users/:id', async (req, res) => {
//   if (!req.session.userId) {
//     return res.status(401).send('Unauthorized');
//   }

//   const { id } = req.params;
//   const { username, password } = req.body;
//   if (!username || !password) {
//     return res.status(400).send('Username and password are required');
//   }

//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const result = await pool.query(
//       'UPDATE users SET username = $1, password = $2 WHERE id = $3 RETURNING *',
//       [username, hashedPassword, id]
//     );
//     res.status(200).json(result.rows[0]);
//   } catch (err) {
//     console.error('Database update error:', err.message);
//     res.status(500).send('Server error');
//   }
// });

// // Delete a user
// app.delete('/api/users/:id', async (req, res) => {
//   if (!req.session.userId) {
//     return res.status(401).send('Unauthorized');
//   }

//   const { id } = req.params;

//   try {
//     await pool.query('DELETE FROM users WHERE id = $1', [id]);
//     res.status(204).send();
//   } catch (err) {
//     console.error('Database delete error:', err.message);
//     res.status(500).send('Server error');
//   }
// });




// //designation


// // Get all designations
// router.get('/api/designation', async (req, res) => {
//   if (!req.session.userId) {
//     return res.status(401).send('Unauthorized');
//   }

//   try {
//     const result = await pool.query('SELECT * FROM designations');
//     res.json(result.rows);
//   } catch (err) {
//     console.error('Database query error:', err.message);
//     res.status(500).send('Server error');
//   }
// });

// // Insert a new designation into designations
// router.post('/api/designation', async (req, res) => {
//   if (!req.session.userId) {
//     return res.status(401).send('Unauthorized');
//   }

//   const { name, description } = req.body;
//   if (!name || !description) {
//     return res.status(400).send('Name and description are required');
//   }

//   try {
//     const result = await pool.query(
//       'INSERT INTO designations (name, description) VALUES ($1, $2) RETURNING *',
//       [name, description]
//     );
//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     console.error('Database insert error:', err.message);
//     res.status(500).send('Server error');
//   }
// });

// // Update an existing designation in designations
// router.put('/api/designation/:id', async (req, res) => {
//   if (!req.session.userId) {
//     return res.status(401).send('Unauthorized');
//   }

//   const { id } = req.params;
//   const { name, description } = req.body;
//   if (!name || !description) {
//     return res.status(400).send('Name and description are required');
//   }

//   try {
//     const result = await pool.query(
//       'UPDATE designations SET name = $1, description = $2 WHERE id = $3 RETURNING *',
//       [name, description, id]
//     );
//     res.status(200).json(result.rows[0]);
//   } catch (err) {
//     console.error('Database update error:', err.message);
//     res.status(500).send('Server error');
//   }
// });

// // Delete a designation from designations
// router.delete('/api/designation/:id', async (req, res) => {
//   if (!req.session.userId) {
//     return res.status(401).send('Unauthorized');
//   }

//   const { id } = req.params;

//   try {
//     await pool.query('DELETE FROM designations WHERE id = $1', [id]);
//     res.status(204).send();
//   } catch (err) {
//     console.error('Database delete error:', err.message);
//     res.status(500).send('Server error');
//   }
// });

// module.exports = router;






// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });




