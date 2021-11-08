import { util } from '../../utils/util.js';
import { BasePayload, DeviceIdPayload } from './BasePayload.js';

export class added_blacklist extends BasePayload {
	id: number;
	phone_number: string;
	phrase: string;

	constructor(r: any) {
		super();
		this.id = Number(r.device_id);
		this.phone_number = util.smartToString(r.phone_number);
		this.phrase = util.smartToString(r.phrase);
	}
}

export class removed_blacklist extends DeviceIdPayload {}
