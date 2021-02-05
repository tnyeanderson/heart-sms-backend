import { BasePayload } from "./BasePayload"

export class added_draft extends BasePayload {
    constructor (
        public id: Number,
        public conversation_id: Number,
        public data: String,
        public mime_type: String
    ) { super() }
}


export class removed_drafts extends BasePayload {
    constructor (
        public id: Number,
        public android_device?: String
    ) { super() }
}


export class replaced_drafts extends added_draft { }