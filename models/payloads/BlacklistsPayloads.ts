import { BasePayload } from "./BasePayload"

export class added_blacklist extends BasePayload {
    constructor (
        public id: Number,
        public phone_number: String,
        public phrase: String
    ) { super() }
}


export class removed_blacklist extends BasePayload {
    constructor (
        public id: Number
    ) { super() }
}