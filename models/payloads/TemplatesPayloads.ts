import { BasePayload } from "./BasePayload"

export class removed_template extends BasePayload {
    constructor (
        public id: Number
    ) { super() }
}


export class added_template extends BasePayload {
    constructor (
        public device_id: Number,
        public text: String
    ) { super() }
}


export class updated_template extends added_template { }