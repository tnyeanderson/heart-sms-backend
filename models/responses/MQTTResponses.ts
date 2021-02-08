import { BaseResponse } from "./BaseResponse.js";
import { AuthError } from "./ErrorResponses.js";

export class MQTTAllowResponse extends BaseResponse {
    constructor(
        public Ok: boolean = true
    ) { super() }
}

export class MQTTDenyResponse extends BaseResponse {
    constructor(
        public Ok: boolean = false,
        public Error: String = new AuthError().error
    ) { super() }
}