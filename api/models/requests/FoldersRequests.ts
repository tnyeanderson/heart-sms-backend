import { Expose } from "class-transformer";
import { BaseRequest, HasItemsRequest, UpdateDeviceIdRequest } from "./BaseRequests.js";


/**
 * folders/add
 */
class FoldersAddItem extends BaseRequest {
    public device_id: number;
    public name: string;
    public color: number;
    public color_dark: number;
    public color_light: number;
    public color_accent: number;

    constructor(r: any) {
        super();
        this.device_id = Number(r.device_id);
        this.name = String(r.name);
        this.color = Number(r.color);
        this.color_dark = Number(r.color_dark);
        this.color_light = Number(r.color_light);
        this.color_accent = Number(r.color_accent);
    }


    static required = [
        ...super.required,
        'device_id',
        'name',
        'color',
        'color_dark',
        'color_light',
        'color_accent'
    ]
}

export class FoldersAddRequest extends HasItemsRequest {
    // Body
    folders: FoldersAddItem[];

    constructor(r: any) {
        super(r);
        this.folders = FoldersAddRequest.createItems(r.folders);
    }


    static itemsPropName = 'folders';
    static itemsPropType = FoldersAddItem;
}


/**
 * folders/update/:device_id
 */
export class FoldersUpdateRequest extends UpdateDeviceIdRequest {
    // Body
    public name: string;
    public color: number;
    public color_dark: number;
    public color_light: number;
    public color_accent: number;

    constructor(r: any) {
        super(r);
        this.name = String(r.name);
        this.color = Number(r.color);
        this.color_dark = Number(r.color_dark);
        this.color_light = Number(r.color_light);
        this.color_accent = Number(r.color_accent);
    }


    static required = [
        ...super.required,
        'name',
        'color',
        'color_dark',
        'color_light',
        'color_accent'
    ]
}
