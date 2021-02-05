import { BasePayload } from './BasePayload.js';

export class update_primary_device extends BasePayload {
    constructor (
        public new_primary_device_id: String
    ) { super() }
}