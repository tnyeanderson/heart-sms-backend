import { BasePayload } from "./BasePayload"

export class added_folder extends BasePayload {
    constructor (
        public device_id: Number,
        public name: String,
        public color: Number,
        public color_dark: Number,
        public color_light: Number,
        public color_accent: Number
    ) { super() }
}


export class removed_folder extends BasePayload {
    constructor (
        public id: Number
    ) { super() }
}


export class updated_folder extends added_folder { }
