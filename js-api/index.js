require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

const dbConfig = {
  host: process.env.MYSQL_HOST || 'mysql',
  port: parseInt(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'example',
  database: process.env.MYSQL_DATABASE || 'Rober'
};

console.log('Conectando a MySQL en:', dbConfig.host + ':' + dbConfig.port);

let db;

function connectWithRetry() {
  db = mysql.createConnection(dbConfig);
  db.connect((err) => {
    if (err) {
      console.error('Error conectando a MySQL, reintentando en 5s...', err.message);
      setTimeout(connectWithRetry, 5000);
    } else {
      console.log('Conectado a MySQL correctamente');
    }
  });
  db.on('error', (err) => {
    console.error('Error de MySQL:', err.message);
    if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.fatal) {
      connectWithRetry();
    }
  });
}

connectWithRetry();

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'API JS funcionando', mysql_host: dbConfig.host });
});

app.get('/test-db', (req, res) => {
  db.query('SELECT 1 AS result', (err, results) => {
    if (err) {
      console.error('Error de conexión a MySQL:', err);
      return res.status(500).json({ db_connection: 'failed', error: err.message });
    }
    res.json({ db_connection: 'success', result: results[0].result });
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`API escuchando en 0.0.0.0:${port}`);
});
