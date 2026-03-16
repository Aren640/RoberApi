const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 5000;

const db = mysql.createConnection({
  host: 'mysql',
  user: 'root',
  password: 'example',
  database: 'testdb'
});

app.get('/', (req, res) => {
  res.send('API JS funcionando');
});

app.get('/test-db', (req, res) => {
  db.query('SELECT 1 AS result', (err, results) => {
    if (err) {
      return res.status(500).json({ db_connection: 'failed', error: err.message });
    }
    res.json({ db_connection: 'success', result: results[0].result });
  });
});

app.listen(port, () => {
  console.log(`API escuchando en puerto ${port}`);
});
