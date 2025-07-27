const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const app = express();
const port = 4000;
const JWT_SECRET = 'streetwealth-secret-2025'; // Replace with env variable in production

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend'))); // Serve frontend files

// Initialize SQLite database
const db = new sqlite3.Database('./streetwealth.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    // Create users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )`);
    // Create ledger entries table
    db.run(`CREATE TABLE IF NOT EXISTS ledger_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      date TEXT,
      desc TEXT,
      type TEXT,
      amount REAL,
      FOREIGN KEY (userId) REFERENCES users(id)
    )`);
    // Create UPI transactions table
    db.run(`CREATE TABLE IF NOT EXISTS upi_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      date TEXT,
      desc TEXT,
      amount REAL,
      FOREIGN KEY (userId) REFERENCES users(id)
    )`);
    // Create receipts table
    db.run(`CREATE TABLE IF NOT EXISTS receipts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      amount REAL,
      date TEXT,
      desc TEXT,
      timestamp TEXT,
      FOREIGN KEY (userId) REFERENCES users(id)
    )`);
  }
});

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// API Endpoints

// Register user
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    stmt.run(name, email, hashedPassword, function(err) {
      if (err) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      const token = jwt.sign({ userId: this.lastID, email }, JWT_SECRET, { expiresIn: '1h' });
      res.status(201).json({ token });
    });
    stmt.finalize();
  } catch (error) {
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err || !user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  });
});

// Add ledger entry
app.post('/api/ledger/entries', authenticateToken, (req, res) => {
  const { date, desc, type, amount } = req.body;
  if (!date || !desc || !type || !amount) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  const stmt = db.prepare('INSERT INTO ledger_entries (userId, date, desc, type, amount) VALUES (?, ?, ?, ?, ?)');
  stmt.run(req.user.userId, date, desc, type, amount, function(err) {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    res.status(201).json({ id: this.lastID });
  });
  stmt.finalize();
});

// Get ledger entries
app.get('/api/ledger/my-entries', authenticateToken, (req, res) => {
  db.all('SELECT id, date, desc, type, amount FROM ledger_entries WHERE userId = ? ORDER BY date DESC', [req.user.userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    res.json(rows);
  });
});

// Add UPI transaction
app.post('/api/upi/entries', authenticateToken, (req, res) => {
  const { date, desc, amount } = req.body;
  if (!date || !desc || !amount) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  const stmt = db.prepare('INSERT INTO upi_entries (userId, date, desc, amount) VALUES (?, ?, ?, ?)');
  stmt.run(req.user.userId, date, desc, amount, function(err) {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    res.status(201).json({ id: this.lastID });
  });
  stmt.finalize();
});

// Get UPI transactions
app.get('/api/upi/my-entries', authenticateToken, (req, res) => {
  db.all('SELECT id, date, desc, amount FROM upi_entries WHERE userId = ? ORDER BY date DESC', [req.user.userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    res.json(rows);
  });
});

// Save receipt data
app.post('/api/receipts', authenticateToken, (req, res) => {
  const { amount, date, desc } = req.body;
  if (!amount || !date) {
    return res.status(400).json({ message: 'Amount and date are required' });
  }
  const timestamp = new Date().toISOString();
  const stmt = db.prepare('INSERT INTO receipts (userId, amount, date, desc, timestamp) VALUES (?, ?, ?, ?, ?)');
  stmt.run(req.user.userId, amount, date, desc || 'Receipt Scan', timestamp, function(err) {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    res.status(201).json({ id: this.lastID });
  });
  stmt.finalize();
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});