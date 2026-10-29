-- Lab 2: SQLite Database Initialization Script
-- Table: book
CREATE TABLE IF NOT EXISTS book (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    price INTEGER NOT NULL,
    pages INTEGER NOT NULL
);

-- 10 Distinct Sample Book Records
INSERT INTO book (title, author, price, pages) VALUES
('Atomic Habits', 'James Clear', 450, 320),
('The Alchemist', 'Paulo Coelho', 300, 208),
('Wings of Fire', 'A. P. J. Abdul Kalam', 250, 180),
('Ikigai', 'Hector Garcia', 350, 194),
('Deep Work', 'Cal Newport', 500, 296),
('Rich Dad Poor Dad', 'Robert Kiyosaki', 400, 336),
('Think Like a Monk', 'Jay Shetty', 420, 288),
('The Power of Habit', 'Charles Duhigg', 480, 371),
('Zero to One', 'Peter Thiel', 390, 210),
('The Psychology of Money', 'Morgan Housel', 320, 256);
