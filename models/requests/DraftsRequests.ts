import { Expose } from "class-transformer";
import { AccountIdRequest, BaseRequest, DeviceIdRequest, HasItemsRequest, UpdateDeviceIdRequest, UpdateRequest } from "./BaseRequests.js";
import { Request } from 'express';


/**
 * drafts/:device_conversation_id
 */
export class DraftsGetDraftRequest extends AccountIdRequest {
    // URL params
    @Expose() device_conversation_id: number = -1;
}



/**
 * drafts/remove/:device_conversation_id
 */
export class DraftsRemoveRequest extends DraftsGetDraftRequest {
    // Query
    @Expose() android_device: string = '';
}


/**
 * drafts/add
 */
class DraftsAddItem extends BaseRequest {
    @Expose() device_id: number = -1;
    @Expose() device_conversation_id: number = -1;
    @Expose() mime_type: string = '';
    @Expose() data: string = '';
}

export class DraftsAddRequest extends HasItemsRequest {
    // Body
    drafts: DraftsAddItem[] = [new DraftsAddItem];

    static itemsPropName = 'drafts';
}


/**
 * drafts/update/:device_id
 */
export class DraftsUpdateRequest extends UpdateDeviceIdRequest {
    // Body
    @Expose() data: string = '';
    @Expose() mime_type: string = '';

    static optional = ['mime_type'];
}


/**
 * drafts/replace/:device_conversation_id
 */
export class DraftsReplaceRequest extends DraftsAddRequest {
    @Expose() device_conversation_id: number = -1

    static create (req: Request) {
        // Create the base request with all items
        let out = this.createWithItems(req);
        // Set the device_conversation_id
        out.device_conversation_id = Number(req.params.device_conversation_id);
        return out;
    }
}