import { BasePayload } from './BasePayload.js';

export class added_contact extends BasePayload {
    constructor (
        public phone_number: String,
        public name: String,
        public color: Number,
        public color_dark: Number,
        public color_light: Number,
        public color_accent: Number,
        public type: Number
    ) { super() }
}


export class updated_contact extends BasePayload {
    constructor (
        public device_id: Number,
        public phone_number: String,
        public name: String,
        public color: Number,
        public color_dark: Number,
        public color_light: Number,
        public color_accent: Number,
        public type: Number
    ) { super() }
}


export class removed_contact extends BasePayload {
    constructor (
        public device_id: Number,
        public phone_number: String
    ) { super() }
}


export class removed_contact_by_id extends BasePayload {
    constructor (
        public id: String
    ) { super() }
}