const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "739943",
  database: "todo_db",
  waitForConnections: true,
  connectionLimit: 10,
});

app.get("/api/todos", async (req, res) => {
  try {
    const { status } = req.query;
    let query = "SELECT id, title, completed, created_at FROM todos";
    let params = [];

    if (status === 'active') {
      query += " WHERE completed = 0";
    } else if (status === 'completed') {
      query += " WHERE completed = 1";
    }

    query += " ORDER BY id DESC";

    const [rows] = await db.query(query, params);
    
    res.json({
      data: rows,
      error: null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      data: null,
      error: { message: "Error al listar tareas" }
    });
  }
});

app.get("/api/todos/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        data: null,
        error: { message: "ID inválido" }
      });
    }

    const [[todo]] = await db.query(
      "SELECT id, title, completed, created_at FROM todos WHERE id = ?",
      [id]
    );

    if (!todo) {
      return res.status(404).json({
        data: null,
        error: { message: "Tarea no encontrada" }
      });
    }

    res.json({
      data: todo,
      error: null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      data: null,
      error: { message: "Error al obtener tarea" }
    });
  }
});

app.post("/api/todos", async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        data: null,
        error: { message: "title es requerido" }
      });
    }

    const [result] = await db.query(
      "INSERT INTO todos (title, completed) VALUES (?, 0)",
      [title.trim()]
    );

    const [[todo]] = await db.query(
      "SELECT id, title, completed, created_at FROM todos WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({
      data: todo,
      error: null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      data: null,
      error: { message: "Error al crear tarea" }
    });
  }
});

app.put("/api/todos/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        data: null,
        error: { message: "ID inválido" }
      });
    }
    
    const { title, completed } = req.body;

    if (title === undefined && completed === undefined) {
      return res.status(400).json({
        data: null,
        error: { message: "Nada para actualizar" }
      });
    }

    const fields = [];
    const values = [];

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          data: null,
          error: { message: "title no puede estar vacío" }
        });
      }
      fields.push("title = ?");
      values.push(title.trim());
    }

    if (completed !== undefined) {
      fields.push("completed = ?");
      values.push(completed ? 1 : 0);
    }

    values.push(id);

    const [result] = await db.query(
      `UPDATE todos SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        data: null,
        error: { message: "Tarea no encontrada" }
      });
    }

    const [[todo]] = await db.query(
      "SELECT id, title, completed, created_at FROM todos WHERE id = ?",
      [id]
    );

    res.json({
      data: todo,
      error: null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      data: null,
      error: { message: "Error al actualizar tarea" }
    });
  }
});

app.delete("/api/todos/completed", async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM todos WHERE completed = 1"
    );

    res.json({
      data: { deleted: result.affectedRows },
      error: null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      data: null,
      error: { message: "Error al borrar tareas completadas" }
    });
  }
});

app.delete("/api/todos/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        data: null,
        error: { message: "ID inválido" }
      });
    }

    const [result] = await db.query(
      "DELETE FROM todos WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        data: null,
        error: { message: "Tarea no encontrada" }
      });
    }

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({
      data: null,
      error: { message: "Error al eliminar tarea" }
    });
  }
});

app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});