import { BasePayload } from "./BasePayload";

export class update_primary_device extends BasePayload {
    constructor (
        public new_primary_device_id: String
    ) { super() }
}