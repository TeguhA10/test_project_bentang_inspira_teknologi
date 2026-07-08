const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3003;

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

// GET /products - List produk
app.get('/products', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM produk ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /products/:id - Detail produk (useful for internal service validation)
app.get('/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM produk WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /products - Tambah produk
app.post('/products', async (req, res) => {
  const { name, harga } = req.body;

  if (!name || harga === undefined) {
    return res.status(400).json({ error: 'Name and price (harga) are required' });
  }

  const numericHarga = parseFloat(harga);
  if (isNaN(numericHarga) || numericHarga < 0) {
    return res.status(400).json({ error: 'Price must be a non-negative number' });
  }

  try {
    // Check unique name
    const nameCheck = await db.query('SELECT id FROM produk WHERE name = $1', [name]);
    if (nameCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Product name must be unique' });
    }

    const result = await db.query(
      `INSERT INTO produk (name, harga) 
       VALUES ($1, $2) 
       RETURNING *`,
      [name, numericHarga]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /products/:id - Update produk
app.put('/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, harga } = req.body;

  if (!name || harga === undefined) {
    return res.status(400).json({ error: 'Name and price (harga) are required' });
  }

  const numericHarga = parseFloat(harga);
  if (isNaN(numericHarga) || numericHarga < 0) {
    return res.status(400).json({ error: 'Price must be a non-negative number' });
  }

  try {
    // Check product existence
    const productCheck = await db.query('SELECT id FROM produk WHERE id = $1', [id]);
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check unique name excluding current product
    const nameCheck = await db.query('SELECT id FROM produk WHERE name = $1 AND id <> $2', [name, id]);
    if (nameCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Product name is already in use' });
    }

    const result = await db.query(
      `UPDATE produk 
       SET name = $1, harga = $2 
       WHERE id = $3 
       RETURNING *`,
      [name, numericHarga, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /products/:id - Hapus produk
app.delete('/products/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const productCheck = await db.query('SELECT id FROM produk WHERE id = $1', [id]);
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await db.query('DELETE FROM produk WHERE id = $1', [id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Data Master Service is running on port ${PORT}`);
});
