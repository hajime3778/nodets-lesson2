import { Todo } from "../models/todo";
import { Connection, RowDataPacket } from "mysql2/promise";

export class TodoRepository {
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
      if (err instanceof Error) {
        console.log(`execute error: ${err}`);
        return err;
      }
      return new Error();
    }
  }
}
