import { AtLeastOne, ItemsProp, Optional, Required } from "../../utils/decorators.js";
import { BaseRequest, HasItemsRequest } from "./BaseRequests.js";


/**
 * blacklists/add
 */
@AtLeastOne
class BlacklistsAddItem extends BaseRequest {
	// Body
	@Required device_id: number;
	@Optional phone_number?: string;
	@Optional phrase?: string;

	constructor(r: BlacklistsAddItem) {
		super();
		this.device_id = Number(r.device_id);
		this.setOptional('phone_number', r, String);
		this.setOptional('phrase', r, String);
	}
}

export class BlacklistsAddRequest extends HasItemsRequest {
	// Body
	@ItemsProp blacklists: BlacklistsAddItem[];

	constructor(r: BlacklistsAddRequest) {
		super(r);
		this.blacklists = BlacklistsAddRequest.createItems(r.blacklists);
	}

	static itemsPropType = BlacklistsAddItem;
}