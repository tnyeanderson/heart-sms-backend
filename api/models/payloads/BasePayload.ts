import { QueryResultRow } from "pg";
import streamController from "../../controllers/StreamController.js";
import { OptionalName } from "../../types/OptionalName.js";
import { DraftsAddItem } from "../requests/DraftsRequests.js";
import { MessagesAddItem } from "../requests/MessagesRequests.js";
import { ScheduledMessagesAddItem } from "../requests/ScheduledMessagesRequests.js";

export class BasePayload {
	/**
	 * Publishes a push message
	 * Since payload classes are named after their "operation", we use this.constructor.name
	 * @param accountId
	 */
	async send(accountId: string) {
		await streamController.sendMessage(accountId, this.constructor.name, this)
	}

	/**
	 * Sets the property on `this` only if it is not empty
	 * @param name The name of the property, or {source: string, target: string}
	 * @param sourceObj The object to get the property from
	 * @param Cast The function used to cast the value to the proper type
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	setProp(name: OptionalName | string, sourceObj: any, Cast: (arg: unknown) => boolean | string | number) {
		if (typeof name === 'string') {
			name = {target: name, source: name}
		}

		if (sourceObj && sourceObj[name.source] !== undefined && sourceObj[name.source] !== null) {
			// @ts-expect-error TS7053
			this[name.target] = Cast(sourceObj[name.source])
		}
	}

	/**
	 * Sets the property on `this`, or sets it to null if it is empty
	 * @param name The name of the property, or {source: string, target: string}
	 * @param sourceObj The object to get the property from
	 * @param Cast The function used to cast the value to the proper type
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	setPropOrNull(name: OptionalName | string, sourceObj: any, Cast: (arg: unknown) => boolean | string | number) {
		if (typeof name === 'string') {
			name = {target: name, source: name}
		}

		if (sourceObj && sourceObj[name.source] !== undefined && sourceObj[name.source] !== null) {
			// @ts-expect-error TS7053
			this[name.target] = Cast(sourceObj[name.source])
		} else {
			// @ts-expect-error TS7053
			this[name.target] = null;
		}
	}
}

export class DeviceIdPayload extends BasePayload {
	id: number;

	constructor(r: DraftsAddItem | MessagesAddItem | ScheduledMessagesAddItem | QueryResultRow) {
		super();
		this.id = Number(r.device_id);
	}
}
