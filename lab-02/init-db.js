const path = require('path');
const fs = require('fs');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const dbPath = path.join(__dirname, 'bookstore.db');
const sqlFilePath = path.join(__dirname, 'init.sql');

async function initializeDatabase() {
  let db;
  try {
    console.log(`Connecting to SQLite database at: ${dbPath}`);
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    console.log('Database connection established successfully.');

    const isReset = process.argv.includes('--reset') || process.argv.includes('--force');
    if (isReset) {
      console.log('Reset flag detected. Dropping table book...');
      await db.exec('DROP TABLE IF EXISTS book;');
    }

    // Ensure the table exists
    await db.exec(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price INTEGER NOT NULL,
        pages INTEGER NOT NULL
      );
    `);
    console.log("Table 'book' verified/created.");

    // Check existing records for idempotent initialization
    const countResult = await db.get('SELECT COUNT(*) AS count FROM book;');
    const recordCount = countResult ? countResult.count : 0;

    if (recordCount === 0) {
      console.log('Table is empty. Reading seed SQL from init.sql...');
      const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
      
      // Execute the SQL file statements
      await db.exec(sqlContent);
      console.log('Seed data inserted successfully from init.sql.');
    } else {
      console.log(`Table already contains ${recordCount} records. Skipping seed insertion to avoid duplicates.`);
    }

    // Verify records
    const allBooks = await db.all('SELECT * FROM book;');
    console.log(`\nVerification: Total records in 'book' table: ${allBooks.length}`);
    console.table(allBooks);

  } catch (error) {
    console.error('Error during database initialization:', error.message);
    process.exit(1);
  } finally {
    if (db) {
      await db.close();
      console.log('Database connection closed.');
    }
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase, dbPath };
