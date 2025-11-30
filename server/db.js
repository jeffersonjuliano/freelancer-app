import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Initialize database
let db;

export async function getDb() {
  if (db) return db;

  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      cnpj TEXT,
      address TEXT,
      phone TEXT,
      email TEXT
    );

    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      cnpj TEXT,
      address TEXT,
      phone TEXT,
      email TEXT
    );

    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      cpf TEXT,
      role TEXT,
      phone TEXT,
      email TEXT
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      default_value REAL
    );

    CREATE TABLE IF NOT EXISTS work_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      company_id INTEGER,
      client_id INTEGER,
      employee_id INTEGER,
      service_id INTEGER,
      value REAL,
      description TEXT,
      post_name TEXT,
      status TEXT DEFAULT 'pending',
      FOREIGN KEY(company_id) REFERENCES companies(id),
      FOREIGN KEY(client_id) REFERENCES clients(id),
      FOREIGN KEY(employee_id) REFERENCES employees(id),
      FOREIGN KEY(service_id) REFERENCES services(id)
    );
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      permissions TEXT
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      entity_id INTEGER,
      details TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS coverage_reasons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );
  `);

  // Migrations for existing databases
  try {
    await db.exec('ALTER TABLE work_logs ADD COLUMN post_name TEXT');
  } catch { /* Column likely exists */ }

  try {
    await db.exec("ALTER TABLE work_logs ADD COLUMN status TEXT DEFAULT 'pending'");
  } catch { /* Column likely exists */ }

  try {
    await db.exec("ALTER TABLE clients ADD COLUMN posts TEXT");
  } catch { /* Column likely exists */ }

  // New Migrations
  try {
    await db.exec("ALTER TABLE employees ADD COLUMN re TEXT");
  } catch { /* Column likely exists */ }

  try {
    await db.exec("ALTER TABLE work_logs ADD COLUMN origin_client_id INTEGER");
  } catch { /* Column likely exists */ }

  try {
    await db.exec("ALTER TABLE work_logs ADD COLUMN origin_post_name TEXT");
  } catch { /* Column likely exists */ }

  try {
    await db.exec("ALTER TABLE work_logs ADD COLUMN coverage_reason_id INTEGER");
  } catch { /* Column likely exists */ }

  try {
    await db.exec("ALTER TABLE users ADD COLUMN permissions TEXT");
  } catch { /* Column likely exists */ }

  // Seed Coverage Reasons
  const reasons = ['Falta', 'Falta Abonada', 'Férias', 'Posto Vago'];
  for (const reason of reasons) {
    try {
      await db.run('INSERT INTO coverage_reasons (name) VALUES (?)', [reason]);
    } catch { /* Already exists */ }
  }

  return db;
}
