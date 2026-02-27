Proyecto Final – API de Tareas

Backend REST para gestión de tareas desarrollado con Node.js, Express y MySQL Server.

## Tecnologías

Node.js
Express
MySQL Server
mysql2
CORS

## Instalación
npm install

## Base de datos
CREATE DATABASE todo_db;
USE todo_db;

CREATE TABLE todos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  completed TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

### Configuración

## Editar conexión en server.js:
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "TU_PASSWORD", (739943 en mi caso)
  database: "todo_db"
});

## Ejecución
"node server.js"  o  "npm run vhal"

## Servidor:
http://localhost:3000


## Endpoints
Listar tareas
GET /api/todos

Filtrar tareas
GET /api/todos?status=active
GET /api/todos?status=completed

Obtener tarea por ID
GET /api/todos/:id

Crear tarea
POST /api/todos

Body (JSON):
{
  "title": "Nueva tarea"
}

Actualizar tarea
PUT /api/todos/:id

Body (JSON):
{
  "title": "Título actualizado",
  "completed": true
}

Eliminar tarea por ID
DELETE /api/todos/:id

Eliminar todas las tareas completadas
DELETE /api/todos/completed

## Notas

API probada con Postman
Base de datos verificada con DBeaver
CRUD completo funcional
