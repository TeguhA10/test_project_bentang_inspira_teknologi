const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

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

// Helper function to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      user_id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// POST /login - Autentikasi user
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const userResult = await db.query(
      `SELECT u.*, r.role 
       FROM users u 
       LEFT JOIN users_role r ON u.id = r.user_id 
       WHERE u.email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userResult.rows[0];

    if (!user.status) {
      return res.status(403).json({ error: 'User is inactive' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /me - Ambil data user & role
app.get('/me', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(400).json({ error: 'User ID is missing from gateway' });
  }

  try {
    const result = await db.query(
      `SELECT u.id, u.name, u.email, u.status, u.created_at, r.role 
       FROM users u 
       LEFT JOIN users_role r ON u.id = r.user_id 
       WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /refresh-token - Perbarui token
app.post('/refresh-token', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    
    // Check if user still exists and is active
    const userResult = await db.query(
      `SELECT u.id, u.email, u.status, r.role 
       FROM users u 
       LEFT JOIN users_role r ON u.id = r.user_id 
       WHERE u.id = $1`,
      [decoded.user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    if (!user.status) {
      return res.status(403).json({ error: 'User is inactive' });
    }

    const newToken = generateToken(user);
    res.json({ token: newToken });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// POST /logout - Logout user and blacklist token
app.post('/logout', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const decoded = jwt.decode(token);
    const expiredAt = decoded && decoded.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 3600 * 1000);

    // Save token to blacklist database
    await db.query(
      `INSERT INTO token_blacklist (token, expired_at) 
       VALUES ($1, $2) 
       ON CONFLICT (token) DO NOTHING`,
      [token, expiredAt]
    );

    res.json({ message: 'Logout successful' });
  } catch (err) {
    console.error('Error blacklisting token:', err);
    res.status(500).json({ error: 'Failed to blacklist token' });
  }
});

// POST /check-blacklist - Check if token is blacklisted
app.post('/check-blacklist', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const result = await db.query('SELECT token FROM token_blacklist WHERE token = $1', [token]);
    const blacklisted = result.rows.length > 0;
    res.json({ blacklisted });
  } catch (err) {
    console.error('Error checking token blacklist:', err);
    res.status(500).json({ error: 'Failed to check token blacklist' });
  }
});

// Periodically clean up expired tokens from blacklist every 5 minutes
setInterval(async () => {
  try {
    const result = await db.query('DELETE FROM token_blacklist WHERE expired_at < NOW() RETURNING token');
    if (result.rows.length > 0) {
      console.log(`Cleaned up ${result.rows.length} expired tokens from blacklist.`);
    }
  } catch (err) {
    console.error('Error cleaning up token blacklist:', err.message);
  }
}, 5 * 60 * 1000);

// ==========================================
// INTERNAL SYNC ENDPOINTS (Called by RBAC Service)
// ==========================================

// POST /internal/users - Sync user creation
app.post('/internal/users', async (req, res) => {
  const { id, name, email, password, status, role } = req.body;

  try {
    await db.query('BEGIN');

    // Create user in Auth database
    await db.query(
      `INSERT INTO users (id, name, email, password, status) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (email) DO UPDATE 
       SET name = EXCLUDED.name, password = EXCLUDED.password, status = EXCLUDED.status`,
      [id, name, email, password, status]
    );

    // Delete existing roles if any and re-add
    await db.query(`DELETE FROM users_role WHERE user_id = $1`, [id]);
    await db.query(
      `INSERT INTO users_role (user_id, role) VALUES ($1, $2)`,
      [id, role]
    );

    await db.query('COMMIT');
    res.status(201).json({ message: 'User synced successfully' });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('Error in internal user sync:', err);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

// PUT /internal/users/:id - Sync user update
app.put('/internal/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, password, status, role } = req.body;

  try {
    await db.query('BEGIN');

    let updateQuery = 'UPDATE users SET name = $1, email = $2, status = $3';
    const params = [name, email, status];

    if (password) {
      updateQuery += ', password = $4 WHERE id = $5';
      params.push(password, id);
    } else {
      updateQuery += ' WHERE id = $4';
      params.push(id);
    }

    await db.query(updateQuery, params);

    // Update role
    await db.query('DELETE FROM users_role WHERE user_id = $1', [id]);
    await db.query(
      'INSERT INTO users_role (user_id, role) VALUES ($1, $2)',
      [id, role]
    );

    await db.query('COMMIT');
    res.json({ message: 'User updated and synced successfully' });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('Error in internal user update sync:', err);
    res.status(500).json({ error: 'Failed to sync user update' });
  }
});

// DELETE /internal/users/:id - Sync user deletion
app.delete('/internal/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await db.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'User deleted and synced successfully' });
  } catch (err) {
    console.error('Error in internal user delete sync:', err);
    res.status(500).json({ error: 'Failed to sync user deletion' });
  }
});

app.listen(PORT, () => {
  console.log(`Auth Service is running on port ${PORT}`);
});
