import { Expose } from "class-transformer";
import util from "../../utils/util.js";
import { BaseRequest, HasItemsRequest } from "./BaseRequests.js";


/**
 * blacklists/add
 */
class BlacklistsAddItem extends BaseRequest {
    // Body
    public device_id: number;
    public phone_number?: string; 
    public phrase?: string;

    constructor(r: any) {
        super();
        this.device_id = Number(r.device_id);
        !util.propMissing(r, 'phone_number') && (this.phone_number = String(r.phone_number));
        !util.propMissing(r, 'phrase') && (this.phrase = String(r.phrase));
    }

    static required = [...super.required, 'device_id'];
    static optional = ["phone_number", "phrase"];
    static atLeastOne = true;
}

export class BlacklistsAddRequest extends HasItemsRequest {
    // Body
    public blacklists: BlacklistsAddItem[];

    constructor(r: any) {
        super(r);
        this.blacklists = BlacklistsAddRequest.createItems(r.blacklists);
    }


    static itemsPropName = 'blacklists';
    static itemsPropType = BlacklistsAddItem;
}