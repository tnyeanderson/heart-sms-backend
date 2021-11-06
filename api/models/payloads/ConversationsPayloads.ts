import { BasePayload } from './BasePayload.js';

export class added_conversation extends BasePayload {
	constructor (
        public device_id: number,
        public folder_id: number,
        public color: number,
        public color_dark: number,
        public color_light: number,
        public color_accent: number,
        public led_color: number,
        public pinned: boolean,
        public read: boolean,
        public timestamp: number,
        public title: string,
        public phone_numbers: string,
        public snippet: string,
        public id_matcher: string,
        public mute: boolean,
        public archive: boolean,
        public private_notifications: boolean,
        public ringtone?: string,
        public image_uri?: string,
	) { super() }
}


export class updated_conversation extends BasePayload {
	constructor (
        public id: number,
        public color: number,
        public color_dark: number,
        public color_light: number,
        public color_accent: number,
        public led_color: number,
        public pinned: boolean,
        public read: boolean,
        public title: string,
        public snippet: string,
        public mute: boolean,
        public archive: boolean,
        public private_notifications: boolean,
        public ringtone?: string
	) { super() }
}


export class update_conversation_snippet extends BasePayload {
	constructor (
        public id: number,
        public read: boolean,
        public timestamp: number,
        public snippet: string,
        public archive: boolean
	) { super() }
}


export class update_conversation_title extends BasePayload {
	constructor (
        public id: number,
        public title: string
	) { super() }
}


export class read_conversation extends BasePayload {
	constructor (
        public id: number,
        public android_device?: string
	) { super() }
}


export class archive_conversation extends BasePayload {
	constructor (
        public id: number,
        public archive: boolean
	) { super() }
}


export class add_conversation_to_folder extends BasePayload {
	constructor (
        public id: number,
        public folder_id: number
	) { super() }
}


export class cleanup_conversation_messages extends BasePayload {
	constructor (
        public timestamp: number,
        public conversation_id: string
	) { super() }
}



export class seen_conversations extends BasePayload { }


export class seen_conversation extends BasePayload {
	constructor (
        public id: number
	) { super() }
}


export class removed_conversation extends seen_conversation { }


export class remove_conversation_from_folder extends seen_conversation { }
