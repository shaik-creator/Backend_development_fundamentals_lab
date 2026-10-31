# Lab 02: SQLite Database and CRUD Routes

## Student Details

- **Name:** Shaik Suheal
- **Registration Number:** 252U1R9145
- **Section:** CSE-GEN-AI 2C 112
- **Course:** Backend Development Fundamentals (Year II Term II)
- **Lab Number:** 02
- **GitHub Repository:** [Backend_development_fundamentals_lab](https://github.com/shaik-creator/Backend_development_fundamentals_lab)

---

## Project Overview
This project connects an Express.js server to an SQLite database (`books.db`) and implements complete CRUD (Create, Read, Update, Delete) operations using HTTP routes.

## Technology Stack
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework for routing and middleware
- **SQLite3 & SQLite**: Embedded relational database engine and promise-based async wrapper
- **Nodemon**: Development tool for automatic server restarts on file changes
- **Postman**: API development and testing tool

## Project Structure
```text
lab-02/
├── server.js
├── package.json
├── package-lock.json
├── books.db
├── init.sql
├── seed.js
├── .gitignore
├── README.md
└── screenshots/
    ├── get-all-books.png
    ├── get-single-book.png
    ├── post-book.png
    ├── put-book.png
    └── delete-book.png
```

## Database Schema
Table name: `book`

```sql
CREATE TABLE IF NOT EXISTS book (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  price INTEGER NOT NULL,
  pages INTEGER NOT NULL
);
```

### Initial Records (10 Sample Books)
1. *Atomic Habits* — James Clear (Price: ₹499, Pages: 320)
2. *The Alchemist* — Paulo Coelho (Price: ₹299, Pages: 208)
3. *Wings of Fire* — A.P.J. Abdul Kalam (Price: ₹350, Pages: 180)
4. *Deep Work* — Cal Newport (Price: ₹450, Pages: 304)
5. *Rich Dad Poor Dad* — Robert Kiyosaki (Price: ₹399, Pages: 336)
6. *Ikigai* — Hector Garcia (Price: ₹320, Pages: 208)
7. *Think and Grow Rich* — Napoleon Hill (Price: ₹250, Pages: 238)
8. *The Power of Habit* — Charles Duhigg (Price: ₹420, Pages: 371)
9. *Zero to One* — Peter Thiel (Price: ₹400, Pages: 224)
10. *Clean Code* — Robert C. Martin (Price: ₹850, Pages: 464)

## Installation & Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Initialize / Seed Database**:
   ```bash
   npm run seed
   # or: node seed.js
   ```

3. **Start Development Server** (with Nodemon):
   ```bash
   npm run dev
   ```
   Or standard start:
   ```bash
   npm start
   ```

The server listens on `http://localhost:3000/`.

## API Endpoints

| HTTP Method | Endpoint | Description | Request Body | Success Response |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/` | Health check / Welcome route | None | Plaintext message |
| **GET** | `/books/` | Retrieve all books | None | JSON array of 10 books |
| **GET** | `/books/:bookId/` | Retrieve a single book by ID | None | JSON object of the requested book |
| **POST** | `/books/` | Add a new book | JSON: `{ title, author, price, pages }` | `201 Created` with new `bookId` |
| **PUT** | `/books/:bookId/` | Update existing book details | JSON: `{ title, author, price, pages }` | `200 OK` update success message |
| **DELETE** | `/books/:bookId/` | Remove a book by ID | None | `200 OK` delete success message |

## Screenshots

### 1. GET All Books
![GET All Books](screenshots/get-all-books.png)

### 2. GET Single Book
![GET Single Book](screenshots/get-single-book.png)

### 3. POST - Add New Book
![POST Book](screenshots/post-book.png)

### 4. PUT - Update Book
![PUT Book](screenshots/put-book.png)

### 5. DELETE - Remove Book
![DELETE Book](screenshots/delete-book.png)
