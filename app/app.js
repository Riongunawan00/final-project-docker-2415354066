const express = require('express');
const mysql = require('mysql2');
const app = express();

app.use(express.json());

// Konfigurasi Database menggunakan Environment Variable
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Auto-create tabel users jika belum ada
pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL
  )
`);

// GET /users - Mengambil semua data user
app.get('/users', (req, res) => {
  pool.query('SELECT * FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// POST /users - Menambahkan user baru
app.post('/users', (req, res) => {
  const { name, email } = req.body;
  pool.query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: results.insertId, name, email });
  });
});

// PUT /users/:id - Mengupdate data user
app.put('/users/:id', (req, res) => {
  const { name, email } = req.body;
  const { id } = req.params;
  pool.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User updated successfully' });
  });
});

// DELETE /users/:id - Menghapus data user
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  pool.query('DELETE FROM users WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User deleted successfully' });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});