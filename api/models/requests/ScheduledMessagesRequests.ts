import { AtLeastOne, ItemsProp, Optional, Required } from "../../utils/decorators.js";
import { BaseRequest, HasItemsRequest, UpdateDeviceIdRequest } from "./BaseRequests.js";

/**
 * scheduled_messages/add
 */
export class ScheduledMessagesAddItem extends BaseRequest {
	@Required device_id: number;
	@Required to: string;
	@Required data: string;
	@Required mime_type: string;
	@Required timestamp: number;
	@Required title: string;
	@Required repeat: number;

	constructor(r: ScheduledMessagesAddItem) {
		super();
		this.device_id = Number(r.device_id);
		this.to = String(r.to);
		this.data = String(r.data);
		this.mime_type = String(r.mime_type);
		this.timestamp = Number(r.timestamp);
		this.title = String(r.title);
		this.repeat = Number(r.repeat);
	}
}

export class ScheduledMessagesAddRequest extends HasItemsRequest {
	// Body
	@ItemsProp scheduled_messages: ScheduledMessagesAddItem[];

	constructor(r: ScheduledMessagesAddRequest) {
		super(r);
		this.scheduled_messages = ScheduledMessagesAddRequest.createItems(r.scheduled_messages);
	}

	static itemsPropType = ScheduledMessagesAddItem;
}

/**
 * scheduled_messages/update/:device_id
 */
@AtLeastOne
export class ScheduledMessagesUpdateRequest extends UpdateDeviceIdRequest {
	@Optional to?: string;
	@Optional data?: string;
	@Optional mime_type?: string;
	@Optional timestamp?: number;
	@Optional title?: string;
	@Optional repeat?: number;

	constructor(r: ScheduledMessagesUpdateRequest) {
		super(r);
		this.setOptional('to', r, String);
		this.setOptional('data', r, String);
		this.setOptional('mime_type', r, String);
		this.setOptional('timestamp', r, Number);
		this.setOptional('title', r, String);
		this.setOptional('repeat', r, Number);
	}
}
