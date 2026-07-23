const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
// Serve static images from uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 1. MySQL Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  port: 3307,
  user: 'root',      // XAMPP default user
  password: '',      // XAMPP default password (empty)
  database: 'registration_db'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database Connection Failed:', err.message);
  } else {
    console.log('✅ Connected to MySQL Database (registration_db)');
  }
});

// 2. Multer Configuration for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Unique filename using timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// 3. API Route for Form Submission
app.post('/api/submit-form', upload.single('profileImage'), (req, res) => {
  const { fullName, email, phone, department, dob } = req.body;
  const profileImage = req.file ? req.file.filename : null;

  // Basic Backend Validation
  if (!fullName || !email || !phone || !department || !dob || !profileImage) {
    return res.status(400).json({ message: 'All fields including image are required.' });
  }

  // Insert into Database Query
  const sql = `
    INSERT INTO users (full_name, email, phone, department, dob, profile_image) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const values = [fullName, email, phone, department, dob, profileImage];

  db.query(sql, values, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'This email address is already registered.' });
      }
      console.error('Database Error:', err);
      return res.status(500).json({ message: 'Failed to save record to database.' });
    }

    res.status(201).json({ 
      message: 'Registration successful!', 
      userId: result.insertId 
    });
  });
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});