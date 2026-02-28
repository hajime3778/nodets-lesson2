import { Todo } from "../../../models/todo";
import { ITodoRepository } from "../../../repositories/interface";
import { TodoService } from "../../../services/todoService";
import { NotFoundDataError } from "../../../utils/error";

function createMockTodoRepository(): ITodoRepository {
  const mockRepository: ITodoRepository = {
    findAll: jest.fn().mockRejectedValue(new Error("Function not implemented")),
    getByID: jest.fn().mockRejectedValue(new Error("Function not implemented")),
    create: jest.fn().mockRejectedValue(new Error("Function not implemented")),
    update: jest.fn().mockRejectedValue(new Error("Function not implemented")),
    delete: jest.fn().mockRejectedValue(new Error("Function not implemented")),
  };
  return mockRepository;
}

function createMockTodoList(num: number): Todo[] {
  const todoList: Todo[] = [];

  for (let index = 0; index < num; index++) {
    const todo: Todo = {
      id: index,
      title: `sample title${index}`,
      description: `sample description${index}`,
    };
    todoList.push(todo);
  }

  return todoList;
}

describe("TodoService", () => {
  describe("findAll", () => {
    it("should return 5 todos", async () => {
      const mockRepository = createMockTodoRepository();
      const service = new TodoService(mockRepository);
      const mockTodos: Todo[] = createMockTodoList(5);
      mockRepository.findAll = jest.fn().mockResolvedValue(mockTodos);

      const result = await service.findAll();
      if (result instanceof Error) {
        throw new Error(`Test failed because an error has occured: ${result.message}`);
      }

      expect(result.length).toBe(5);

      for (const todo of result) {
        const expectTodo = mockTodos.filter((t) => t.id === todo.id)[0];
        expect(todo.id).toBe(expectTodo.id);
        expect(todo.title).toBe(expectTodo.title);
        expect(todo.description).toBe(expectTodo.description);
      }
    });

    it("should return repository error", async () => {
      const mockRepository = createMockTodoRepository();
      mockRepository.findAll = jest.fn().mockResolvedValue(new Error("repository error"));
      const service = new TodoService(mockRepository);

      const result = await service.findAll();

      if (!(result instanceof Error)) {
        throw new Error(`Test failed because an error has not occured`);
      }

      expect(result instanceof Error).toBeTruthy();
    });
  });
  describe("getByID", () => {
    it("should return todo", async () => {
      const todo: Todo = {
        id: 1,
        title: "title",
        description: "description",
      };
      const mockRepository = createMockTodoRepository();
      mockRepository.getByID = jest.fn().mockResolvedValue(todo);

      const service = new TodoService(mockRepository);
      const result = await service.getByID(todo.id!);

      if (result instanceof Error) {
        throw new Error(`Test failed because an error has occurred: ${result.message}`);
      }

      expect(result.id).toBe(todo.id);
      expect(result.title).toBe(todo.title);
      expect(result.description).toBe(todo.description);
    });
    it("should return repository error", async () => {
      const mockRepository = createMockTodoRepository();
      mockRepository.getByID = jest.fn().mockResolvedValue(new Error("repository error"));

      const service = new TodoService(mockRepository);
      const result = await service.getByID(1);

      if (!(result instanceof Error)) {
        throw new Error("Test failed because an error has not occurred");
      }

      expect(result.message).toBe("repository error");
    });
  });

  describe("create", () => {
    it("should return createdID 1", async () => {
      const mockRepository = createMockTodoRepository();
      mockRepository.create = jest.fn().mockResolvedValue(1);

      const service = new TodoService(mockRepository);
      const createTodo: Todo = {
        title: "title",
        description: "description",
      };
      const result = await service.create(createTodo);

      if (result instanceof Error) {
        throw new Error(`Test failed because an error has occurred: ${result.message}`);
      }

      expect(result).toBe(1);
    });
    it("should return repository error", async () => {
      const mockRepository = createMockTodoRepository();
      mockRepository.create = jest.fn().mockResolvedValue(new Error("repository error"));

      const service = new TodoService(mockRepository);
      const createTodo: Todo = {
        title: "title",
        description: "description",
      };
      const result = await service.create(createTodo);

      if (!(result instanceof Error)) {
        throw new Error("Test failed because an error has not occurred");
      }

      expect(result.message).toBe("repository error");
    });
  });

  describe("update", () => {
    it("should return no errors", async () => {
      const mockRepository = createMockTodoRepository();
      const mockGetByIDResult: Todo = {
        id: 1,
        title: "title",
        description: "description",
      };
      mockRepository.getByID = jest.fn().mockResolvedValue(mockGetByIDResult);
      mockRepository.update = jest.fn().mockResolvedValue(null);

      const service = new TodoService(mockRepository);
      const updateTodo: Todo = {
        title: "updated title",
        description: "updated description",
      };
      const result = await service.update(1, updateTodo);

      if (result instanceof Error) {
        throw new Error(`Test failed because an error has occurred: ${result.message}`);
      }

      expect(result).toBe(null);
    });
    it("should return notfound error", async () => {
      const mockGetByIDResult: Error = new NotFoundDataError("mock notfound error");
      const mockRepository = createMockTodoRepository();
      mockRepository.getByID = jest.fn().mockResolvedValue(mockGetByIDResult);
      mockRepository.update = jest.fn().mockResolvedValue(null);

      const service = new TodoService(mockRepository);
      const updateTodo: Todo = {
        title: "updated title",
        description: "updated description",
      };
      const result = await service.update(1, updateTodo);

      if (!(result instanceof Error)) {
        throw new Error("Test failed because an error has not occurred");
      }

      expect(result instanceof NotFoundDataError).toBeTruthy();
      expect(result.message).toBe("mock notfound error");
    });
    it("should return repository error", async () => {
      const mockRepository = createMockTodoRepository();
      const mockGetByIDResult: Todo = {
        id: 1,
        title: "title",
        description: "description",
      };
      mockRepository.getByID = jest.fn().mockResolvedValue(mockGetByIDResult);
      mockRepository.update = jest.fn().mockResolvedValue(new Error("repository error"));

      const service = new TodoService(mockRepository);
      const updateTodo: Todo = {
        title: "updated title",
        description: "updated description",
      };
      const result = await service.update(1, updateTodo);

      if (!(result instanceof Error)) {
        throw new Error("Test failed because an error has not occurred");
      }

      expect(result.message).toBe("repository error");
    });
  });

  describe("delete", () => {
    it("should return no errors", async () => {
      const mockRepository = createMockTodoRepository();
      mockRepository.delete = jest.fn().mockResolvedValue(null);

      const service = new TodoService(mockRepository);
      const result = await service.delete(1);

      if (result instanceof Error) {
        throw new Error(`Test failed because an error has occurred: ${result.message}`);
      }

      expect(result).toBe(null);
    });
    it("should return repository error", async () => {
      const mockRepository = createMockTodoRepository();
      mockRepository.delete = jest.fn().mockResolvedValue(new Error("repository error"));

      const service = new TodoService(mockRepository);
      const result = await service.delete(1);

      if (!(result instanceof Error)) {
        throw new Error("Test failed because an error has not occurred");
      }

      expect(result.message).toBe("repository error");
    });
  });
});
