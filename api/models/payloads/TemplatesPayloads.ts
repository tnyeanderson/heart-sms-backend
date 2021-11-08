import { BasePayload, DeviceIdPayload } from './BasePayload.js';

export class removed_template extends DeviceIdPayload { }

export class added_template extends BasePayload {
	device_id: number;
	text: string;

	constructor(r: any) {
		super();
		this.device_id = Number(r.device_id);
		this.text = String(r.text);
	}
}

export class updated_template extends added_template { }
