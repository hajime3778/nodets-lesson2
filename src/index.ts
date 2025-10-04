import express, { Express } from "express";
import cors from "cors";
import mysql, { Connection, ResultSetHeader } from "mysql2/promise";
import { Todo } from "./models/todo";
import { TodoRepository } from "./repositories/todoRepository";
import * as dotenv from "dotenv";
import { NotFoundDataError } from "./utils/error";

async function main() {
  dotenv.config();
  const { PORT, MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASS, MYSQL_DB } = process.env;
  const app: Express = express();

  // port4000でサーバ立ち上げ
  app.listen(parseInt(PORT as string), function () {
    console.log(("Node.js is listening to PORT: " + PORT) as string);
  });

  // cors設定
  app.disable("x-powered-by");
  app.use(cors()).use(express.json());

  // mysqlに接続
  const connection: Connection = await mysql.createConnection({
    host: MYSQL_HOST,
    port: parseInt(MYSQL_PORT as string),
    user: MYSQL_USER,
    password: MYSQL_PASS,
    database: MYSQL_DB,
  });

  const todoRepository = new TodoRepository(connection);

  app.get("/api/todos", async (req, res) => {
    const result = await todoRepository.findAll();

    if (result instanceof Error) {
      res.status(500).send();
      return;
    }

    res.status(200).json(result);
  });

  app.get("/api/todos/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const result = await todoRepository.getByID(id);

    if (result instanceof NotFoundDataError) {
      res.status(404).json(result.message);
      return;
    }

    if (result instanceof Error) {
      res.status(500).send();
      return;
    }

    res.status(200).json(result);
  });

  app.post("/api/todos", async (req, res) => {
    try {
      const todo = req.body;
      const sql = `INSERT INTO todos (title, description) VALUES ("${todo.title}", "${todo.description}")`;
      const [result] = await connection.execute<ResultSetHeader>(sql);
      res.status(201).json(result.insertId);
    } catch (err) {
      if (err instanceof Error) {
        console.log(`execute error: ${err}`);
        res.status(500).send();
      }
    }
  });

  // Update API
  app.put("/api/todos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const todo: Todo = req.body;
      const sql = `UPDATE todos SET title="${todo.title}", description="${todo.description}" WHERE id=${id}`;
      await connection.execute<ResultSetHeader>(sql);
      res.status(200).send();
    } catch (err) {
      if (err instanceof Error) {
        console.log(`execute error: ${err}`);
        res.status(500).send();
      }
    }
  });

  // Delete API
  app.delete("/api/todos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const sql = `DELETE FROM todos WHERE id=${id}`;
      await connection.execute<ResultSetHeader>(sql);
      res.status(204).send();
    } catch (err) {
      if (err instanceof Error) {
        console.log(`execute error: ${err}`);
        res.status(500).send();
      }
    }
  });
}
main();
