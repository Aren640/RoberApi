from flask import Flask, jsonify
import mysql.connector

app = Flask(__name__)

@app.route('/test-db')
def test_db():
    try:
        conn = mysql.connector.connect(
            host='mysql',
            user='root',
            password='example',
            database='testdb'
        )
        cursor = conn.cursor()
        cursor.execute('SELECT 1')
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        return jsonify({'db_connection': 'success', 'result': result[0]})
    except Exception as e:
        return jsonify({'db_connection': 'failed', 'error': str(e)})

@app.route('/')
def home():
    return 'API funcionando'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
