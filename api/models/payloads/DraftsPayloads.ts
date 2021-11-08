import { BasePayload, DeviceIdPayload } from './BasePayload.js';

export class added_draft extends DeviceIdPayload {
	conversation_id: number;
	data: string;
	mime_type: string;

	constructor(r: any) {
		super(r);
		this.conversation_id = Number(r.device_conversation_id);
		this.data = String(r.data);
		this.mime_type = String(r.mime_type);
	}
}

export class removed_drafts extends BasePayload {
	id: number;
	android_device?: string;

	constructor(r: any) {
		super();
		this.id = Number(r.device_conversation_id);
		this.setProp('android_device', r, String);
	}
}

export class replaced_drafts extends added_draft {
	constructor(r: any) {
		super(r);
		// This can be called with id/conversation_id as well
		this.id = this.id || Number(r.id);
		this.conversation_id = this.conversation_id || Number(r.conversation_id);
	}
}
