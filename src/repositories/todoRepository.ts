import { Todo } from "../models/todo";
import { Connection, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { NotFoundDataError, SqlError } from "../utils/error";
import { ITodoRepository } from "./interface";

export class TodoRepository implements ITodoRepository {
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  public async findAll(): Promise<Todo[] | Error> {
    try {
      const sql = "SELECT * FROM todos";
      const [rows] = await this.connection.execute<Todo[] & RowDataPacket[]>(sql);
      return rows;
    } catch (err) {
      console.log(`TodoRepository.findAll: ${err}`);
      return new SqlError(`sql error`);
    }
  }

  public async getByID(id: number): Promise<Todo | Error> {
    try {
      const sql = `SELECT * FROM todos WHERE id=${id}`;
      const [rows] = await this.connection.execute<Todo[] & RowDataPacket[]>(sql);

      if (rows.length === 0) {
        return new NotFoundDataError(`todo is not found`);
      }

      return rows[0];
    } catch (err) {
      console.log(`TodoRepository.getByID: ${err}`);
      return new SqlError(`sql error`);
    }
  }

  public async create(todo: Todo): Promise<number | Error> {
    try {
      const sql = `INSERT INTO todos (title, description) VALUES ("${todo.title}", "${todo.description}")`;
      const [result] = await this.connection.execute<ResultSetHeader>(sql);
      return result.insertId;
    } catch (err) {
      console.log(`TodoRepository.create: ${err}`);
      return new SqlError(`sql error`);
    }
  }

  public async update(id: number, todo: Todo): Promise<void | Error> {
    try {
      const sql = `UPDATE todos SET title="${todo.title}", description="${todo.description}" WHERE id=${id}`;
      await this.connection.query<ResultSetHeader>(sql);
    } catch (err) {
      console.log(`TodoRepository.update: ${err}`);
      return new SqlError(`sql error`);
    }
  }

  public async delete(id: number): Promise<void | Error> {
    try {
      const sql = `DELETE FROM todos WHERE id=${id}`;
      await this.connection.query<ResultSetHeader>(sql);
    } catch (err) {
      console.log(`TodoRepository.delete: ${err}`);
      return new SqlError(`sql error`);
    }
  }
}
