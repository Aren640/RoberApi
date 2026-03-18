require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

const db = mysql.createConnection({
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'Rober'
});

app.get('/', (req, res) => {
  res.send('API JS funcionando');
});

app.get('/test-db', (req, res) => {
  db.query('SELECT 1 AS result', (err, results) => {
    if (err) {
      console.error('Error de conexión a MySQL:', err);
      return res.status(500).json({ db_connection: 'failed', error: err.message });
    }
    console.log('Conexión a MySQL exitosa:', results);
    res.json({ db_connection: 'success', result: results[0].result });
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`API escuchando en 0.0.0.0:${port}`);
});
