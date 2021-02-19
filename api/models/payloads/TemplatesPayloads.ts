import { BasePayload } from './BasePayload.js';

export class removed_template extends BasePayload {
    constructor (
        public id: number
    ) { super() }
}


export class added_template extends BasePayload {
    constructor (
        public device_id: number,
        public text: string
    ) { super() }
}


export class updated_template extends added_template { }