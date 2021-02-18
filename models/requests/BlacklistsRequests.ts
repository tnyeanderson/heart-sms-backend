import { Expose } from "class-transformer";
import { AccountIdRequest, BaseRequest, HasItemsRequest } from "./BaseRequests.js";
import { Request } from 'express';


/**
 * blacklists/add
 */
class BlacklistsAddItem extends BaseRequest {
    // Body
    @Expose() device_id: number = -1;
    @Expose() phone_number: string = '';
    @Expose() phrase: string = '';

    static optional = ["phone_number", "phrase"];
    static atLeastOne = true;
}

export class BlacklistsAddRequest extends HasItemsRequest {
    // Body
    blacklists: BlacklistsAddItem[] = [new BlacklistsAddItem];

    static itemsPropName = 'blacklists';
}