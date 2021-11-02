import { Expose } from "class-transformer";
import { BaseRequest } from "./BaseRequests.js";

/**
 * article
 */
export class ArticleRequest extends BaseRequest {
    public url: string

    constructor(r: any) {
        super()
        this.url = String(r.url);
    }

    static required = [
        ...super.required,
        'url'
    ]
}