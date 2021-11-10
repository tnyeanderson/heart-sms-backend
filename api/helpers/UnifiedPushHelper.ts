import db from '../db/query.js';

class UnifiedPushHelper {
	async getMessagePushUrl(accountId: string) {
		const sql = `SELECT account_id, session_id, push_url, push_app_token FROM UnifiedPush
			INNER JOIN SessionMap USING (account_id)
			WHERE ${db.whereAccount(accountId)} LIMIT 1`;

		const result = await db.query(sql);

		console.log(JSON.stringify(result));

		return `https://${result[0].push_url}/message?token=${result[0].push_app_token}`
	}
}

const unifiedPushHelper = new UnifiedPushHelper();

export default unifiedPushHelper;
