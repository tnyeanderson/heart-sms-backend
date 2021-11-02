import { Expose } from "class-transformer";
import { Request } from 'express';
import util from "../../utils/util.js";
import { MissingParamError } from "../responses/ErrorResponses.js";
import { AccountIdRequest, BaseRequest, UpdateRequest } from "./BaseRequests.js";


/**
 * devices/add
 */
class DevicesAddItem extends BaseRequest {
    public id: number;
    public info: string;
    public name: string;
    public primary: boolean;
    public fcm_token: string;

    constructor(r: any) {
        super();
        this.id = Number(r.id);
        this.info = String(r.info);
        this.name = String(r.name);
        this.primary = Boolean(r.primary);
        this.fcm_token = String(r.fcm_token);
    }


    static required = [
        ...super.required,
        'id',
        'info',
        'name',
        'primary',
        'fcm_token'
    ]
}

export class DevicesAddRequest extends AccountIdRequest {
    // Body
    public device: DevicesAddItem;

    constructor(r: any) {
        super(r);
        this.device = new DevicesAddItem(r.device);
    }

    /**
     * devices/add is a special case, in that it is essentially a HasItemsRequest.
     * However, it only has one item and it is not wrapped in an array (device: {}).
     * Therefore, there is a custom validation function for this endpoint
     * TODO: This is dumb
     * @param req 
     */
    static validate(req: Request) {
        let prop = 'device';
        let items = req.body[prop];

        if (!items || items === []) {
            return new MissingParamError(prop);
        } 

        items.forEach((item: any) => DevicesAddItem.validate(item));

        // Items are valid
        // Perform request schema validation
        return super.validate(req);
    }
}


/**
 * devices/remove/:id
 */
export class DevicesRemoveRequest extends AccountIdRequest {
    // URL params
    public id: number;

    constructor(r: any) {
        super(r);
        this.id = Number(r.id);
    }


    static required = [...super.required, 'id'];
}


/**
 * devices/update/:id
 */
export class DevicesUpdateRequest extends UpdateRequest {
    // URL params
    public id: number;

    // Query
    public fcm_token?: string;
    public name?: string;

    constructor(r: any) {
        super(r);
        this.id = Number(r.id);
        !util.propMissing(r, 'fcm_token') && (this.fcm_token = String(r.fcm_token));
        !util.propMissing(r, 'name') && (this.name = String(r.name));
    }


    static required = [...super.required, 'id'];
    static optional = ['fcm_token', 'name'];
    static atLeastOne = true;

    toUpdate() {
        let {account_id, id, ...out} = this;
        out = Object.assign({ device_id: id }, out);
        return out;
    }
}



/**
 * devices/update_primary
 */
export class DevicesUpdatePrimaryRequest extends AccountIdRequest {
    // Query
    public new_primary_device_id: string;

    constructor(r: any) {
        super(r);
        this.new_primary_device_id = String(r.new_primary_device_id);
    }


    static required = [...super.required, 'new_primary_device_id'];
}