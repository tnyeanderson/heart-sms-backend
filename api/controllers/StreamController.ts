import axios from 'axios';
import unifiedPushHelper from '../helpers/UnifiedPushHelper.js';
import { BasePayload } from '../models/payloads/BasePayload.js';

class StreamController {

	prettyPrintOperation(operation: string) {
		return operation.split('_').map(word => word.charAt(0).toUpperCase() + word.substring(1)).join(' ');
	}

	async sendMessage (accountId: string, operation: string, content: BasePayload) {
		const gotifyUrl = await unifiedPushHelper.getMessagePushUrl(accountId);

		const message = {
			operation: operation,
			content: content
		};

		const body = {
			extras: {
				"heartsms::realtime": message
			},
			message: this.prettyPrintOperation(operation)
		}

		try {
			await axios.post(gotifyUrl, body);
		}
		catch (error) {
			console.log(error);
		}
	}
}

const streamController = new StreamController();

export default streamController;

