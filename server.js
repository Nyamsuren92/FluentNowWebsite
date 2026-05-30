const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const db = new sqlite3.Database("./database.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      price REAL,
      image TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS basket (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      quantity INTEGER DEFAULT 1
    )
  `);

  db.run("DELETE FROM products");

  const products = [
    ["Beginner English Lesson", 19.99, "Images/img7.png"],
    ["Business English Course", 29.99, "Images/img6.png"],
    ["IELTS Speaking Practice", 24.99, "Images/img8.png"]
  ];

  const stmt = db.prepare(
    "INSERT INTO products (name, price, image) VALUES (?, ?, ?)"
  );

  products.forEach(product => stmt.run(product));
  stmt.finalize();
});

app.get("/api/products", (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(rows);
  });
});

app.post("/api/basket", (req, res) => {
  const { product_id } = req.body;

  db.run(
    "INSERT INTO basket (product_id, quantity) VALUES (?, 1)",
    [product_id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ message: "Added to basket" });
    }
  );
});

app.get("/api/basket", (req, res) => {
  db.all(
    `
    SELECT basket.id, products.name, products.price, basket.quantity
    FROM basket
    JOIN products ON basket.product_id = products.id
    `,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json(rows);
    }
  );
});

app.delete("/api/basket/:id", (req, res) => {
  db.run("DELETE FROM basket WHERE id = ?", [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ message: "Removed from basket" });
  });
});

app.post("/api/checkout", (req, res) => {
  db.run("DELETE FROM basket", [], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ message: "Checkout completed successfully!" });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});