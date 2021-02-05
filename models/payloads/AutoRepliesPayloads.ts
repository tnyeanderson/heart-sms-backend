import { BasePayload } from './BasePayload.js';

export class removed_auto_reply extends BasePayload {
    constructor (
        public id: Number
    ) { super() }
}

export class added_auto_reply extends BasePayload {
    constructor (
        public device_id: Number,
        public type: String,
        public pattern: String,
        public response: String
    ) { super() }
}


export class updated_auto_reply extends added_auto_reply {}