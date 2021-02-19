

export class BaseError extends Error {
    constructor(
        public error: string
    ) { super() }
}


export class MQTTNotConnectedError extends BaseError {
    constructor() { super("Not connected to MQTT, can't send a message") }
}

export class MQTTError extends BaseError {
    constructor(msg?: Error) { super(`MQTT error: ${msg}`) }
}

export class DefaultDatabasePasswordError extends BaseError {
    constructor() { super("You cannot use the default MYSQL password in production. Change it in .db.env") }
}