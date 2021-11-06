import { Required } from "../../utils/decorators.js";
import { BaseRequest } from "./BaseRequests.js";


/**
 * mqtt/login
 */
export class MQTTLoginRequest extends BaseRequest {
	// Body
	@Required username: string;
	@Required password: string;

	constructor(r: MQTTLoginRequest) {
		super();
		this.username = String(r.username);
		this.password = String(r.password);
	}
}


/**
 * mqtt/acl
 */
export class MQTTAclRequest extends BaseRequest {
	// Body
	@Required username: string;
	@Required topic: string;

	constructor(r: MQTTAclRequest) {
		super();
		this.username = String(r.username);
		this.topic = String(r.topic);
	}
}