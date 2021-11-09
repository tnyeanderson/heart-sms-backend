import { util } from '../../utils/util.js';
import { BlacklistsAddItem } from '../requests/BlacklistsRequests.js';
import { BasePayload, DeviceIdPayload } from './BasePayload.js';

export class added_blacklist extends BasePayload {
	id: number;
	phone_number: string;
	phrase: string;

	constructor(r: BlacklistsAddItem) {
		super();
		this.id = Number(r.device_id);
		this.phone_number = util.smartToString(r.phone_number);
		this.phrase = util.smartToString(r.phrase);
	}
}

export class removed_blacklist extends DeviceIdPayload {}
