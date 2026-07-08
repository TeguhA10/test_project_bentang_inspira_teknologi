const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'password123!';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '5432';
const PG_CONNECTION_STRING = `postgresql://${DB_USER}:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST}:${DB_PORT}/postgres`;

async function executeQueryOnDefaultDb(query) {
  const client = new Client({ connectionString: PG_CONNECTION_STRING });
  await client.connect();
  try {
    await client.query(query);
  } finally {
    await client.end();
  }
}

async function executeQueryOnSpecificDb(dbName, query) {
  const connectionString = `postgresql://${DB_USER}:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST}:${DB_PORT}/${dbName}`;
  const client = new Client({ connectionString });
  await client.connect();
  try {
    await client.query(query);
  } finally {
    await client.end();
  }
}

async function applyUniqueConstraint(dbName) {
  try {
    // 1. Delete duplicates from users_role (keep only one per user_id)
    await executeQueryOnSpecificDb(dbName, `
      DELETE FROM users_role a USING users_role b 
      WHERE a.id > b.id AND a.user_id = b.user_id;
    `);
    // 2. Add UNIQUE constraint (ignoring errors if it already exists)
    await executeQueryOnSpecificDb(dbName, `
      ALTER TABLE users_role ADD CONSTRAINT unique_user_id UNIQUE (user_id);
    `);
    console.log(`Applied unique constraint to users_role in ${dbName}`);
  } catch (err) {
    console.log(`Note: Unique constraint on users_role in ${dbName} already exists or could not be created:`, err.message);
  }
}

async function init() {
  console.log('Starting Database Initialization...');

  // 1. Recreate databases
  const databases = [
    'auth_service_db',
    'rbac_service_db',
    'data_master_service_db',
    'transaksi_service_db'
  ];

  for (const db of databases) {
    try {
      console.log(`Dropping database if exists: ${db}...`);
      await executeQueryOnDefaultDb(`DROP DATABASE IF EXISTS ${db};`);
      console.log(`Creating database: ${db}...`);
      await executeQueryOnDefaultDb(`CREATE DATABASE ${db};`);
    } catch (err) {
      console.error(`Error recreating database ${db}:`, err.message);
    }
  }

  // 2. Setup schemas & tables for Auth Service DB
  console.log('Setting up auth_service_db tables...');
  const authTablesQuery = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      status BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users_role (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role VARCHAR(50) NOT NULL,
      UNIQUE (user_id)
    );

    CREATE TABLE IF NOT EXISTS token_blacklist (
      token VARCHAR(1000) PRIMARY KEY,
      expired_at TIMESTAMP NOT NULL
    );
  `;
  await executeQueryOnSpecificDb('auth_service_db', authTablesQuery);
  await applyUniqueConstraint('auth_service_db');

  // 3. Setup schemas & tables for RBAC Service DB
  console.log('Setting up rbac_service_db tables...');
  const rbacTablesQuery = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      status BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users_role (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role VARCHAR(50) NOT NULL,
      UNIQUE (user_id)
    );
  `;
  await executeQueryOnSpecificDb('rbac_service_db', rbacTablesQuery);
  await applyUniqueConstraint('rbac_service_db');

  // 4. Setup schemas & tables for Data Master Service DB
  console.log('Setting up data_master_service_db tables...');
  const dataMasterTablesQuery = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS produk (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) UNIQUE NOT NULL,
      harga DECIMAL(12, 2) NOT NULL CHECK (harga >= 0),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await executeQueryOnSpecificDb('data_master_service_db', dataMasterTablesQuery);

  // 5. Setup schemas & tables for Transaksi Service DB
  console.log('Setting up transaksi_service_db tables...');
  const transaksiTablesQuery = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS transaksi (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      kode_billing VARCHAR(50) UNIQUE NOT NULL,
      PEMBELI_id UUID NOT NULL,
      total_harga DECIMAL(12, 2) NOT NULL,
      status VARCHAR(50) NOT NULL CHECK (status IN ('BELUM_DIBAYAR', 'SUDAH_DIBAYAR', 'EXPIRED')),
      expired_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS keranjang (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      transaksi_id UUID REFERENCES transaksi(id) ON DELETE CASCADE,
      pembeli_id UUID NOT NULL,
      produk_id UUID NOT NULL,
      harga DECIMAL(12, 2) NOT NULL
    );
  `;
  await executeQueryOnSpecificDb('transaksi_service_db', transaksiTablesQuery);

  // 6. Seed initial data
  console.log('Seeding initial data...');
  
  // Hash passwords
  const adminId = 'd3b07384-d113-4ec2-a5e2-049ef20e29b1'; // Static UUIDs to sync seed easily
  const pembeliId = 'e2b07384-d113-4ec2-a5e2-049ef20e29b2';
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Seed Users in Auth DB
  const seedAuthUsers = `
    INSERT INTO users (id, name, email, password, status)
    VALUES 
      ('${adminId}', 'Andi Pratama', 'admin@mail.com', '${hashedPassword}', true),
      ('${pembeliId}', 'Siti Rahmawati', 'pembeli@mail.com', '${hashedPassword}', true)
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO users_role (user_id, role)
    VALUES 
      ('${adminId}', 'ADMIN'),
      ('${pembeliId}', 'PEMBELI')
    ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;
  `;
  await executeQueryOnSpecificDb('auth_service_db', seedAuthUsers);

  // Seed Users in RBAC DB
  const seedRbacUsers = `
    INSERT INTO users (id, name, email, password, status)
    VALUES 
      ('${adminId}', 'Andi Pratama', 'admin@mail.com', '${hashedPassword}', true),
      ('${pembeliId}', 'Siti Rahmawati', 'pembeli@mail.com', '${hashedPassword}', true)
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO users_role (user_id, role)
    VALUES 
      ('${adminId}', 'ADMIN'),
      ('${pembeliId}', 'PEMBELI')
    ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;
  `;
  await executeQueryOnSpecificDb('rbac_service_db', seedRbacUsers);

  // Seed Products in Data Master DB
  const seedProducts = `
    INSERT INTO produk (name, harga)
    VALUES 
      ('Pemadanan Data & Dokumen Kependudukan 5.000 Hit', 500000.00),
      ('Agregat Data Penduduk 10.000 Hit', 900000.00),
      ('Buku Cetakan Data Agregat Penduduk 50.000 Hit', 4000000.00)
    ON CONFLICT (name) DO NOTHING;
  `;
  await executeQueryOnSpecificDb('data_master_service_db', seedProducts);

  console.log('Database initialization and seeding completed successfully!');
}

init().catch(err => {
  console.error('Fatal database initialization error:', err);
  process.exit(1);
});
