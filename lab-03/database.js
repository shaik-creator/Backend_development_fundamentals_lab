const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

const openDatabase = async () => {
  const database = await open({
    filename: path.join(__dirname, "books.db"),
    driver: sqlite3.Database
  });

  console.log("Database connected successfully");

  return database;
};

module.exports = openDatabase;
