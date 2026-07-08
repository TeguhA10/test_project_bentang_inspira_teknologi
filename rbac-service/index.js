const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const db = require('./db');
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Gateway Security Middleware
const checkGatewaySecurity = (req, res, next) => {
  const internalKey = req.headers['x-internal-key'];
  if (!internalKey || internalKey !== process.env.GATEWAY_SECRET) {
    return res.status(403).json({ error: 'Access denied: Invalid internal key' });
  }
  next();
};

app.use(checkGatewaySecurity);

// Helper function to sync with Auth Service
async function syncWithAuthService(method, path, data = null) {
  try {
    await axios({
      method,
      url: `${process.env.AUTH_SERVICE_URL}${path}`,
      data,
      headers: {
        'x-internal-key': process.env.GATEWAY_SECRET
      }
    });
    console.log(`Successfully synced ${method} ${path} with Auth Service`);
    return true;
  } catch (err) {
    console.error(`Failed to sync with Auth Service (${method} ${path}):`, err.response?.data || err.message);
    throw new Error('Auth Service sync failure');
  }
}

// GET /users - List data user
app.get('/users', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.name, u.email, u.status, u.created_at, r.role 
       FROM users u 
       LEFT JOIN users_role r ON u.id = r.user_id 
       ORDER BY u.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /add_users - Tambah user
app.post('/add_users', async (req, res) => {
  const { name, email, password, status, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password and role are required' });
  }

  // Validate role
  if (role !== 'ADMIN' && role !== 'PEMBELI') {
    return res.status(400).json({ error: 'Invalid role. Must be ADMIN or PEMBELI' });
  }

  try {
    // Check if email already exists
    const emailCheck = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userStatus = status !== undefined ? status : true;

    await db.query('BEGIN');

    // 1. Insert user
    const userResult = await db.query(
      `INSERT INTO users (name, email, password, status) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, email, status, created_at`,
      [name, email, hashedPassword, userStatus]
    );
    const newUser = userResult.rows[0];

    // 2. Insert role
    await db.query(
      `INSERT INTO users_role (user_id, role) VALUES ($1, $2)`,
      [newUser.id, role]
    );

    // 3. Sync to Auth Service
    await syncWithAuthService('POST', '/internal/users', {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      password: hashedPassword,
      status: newUser.status,
      role
    });

    await db.query('COMMIT');
    res.status(201).json({ ...newUser, role });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

// PUT /update_users/:id - Update user
app.put('/update_users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, password, status, role } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Name, email and role are required' });
  }

  if (role !== 'ADMIN' && role !== 'PEMBELI') {
    return res.status(400).json({ error: 'Invalid role. Must be ADMIN or PEMBELI' });
  }

  try {
    // Check user existence
    const userCheck = await db.query('SELECT id, password FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check unique email (excluding current user)
    const emailCheck = await db.query('SELECT id FROM users WHERE email = $1 AND id <> $2', [email, id]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const userStatus = status !== undefined ? status : true;

    await db.query('BEGIN');

    // 1. Update user
    let updateQuery = 'UPDATE users SET name = $1, email = $2, status = $3';
    const params = [name, email, userStatus];

    if (hashedPassword) {
      updateQuery += ', password = $4 WHERE id = $5';
      params.push(hashedPassword, id);
    } else {
      updateQuery += ' WHERE id = $4';
      params.push(id);
    }

    await db.query(updateQuery, params);

    // 2. Update role
    await db.query('DELETE FROM users_role WHERE user_id = $1', [id]);
    await db.query(
      'INSERT INTO users_role (user_id, role) VALUES ($1, $2)',
      [id, role]
    );

    // 3. Sync to Auth Service
    await syncWithAuthService('PUT', `/internal/users/${id}`, {
      name,
      email,
      password: hashedPassword, // will be null if password is not updated
      status: userStatus,
      role
    });

    await db.query('COMMIT');
    res.json({ id, name, email, status: userStatus, role });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

// DELETE /delete_users/:id - Hapus user
app.delete('/delete_users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const userCheck = await db.query('SELECT id FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    await db.query('BEGIN');

    // 1. Delete user from RBAC db
    await db.query('DELETE FROM users WHERE id = $1', [id]);

    // 2. Sync deletion to Auth Service
    await syncWithAuthService('DELETE', `/internal/users/${id}`);

    await db.query('COMMIT');
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`RBAC Service is running on port ${PORT}`);
});
