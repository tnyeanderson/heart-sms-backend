import { Expose } from "class-transformer";
import { BaseRequest } from "./BaseRequests.js";


/**
 * mqtt/login
 */
export class MQTTLoginRequest extends BaseRequest {
    // Body
    @Expose() username: string = '';
    @Expose() password: string = '';
}


/**
 * mqtt/acl
 */
export class MQTTAclRequest extends BaseRequest {
    // Body
    @Expose() username: string = '';
    @Expose() topic: string = '';
}