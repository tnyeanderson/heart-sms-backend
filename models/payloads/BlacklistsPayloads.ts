import { BasePayload } from './BasePayload.js';

export class added_blacklist extends BasePayload {
    constructor (
        public id: Number,
        public phone_number: string,
        public phrase: string
    ) { super() }
}


export class removed_blacklist extends BasePayload {
    constructor (
        public id: Number
    ) { super() }
}