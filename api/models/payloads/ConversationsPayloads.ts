import { QueryResultRow } from 'pg';
import { util } from '../../utils/util.js';
import { DeviceIdRequest } from '../requests/BaseRequests.js';
import { ConversationsAddItem, ConversationsAddToFolderRequest, ConversationsCleanupMessagesRequest, ConversationsReadRequest, ConversationsSeenRequest, ConversationsUpdateTitleRequest } from '../requests/ConversationsRequests.js';
import { BasePayload, DeviceIdPayload } from './BasePayload.js';

export class added_conversation extends BasePayload {
	device_id: number;
	folder_id: number;
	color: number;
	color_dark: number;
	color_light: number;
	color_accent: number;
	led_color: number;
	pinned: boolean;
	read: boolean;
	timestamp: number;
	title: string;
	phone_numbers: string;
	snippet: string;
	id_matcher: string;
	mute: boolean;
	archive: boolean;
	private_notifications: boolean;
	ringtone?: string;
	image_uri?: string;

	constructor(r: ConversationsAddItem) {
		super();
		this.device_id = Number(r.device_id);
		this.folder_id = Number(r.folder_id);
		this.color = Number(r.color);
		this.color_dark = Number(r.color_dark);
		this.color_light = Number(r.color_light);
		this.color_accent = Number(r.color_accent);
		this.led_color = Number(r.led_color);
		this.pinned = Boolean(r.pinned);
		this.read = Boolean(r.read);
		this.timestamp = Number(r.timestamp);
		this.title = String(r.title);
		this.phone_numbers = String(r.phone_numbers);
		this.snippet = String(r.snippet);
		this.id_matcher = String(r.id_matcher);
		this.mute = Boolean(r.mute);
		this.archive = Boolean(r.archive);
		this.private_notifications = Boolean(r.private_notifications);
		this.setProp('ringtone', r, String);
		this.setProp('image_uri', r, String);
	}
}

export class updated_conversation extends BasePayload {
	id: number;
	color: number;
	color_dark: number;
	color_light: number;
	color_accent: number;
	led_color: number;
	pinned: boolean;
	read: boolean;
	title: string;
	snippet: string;
	mute: boolean;
	archive: boolean;
	private_notifications: boolean;
	ringtone?: string | null;
	image_uri?: string;

	constructor(r: QueryResultRow) {
		super();
		this.id = Number(r.id);
		this.color = Number(r.color);
		this.color_dark = Number(r.color_dark);
		this.color_light = Number(r.color_light);
		this.color_accent = Number(r.color_accent);
		this.led_color = Number(r.led_color);
		this.pinned = Boolean(r.pinned);
		this.read = Boolean(r.read);
		this.title = String(r.title);
		this.snippet = String(r.snippet);
		this.mute = Boolean(r.mute);
		this.archive = Boolean(r.archive);
		this.private_notifications = Boolean(r.private_notifications);
		this.ringtone = (util.propMissing(r, 'ringtone')) ? null : String(r.ringtone);
	}
}

export class update_conversation_snippet extends BasePayload {
	id: number;
	read: boolean;
	timestamp: number;
	snippet: string;
	archive: boolean;

	constructor(r: QueryResultRow) {
		super();
		this.id = Number(r.id);
		this.read = Boolean(r.read);
		this.timestamp = Number(r.timestamp);
		this.snippet = String(r.snippet);
		this.archive = Boolean(r.archive);
	}
}

export class update_conversation_title extends DeviceIdPayload {
	title: string;

	constructor(r: ConversationsUpdateTitleRequest) {
		super(r);
		this.title = String(r.title);
	}
}

export class read_conversation extends DeviceIdPayload {
	android_device?: string;

	constructor(r: ConversationsReadRequest) {
		super(r);
		this.setProp('android_device', r, String);
	}
}

export class archive_conversation extends DeviceIdPayload {
	archive: boolean;

	constructor(r: DeviceIdRequest, archive: boolean) {
		super(r);
		this.archive = Boolean(archive);
	}
}

export class add_conversation_to_folder extends DeviceIdPayload {
	folder_id: number;

	constructor(r: ConversationsAddToFolderRequest) {
		super(r);
		this.folder_id = Number(r.folder_id);
	}
}

export class cleanup_conversation_messages extends BasePayload {
	timestamp: number;
	conversation_id: string;

	constructor(r: ConversationsCleanupMessagesRequest) {
		super();
		this.timestamp = Number(r.timestamp);
		this.conversation_id = String(r.conversation_id);
	}
}

export class seen_conversations extends BasePayload { }

export class seen_conversation extends BasePayload {
	id: number;

	constructor (r: ConversationsSeenRequest) {
		super();
		this.id = Number(r.device_conversation_id);
	}
}

export class removed_conversation extends DeviceIdPayload { }

export class remove_conversation_from_folder extends DeviceIdPayload { }
