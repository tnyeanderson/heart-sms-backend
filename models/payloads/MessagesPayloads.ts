import { BasePayload } from './BasePayload.js';

export class added_message extends BasePayload {
    constructor (
        public id: Number,
        public conversation_id: Number,
        public type: Number,
        public data: String,
        public timestamp: Number,
        public mime_type: String,
        public read: Boolean,
        public seen: Boolean,
        public from: String,
        public color: Number,
        public sent_device: Number,
        public sim_stamp: Number
    ) { super() }
}


export class updated_message extends BasePayload {
    constructor (
        public id: Number,
        public type: Number,
        public timestamp: Number,
        public read: Boolean,
        public seen: Boolean,
    ) { super() }
}


export class update_message_type extends BasePayload {
    constructor (
        public id: String,
        public message_type: String
    ) { super() }
}


export class removed_message extends BasePayload {
    constructor (
        public id: Number
    ) { super() }
}


export class cleanup_messages extends BasePayload {
    constructor (
        public timestamp: Number
    ) { super() }
}


export class forward_to_phone extends BasePayload {
    constructor (
        public to: String,
        public message: String,
        public sent_device: Number,
        public mime_type?: String,
        public message_id?: Number
    ) { super() }
}