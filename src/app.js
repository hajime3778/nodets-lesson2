const express = require("express");
const cors = require("cors");
const app = express();
const mysql2 = require('mysql2');

// port3000でサーバ立ち上げ
const server = app.listen(3000, function () {
  console.log("Node.js is listening to PORT:" + server.address().port);
});

// cors設定
app.disable('x-powered-by');
app.use(cors()).use(express.json());

// mysqlに接続
const connection = mysql2.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'user',
  password: 'password',
  database: 'sample',
});

connection.connect((err) => {
  if (err) throw err;
  console.log('connected mysql');
});

// todoをすべて取得する
app.get("/api/todos", (req, res) => {
  const sql = 'SELECT * FROM todos';
  connection.query(sql, (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).json();
      return;
    };
    res.json(results);
  });
});

// todoをidで1件取得する
app.get("/api/todos/:id", (req, res) => {
  const id = req.params.id;
  const sql = `SELECT * FROM todos WHERE ${id}`;
  connection.query(sql, (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).json();
      return;
    };
    if (results.length === 0) {
      res.status(404).json();
      return;
    }
    res.json(results[0]);
  });
});

// todoを作成する
app.post("/api/todos", (req, res) => {
  const todo = req.body;
  const sql = `
    INSERT INTO todos (title, description) 
    VALUES ("${todo.title}", "${todo.description}")
  `
  connection.query(sql, (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).json();
      return;
    };
    res.status(201).json(results.insertId);
  })
});

// ↓ 演習課題の回答
// todoを更新する
app.put("/api/todos/:id", (req, res) => {
  const id = req.params.id;
  const todo = req.body;
  const sql = `UPDATE todos SET title="${req.body.title}" description="${req.body.description}" WHERE id=${id}`;
  connection.query(sql, [todo, { id: id }], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json();
      return;
    };
    res.status(200).send();
  });
});

// todoを削除する
app.delete("/api/todos/:id", (req, res) => {
  const id = req.params.id;
  const sql = `DELETE FROM todos WHERE ${id}`;
  connection.query(sql, { id: id }, (err) => {
    if (err) {
      console.log(err);
      res.status(500).json();
      return;
    };
    res.status(200).send();
  });
});
