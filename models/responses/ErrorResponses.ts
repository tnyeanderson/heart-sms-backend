import { BaseResponse } from "./BaseResponse.js"

export class ErrorResponse extends BaseResponse {
    constructor(
        public error: string
    ) { super() }
}

export class InvalidAccountError extends ErrorResponse {
    constructor() { super('account id invalid') }
}


export class DuplicateUserError extends ErrorResponse {
    constructor() { super('user already exists') }
}


export class UserNotAllowedError extends ErrorResponse {
    constructor() { super('username is not allowed') }
}


export class AuthError extends ErrorResponse {
    constructor() { super('username or password incorrect') }
}


export class NotImplementedError extends ErrorResponse {
    constructor() { super('not implemented') }
}


export class MissingParamError extends ErrorResponse {
    constructor(param?: string) { super(`missing required parameter ${param}`) }
}


export class DatabaseError extends ErrorResponse {
    constructor() { super('could not query database') }
}