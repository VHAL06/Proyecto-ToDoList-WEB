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

### Base de datos
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
Método	      Ruta	                            Descripción
GET    	    /api/todos	                      Listar tareas
GET    	    /api/todos?status=active	        Tareas pendientes
GET    	    /api/todos?status=completed	      Tareas completadas
GET    	    /api/todos/:id	                  Obtener tarea
POST  	    /api/todos	                      Crear tarea
PUT    	    /api/todos/:id	                  Actualizar tarea
DELETE	    /api/todos/:id	                  Eliminar tarea
DELETE	    /api/todos/completed	            Eliminar completadas

# Notas

API probada con Postman
Base de datos verificada con DBeaver
CRUD completo funcional
