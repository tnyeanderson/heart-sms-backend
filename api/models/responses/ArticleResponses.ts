import { BaseResponse } from "./BaseResponse.js";

export class ArticleResponse extends BaseResponse {
	title?: string;
	description?: string;
	image_url?: string;
	domain?: string;
	web_url?: string;

	constructor(r: ArticleResponse) {
		super();
		this.setProp('title', r, String);
		this.setProp({target: 'description', source: 'excerpt'}, r, String);
		this.setProp({target: 'image_url', source: 'lead_image_url'}, r, String);
		this.setProp('domain', r, String);
		this.setProp({target: 'web_url', source: 'url'}, r, String);
	}
}