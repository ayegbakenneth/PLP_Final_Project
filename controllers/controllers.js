const bcrypt = require('bcrypt');
const db = require('../db.js');


exports.registerUser = ('/submit_form', async (req, res) => {
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

exports.loginUser = ('/auth', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const sql = `SELECT * FROM users WHERE email = ?`;
        db.query(sql, [email], async (error, result) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).send('Server error');
            }

            if (result.length === 0) {
                return res.status(401).send('Invalid email or password');

            }

            const user = result[0];
            const passwordMatch = await bcrypt.compare(password, user.password_hash);
            if (passwordMatch) {
                req.session.loggedin = true;
                req.session.userId = user.user_id;
                req.session.userType = 'user';
                req.session.save((err) => {
                    if (err) {
                        console.error('Session save error:', err);
                        return res.status(500).send('Session error')
                    }
                    //Send a response indicating success
                    res.status(200).json({ message: 'Login Successful'});
                });
            }else {
        res.status(401).send('Invalid email or password');
      }
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Server error');
  }
});