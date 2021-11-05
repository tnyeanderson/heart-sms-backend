import streamController from "../../controllers/StreamController.js";


export class BasePayload {
	/**
     * Publishes an MQTT message
     * Since payload classes are named after their "operation", we use this.constructor.name
     * @param accountId
     */
	send(accountId: string) {
		streamController.sendMessage(accountId, this.constructor.name, this)
	}
}