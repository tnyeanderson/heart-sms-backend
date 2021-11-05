import { ItemsProp, Optional, Required } from "../../utils/decorators.js";
import { AccountIdRequest, BaseRequest, HasItemsRequest, UpdateDeviceIdRequest } from "./BaseRequests.js";


/**
 * drafts/:device_conversation_id
 */
export class DraftsGetDraftRequest extends AccountIdRequest {
    // URL params
    @Required device_conversation_id: number;

    constructor(r: DraftsGetDraftRequest) {
        super(r);
        this.device_conversation_id = Number(r.device_conversation_id);
    }
}



/**
 * drafts/remove/:device_conversation_id
 */
export class DraftsRemoveRequest extends DraftsGetDraftRequest {
    // Query
    @Required android_device: string;

    constructor(r: DraftsRemoveRequest) {
        super(r);
        this.android_device = String(r.android_device);
    }
}


/**
 * drafts/add
 */
class DraftsAddItem extends BaseRequest {
    @Required device_id: number;
    @Required device_conversation_id: number;
    @Required mime_type: string;
    @Required data: string;

    constructor(r: DraftsAddItem) {
        super();
        this.device_id = Number(r.device_id);
        this.device_conversation_id = Number(r.device_conversation_id);
        this.mime_type = String(r.mime_type);
        this.data = String(r.data);
    }
}

export class DraftsAddRequest extends HasItemsRequest {
    // Body
    @ItemsProp drafts: DraftsAddItem[];

    constructor(r: DraftsAddRequest) {
        super(r);
        this.drafts = DraftsAddRequest.createItems(r.drafts);
    }

    static itemsPropType = DraftsAddItem;
}


/**
 * drafts/update/:device_id
 */
export class DraftsUpdateRequest extends UpdateDeviceIdRequest {
    // Body
    @Required data: string;
    @Optional mime_type?: string;

    constructor(r: DraftsUpdateRequest) {
        super(r);
        this.data = String(r.data);
        this.setOptional('mime_type', r, String);
    }
}


/**
 * drafts/replace/:device_conversation_id
 */
export class DraftsReplaceRequest extends DraftsAddRequest {
    @Required device_conversation_id: number;

    constructor(r: DraftsReplaceRequest) {
        super(r);
        this.device_conversation_id = Number(r.device_conversation_id);
    }
}