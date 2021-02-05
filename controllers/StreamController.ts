import mqtt, { MqttClient, OnErrorCallback } from 'mqtt';
import util from '../utils/util';
import crypto from 'crypto';
import { BasePayload } from '../models/payloads/BasePayload';

class StreamController {
    socket?: MqttClient;
    backendPassword?: string;
    topicPrefix = 'heartsms/';

    init () {
        this.backendPassword = (util.env.devOrTest()) ? 'testpassword' : crypto.randomBytes(64).toString('hex');

        let username = 'heart-sms-backend';

        let protocol = (process.env.HEART_USE_SSL === 'true') ? 'mqtts://' : 'mqtt://';
        let url = (process.env.HEART_MQTT_URL) ? process.env.HEART_MQTT_URL : 'localhost';

        console.log("Connecting to " + username + ":" + this.backendPassword + "@" + protocol + url);

        this.socket = mqtt.connect(protocol + url, {
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
        console.log("MQTT error: ", err);
    }
    
    sendMessage (accountId: string, operation: string, content: BasePayload) {
        let message = {
            operation: operation,
            content: content
        };
        
        if (this.socket) {
            this.socket.publish(this.topicPrefix + accountId, JSON.stringify(message), {
                qos: 2
            });
        } else {
            console.log("Not connected to MQTT, can't send message.");
        }
    }
}

export = new StreamController();

 
