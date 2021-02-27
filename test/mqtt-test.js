import mqtt, { MqttClient } from 'mqtt';
import * as assert from 'assert';

const username = 'heart-sms-backend';
const password = 'testpassword';
const url = 'mqtt://localhost';

export function checkMsg (accountId, expectedValue) {
    socket.removeAllListeners('message');

    let check = function (topic, message) {
        let msg = JSON.parse(message.toString());

        describe(`check mqtt message for ${expectedValue.operation}`, function () {
            it("topic should be the accountId",function(done){
                topic.should.equal('heartsms/' + accountId);
                done();
            });
    
            it(`message values for ${expectedValue.operation} should match`,function(done){
                assert.deepStrictEqual(msg, expectedValue);
                done();
            });
        })
    }

    socket.once('message', check);
}

console.log(`Connecting to ${username}:${password}@${url}`);

export const socket = mqtt.connect("mqtt://localhost", {username, password});

socket.on('connect', function () {
    console.log('Connected to mqtt socket');

    // Subscribe to root topic
    this.subscribe('#');
});

socket.on('error', function () {
    console.log('Error connecting to mqtt socket');
    throw 'Error connecting to mqtt socket'
});