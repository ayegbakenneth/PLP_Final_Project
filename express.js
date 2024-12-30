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

// Initializing the express app

const app = express();
dotenv.config();

// This creates the MySQL connection

const db = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.PORT
});

// Create a session store
const sessionStore = new MySQLStore({}, db.promise());

// Middlewares path

app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    key: 'user_sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}));

// Registration route

app.post('submit_form', async (req, res) => {
    const {first_name, last_name, email, password, age, phone_number, gender, country } = req.body;
    const password_hash = await bcrypt.hash(password, 10);
    const sql = `INSERT INTO user (first_name, last_name, email, password_hash, age, phone_number, gender, country) VALUES
    (?, ?, ?, ?, ?, ?, ?, ?)`
    const values = [first_name, last_name, email, password_hash, age, phone_number, gender, country];
    db.query(sql, values, (error, result) => {
        if (error) {
            console.error('Error inserting the user', error);
            res.status(500).send('Server error');
        } else {
            res.send('Registration successful');
        }
    })
});

// Login route

app.post('auth', async (req, res) => {
    const { email, password } = req.body;
    const authenticateUser = async (table, idField) => {
        return new Promise((resolve, reject) => {
            db.query(`SELECT * FROM ${table} WHERE email = ?`, [email], async (err, results) => {
                if (err) return reject(err);
                if (results.length === 0) return resolve(null);
                const user = results[0];
                const match = await bcrypt.compare(password, user.password_hash);
                if (match) {
                    return resolve({ user, idField});
                }
                return resolve(null);
            });
        });
    };
    try {
        let result = await authenticateUser('users', 'user_id');
        if (result) {
            const { user, idField } = result;
            req.session.loggedin = true;
            req.session.userId = user[idField];
            req.session.userType = idField.includes('users');
            req.session.save(err => {
                if (err) {
                    console.error('Session save error:', err);
                    return res.status(500).send('Session error');
                }res.json({ message: 'Login successful', userType: req.session.userType });
            })
        } else {
            res.status(401).send('Authentication failed');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server error');
    }
});