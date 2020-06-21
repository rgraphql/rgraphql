// FieldNotFoundError is thrown when a field is not found.
// Usually this happens when a query selects a field
// not defined in the schema.
export class FieldNotFoundError extends Error {
  constructor(m: string) {
    super(m)
    Object.setPrototypeOf(this, FieldNotFoundError.prototype)
  }
}

// TypeNotFoundError indicates a graphql type was not found.
export class TypeNotFoundError extends Error {
  constructor(m: string) {
    super(m)
    Object.setPrototypeOf(this, TypeNotFoundError.prototype)
  }
}
