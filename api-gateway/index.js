const express = require('express');
const cors = require('cors');
const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS with Credentials
app.use(cors({
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

// Helper to get token from cookies
const getCookieToken = (req) => {
  const cookies = req.headers.cookie;
  if (!cookies) return null;
  const match = cookies.match(new RegExp('(^| )token=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
};

// Auth Middleware (Validasi JWT)
const authenticateJWT = async (req, res, next) => {
  let token = getCookieToken(req);
  if (!token) {
    const authHeader = req.headers['authorization'];
    token = authHeader && authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Access token is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Call Auth Service to check if token is blacklisted (logged out)
    const response = await axios.post(`${process.env.AUTH_SERVICE_URL}/check-blacklist`, { token }, {
      headers: {
        'x-internal-key': process.env.GATEWAY_SECRET
      }
    });

    if (response.data && response.data.blacklisted) {
      return res.status(401).json({ error: 'Token has been invalidated. Please log in again.' });
    }

    req.user = decoded; // Contains user_id, email, role
    next();
  } catch (err) {
    console.error('JWT Verification / Blacklist check Error:', err.message);
    return res.status(401).json({ error: 'Invalid or expired access token' });
  }
};

// RBAC Middleware
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied: Insufficient permissions' });
    }
    next();
  };
};

// Proxy Helper Function
async function proxyRequest(req, res, targetUrl, method = null, overrideBody = null) {
  const finalMethod = method || req.method;
  const headers = {
    'x-internal-key': process.env.GATEWAY_SECRET
  };

  // If user is authenticated, forward their info
  if (req.user) {
    headers['x-user-id'] = req.user.user_id;
    headers['x-user-role'] = req.user.role;
    headers['x-user-email'] = req.user.email;
  }

  // Forward authorization header for endpoints like refresh-token
  if (req.headers['authorization']) {
    headers['authorization'] = req.headers['authorization'];
  }

  try {
    const response = await axios({
      method: finalMethod,
      url: targetUrl,
      data: overrideBody || req.body,
      headers,
      params: req.query,
      validateStatus: () => true // Allow proxying all status codes
    });

    res.status(response.status).json(response.data);
  } catch (err) {
    console.error(`Gateway proxy error to ${targetUrl}:`, err.message);
    res.status(500).json({ error: 'Gateway failed to reach downstream service' });
  }
}

// ==========================================
// PUBLIC ROUTES
// ==========================================

// Login User
app.post('/api/login', async (req, res) => {
  try {
    const response = await axios.post(`${process.env.AUTH_SERVICE_URL}/login`, req.body, {
      headers: {
        'x-internal-key': process.env.GATEWAY_SECRET
      },
      validateStatus: () => true
    });

    if (response.status === 200 && response.data.token) {
      res.cookie('token', response.data.token, {
        httpOnly: true,
        secure: false, // set to true if using HTTPS
        sameSite: 'lax',
        maxAge: 3600 * 1000, // 1 hour matching token expiry
        path: '/'
      });
      return res.status(200).json({ success: true });
    }

    res.status(response.status).json(response.data);
  } catch (err) {
    console.error('Login Gateway proxy error:', err.message);
    res.status(500).json({ error: 'Gateway failed to reach Auth Service' });
  }
});

// Refresh Token
app.post('/api/refresh-token', async (req, res) => {
  try {
    let token = getCookieToken(req);
    if (!token) {
      const authHeader = req.headers['authorization'];
      token = authHeader && authHeader.split(' ')[1];
    }

    const response = await axios.post(`${process.env.AUTH_SERVICE_URL}/refresh-token`, {}, {
      headers: {
        'x-internal-key': process.env.GATEWAY_SECRET,
        'authorization': token ? `Bearer ${token}` : ''
      },
      validateStatus: () => true
    });

    if (response.status === 200 && response.data.token) {
      res.cookie('token', response.data.token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 3600 * 1000,
        path: '/'
      });
      return res.status(200).json({ success: true });
    }

    res.status(response.status).json(response.data);
  } catch (err) {
    console.error('Refresh Token Gateway proxy error:', err.message);
    res.status(500).json({ error: 'Gateway failed to reach Auth Service' });
  }
});

// ==========================================
// PROTECTED ROUTES
// ==========================================

// GET /api/me - Info user login (ADMIN, PEMBELI)
app.get('/api/me', authenticateJWT, (req, res) => {
  proxyRequest(req, res, `${process.env.AUTH_SERVICE_URL}/me`);
});

// POST /api/logout - Logout user (ADMIN, PEMBELI)
app.post('/api/logout', authenticateJWT, async (req, res) => {
  try {
    let token = getCookieToken(req);
    if (!token) {
      const authHeader = req.headers['authorization'];
      token = authHeader && authHeader.split(' ')[1];
    }

    const response = await axios.post(`${process.env.AUTH_SERVICE_URL}/logout`, {}, {
      headers: {
        'x-internal-key': process.env.GATEWAY_SECRET,
        'authorization': token ? `Bearer ${token}` : ''
      },
      validateStatus: () => true
    });

    res.clearCookie('token', { path: '/' });
    res.status(response.status).json(response.data);
  } catch (err) {
    console.error('Logout Gateway proxy error:', err.message);
    res.status(500).json({ error: 'Gateway failed to reach Auth Service' });
  }
});

// ==========================================
// RBAC SERVICE ROUTES (ADMIN ONLY)
// ==========================================
app.get('/api/users', authenticateJWT, authorizeRoles('ADMIN'), (req, res) => {
  proxyRequest(req, res, `${process.env.RBAC_SERVICE_URL}/users`);
});

app.post('/api/users', authenticateJWT, authorizeRoles('ADMIN'), (req, res) => {
  proxyRequest(req, res, `${process.env.RBAC_SERVICE_URL}/add_users`);
});

app.put('/api/users/:id', authenticateJWT, authorizeRoles('ADMIN'), (req, res) => {
  proxyRequest(req, res, `${process.env.RBAC_SERVICE_URL}/update_users/${req.params.id}`);
});

app.delete('/api/users/:id', authenticateJWT, authorizeRoles('ADMIN'), (req, res) => {
  proxyRequest(req, res, `${process.env.RBAC_SERVICE_URL}/delete_users/${req.params.id}`);
});

// ==========================================
// DATA MASTER SERVICE ROUTES
// ==========================================
// List products (ADMIN, PEMBELI)
app.get('/api/products', authenticateJWT, authorizeRoles('ADMIN', 'PEMBELI'), (req, res) => {
  proxyRequest(req, res, `${process.env.DATA_MASTER_SERVICE_URL}/products`);
});

// Create product (ADMIN only)
app.post('/api/products', authenticateJWT, authorizeRoles('ADMIN'), (req, res) => {
  proxyRequest(req, res, `${process.env.DATA_MASTER_SERVICE_URL}/products`);
});

// Update product (ADMIN only)
app.put('/api/products/:id', authenticateJWT, authorizeRoles('ADMIN'), (req, res) => {
  proxyRequest(req, res, `${process.env.DATA_MASTER_SERVICE_URL}/products/${req.params.id}`);
});

// Delete product (ADMIN only)
app.delete('/api/products/:id', authenticateJWT, authorizeRoles('ADMIN'), (req, res) => {
  proxyRequest(req, res, `${process.env.DATA_MASTER_SERVICE_URL}/products/${req.params.id}`);
});

// ==========================================
// TRANSAKSI SERVICE ROUTES
// ==========================================
// Add product to cart (PEMBELI only)
app.post('/api/cart/add', authenticateJWT, authorizeRoles('PEMBELI'), (req, res) => {
  const { produk_id } = req.body;
  // Inject buyer's ID from token payload to prevent spoofing
  const body = {
    produk_id,
    pembeli_id: req.user.user_id
  };
  proxyRequest(req, res, `${process.env.TRANSAKSI_SERVICE_URL}/cart/add`, 'POST', body);
});

// View cart (PEMBELI only)
app.get('/api/cart', authenticateJWT, authorizeRoles('PEMBELI'), (req, res) => {
  proxyRequest(req, res, `${process.env.TRANSAKSI_SERVICE_URL}/cart/${req.user.user_id}`, 'GET');
});

// Remove item from cart (PEMBELI only)
app.delete('/api/cart/:id', authenticateJWT, authorizeRoles('PEMBELI'), (req, res) => {
  proxyRequest(req, res, `${process.env.TRANSAKSI_SERVICE_URL}/cart/${req.params.id}`, 'DELETE');
});

// Checkout transaction (PEMBELI only)
app.post('/api/checkout', authenticateJWT, authorizeRoles('PEMBELI'), (req, res) => {
  const body = {
    pembeli_id: req.user.user_id
  };
  proxyRequest(req, res, `${process.env.TRANSAKSI_SERVICE_URL}/checkout`, 'POST', body);
});

// Get transactions history (ADMIN, PEMBELI)
// - If user is ADMIN, forwards 'all'
// - If user is PEMBELI, forwards user's own id
app.get('/api/transactions', authenticateJWT, authorizeRoles('ADMIN', 'PEMBELI'), (req, res) => {
  const targetId = req.user.role === 'ADMIN' ? 'all' : req.user.user_id;
  proxyRequest(req, res, `${process.env.TRANSAKSI_SERVICE_URL}/transactions/${targetId}`, 'GET');
});

// Update transaction payment status (ADMIN only)
app.put('/api/transactions/:id/pay', authenticateJWT, authorizeRoles('ADMIN'), (req, res) => {
  proxyRequest(req, res, `${process.env.TRANSAKSI_SERVICE_URL}/transactions/${req.params.id}/pay`, 'PUT');
});

app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
});
