const express = require('express');
const cors = require('cors');
const axios = require('axios');
const db = require('./db');
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3004;

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

// Automatic expiry checker running every 10 seconds
setInterval(async () => {
  try {
    const result = await db.query(
      `UPDATE transaksi 
       SET status = 'EXPIRED' 
       WHERE status = 'BELUM_DIBAYAR' AND expired_at < NOW() 
       RETURNING id, kode_billing`
    );
    if (result.rows.length > 0) {
      console.log(`Expired ${result.rows.length} pending transactions:`, result.rows.map(r => r.kode_billing));
    }
  } catch (err) {
    console.error('Error during automatic expiry check:', err.message);
  }
}, 10000);

// Helper to fetch single product details from Data Master Service
async function fetchProductDetails(productId) {
  try {
    const response = await axios.get(`${process.env.DATA_MASTER_SERVICE_URL}/products/${productId}`, {
      headers: {
        'x-internal-key': process.env.GATEWAY_SECRET
      }
    });
    return response.data;
  } catch (err) {
    console.error(`Error fetching product ${productId} from Data Master:`, err.message);
    return null;
  }
}

// Helper to fetch all products from Data Master Service for mapping names
async function fetchAllProducts() {
  try {
    const response = await axios.get(`${process.env.DATA_MASTER_SERVICE_URL}/products`, {
      headers: {
        'x-internal-key': process.env.GATEWAY_SECRET
      }
    });
    return response.data;
  } catch (err) {
    console.error('Error fetching products list from Data Master:', err.message);
    return [];
  }
}

// POST /cart/add - Tambah produk ke keranjang
app.post('/cart/add', async (req, res) => {
  const { produk_id, pembeli_id } = req.body;

  if (!produk_id || !pembeli_id) {
    return res.status(400).json({ error: 'produk_id and pembeli_id are required' });
  }

  try {
    // Validate product availability and price with Data Master Service
    const product = await fetchProductDetails(produk_id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found in Data Master' });
    }

    // Insert into cart
    const result = await db.query(
      `INSERT INTO keranjang (pembeli_id, produk_id, harga, transaksi_id) 
       VALUES ($1, $2, $3, NULL) 
       RETURNING *`,
      [pembeli_id, produk_id, product.harga]
    );

    res.status(201).json({
      ...result.rows[0],
      produk_name: product.name
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /cart/:pembeli_id - Lihat keranjang
app.get('/cart/:pembeli_id', async (req, res) => {
  const { pembeli_id } = req.params;

  try {
    const cartResult = await db.query(
      `SELECT * FROM keranjang 
       WHERE pembeli_id = $1 AND transaksi_id IS NULL`,
      [pembeli_id]
    );

    const products = await fetchAllProducts();
    const productMap = {};
    products.forEach(p => {
      productMap[p.id] = p.name;
    });

    const items = cartResult.rows.map(item => ({
      ...item,
      produk_name: productMap[item.produk_id] || 'Unknown Product'
    }));

    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /cart/:id - Hapus item dari keranjang
app.delete('/cart/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      'DELETE FROM keranjang WHERE id = $1 AND transaksi_id IS NULL RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found in active cart' });
    }

    res.json({ message: 'Item removed from cart', item: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /checkout - Buat transaksi & billing
app.post('/checkout', async (req, res) => {
  const { pembeli_id } = req.body;

  if (!pembeli_id) {
    return res.status(400).json({ error: 'pembeli_id is required' });
  }

  try {
    // 1. Fetch active cart items
    const cartResult = await db.query(
      `SELECT * FROM keranjang 
       WHERE pembeli_id = $1 AND transaksi_id IS NULL`,
      [pembeli_id]
    );

    if (cartResult.rows.length === 0) {
      return res.status(400).json({ error: 'Cart is empty. Cannot checkout.' });
    }

    // 2. Calculate total_harga
    const totalHarga = cartResult.rows.reduce((sum, item) => sum + parseFloat(item.harga), 0);

    // 3. Generate unique billing code (SIM-xxxxxxxx, 8 digits)
    let isUnique = false;
    let billingCode = '';
    while (!isUnique) {
      const randDigits = Math.floor(10000000 + Math.random() * 90000000);
      billingCode = `SIM-${randDigits}`;
      const codeCheck = await db.query('SELECT id FROM transaksi WHERE kode_billing = $1', [billingCode]);
      if (codeCheck.rows.length === 0) {
        isUnique = true;
      }
    }

    // 4. Set expiry time (+24 hours)
    const expiredAt = new Date();
    expiredAt.setHours(expiredAt.getHours() + 24);

    await db.query('BEGIN');

    // 5. Create transaction
    const transactionResult = await db.query(
      `INSERT INTO transaksi (kode_billing, PEMBELI_id, total_harga, status, expired_at) 
       VALUES ($1, $2, $3, 'BELUM_DIBAYAR', $4) 
       RETURNING *`,
      [billingCode, pembeli_id, totalHarga, expiredAt]
    );
    const newTransaction = transactionResult.rows[0];

    // 6. Update cart items to reference the transaction
    await db.query(
      `UPDATE keranjang 
       SET transaksi_id = $1 
       WHERE pembeli_id = $2 AND transaksi_id IS NULL`,
      [newTransaction.id, pembeli_id]
    );

    await db.query('COMMIT');
    res.status(201).json(newTransaction);
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /transactions/:pembeli_id - Riwayat transaksi
app.get('/transactions/:pembeli_id', async (req, res) => {
  const { pembeli_id } = req.params;
  const userRole = req.headers['x-user-role'];

  try {
    let transactionResult;
    if (pembeli_id === 'all' || userRole === 'ADMIN') {
      transactionResult = await db.query('SELECT * FROM transaksi ORDER BY created_at DESC');
    } else {
      transactionResult = await db.query(
        'SELECT * FROM transaksi WHERE PEMBELI_id = $1 ORDER BY created_at DESC',
        [pembeli_id]
      );
    }

    const transactions = transactionResult.rows;
    if (transactions.length === 0) {
      return res.json([]);
    }

    // Fetch all products to map names
    const products = await fetchAllProducts();
    const productMap = {};
    products.forEach(p => {
      productMap[p.id] = p.name;
    });

    // Fetch cart items for these transactions
    const transactionIds = transactions.map(t => t.id);
    const itemsResult = await db.query(
      `SELECT * FROM keranjang WHERE transaksi_id = ANY($1::uuid[])`,
      [transactionIds]
    );

    // Group items by transaction_id
    const itemsByTx = {};
    itemsResult.rows.forEach(item => {
      if (!itemsByTx[item.transaksi_id]) {
        itemsByTx[item.transaksi_id] = [];
      }
      itemsByTx[item.transaksi_id].push({
        ...item,
        produk_name: productMap[item.produk_id] || 'Unknown Product'
      });
    });

    // Attach items to response
    const response = transactions.map(tx => ({
      ...tx,
      items: itemsByTx[tx.id] || []
    }));

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /transactions/:id/pay - Update status pembayaran
app.put('/transactions/:id/pay', async (req, res) => {
  const { id } = req.params;

  try {
    const txCheck = await db.query('SELECT id, status FROM transaksi WHERE id = $1', [id]);
    if (txCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (txCheck.rows[0].status !== 'BELUM_DIBAYAR') {
      return res.status(400).json({ error: `Cannot pay transaction with status: ${txCheck.rows[0].status}` });
    }

    const result = await db.query(
      `UPDATE transaksi 
       SET status = 'SUDAH_DIBAYAR' 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Transaksi Service is running on port ${PORT}`);
});
