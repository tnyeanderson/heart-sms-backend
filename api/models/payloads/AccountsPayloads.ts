import { BasePayload } from './BasePayload.js';

export class dismissed_notification extends BasePayload {
    constructor (
        public id: string,
        public device_id?: string
    ) { super() }
}


export class cleaned_account extends BasePayload {
    constructor (
        public id: string
    ) { super() }
}


export class update_setting extends BasePayload {
    constructor (
        public pref: string,
        public type: string,
        public value: any
    ) { super() }
}


export class removed_account extends cleaned_account {}