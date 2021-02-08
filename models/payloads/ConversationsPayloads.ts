import { BasePayload } from './BasePayload.js';

export class added_conversation extends BasePayload {
    constructor (
        public device_id: Number,
        public folder_id: Number,
        public color: Number,
        public color_dark: Number,
        public color_light: Number,
        public color_accent: Number,
        public led_color: Number,
        public pinned: Boolean,
        public read: Boolean,
        public timestamp: Number,
        public title: string,
        public phone_numbers: string,
        public snippet: string,
        public id_matcher: string,
        public mute: Boolean,
        public archive: Boolean,
        public private_notifications: Boolean,
        public ringtone?: string,
        public image_uri?: string,
    ) { super() }
}


export class updated_conversation extends BasePayload {
    constructor (
        public id: Number,
        public color: Number,
        public color_dark: Number,
        public color_light: Number,
        public color_accent: Number,
        public led_color: Number,
        public pinned: Boolean,
        public read: Boolean,
        public title: string,
        public snippet: string,
        public mute: Boolean,
        public archive: Boolean,
        public private_notifications: Boolean,
        public ringtone?: string
    ) { super() }
}


export class update_conversation_snippet extends BasePayload {
    constructor (
        public id: Number,
        public read: Boolean,
        public timestamp: Number,
        public snippet: string,
        public archive: Boolean
    ) { super() }
}


export class update_conversation_title extends BasePayload {
    constructor (
        public id: Number,
        public title: string
    ) { super() }
}


export class read_conversation extends BasePayload {
    constructor (
        public id: Number,
        public android_device?: string
    ) { super() }
}


export class archive_conversation extends BasePayload {
    constructor (
        public id: Number,
        public archive: Boolean
    ) { super() }
}


export class add_conversation_to_folder extends BasePayload {
    constructor (
        public id: Number,
        public folder_id: Number
    ) { super() }
}


export class cleanup_conversation_messages extends BasePayload {
    constructor (
        public timestamp: Number,
        public conversation_id: string
    ) { super() }
}



export class seen_conversations { }


export class seen_conversation extends BasePayload {
    constructor (
        public id: Number
    ) { super() }
}


export class removed_conversation extends seen_conversation { }


export class remove_conversation_from_folder extends seen_conversation { }
