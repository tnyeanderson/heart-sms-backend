import { BaseError } from "../errors/Errors.js"

export class ErrorResponse {
	constructor(
		public msg: BaseError = new BaseError('unexpected error'),
		public status?: number
	) { }
}

export class InvalidAccountError extends ErrorResponse {
	constructor() { super(new BaseError('account id invalid'), 400) }
}

export class DuplicateUserError extends ErrorResponse {
	constructor() { super(new BaseError('user already exists'), 400) }
}

export class UserNotAllowedError extends ErrorResponse {
	constructor() { super(new BaseError('username is not allowed'), 401) }
}

export class AuthError extends ErrorResponse {
	constructor() { super(new BaseError('username or password incorrect'), 401) }
}

export class NotImplementedError extends ErrorResponse {
	constructor() { super(new BaseError('not implemented'), 501) }
}

export class UnhandledPathError extends ErrorResponse {
	constructor(path: string) { super(new BaseError(`unhandled path in request: ${path}`), 404) }
}

export class MissingParamError extends ErrorResponse {
	constructor(param?: string) { super(new BaseError(`missing required parameter ${param || ''}`), 400) }
}

export class ParamTypeError extends ErrorResponse {
	constructor(param?: string) { super(new BaseError(`parameter ${param || ''} has the wrong type`), 400) }
}

export class DatabaseError extends ErrorResponse {
	constructor() { super(new BaseError('could not query database'), 500) }
}
