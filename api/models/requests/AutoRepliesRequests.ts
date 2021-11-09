import { ItemsProp, Required } from "../../utils/decorators.js";
import { BaseRequest, HasItemsRequest, UpdateDeviceIdRequest } from "./BaseRequests.js";

/**
 * auto_replies/update/:device_id
 */
export class AutoRepliesUpdateRequest extends UpdateDeviceIdRequest {
	// Body
	@Required reply_type: string;
	@Required pattern: string;
	@Required response: string;

	constructor(r: AutoRepliesUpdateRequest) {
		super(r);
		this.reply_type = String(r.reply_type);
		this.pattern = String(r.pattern);
		this.response = String(r.response);
	}
}

/**
 * auto_replies/add
 */
export class AutoRepliesAddItem extends BaseRequest {
	@Required device_id: number;
	@Required reply_type: string;
	@Required pattern: string;
	@Required response: string;

	constructor(r: AutoRepliesAddItem) {
		super();
		this.device_id = Number(r.device_id);
		this.reply_type = String(r.reply_type);
		this.pattern = String(r.pattern);
		this.response = String(r.response);
	}
}

export class AutoRepliesAddRequest extends HasItemsRequest {
	// Body
	@ItemsProp auto_replies: AutoRepliesAddItem[];

	constructor(r: AutoRepliesAddRequest) {
		super(r);
		this.auto_replies = AutoRepliesAddRequest.createItems(r.auto_replies);
	}

	static itemsPropType = AutoRepliesAddItem;
}
