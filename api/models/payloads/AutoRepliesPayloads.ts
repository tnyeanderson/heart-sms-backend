import { BasePayload, DeviceIdPayload } from './BasePayload.js';

export class removed_auto_reply extends DeviceIdPayload {}

export class added_auto_reply extends BasePayload {
	device_id: number;
	type: string;
	pattern: string;
	response: string;

	constructor(r: any) {
		super();
		this.device_id = Number(r.device_id);
		this.type = String(r.reply_type);
		this.pattern = String(r.pattern);
		this.response = String(r.response);
	}
}

export class updated_auto_reply extends added_auto_reply {}
