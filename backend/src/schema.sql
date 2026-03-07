-- IntelliGrocery-Pro Database Schema (SQLite version)

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  stock INTEGER DEFAULT 0,
  image TEXT,
  sales_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  total_amount REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  price REAL NOT NULL
);

-- Seed admin user (password: admin123)
INSERT OR IGNORE INTO users (id, name, email, password, role)
VALUES (1, 'Admin', 'admin@intelligrocery.com', '$2a$10$xJwH9o9KGWsLv3s1LODpN.LcGO9JsiBN6XPy/Q2lUJlqiTWl.NMzu', 'admin');

-- Seed sample products
INSERT OR IGNORE INTO products (id, name, category, price, stock, sales_count) VALUES
(1, 'Whole Milk (1L)', 'Dairy', 2.99, 150, 320),
(2, 'Brown Bread (500g)', 'Bakery', 1.99, 80, 280),
(3, 'Butter (250g)', 'Dairy', 3.49, 60, 150),
(4, 'Basmati Rice (5kg)', 'Grains', 8.99, 40, 200),
(5, 'Sunflower Oil (1L)', 'Oils', 4.99, 90, 180),
(6, 'Free Range Eggs (12)', 'Dairy', 3.99, 100, 250),
(7, 'Cheddar Cheese (200g)', 'Dairy', 4.49, 55, 120),
(8, 'Pasta (500g)', 'Grains', 1.49, 120, 310),
(9, 'Tomato Sauce (450g)', 'Canned', 1.99, 70, 190),
(10, 'Greek Yogurt (500g)', 'Dairy', 2.49, 65, 145),
(11, 'Orange Juice (1L)', 'Beverages', 3.29, 85, 220),
(12, 'Breakfast Cereal (750g)', 'Bakery', 4.99, 45, 160),
(13, 'Chicken Breast (500g)', 'Meat', 6.99, 30, 290),
(14, 'Salmon Fillet (300g)', 'Seafood', 9.99, 20, 95),
(15, 'Broccoli (400g)', 'Vegetables', 1.79, 60, 130),
(16, 'Apples (6 pack)', 'Fruits', 2.49, 75, 210),
(17, 'Bananas (1kg)', 'Fruits', 1.29, 100, 340),
(18, 'Potato Crisps (200g)', 'Snacks', 2.29, 110, 380),
(19, 'Dark Chocolate (100g)', 'Snacks', 1.89, 90, 270),
(20, 'Green Tea (50 bags)', 'Beverages', 3.99, 55, 140);

-- Seed sample orders for analytics
WITH RECURSIVE cnt(x) AS (
  SELECT 1
  UNION ALL
  SELECT x+1 FROM cnt WHERE x<50
)
INSERT OR IGNORE INTO orders (id, user_id, total_amount, created_at)
SELECT x, 1, ROUND(RANDOM() * 50 + 10, 2), datetime('now', '-' || (CAST(ABS(RANDOM() % 90) AS TEXT)) || ' days')
FROM cnt;
