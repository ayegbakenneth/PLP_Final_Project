// This file contains the logic for the express server
const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

// Initialize the express app
const app = express();
dotenv.config();

// MySQL connection
const db = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT,
});

// Create a session store
const sessionStore = new MySQLStore({}, db.promise());
app.use('/static', express.static(path.join(__dirname, 'public')));
// Middlewares
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    key: 'user_sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// Rendering the landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
});
app.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'))
});
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'))
})
app.get('/products.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'products.html'))
})

// Registration route
app.post('/submit_form', async (req, res) => {
  const { first_name, last_name, email, password, age, phone_number, gender, country } = req.body;

  try {
    const password_hash = await bcrypt.hash(password, 10);
    const sql = `INSERT INTO users (first_name, last_name, email, password_hash, age, phone_number, gender, country) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [first_name, last_name, email, password_hash, age, phone_number, gender, country];

    db.query(sql, values, (error, result) => {
      if (error) {
        console.error('Error inserting the user:', error);
        res.status(500).send('Server error');
      } else {
        // Send a response indicating success
        res.status(200).json({ message: 'Registration successful, redirecting to login page...' });
      }
    });
  } catch (err) {
    console.error('Hashing error:', err);
    res.status(500).send('Server error');
  }
});
// Login route
app.post('/auth', async (req, res) => {
  const { email, password } = req.body;

  try {
    const sql = `SELECT * FROM users WHERE email = ?`;
    db.query(sql, [email], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).send('Server error');
      }

      if (results.length === 0) {
        return res.status(401).send('Invalid email or password');
      }

      const user = results[0];
      const match = await bcrypt.compare(password, user.password_hash);

      if (match) {
        req.session.loggedin = true;
        req.session.userId = user.user_id;
        req.session.userType = 'user';

        req.session.save((err) => {
          if (err) {
            console.error('Session save error:', err);
            return res.status(500).send('Session error');
          }
          // Send a response indicating success
          res.status(200).json({ message: 'Login successful, redirecting to products page...' });
        });
      } else {
        res.status(401).send('Invalid email or password');
      }
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Server error');
  }
});
app.get('/product', (req, res) => {
  if (!req.session.loggedin) {
    return res.status(401).send('Unauthorized');
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;
  const offset = (page - 1) * limit;

  const sqlCount = 'SELECT COUNT(*) AS total FROM product';
  const sqlProducts = `
    SELECT 
      id, 
      name, 
      price, 
      CASE 
        WHEN image_url LIKE 'http%' THEN image_url
        ELSE CONCAT('/static/', image_url)
      END AS image 
    FROM product 
    LIMIT ? OFFSET ?
  `;

  // Get total product count
  db.query(sqlCount, (err, countResults) => {
    if (err) {
      console.error('Error fetching product count:', err);
      return res.status(500).send('Server error');
    }

    const totalProducts = countResults[0].total;
    const totalPages = Math.ceil(totalProducts / limit);

    // Get paginated products
    db.query(sqlProducts, [limit, offset], (err, results) => {
      if (err) {
        console.error('Error fetching products:', err);
        return res.status(500).send('Server error');
      }

      res.json({
        products: results,
        totalPages,
      });
    });
  });
});

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
      if (err) {
          return res.status(500).send('Could not log out');
      }
      res.send('Logout successful');
  });
});

// Start the server
const PORT = process.env.SERVER_PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));