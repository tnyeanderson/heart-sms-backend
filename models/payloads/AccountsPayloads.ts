import { BasePayload } from './BasePayload.js';

export class dismissed_notification extends BasePayload {
    constructor (
        public id: String,
        public device_id?: String
    ) { super() }
}


export class cleaned_account extends BasePayload {
    constructor (
        public id: String
    ) { super() }
}


export class removed_account extends cleaned_account {}