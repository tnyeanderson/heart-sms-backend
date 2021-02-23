import { Expose } from "class-transformer";
import { Request } from 'express';
import { MissingParamError } from "../responses/ErrorResponses.js";
import { AccountIdRequest, BaseRequest, UpdateRequest } from "./BaseRequests.js";


/**
 * devices/add
 */
class DevicesAddItem extends BaseRequest {
    @Expose() id: number = -1;
    @Expose() info: string = '';
    @Expose() name: string = '';
    @Expose() primary: boolean = false;
    @Expose() fcm_token: string = '';
}

export class DevicesAddRequest extends AccountIdRequest {
    // Body
    device: DevicesAddItem = new DevicesAddItem;

    /**
     * devices/add is a special case, in that it is essentially a HasItemsRequest.
     * However, it only has one item and it is not wrapped in an array (device: {}).
     * Therefore, this is custom validation function for this endpoint
     * @param req 
     */
    static validate (req: Request) {
        let props = Object.getOwnPropertyNames(new DevicesAddItem);
        let toValidate = Object.assign(req.query, req.body, req.params)

        if (toValidate.account_id === undefined || toValidate.account_id === '')
            // Account
            return new MissingParamError('account_id');
        
        if (toValidate.device === undefined || toValidate.device === [])
            return new MissingParamError('device');

        for (let i=0, len=props.length; i<len; i++) {
            console.log("Checking ", props[i], toValidate.device[props[i]]);
            if (toValidate.device[props[i]] === undefined || toValidate.device[props[i]] === '') {
                return new MissingParamError(props[i]);
            }
        }
        
        // Validated
        return true;
    }

    static create (req: Request) {
        let out = new this;

        // This is always set because validate is called before create
        out.account_id = req.body.account_id;
        
        out.device = DevicesAddItem.createItem(req.body.device) as DevicesAddItem;

        return out;
    }
}


/**
 * devices/remove/:id
 */
export class DevicesRemoveRequest extends AccountIdRequest {
    // URL params
    @Expose() id: number = -1;
}


/**
 * devices/update/:id
 */
export class DevicesUpdateRequest extends UpdateRequest {
    // URL params
    @Expose() id: number = -1;

    // Query
    @Expose() fcm_token: string = '';
    @Expose() name: string = '';

    static optional = ['fcm_token', 'name'];
    static atLeastOne = true;
}



/**
 * devices/update_primary
 */
export class DevicesUpdatePrimaryRequest extends AccountIdRequest {
    // Query
    @Expose() new_primary_device_id: string = '';
}