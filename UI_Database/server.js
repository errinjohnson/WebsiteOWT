const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');
const app = express();
require('dotenv').config(); // Load environment variables

const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;

app.use(cors()); // Enable CORS for all origins

app.use(express.json()); // Parse JSON bodies

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Create a MySQL connection
const db = mysql.createConnection({
    host: dbHost,
    user: dbUser,
    password: dbPassword,
    database: dbName
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database.');
});

// Get all participants
app.get('/api/participants', (req, res) => {
    const query = 'SELECT * FROM participants';
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results);
    });
});

// Get a single participant by ID
app.get('/api/participants/:id', (req, res) => {
    const query = 'SELECT * FROM participants WHERE participant_id = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results[0]);
    });
});

// Add a new participant
app.post('/api/participants', (req, res) => {
    const { email, first_name, last_name, phone, registration } = req.body;
    const query = 'INSERT INTO participants (email, first_name, last_name, phone, registration) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [email, first_name, last_name, phone, registration], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ message: 'Participant added', participant_id: results.insertId });
    });
});

// Update a participant
app.put('/api/participants/:id', (req, res) => {
    const { email, first_name, last_name, phone, registration } = req.body;
    const query = 'UPDATE participants SET email = ?, first_name = ?, last_name = ?, phone = ?, registration = ? WHERE participant_id = ?';
    db.query(query, [email, first_name, last_name, phone, registration, req.params.id], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Participant updated' });
    });
});

// Delete a participant
app.delete('/api/participants/:id', (req, res) => {
    const query = 'DELETE FROM participants WHERE participant_id = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Participant deleted' });
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
