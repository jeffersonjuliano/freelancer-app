
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function test() {
    const db = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database
    });

    await db.exec(`
    CREATE TABLE IF NOT EXISTS coverage_reasons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );
  `);

    const reasons = ['Falta', 'Falta Abonada', 'Férias', 'Posto Vago'];
    for (const reason of reasons) {
        console.log(`Inserting ${reason}...`);
        await db.run('INSERT OR IGNORE INTO coverage_reasons (name) VALUES (?)', [reason]);
        console.log(`Inserted ${reason}`);
    }
}

test().catch(console.error);
