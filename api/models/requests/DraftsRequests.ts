import { Expose } from "class-transformer";
import { Request } from 'express';
import util from "../../utils/util.js";
import { AccountIdRequest, BaseRequest, HasItemsRequest, UpdateDeviceIdRequest } from "./BaseRequests.js";


/**
 * drafts/:device_conversation_id
 */
export class DraftsGetDraftRequest extends AccountIdRequest {
    // URL params
    public device_conversation_id: number;

    constructor(r: any) {
        super(r);
        this.device_conversation_id = Number(r.device_conversation_id);
    }


    static required = [
        ...super.required,
        'device_conversation_id'
    ]
}



/**
 * drafts/remove/:device_conversation_id
 */
export class DraftsRemoveRequest extends DraftsGetDraftRequest {
    // Query
    public android_device: string;

    constructor(r: any) {
        super(r);
        this.android_device = String(r.android_device);
    }


    static required = [
        ...super.required,
        'android_device'
    ]
}


/**
 * drafts/add
 */
class DraftsAddItem extends BaseRequest {
    public device_id: number;
    public device_conversation_id: number;
    public mime_type: string;
    public data: string;

    constructor(r: any) {
        super();
        this.device_id = Number(r.device_id);
        this.device_conversation_id = Number(r.device_conversation_id);
        this.mime_type = String(r.mime_type);
        this.data = String(r.data);
    }


    static required = [
        ...super.required,
        'device_id',
        'device_conversation_id',
        'mime_type',
        'data'
    ]
}

export class DraftsAddRequest extends HasItemsRequest {
    // Body
    drafts: DraftsAddItem[];

    constructor(r: any) {
        super(r);
        this.drafts = DraftsAddRequest.createItems(r.drafts);
    }

    static itemsPropName = 'drafts';
    static itemsPropType = DraftsAddItem;
}


/**
 * drafts/update/:device_id
 */
export class DraftsUpdateRequest extends UpdateDeviceIdRequest {
    // Body
    public data: string;
    public mime_type?: string;

    constructor(r: any) {
        super(r);
        this.data = String(r.data);
        !util.propMissing(r, 'mime_type') && (this.mime_type = String(r.mime_type));
    }


    static required = [
        ...super.required,
        'data'
    ];

    static optional = ['mime_type'];
}


/**
 * drafts/replace/:device_conversation_id
 */
export class DraftsReplaceRequest extends DraftsAddRequest {
    public device_conversation_id: number;

    constructor(r: any) {
        super(r);
        this.device_conversation_id = Number(r.device_conversation_id);
    }


    static required = [
        ...super.required,
        'device_conversation_id'
    ];
}