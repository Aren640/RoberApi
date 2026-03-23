# Documentación: API con Node.js, MySQL y Dokploy

---

## 1. Instalación de Ubuntu en Máquina Virtual

Para comenzar, instalamos Ubuntu en una máquina virtual a partir de una ISO.

Una vez completada la instalación, abrimos el terminal y ejecutamos los siguientes comandos:

```bash
apt update
```
```bash
apt upgrade
```
```bash
apt install curl
```

Con esto ya podemos comenzar con los pasos necesarios para instalar Dokploy.

---

## 2. Instalación de Dokploy

Dokploy es una plataforma de despliegue self-hosted que nos permite gestionar contenedores Docker de forma sencilla.

Accedemos a la documentación oficial para obtener el comando de instalación:
- https://docs.dokploy.com/docs/core/installation

Ejecutamos el siguiente comando:

```bash
curl -sSL https://dokploy.com/install.sh | sh
```

Una vez ejecutado, la instalación comenzará automáticamente. Al finalizar, nos proporcionará una dirección IP con puerto para acceder al panel de Dokploy desde el navegador (ej: `http://IP_DE_LA_VM:3000`).

---

## 3. Creación del Proyecto y la API en Dokploy

### 3.1 Crear el proyecto en Dokploy

1. Accedemos al panel de Dokploy desde el navegador.
2. Creamos un nuevo **Proyecto**.
3. Dentro del proyecto, creamos un **Service → Application**.
4. Conectamos con nuestro repositorio de GitHub.

### 3.2 Repositorio de GitHub

El código de la API está alojado en:
- https://github.com/Aren640/RoberApi

La estructura del proyecto es:

```
RoberApi/
└── js-api/
    ├── index.js          # Código principal de la API
    ├── package.json      # Dependencias
    ├── Dockerfile        # Imagen Docker de la API
    ├── docker-compose.yml
    └── .env              # Variables de entorno (NO subir en producción)
```

---

## 4. Creación de la Base de Datos en Dokploy

1. Dentro del proyecto en Dokploy, creamos un nuevo **Service → Database → MySQL**.
2. Configuramos:
   - **Database Name:** `Rober`
   - **User:** `root`
3. Dokploy genera automáticamente las credenciales y el host interno.

Una vez creada, en la pestaña **General** de la base de datos encontramos las **Internal Credentials**:

| Campo | Valor |
|---|---|
| User | `root` |
| Password | (generado automáticamente) |
| Root Password | (generado automáticamente) |
| Database Name | `Rober` |
| Internal Port | `3306` |
| Internal Host | `claserober-basedatos-k8sxeu` |

---

## 5. Configuración de la API

### 5.1 Código principal (index.js)

La API está desarrollada en **Node.js con Express** y se conecta a MySQL usando el paquete `mysql2`.

Características:
- Lee la configuración desde variables de entorno.
- Reintenta la conexión a MySQL automáticamente si falla.
- Escucha en `0.0.0.0` para ser accesible desde fuera del contenedor.

Endpoints disponibles:
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Comprueba que la API está activa |
| GET | `/test-db` | Prueba la conexión a la base de datos |

### 5.2 Dockerfile

```dockerfile
FROM node:18
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 6. Variables de Entorno en Dokploy

En el servicio de la API, dentro de **Environment Settings**, configuramos las siguientes variables:

```
NODE_ENV=production
PORT=3000
MYSQL_HOST=claserober-basedatos-k8sxeu
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=(Root Password de la DB en Dokploy)
MYSQL_DATABASE=Rober
```

> **Importante:** No usar `127.0.0.1` como `MYSQL_HOST`. Los contenedores Docker se comunican entre sí mediante el nombre del servicio (Internal Host).

---

## 7. Despliegue

Una vez configuradas las variables de entorno:

1. En el servicio de la API en Dokploy, hacer click en **Deploy**.
2. Dokploy clonará el repositorio de GitHub, construirá la imagen Docker y levantará el contenedor.
3. Verificar en los **Logs** que aparezca:
   ```
   API escuchando en 0.0.0.0:3000
   Conectado a MySQL correctamente
   ```

---

## 8. Acceso Externo con Cloudflare Tunnel

Dokploy gestiona el tráfico internamente mediante **Traefik** (puerto 80/443). Para acceder a la API desde fuera de la máquina virtual (PC, móvil, etc.) sin exponer la IP, usamos **Cloudflare Tunnel**.

### 8.1 Instalación de cloudflared

En la terminal de Ubuntu:

```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb
```

Verificar la instalación:

```bash
cloudflared --version
```

### 8.2 Crear túnel rápido (sin cuenta de Cloudflare)

```bash
cloudflared tunnel --url http://localhost:80 --http-host-header claserober-api-czwtzj-362621-10-0-2-15.traefik.me
```

- `--url http://localhost:80` → apunta a Traefik, que gestiona el tráfico hacia la API.
- `--http-host-header` → indica a Traefik qué servicio debe recibir las peticiones.

Al ejecutarlo, Cloudflare genera una URL pública del tipo:
```
https://xxxx-xxxx-xxxx-xxxx.trycloudflare.com
```

Esta URL es accesible desde cualquier dispositivo con internet.

> **Nota:** Con el túnel rápido (sin cuenta), la URL cambia cada vez que se reinicia el túnel y no tiene garantía de uptime. Para producción, usar un túnel nombrado con cuenta de Cloudflare.

### 8.3 Probar la API

Una vez activo el túnel, acceder a:

- `https://TU_URL.trycloudflare.com/` → debe responder `API JS funcionando`
- `https://TU_URL.trycloudflare.com/test-db` → debe responder `{"db_connection":"success","result":1}`

---

## 9. Arquitectura del Sistema

```
[PC / Móvil]
     │
     │ HTTPS
     ▼
[Cloudflare Tunnel]
     │
     │ HTTP (localhost:80)
     ▼
[Traefik - Puerto 80/443]
     │
     │ Enruta por Host header
     ▼
[Contenedor API - Node.js:3000]
     │
     │ TCP interno (claserober-basedatos-k8sxeu:3306)
     ▼
[Contenedor MySQL - Puerto 3306]
```

---

## 10. Comandos Útiles

| Acción | Comando |
|---|---|
| Ver contenedores activos | `docker ps` |
| Ver logs de la API | `docker logs <CONTAINER_ID>` |
| Reiniciar un contenedor | `docker restart <CONTAINER_ID>` |
| Instalar cloudflared | `sudo dpkg -i cloudflared.deb` |
| Lanzar túnel | `cloudflared tunnel --url http://localhost:80 --http-host-header <HOST>` |
