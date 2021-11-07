import { BaseResponse } from "./BaseResponse.js";
import { AuthError } from "./ErrorResponses.js";

export class MQTTAllowResponse extends BaseResponse {
	Ok?: boolean = true;
}

export class MQTTDenyResponse extends BaseResponse {
	public Ok?: boolean = false;
	public Error?: string = new AuthError().msg.error;
}
