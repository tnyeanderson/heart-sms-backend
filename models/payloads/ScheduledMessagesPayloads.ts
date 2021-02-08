import { BasePayload } from './BasePayload.js';

export class removed_scheduled_message extends BasePayload {
    constructor (
        public id: Number
    ) { super() }
}


export class added_scheduled_message extends BasePayload {
    constructor (
        public id: Number,
        public to: string,
        public data: string,
        public mime_type: string,
        public timestamp: Number,
        public title: string,
        public repeat: Number
    ) { super() }
}


export class updated_scheduled_message extends added_scheduled_message { }