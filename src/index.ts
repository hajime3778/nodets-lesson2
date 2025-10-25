import express, { Express } from "express";
import cors from "cors";
import mysql, { Connection } from "mysql2/promise";
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

  app.get("/api/todos", async (_, res) => {
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
    const todo = req.body as Todo;
    const result = await todoRepository.create(todo);

    if (result instanceof Error) {
      res.status(500).send();
      return;
    }

    res.status(201).json(result);
  });

  // Update API
  app.put("/api/todos/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const todo: Todo = req.body;
    const result = await todoRepository.update(id, todo);

    if (result instanceof Error) {
      res.status(500).send();
      return;
    }

    res.status(200).send();
  });

  // Delete API
  app.delete("/api/todos/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const result = await todoRepository.delete(id);

    if (result instanceof Error) {
      res.status(500).send();
      return;
    }

    res.status(200).send();
  });
}
main();
