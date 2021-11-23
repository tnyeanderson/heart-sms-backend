export class BaseError extends Error {
	constructor(
		public error: string
	) { super() }
}

export class DefaultDatabasePasswordError extends BaseError {
	constructor() { super("You cannot use the default MYSQL password in production. Change it in .db.env") }
}

export class InvalidPushClientTokenError extends BaseError {
	constructor() { super('Client token for Unified Push is invalid') }
}

export class InvalidPushAppTokenError extends BaseError {
	constructor() { super('Application token for Unified Push is invalid') }
}
