import { BasePayload } from './BasePayload.js';

export class added_draft extends BasePayload {
    constructor (
        public id: Number,
        public conversation_id: Number,
        public data: string,
        public mime_type: string
    ) { super() }
}


export class removed_drafts extends BasePayload {
    constructor (
        public id: Number,
        public android_device?: string
    ) { super() }
}


export class replaced_drafts extends added_draft { }