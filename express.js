// Importation of the required dependencies
const express = require('express');
const db = require('./db');
const registerRoutes = require('./routes/registerRoutes.js');
const loginRoutes = require('./routes/loginRoutes.js');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

// Initialize the express app
const app = express();


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
app.use('/submit_form', registerRoutes);
app.use('/auth', loginRoutes)

// Login route

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