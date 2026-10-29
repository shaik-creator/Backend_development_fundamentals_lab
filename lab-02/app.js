const express = require('express');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;
const dbPath = path.join(__dirname, 'bookstore.db');

let db = null;

// Middleware to parse JSON request bodies
app.use(express.json());

// Helper function to validate integer IDs
function parseAndValidateId(idParam) {
  const parsedId = Number(idParam);
  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return null;
  }
  return parsedId;
}

// Helper function to validate book payload
function validateBookPayload(body) {
  const { title, author, price, pages } = body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return 'Invalid or missing field: title must be a non-empty string.';
  }
  if (!author || typeof author !== 'string' || author.trim() === '') {
    return 'Invalid or missing field: author must be a non-empty string.';
  }
  if (price === undefined || typeof price !== 'number' || price < 0 || !Number.isFinite(price)) {
    return 'Invalid or missing field: price must be a non-negative number.';
  }
  if (pages === undefined || !Number.isInteger(pages) || pages <= 0) {
    return 'Invalid or missing field: pages must be a positive integer.';
  }

  return null;
}

/**
 * Route A: GET /books/
 * Retrieve all books from the database
 */
app.get('/books/', async (request, response) => {
  try {
    const getBooksQuery = `SELECT * FROM book ORDER BY id ASC;`;
    const books = await db.all(getBooksQuery);
    return response.status(200).json(books);
  } catch (error) {
    return response.status(500).json({ error: 'Failed to retrieve books.' });
  }
});

/**
 * Route B: GET /books/:bookId/
 * Retrieve a single book by ID using a parameterized query (? placeholder)
 */
app.get('/books/:bookId/', async (request, response) => {
  try {
    const bookId = parseAndValidateId(request.params.bookId);
    if (!bookId) {
      return response.status(400).json({ error: 'Invalid book ID. Must be a positive integer.' });
    }

    // Parameterized query prevents SQL Injection
    const getBookQuery = `SELECT * FROM book WHERE id = ?;`;
    const book = await db.get(getBookQuery, [bookId]);

    if (!book) {
      return response.status(404).json({ error: `Book with ID ${bookId} not found.` });
    }

    return response.status(200).json(book);
  } catch (error) {
    return response.status(500).json({ error: 'Failed to retrieve book.' });
  }
});

/**
 * Route C: POST /books/
 * Create a new book record using parameterized INSERT query
 */
app.post('/books/', async (request, response) => {
  try {
    const validationError = validateBookPayload(request.body);
    if (validationError) {
      return response.status(400).json({ error: validationError });
    }

    const { title, author, price, pages } = request.body;

    // Parameterized query using ? placeholders for all values
    const insertBookQuery = `
      INSERT INTO book (title, author, price, pages)
      VALUES (?, ?, ?, ?);
    `;

    const result = await db.run(insertBookQuery, [
      title.trim(),
      author.trim(),
      price,
      pages
    ]);

    const createdBook = await db.get(`SELECT * FROM book WHERE id = ?;`, [result.lastID]);

    return response.status(201).json({
      message: 'Book created successfully',
      bookId: result.lastID,
      book: createdBook
    });
  } catch (error) {
    return response.status(500).json({ error: 'Failed to create book.' });
  }
});

/**
 * Route D: PUT /books/:bookId/
 * Update an existing book's details using parameterized UPDATE query
 */
app.put('/books/:bookId/', async (request, response) => {
  try {
    const bookId = parseAndValidateId(request.params.bookId);
    if (!bookId) {
      return response.status(400).json({ error: 'Invalid book ID. Must be a positive integer.' });
    }

    const validationError = validateBookPayload(request.body);
    if (validationError) {
      return response.status(400).json({ error: validationError });
    }

    // Check if book exists before updating
    const existingBook = await db.get(`SELECT * FROM book WHERE id = ?;`, [bookId]);
    if (!existingBook) {
      return response.status(404).json({ error: `Book with ID ${bookId} not found.` });
    }

    const { title, author, price, pages } = request.body;

    // Parameterized query using ? placeholders
    const updateBookQuery = `
      UPDATE book
      SET title = ?, author = ?, price = ?, pages = ?
      WHERE id = ?;
    `;

    await db.run(updateBookQuery, [
      title.trim(),
      author.trim(),
      price,
      pages,
      bookId
    ]);

    const updatedBook = await db.get(`SELECT * FROM book WHERE id = ?;`, [bookId]);

    return response.status(200).json({
      message: 'Book updated successfully',
      book: updatedBook
    });
  } catch (error) {
    return response.status(500).json({ error: 'Failed to update book.' });
  }
});

/**
 * Route E: DELETE /books/:bookId/
 * Delete a book by ID using a parameterized DELETE query
 */
app.delete('/books/:bookId/', async (request, response) => {
  try {
    const bookId = parseAndValidateId(request.params.bookId);
    if (!bookId) {
      return response.status(400).json({ error: 'Invalid book ID. Must be a positive integer.' });
    }

    // Check if book exists before deleting
    const existingBook = await db.get(`SELECT * FROM book WHERE id = ?;`, [bookId]);
    if (!existingBook) {
      return response.status(404).json({ error: `Book with ID ${bookId} not found.` });
    }

    // Parameterized query using ? placeholder
    const deleteBookQuery = `DELETE FROM book WHERE id = ?;`;
    await db.run(deleteBookQuery, [bookId]);

    return response.status(200).json({
      message: `Book with ID ${bookId} deleted successfully.`
    });
  } catch (error) {
    return response.status(500).json({ error: 'Failed to delete book.' });
  }
});

// Catch-all handler for undefined routes
app.use((request, response) => {
  response.status(404).json({
    error: 'Route not found',
    requestedUrl: request.originalUrl
  });
});

// Global error handler for malformed JSON or unhandled exceptions
app.use((err, request, response, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return response.status(400).json({ error: 'Invalid JSON payload provided.' });
  }
  return response.status(500).json({ error: 'Internal Server Error' });
});

/**
 * Initializes database connection and starts Express server.
 * Ensures the server only listens if database connection succeeds.
 */
async function initializeDBAndServer() {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    console.log(`Database connected successfully at ${dbPath}`);

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

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  }
}

// Initialize database and start the server
initializeDBAndServer();

module.exports = app;

