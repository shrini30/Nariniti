const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Database setup
const db = new sqlite3.Database('./users.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Create users table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phone TEXT,
  dateOfBirth TEXT,
  gender TEXT,
  maritalStatus TEXT,
  occupation TEXT,
  monthlyIncome INTEGER,
  savingsGoal INTEGER,
  familySize INTEGER,
  financialGoals TEXT,
  city TEXT,
  state TEXT,
  preferredLanguage TEXT DEFAULT 'en',
  notificationPreferences TEXT DEFAULT 'all',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Routes

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Register endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (user) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', 
        [name, email, hashedPassword], 
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Error creating user' });
          }

          // Generate JWT token
          const token = jwt.sign({ userId: this.lastID, email }, JWT_SECRET, { expiresIn: '24h' });

          res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
              id: this.lastID,
              name,
              email
            }
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, { expiresIn: '24h' });

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Protected route middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Get user profile (protected route)
app.get('/api/profile', authenticateToken, (req, res) => {
  db.get('SELECT id, name, email, phone, dateOfBirth, gender, maritalStatus, occupation, monthlyIncome, savingsGoal, familySize, financialGoals, city, state, preferredLanguage, notificationPreferences, created_at FROM users WHERE id = ?', [req.user.userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  });
});

// Update user profile (protected route)
app.put('/api/profile/update', authenticateToken, (req, res) => {
  const allowedFields = [
    'name', 'phone', 'dateOfBirth', 'gender', 'maritalStatus', 
    'occupation', 'monthlyIncome', 'savingsGoal', 'familySize', 
    'financialGoals', 'city', 'state', 'preferredLanguage', 'notificationPreferences'
  ];
  
  const updates = {};
  const values = [];
  const placeholders = [];
  
  // Build dynamic update query
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key) && req.body[key] !== undefined) {
      updates[key] = req.body[key];
      placeholders.push(`${key} = ?`);
      values.push(req.body[key]);
    }
  });
  
  if (placeholders.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }
  
  // Add updated_at timestamp
  placeholders.push('updated_at = ?');
  values.push(new Date().toISOString());
  
  // Add user ID for WHERE clause
  values.push(req.user.userId);
  
  const sql = `UPDATE users SET ${placeholders.join(', ')} WHERE id = ?`;
  
  db.run(sql, values, function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to update profile' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      message: 'Profile updated successfully',
      updated: updates
    });
  });
});

// Change password (protected route)
app.put('/api/profile/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }
    
    // Get current user
    db.get('SELECT password FROM users WHERE id = ?', [req.user.userId], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
      
      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      db.run('UPDATE users SET password = ?, updated_at = ? WHERE id = ?', 
        [hashedNewPassword, new Date().toISOString(), req.user.userId], 
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to update password' });
          }
          
          res.json({ message: 'Password changed successfully' });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user account (protected route)
app.delete('/api/profile/delete', authenticateToken, (req, res) => {
  db.run('DELETE FROM users WHERE id = ?', [req.user.userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete account' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'Account deleted successfully' });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed.');
    process.exit(0);
  });
});
