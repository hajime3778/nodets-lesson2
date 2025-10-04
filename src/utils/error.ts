class BaseError extends Error {
  constructor(e?: string) {
    super(e);

    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class SqlError extends BaseError {}
export class NotFoundDataError extends BaseError {}
