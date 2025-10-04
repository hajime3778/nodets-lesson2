import { Todo } from "../models/todo";

export interface ITodoRepository {
  findAll(): Promise<Todo[] | Error>;
  getByID(id: number): Promise<Todo | Error>;
}
