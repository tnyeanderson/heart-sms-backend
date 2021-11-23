import db from '../db/query.js';
import { util } from '../utils/util.js';

class TokenCacheItem {
	constructor(
		public account_id: string,
		public push_url: string,
		public push_app_token: string
	) { }
}

class UnifiedPushHelper {
	tokenCache = new Map<string, TokenCacheItem>();

	async getPushConfig(accountId: string) {
		const sql = `SELECT account_id, session_id, push_url, push_app_token FROM UnifiedPush
			INNER JOIN SessionMap USING (account_id)
			WHERE ${db.whereAccount(accountId)} LIMIT 1`;

		const result = await db.query(sql);

		return new TokenCacheItem(result[0].session_id, result[0].push_url, result[0].push_app_token);
	}

	async getMessagePushUrl(accountId: string) {
		let config = this.tokenCache.get(accountId);

		if (!config) {
			config = await this.getPushConfig(accountId);
			// Add it to the cache
			this.tokenCache.set(config.account_id, config);
		}

		return `${this.getPushProtocol()}://${config.push_url}/message?token=${config.push_app_token}`;
	}

	getPushProtocol() {
		return (util.env.devOrTest()) ? 'http' : 'https';
	}
}

const unifiedPushHelper = new UnifiedPushHelper();

export default unifiedPushHelper;
