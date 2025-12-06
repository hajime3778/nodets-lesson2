import { Connection, ResultSetHeader } from "mysql2/promise";
import { Todo } from "../../../models/todo";
import { TodoRepository } from "../../../repositories/todoRepository";
import { createDBConnection } from "../../utils/database/database";
import { NotFoundDataError, SqlError } from "../../../utils/error";

let connection: Connection;

beforeEach(async () => {
  connection = await createDBConnection();
  await connection.query(`DELETE FROM todos`);
});

afterEach(async () => {
  await connection.end();
});

describe("TodoRepository", () => {
  describe("getByID", () => {
    it("should return todo", async () => {
      const todos = await createTodoTestDatas(connection, 1);
      const todo = todos[0];

      const repository = new TodoRepository(connection);
      const getByIdResult = await repository.getByID(todo.id!);
      if (getByIdResult instanceof Error) {
        throw new Error(`Test failed because an error has occured: ${getByIdResult.message}`);
      }

      expect(todo.id).toBe(getByIdResult.id);
      expect(todo.title).toBe(getByIdResult.title);
      expect(todo.description).toBe(getByIdResult.description);
    });

    it("should return NotFoundDataError if id is not exist", async () => {
      const repository = new TodoRepository(connection);
      const result = await repository.getByID(1);

      if (!(result instanceof Error)) {
        throw new Error(`Test failed because an error has occured`);
      }

      expect(result instanceof NotFoundDataError).toBeTruthy();
    });

    it("should return SqlError if database is clushed", async () => {
      const mockConnection = {
        execute: jest.fn().mockRejectedValue(new Error("Mocked SQL Error")),
      } as unknown as Connection;

      const repository = new TodoRepository(mockConnection);
      const result = await repository.getByID(1);

      expect(result instanceof SqlError).toBeTruthy();
    });
  });
});

async function createTodoTestDatas(connection: Connection, num: number): Promise<Todo[]> {
  const todoList: Todo[] = [];

  for (let index = 0; index < num; index++) {
    const todo: Todo = {
      title: `sample title${index}`,
      description: `sample description${index}`,
    };

    const sql = `INSERT INTO todos (title, description) VALUES ("${todo.title}", "${todo.description}")`;
    const [result] = await connection.execute<ResultSetHeader>(sql);

    todo.id = result.insertId;
    todoList.push(todo);
  }

  return todoList;
}
