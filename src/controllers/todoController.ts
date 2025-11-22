import { Router } from "express";
import { ITodoService } from "../services/interface";
import { NotFoundDataError } from "../utils/error";
import { Todo } from "../models/todo";

export class TodoController {
  private todoService: ITodoService;
  public router: Router;

  constructor(todoService: ITodoService) {
    this.todoService = todoService;
    this.router = Router();

    this.router.get("/todos", async (_, res) => {
      const result = await this.todoService.findAll();

      if (result instanceof Error) {
        res.status(500).send();
        return;
      }

      res.status(200).json(result);
    });

    this.router.get("/todos/:id", async (req, res) => {
      const id = parseInt(req.params.id);
      const result = await this.todoService.getByID(id);

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

    this.router.post("/todos", async (req, res) => {
      const todo: Todo = req.body;
      const result = await this.todoService.create(todo);

      if (result instanceof Error) {
        res.status(500).send();
        return;
      }

      res.status(201).json(result);
    });

    // Update API
    this.router.put("/todos/:id", async (req, res) => {
      const id = parseInt(req.params.id);
      const todo: Todo = req.body;
      const result = await this.todoService.update(id, todo);

      if (result instanceof NotFoundDataError) {
        res.status(404).send();
        return;
      }

      if (result instanceof Error) {
        res.status(500).send();
        return;
      }

      res.status(200).send();
    });

    // Delete API
    this.router.delete("/todos/:id", async (req, res) => {
      const id = parseInt(req.params.id);
      const result = await this.todoService.delete(id);

      if (result instanceof Error) {
        res.status(500).send();
        return;
      }

      res.status(204).send();
    });
  }
}
