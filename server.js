const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Database setup
const db = new sqlite3.Database('impower.db');

// Create tables
db.serialize(() => {
    // Donations table
    db.run(`CREATE TABLE IF NOT EXISTS donations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        amount INTEGER NOT NULL,
        address TEXT,
        anonymous BOOLEAN DEFAULT 0,
        newsletter BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Registrations table
    db.run(`CREATE TABLE IF NOT EXISTS registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullName TEXT NOT NULL,
        email TEXT NOT NULL,
        contact TEXT NOT NULL,
        occupation TEXT NOT NULL,
        age INTEGER,
        address TEXT,
        city TEXT,
        state TEXT,
        interests TEXT,
        availability TEXT,
        experience TEXT,
        motivation TEXT,
        comments TEXT,
        newsletter BOOLEAN DEFAULT 1,
        emergency BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});

// Routes

// Home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/donation.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'donation.html'));
});

app.get('/registration.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'registration.html'));
});

// Donation endpoint
app.post('/api/donate', (req, res) => {
    const { name, email, phone, amount, address, anonymous, newsletter } = req.body;
    
    if (!name || !email || !phone || !amount) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const stmt = db.prepare(`INSERT INTO donations (name, email, phone, amount, address, anonymous, newsletter) 
                            VALUES (?, ?, ?, ?, ?, ?, ?)`);
    
    stmt.run(name, email, phone, amount, address, anonymous ? 1 : 0, newsletter ? 1 : 0, function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        // Send confirmation email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Thank you for your donation to Impower Foundation',
            html: `
                <h2>Thank you for your generous donation!</h2>
                <p>Dear ${name},</p>
                <p>We are deeply grateful for your donation of ₹${amount} to Impower Foundation. Your support helps us continue our work in:</p>
                <ul>
                    <li>Women and Children Empowerment</li>
                    <li>Clean Up Drives</li>
                    <li>Food Distribution</li>
                    <li>Plantation Drives</li>
                </ul>
                <p>Your donation ID: ${this.lastID}</p>
                <p>We will send you updates on how your contribution is making a difference.</p>
                <p>With gratitude,<br>The Impower Foundation Team</p>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Email error:', error);
            }
        });

        res.json({ 
            success: true, 
            donationId: this.lastID,
            message: 'Thank you for your donation!'
        });
    });
    
    stmt.finalize();
});

// Registration endpoint
app.post('/api/register', (req, res) => {
    const { 
        fullName, email, contact, occupation, age, address, city, state,
        interests, availability, experience, motivation, comments,
        newsletter, emergency
    } = req.body;

    if (!fullName || !email || !contact || !occupation) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const stmt = db.prepare(`INSERT INTO registrations 
        (fullName, email, contact, occupation, age, address, city, state, 
         interests, availability, experience, motivation, comments, newsletter, emergency)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    
    stmt.run(
        fullName, email, contact, occupation, age, address, city, state,
        JSON.stringify(interests), availability, experience, motivation, comments,
        newsletter ? 1 : 0, emergency ? 1 : 0,
        function(err) {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            // Send confirmation email
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Welcome to Impower Foundation Volunteer Program',
                html: `
                    <h2>Welcome to Impower Foundation!</h2>
                    <p>Dear ${fullName},</p>
                    <p>Thank you for registering as a volunteer with Impower Foundation. We're excited to have you join our mission to create positive change in our communities.</p>
                    
                    <h3>Your Registration Details:</h3>
                    <ul>
                        <li><strong>Name:</strong> ${fullName}</li>
                        <li><strong>Email:</strong> ${email}</li>
                        <li><strong>Contact:</strong> ${contact}</li>
                        <li><strong>Occupation:</strong> ${occupation}</li>
                        <li><strong>Interests:</strong> ${interests ? interests.join(', ') : 'General volunteering'}</li>
                    </ul>
                    
                    <p>We will contact you soon with volunteer opportunities that match your interests and availability.</p>
                    
                    <p>Together, we can make a difference!</p>
                    <p>The Impower Foundation Team</p>
                `
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Email error:', error);
                }
            });

            res.json({ 
                success: true, 
                registrationId: this.lastID,
                message: 'Registration successful! We will contact you soon.'
            });
        }
    );
    
    stmt.finalize();
});

// Admin endpoints
app.get('/api/donations', (req, res) => {
    db.all('SELECT * FROM donations ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

app.get('/api/registrations', (req, res) => {
    db.all('SELECT * FROM registrations ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Database: impower.db');
    console.log('Frontend: http://localhost:' + PORT);
});
