import { Expose } from "class-transformer";
import { BaseRequest } from "./BaseRequests.js";


/**
 * mqtt/login
 */
export class MQTTLoginRequest extends BaseRequest {
    // Body
    public username: string;
    public password: string;

    constructor(r: any) {
        super();
        this.username = String(r.username);
        this.password = String(r.password);
    }


    static required = [
        ...super.required,
        'username',
        'password'
    ]
}


/**
 * mqtt/acl
 */
export class MQTTAclRequest extends BaseRequest {
    // Body
    public username: string;
    public topic: string;

    constructor(r: any) {
        super();
        this.username = String(r.username);
        this.topic = String(r.topic);
    }


    static required = [
        ...super.required,
        'username',
        'topic'
    ]
}