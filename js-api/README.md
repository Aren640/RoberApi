# RoberApi JS

API de prueba en Node.js (Express) conectada a MySQL, lista para usar con Docker.

## Uso

1. Clona el repositorio:
   ```
   git clone https://github.com/Aren640/RoberApi.git
   cd RoberApi/js-api
   ```
2. Levanta los servicios:
   ```
   docker-compose up --build
   ```
3. Accede a la API:
   - [http://localhost:5000/](http://localhost:5000/) para ver el mensaje de bienvenida.
   - [http://localhost:5000/test-db](http://localhost:5000/test-db) para probar la conexión a MySQL.

## Estructura
- `index.js`: Código de la API.
- `package.json`: Dependencias.
- `Dockerfile`: Imagen de la API.
- `docker-compose.yml`: Orquestación de servicios.

## Notas
- La base de datos se crea automáticamente con el nombre `testdb` y usuario `root` (contraseña `example`).
