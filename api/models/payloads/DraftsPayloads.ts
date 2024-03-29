import { DraftsAddItem, DraftsRemoveRequest } from '../requests/DraftsRequests.js';
import { BasePayload, DeviceIdPayload } from './BasePayload.js';

export class added_draft extends DeviceIdPayload {
	conversation_id: number;
	data: string;
	mime_type: string;

	constructor(r: DraftsAddItem) {
		super(r);
		this.conversation_id = Number(r.device_conversation_id);
		this.data = String(r.data);
		this.mime_type = String(r.mime_type);
	}
}

export class removed_drafts extends BasePayload {
	id: number;
	android_device?: string;

	constructor(r: DraftsRemoveRequest) {
		super();
		this.id = Number(r.device_conversation_id);
		this.setProp('android_device', r, String);
	}
}

export class replaced_drafts extends added_draft { }
