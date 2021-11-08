import streamController from "../../controllers/StreamController.js";
import { OptionalName } from "../../types/OptionalName.js";

export class BasePayload {
	/**
	 * Publishes an MQTT message
	 * Since payload classes are named after their "operation", we use this.constructor.name
	 * @param accountId
	 */
	send(accountId: string) {
		streamController.sendMessage(accountId, this.constructor.name, this)
	}

	/**
	 *
	 * @param name The name of the property
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
}

export class DeviceIdPayload extends BasePayload {
	id: number;

	constructor(r: any) {
		super();
		this.id = Number(r.device_id);
	}
}
