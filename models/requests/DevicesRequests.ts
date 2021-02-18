import { Expose } from "class-transformer";
import { AccountIdRequest, BaseRequest, DeviceIdRequest, UpdateDeviceIdRequest, UpdateRequest } from "./BaseRequests.js";
import { Request } from 'express';


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