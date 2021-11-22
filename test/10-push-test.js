import WebSocket from 'ws';
import * as assert from 'assert';
import axios from 'axios';

/**
 * Stores the socket connection
 */
let socket;

/**
 * The url used to contact the Gotify server from within the tests
 */
export const pushUrl = 'push.heart.lan';

/**
 * The url used in API requests to contact the Gotify server from inside the docker container
 */
export const internalPushUrl = 'heart-sms-push:80';


// Define a user for the dummy account
const dummyAccount = {
	admin: false,
	name: 'dummy',
	pass: 'thedummyaccount'
}


// Define a user for the actual test account
const testAccount = {
	admin: false,
	name: 'test',
	pass: 'thetestaccount'
}

// Start by deleting old dummy/test accounts just in case
await cleanAllFromGotify();

// Create the dummy and test accounts
const dummyAccountCreate = await axios.post(`https://${pushUrl}/user`, dummyAccount);
const testAccountCreate = await axios.post(`https://${pushUrl}/user`, testAccount);

// Create Gotify Clients for the dummy and test accounts
export const dummyClient = await axios.post(`https://${pushUrl}/client`, {name: 'dummy-client'}, {
	auth: {
		username: dummyAccount.name,
		password: dummyAccount.pass
	}
});

export const testClient = await axios.post(`https://${pushUrl}/client`, {name: 'test-client'}, {
	auth: {
		username: testAccount.name,
		password: testAccount.pass
	}
});


// In the end, we only actually test responses from the test account. Go figure
const pushStreamUrl = `wss://${pushUrl}/stream?token=${testClient.data.token}`;

export var msgCount = 0;
export var msgTested = 0;


export async function cleanAllFromGotify() {
	const config = {
		auth: {
			username: 'admin',
			password: 'onlyfortesting'
		}
	}
	console.log('DELETING TEST GOTIFY ACCOUNTS')
	const userList = await axios.get(`https://${pushUrl}/user`, config);

	const dummyFound = userList.data.find(u => u.name === dummyAccount.name);
	const testFound = userList.data.find(u => u.name === testAccount.name);

	if (dummyFound) {
		console.log(`deleting dummy account`)
		await axios.delete(`https://${pushUrl}/user/${dummyFound.id}`, config);
	}

	if (testFound) {
		console.log(`deleting test account`)
		await axios.delete(`https://${pushUrl}/user/${testFound.id}`, config);
	}
}


/**
 * Define an push message to expect
 * @param {*} topic_suffix the user's account id
 * @param {*} expectedValue expected message object (operation + content)
 * @param {*} callback function to run when the expected message is received. Used for chaining expectations
 */
export function expectMsg (topic_suffix, expectedValue, callback) {
	let check = function (message) {
		// Parse the message from the buffer
		let msg = JSON.parse(message.toString());

		// Actual message data is stored in extras
		let data = msg.extras['heartsms::realtime'];

		// Run tests for topic and message value
		describe(`check push message for ${expectedValue.operation}`, function () {
			it(`message values for ${expectedValue.operation} should match`,function(done){
				assert.deepStrictEqual(data, expectedValue);
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
	return function (message) {
		msgCount++;
		callback(message);
	}
}

/**
 * Can be attached as a listener to throw an error if an unexpected message is received
 */
function expectNoMessages(message) {
	describe('unexpected push message', function () {
		it('push message should not be sent', function (done) {
			console.log("shouldn't have sent");
			JSON.parse(message.toString()).should.equal(null);
			assert.ok(false);
			done();
		})
	})
}

export function init(callback) {
	console.log(`Connecting to ${pushStreamUrl}`);

	// Connect to and export socket
	socket = new WebSocket(pushStreamUrl, {
		perMessageDeflate: false
	});

	// On successful connection
	socket.on('open', function () {
		console.log('Connected to push socket');
		callback(true);
	});

	// On connection error
	socket.on('error', function () {
		console.log('Error connecting to push socket');
		throw 'Error connecting to push socket'
	});

	// Expect no messages until we've defined our first expected message
	socket.on('message', expectNoMessages);
}

export function close(callback) {
	socket.close();
	callback(true);
}