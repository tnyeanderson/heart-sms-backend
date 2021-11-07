import { Request } from 'express';
import { AtLeastOne, Optional, Required } from '../../utils/decorators.js';
import { MissingParamError } from "../responses/ErrorResponses.js";
import { AccountIdRequest, BaseRequest, UpdateRequest } from "./BaseRequests.js";

/**
 * devices/add
 */
class DevicesAddItem extends BaseRequest {
	@Required id: number;
	@Required info: string;
	@Required name: string;
	@Required primary: boolean;
	@Required fcm_token: string;

	constructor(r: DevicesAddItem) {
		super();
		this.id = Number(r.id);
		this.info = String(r.info);
		this.name = String(r.name);
		this.primary = Boolean(r.primary);
		this.fcm_token = String(r.fcm_token);
	}
}

export class DevicesAddRequest extends AccountIdRequest {
	// Body
	device: DevicesAddItem;

	constructor(r: DevicesAddRequest) {
		super(r);
		this.device = new DevicesAddItem(r.device);
	}

	/**
	 * devices/add is a special case, in that it is essentially a HasItemsRequest.
	 * However, it only has one item and it is not wrapped in an array (device: {}).
	 * Therefore, there is a custom validation function for this endpoint
	 * TODO: This is dumb
	 * @param req
	 */
	static validate(req: Request) {
		const prop = 'device';
		const item = req.body[prop];

		if (!item || item === {}) {
			throw new MissingParamError(prop);
		}

		DevicesAddItem.validate(item);

		// Items are valid
		// Perform request schema validation
		return super.validate(req);
	}
}

/**
 * devices/remove/:id
 */
export class DevicesRemoveRequest extends AccountIdRequest {
	// URL params
	@Required id: number;

	constructor(r: DevicesRemoveRequest) {
		super(r);
		this.id = Number(r.id);
	}
}

/**
 * devices/update/:id
 */
@AtLeastOne
export class DevicesUpdateRequest extends UpdateRequest {
	// URL params
	@Required id: number;

	// Query
	@Optional fcm_token?: string;
	@Optional name?: string;

	constructor(r: DevicesUpdateRequest) {
		super(r);
		this.id = Number(r.id);
		this.setOptional('fcm_token', r, String);
		this.setOptional('name', r, String);
	}

	toUpdate() {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const {account_id, id, ...out} = this;
		return Object.assign({ device_id: id }, out);
	}
}

/**
 * devices/update_primary
 */
export class DevicesUpdatePrimaryRequest extends AccountIdRequest {
	// Query
	@Required new_primary_device_id: string;

	constructor(r: DevicesUpdatePrimaryRequest) {
		super(r);
		this.new_primary_device_id = String(r.new_primary_device_id);
	}
}
