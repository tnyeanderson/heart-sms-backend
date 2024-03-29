import { DevicesUpdatePrimaryRequest } from '../requests/DevicesRequests.js';
import { BasePayload } from './BasePayload.js';

export class update_primary_device extends BasePayload {
	new_primary_device_id: string;

	constructor (r: DevicesUpdatePrimaryRequest) {
		super();
		this.new_primary_device_id = String(r.new_primary_device_id);
	}
}
