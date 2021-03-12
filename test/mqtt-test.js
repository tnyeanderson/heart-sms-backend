import mqtt from 'mqtt';
import * as assert from 'assert';

/**
 * Stores the socket connection
 */
let socket;

const clientId = 'heart-sms-backend-test'
const username = 'heart-sms-backend';
const password = 'testpassword';
const url = 'mqtt://localhost';

export var msgCount = 0;
export var msgTested = 0;

/**
 * Define an mqtt message to expect
 * @param {*} topic_suffix the user's account id
 * @param {*} expectedValue expected message object (operation + content)
 * @param {*} callback function to run when the expected message is received. Used for chaining expectations
 */
export function expectMsg (topic_suffix, expectedValue, callback) {
    let check = function (topic, message) {
        // Parse the message from the buffer
        let msg = JSON.parse(message.toString());

        // Run tests for topic and message value
        describe(`check mqtt message for ${expectedValue.operation}`, function () {
            it("topic should be the accountId",function(done){
                topic.should.equal('heartsms/' + topic_suffix);
                done();
            });
    
            it(`message values for ${expectedValue.operation} should match`,function(done){
                assert.deepStrictEqual(msg, expectedValue);
                done();
            });
        });

        msgTested++;

        // If a callback is not set, then set a listener to expect no messages
        callback = callback || function () { listen(expectNoMessages) };
        callback();
    }

    once(check);
}

/**
 * Attach a listener function to the 'message' event.
 * Will run every time a message is received.
 * Removes all listeners first.
 * @param {*} listener 
 */
function listen (listener) {
    socket.removeAllListeners('message');
    socket.on('message', incrementMsgCount(listener))
}

/**
 * Attach a listener function to the 'message' event.
 * Will only run the first time a message is received.
 * Removes all listeners first.
 * @param {*} listener 
 */
function once (listener) {
    socket.removeAllListeners('message');
    socket.once('message', incrementMsgCount(listener));
}

function incrementMsgCount(callback) {
    return function (topic, message) {
        msgCount++;
        callback(topic, message);
    }
}

/**
 * Can be attached as a listener to throw an error if an unexpected message is received
 */
function expectNoMessages(topic, message) {
    describe('unexpected mqtt message', function () {
        it('mqtt message should not be sent', function (done) {
            console.log("shouldn't have sent");
            JSON.parse(message.toString()).should.equal(null);
            assert.ok(false);
            done();
        })
    })
}

export function init(callback) {
    console.log(`Connecting to ${username}:${password}@${url}`);

    // Connect to and export socket
    socket = mqtt.connect("mqtt://localhost", {username, password, clientId});

    // On successful connection
    socket.on('connect', function () {
        console.log('Connected to mqtt socket');
        // Subscribe to root topic
        this.subscribe('#');
        callback(true);
    });

    // On connection error
    socket.on('error', function () {
        console.log('Error connecting to mqtt socket');
        throw 'Error connecting to mqtt socket'
    });

    // Expect no messages until we've defined our first expected message
    socket.on('message', expectNoMessages);
}

export function close(callback) {
    socket.end();
    callback(true);
}