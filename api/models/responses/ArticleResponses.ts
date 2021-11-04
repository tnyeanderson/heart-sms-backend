import { BaseResponse } from "./BaseResponse.js";

export class ArticleResponse extends BaseResponse {
    title?: string;
    description?: string;
    image_url?: string;
    domain?: string;
    web_url?: string;

    constructor(r: any) {
        super();
        this.setOptional('title', r, String);
        this.setOptional('description', r, String);
        this.setOptional('image_url', r, String);
        this.setOptional('domain', r, String);
        this.setOptional('web_url', r, String);
    }
}