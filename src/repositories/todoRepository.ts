import { Todo } from "../models/todo";
import { Connection, RowDataPacket } from "mysql2/promise";
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
}
