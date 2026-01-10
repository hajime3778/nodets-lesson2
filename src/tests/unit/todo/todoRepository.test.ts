import { Connection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
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
  describe("findAll", () => {
    it("should return 5 todos", async () => {
      const repository = new TodoRepository(connection);
      const createdTodos = await createTodoTestDatas(connection, 5);

      const result = await repository.findAll();
      if (result instanceof Error) {
        throw new Error(`Test failed because an error has occured: ${result.message}`);
      }

      expect(createdTodos.length).toBe(5);

      for (const todo of result) {
        const expectTodo = createdTodos.filter((t) => t.id === todo.id)[0];
        expect(todo.id).toBe(expectTodo.id);
        expect(todo.title).toBe(expectTodo.title);
        expect(todo.description).toBe(expectTodo.description);
      }
    });

    it("should return SqlError if database is clushed", async () => {
      const mockConnection = {
        execute: jest.fn().mockRejectedValue(new Error("Mocked SQL Error")),
      } as unknown as Connection;

      const repository = new TodoRepository(mockConnection);
      const result = await repository.findAll();

      expect(result instanceof SqlError).toBeTruthy();
    });
  });

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

  describe("create", () => {
    it("should return createdID", async () => {
      const repository = new TodoRepository(connection);

      const todo: Todo = {
        title: "sample title",
        description: "sample description",
      };
      const result = await repository.create(todo);
      if (result instanceof Error) {
        throw new Error(`Test failed because an error has occured: ${result.message}`);
      }

      const createdID = result;
      const selectResult = await getTodoByIdForTest(connection, createdID);

      expect(createdID).toBe(selectResult.id);
      expect(todo.title).toBe(selectResult.title);
      expect(todo.description).toBe(selectResult.description);
    });

    it("should return SqlError if database is clushed", async () => {
      const mockConnection = {
        execute: jest.fn().mockRejectedValue(new Error("Mocked SQL Error")),
      } as unknown as Connection;

      const repository = new TodoRepository(mockConnection);
      const todo: Todo = {
        title: "sample",
        description: "sample",
      };
      const result = await repository.create(todo);

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

async function getTodoByIdForTest(connection: Connection, id: number): Promise<Todo> {
  const sql = `SELECT * FROM todos WHERE id=${id}`;
  const [rows] = await connection.execute<Todo[] & RowDataPacket[]>(sql);

  return rows[0] as Todo;
}
