import { BasePayload } from "./BasePayload"

export class removed_scheduled_message extends BasePayload {
    constructor (
        public id: Number
    ) { super() }
}


export class added_scheduled_message extends BasePayload {
    constructor (
        public id: Number,
        public to: String,
        public data: String,
        public mime_type: String,
        public timestamp: Number,
        public title: String,
        public repeat: Number
    ) { super() }
}


export class updated_scheduled_message extends added_scheduled_message { }