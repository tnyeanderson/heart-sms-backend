import { MessagesAddItem, MessagesCleanupRequest, MessagesForwardToPhoneRequest, MessagesUpdateTypeRequest } from '../requests/MessagesRequests.js';
import { BasePayload, DeviceIdPayload } from './BasePayload.js';

export class added_message extends DeviceIdPayload {
	conversation_id: number;
	type: number;
	data: string;
	timestamp: number;
	mime_type: string;
	read: boolean;
	seen: boolean;
	sent_device: number;
	from?: string;
	color?: number;
	sim_stamp?: string;

	constructor(r: MessagesAddItem) {
		super(r);
		this.conversation_id = Number(r.device_conversation_id);
		this.type = Number(r.message_type);
		this.data = String(r.data);
		this.timestamp = Number(r.timestamp);
		this.mime_type = String(r.mime_type);
		this.read = Boolean(r.read);
		this.seen = Boolean(r.seen);
		this.sent_device = Number(r.sent_device);
		this.setProp({source: 'message_from', target: 'from'}, r, String);
		this.setProp('color', r, Number);
		this.setProp('sim_stamp', r, String);
	}
}

export class updated_message extends BasePayload {
	id: number;
	type: number;
	timestamp: number;
	read?: boolean;
	seen?: boolean;

	constructor(r: any) {
		super();
		this.id = Number(r.id);
		this.type = Number(r.type);
		this.timestamp = Number(r.timestamp);
		this.setProp('read', r, Boolean);
		this.setProp('seen', r, Boolean);
	}
}

export class update_message_type extends BasePayload {
	id: string;
	message_type: string;

	constructor(r: MessagesUpdateTypeRequest) {
		super();
		this.id = String(r.device_id);
		this.message_type = String(r.message_type);
	}
}

export class removed_message extends DeviceIdPayload { }

export class cleanup_messages extends BasePayload {
	timestamp: number;

	constructor(r: MessagesCleanupRequest) {
		super();
		this.timestamp = Number(r.timestamp);
	}
}

export class forward_to_phone extends BasePayload {
	to: string;
	message: string;
	sent_device: number;
	mime_type?: string;
	message_id?: number;

	constructor(r: MessagesForwardToPhoneRequest) {
		super();
		this.to = String(r.to)
		this.message = String(r.message);
		this.sent_device = Number(r.sent_device);
		this.setProp('mime_type', r, String);
		this.setProp('message_id', r, Number);
	}
}
