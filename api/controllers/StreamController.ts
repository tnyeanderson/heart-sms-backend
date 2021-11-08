import crypto from 'crypto';
import mqtt, { MqttClient } from 'mqtt';
import { MQTTError, MQTTNotConnectedError } from '../models/errors/Errors.js';
import { BasePayload } from '../models/payloads/BasePayload.js';
import { util } from '../utils/util.js';

class StreamController {
	socket?: MqttClient;
	backendPassword?: string;
	topicPrefix = 'heartsms/';

	init () {
		this.backendPassword = (util.env.devOrTest()) ? 'testpassword' : crypto.randomBytes(64).toString('hex');

		const username = 'heart-sms-backend';

		const protocol = (process.env.HEART_USE_SSL === 'true') ? 'mqtts://' : 'mqtt://';
		const url = (process.env.HEART_MQTT_URL) ? process.env.HEART_MQTT_URL : 'localhost';

		console.log(`Connecting to ${username}: ${this.backendPassword}@${protocol}${url}`);

		this.socket = mqtt.connect(protocol + url, {
			clientId: 'heart-sms-backend',
			username: username,
			password: this.backendPassword
		});

		this.socket.on('connect', this.onConnect);

		this.socket.on('error', this.onError);
	}

	onConnect () {
		console.log("Connected to MQTT broker");
	}

	onError (err: Error) {
		console.log(new MQTTError(err));
	}

	sendMessage (accountId: string, operation: string, content: BasePayload) {
		const message = {
			operation: operation,
			content: content
		};

		if (this.socket) {
			this.socket.publish(this.topicPrefix + accountId, JSON.stringify(message), {
				qos: 2
			});
		} else {
			console.log(new MQTTNotConnectedError);
		}
	}
}

const streamController = new StreamController();

export default streamController;

