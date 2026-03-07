import axios from "axios";
import { Todo } from "../../models/todo";
import * as dotenv from "dotenv";
import { Connection, RowDataPacket } from "mysql2/promise";
import { createDBConnection } from "../utils/database/database";

dotenv.config();
const { PORT } = process.env;

let connection: Connection;
beforeEach(async () => {
  connection = await createDBConnection();
  await connection.query(`DELETE FROM todos`);
});

afterEach(async () => {
  await connection.end();
});

axios.defaults.baseURL = `http://localhost:${PORT}`;
axios.defaults.headers.common = { "Content-Type": "application/json" };
axios.defaults.validateStatus = (status) => status >= 200 && status < 500;

describe("TodoApi", () => {
  // describe("GET /api/todos", () => {
  //   it("test", async () => {
  //     const response = await axios.get<Todo[]>("/api/todos");
  //     // console.log(response.data);
  //     // console.log(response.status);
  //     console.log(response.data);
  //     console.log(`status: ${response.status}`);
  //   });
  // });
  describe("POST /api/todos", () => {
    it("should return createdID and 201 status", async () => {
      const request: Todo = {
        title: "title",
        description: "description",
      };
      const response = await axios.post<number>("/api/todos", request);
      const createdId = response.data;
      const status = response.status;

      const sql = `SELECT * FROM todos WHERE id=${createdId}`;
      const [rows] = await connection.execute<Todo[] & RowDataPacket[]>(sql);
      const queryResult = rows[0] as Todo;

      expect(status).toBe(201);
      expect(queryResult.id).toBe(createdId);
      expect(queryResult.title).toBe(request.title);
      expect(queryResult.description).toBe(request.description);
    });
  });
});
