import express, { Express } from "express";
import cors from "cors";
import mysql, { Connection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import * as dotenv from "dotenv";

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

  type Todo = {
    id: number;
    title: string;
    description: string;
    createdAt?: Date;
    updatedAt?: Date;
  };

  app.get("/api/todos", async (req, res) => {
    const sql = "SELECT * FROM todos";
    const [rows] = await connection.execute<Todo[] & RowDataPacket[]>(sql);
    res.json(rows);
  });

  app.get("/api/todos/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const sql = `SELECT * FROM todos WHERE id=${id}`;
    const [rows] = await connection.execute<Todo[] & RowDataPacket[]>(sql);
    res.json(rows[0]);
  });

  app.post("/api/todos", async (req, res) => {
    const todo = req.body;
    const sql = `INSERT INTO todos (title, description) VALUES ("${todo.title}", "${todo.description}")`;
    const [result] = await connection.execute<ResultSetHeader>(sql);
    res.status(201).json(result.insertId);
  });

  // Update API

  // Delete API
}
main();
