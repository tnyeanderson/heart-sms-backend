import { agent } from 'supertest';
import * as assert from 'assert';
import { expectMsg, msgCount, msgTested, close as mqttTestClose } from './mqtt-test.js';
import { deleteDummyAccount, postDeleteDummyCounts, deleteUnifiedPushApp } from './add_dummy_account.js';

// This agent refers to PORT where program is runninng.
const api = agent("http://localhost:5000/api/v1");

const pushUrl = 'gotify1.unifiedpush.org';
const pushClientToken = process.env.PUSH_CLIENT_TOKEN;

let accountId = '';
let contactsToRemove = [];

let testAccountUsername = 'test@email.com'

// Password is 'tester', this is the SHA256 hash
// The password is hashed on the client and again on the server to maintain perfect secrecy
let testAccountPassword = '9bba5c53a0545e0c80184b946153c9f58387e3bd1d4ee35740f29ac2e718b019'


function delay(msg = 'should delay', interval = 3000) {
	return it(`should delay ${interval/1000}s`, done => 
	{
		console.log(msg);
		setTimeout(() => {
			done();
		}, interval)

	}).timeout(interval + 100) // The extra 100ms should guarantee the test will not fail due to exceeded timeout
}

// UNIT test begin

describe("heart-sms-backend unit test", function () {

	beforeEach(function (done) {
		let delay = 50;

		// Wait between api requests so mqtt testing works
		setTimeout(() => {
			done();
		}, delay)
	})

	it("Create new user", function (done) {
		api
		.post('/accounts/signup')
		.send({
			"name": testAccountUsername,
			// Password is 'tester', this is the SHA256 hash
			"password": testAccountPassword,
			"phone_number": "5555555555",
			"real_name": "testname",
			"push_url": pushUrl,
			"push_client_token": pushClientToken
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			res.body.should.have.property('account_id');
			res.body.should.have.property('salt1');
			res.body.should.have.property('salt2');
			done();
		});
	});

	it(`Fail to create user that is not in HEART_ALLOWED_USERS`, function (done) {
		api
		.post('/accounts/signup')
		.send({
			"name": "usernamenotallowed",
			"password": "shouldfail",
			"phone_number": "shouldfail",
			"real_name": "shouldfail",
			"push_url": pushUrl,
			"push_client_token": pushClientToken
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(401);
			assert.deepStrictEqual(res.body, {
				error: 'username is not allowed'
			});
			done();
		});
	});

	it("Fail to create duplicate user", function (done) {
		api
		.post('/accounts/signup')
		.send({
			"name": testAccountUsername,
			// Password is 'tester', this is the SHA256 hash
			"password": testAccountPassword,
			"phone_number": "5555555555",
			"real_name": "testname",
			"push_url": pushUrl,
			"push_client_token": pushClientToken
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(400);
			assert.deepStrictEqual(res.body, {
				error: 'user already exists'
			});
			done();
		});
	});
	
	it("Log in", function (done) {
		let body = {
			"username": testAccountUsername,
			"password": testAccountPassword
		}

		api
		.post('/accounts/login')
		.send(body)
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			res.body.should.have.property('subscription_expiration');
			res.body.account_id.length.should.equal(64);
			res.body.salt1.length.should.equal(128);
			res.body.salt2.length.should.equal(128);
			accountId = res.body.account_id;
			assert.deepStrictEqual(res.body, {
				"account_id": accountId,
				"salt1": res.body.salt1,
				"salt2": res.body.salt2,
				"phone_number": "5555555555",
				"name": "testname",
				"subscription_type": 3,
				"subscription_expiration": res.body.subscription_expiration,
				"base_theme": "light",
				"rounder_bubbles": false,
				"global_color_theme": "default",
				"color": -1352590,
				"color_dark": -4311478,
				"color_light": -1,
				"color_accent": -10011977,
				"use_global_theme": false,
				"apply_primary_color_toolbar": true,
				"passcode": null,
				"message_timestamp": false,
				"conversation_categories": true,
				"push_url": pushUrl,
				"push_client_token": pushClientToken
			  });
			console.log('\n', "Account ID: ", res.body.account_id, '\n');
			done();
		});
	});

	it("Fail log in (bad username)", function (done) {
		api
		.post('/accounts/login')
		.send({
			"username": "bad",
			"password": testAccountPassword
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(401);
			assert.deepStrictEqual(res.body, {
				error: 'username or password incorrect'
			});
			done();
		});
	});

	it("Fail log in (bad password)", function (done) {
		api
		.post('/accounts/login')
		.send({
			"username": testAccountUsername,
			"password": "bad"
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(401);
			assert.deepStrictEqual(res.body, {
				error: 'username or password incorrect'
			});
			done();
		});
	});
	
	it("MQTT log in", function (done) {
		api
		.post('/mqtt/login')
		.send({
			"username": testAccountUsername,
			"password": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {
				Ok: true
			});
			done();
		});
	});

	it("MQTT fail log in (bad username)", function (done) {
		api
		.post('/mqtt/login')
		.send({
			"username": "bad",
			"password": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(401);
			assert.deepStrictEqual(res.body, {
				Ok: false,
				Error: 'username or password incorrect'
			});
			done();
		});
	});

	it("MQTT fail log in (bad password)", function (done) {
		api
		.post('/mqtt/login')
		.send({
			"username": testAccountUsername,
			"password": "bad"
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(401);
			assert.deepStrictEqual(res.body, {
				Ok: false,
				Error: 'username or password incorrect'
			});
			done();
		});
	});

	it("MQTT acl", function (done) {
		api
		.post('/mqtt/acl')
		.send({
			"username": testAccountUsername,
			"topic": 'heartsms/' + accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {
				Ok: true
			});
			done();
		});
	});

	it("MQTT fail acl (bad username)", function (done) {
		api
		.post('/mqtt/acl')
		.send({
			"username": "bad",
			"topic": 'heartsms/' + accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(401);
			assert.deepStrictEqual(res.body, {
				Ok: false,
				Error: 'username or password incorrect'
			});
			done();
		});
	});

	it("MQTT fail acl (bad topic)", function (done) {
		api
		.post('/mqtt/acl')
		.send({
			"username": testAccountUsername,
			"topic": "bad"
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(401);
			assert.deepStrictEqual(res.body, {
				Ok: false,
				Error: 'username or password incorrect'
			});
			done();
		});
	});

	//delay("Waiting to give you time to log in, etc...");

	it("Update account base_theme string setting", function (done) {
		expectMsg(accountId, {
			operation: 'update_setting',
			content: {
				"pref": "base_theme",
				"type": "string",
				"value": "dark"
			}
		});
		
		api
		.post('/accounts/update_setting')
		.query({
			"account_id": accountId,
			"pref": "base_theme",
			"type": "string",
			"value": "dark"
		})
		.send()
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});

	it("Fail to update account setting with value that is not a string, number, or boolean", function (done) {
		api
		.post('/accounts/update_setting')
		.query({
			"account_id": accountId,
			"pref": "base_theme",
			"type": "string"
		})
		.send({
			"value": [23] // Has to be in the body to not be a string
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(400);
			assert.deepStrictEqual(res.body, {
				error: 'parameter value has the wrong type'
			});
			done();
		});
	});

	it("Update account apply_primary_color_toolbar boolean setting", function (done) {
		expectMsg(accountId, {
			operation: 'update_setting',
			content: {
				"pref": "apply_primary_color_toolbar",
				"type": "boolean",
				"value": false
			}
		});
		
		api
		.post('/accounts/update_setting')
		.query({
			"account_id": accountId,
			"pref": "apply_primary_color_toolbar",
			"type": "boolean",
			"value": "false"
		})
		.send()
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});

	it("Fail to update account apply_primary_color_toolbar boolean setting with uncastable string value", function (done) {
		api
		.post('/accounts/update_setting')
		.query({
			"account_id": accountId,
			"pref": "apply_primary_color_toolbar",
			"type": "boolean",
			"value": "shouldfail"
		})
		.send()
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(400);
			assert.deepStrictEqual(res.body, {
				error: 'parameter value has the wrong type'
			});
			done();
		});
	});

	it("Update account color integer setting", function (done) {
		expectMsg(accountId, {
			operation: 'update_setting',
			content: {
				"pref": "color",
				"type": "int",
				"value": 123456
			}
		});
		
		api
		.post('/accounts/update_setting')
		.query({
			"account_id": accountId,
			"pref": "color",
			"type": "int",
			"value": "123456"
		})
		.send()
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});

	it("Fail to update account color integer setting (as long) with uncastable string value", function (done) {
		api
		.post('/accounts/update_setting')
		.query({
			"account_id": accountId,
			"pref": "color",
			"type": "long", // int and long should have identical results
			"value": "shouldfail"
		})
		.send()
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(400);
			assert.deepStrictEqual(res.body, {
				error: 'parameter value has the wrong type'
			});
			done();
		});
	});

	it("Fail to update account color integer setting with wrong type string that does not match database (verifies database errors are caught)", function (done) {
		api
		.post('/accounts/update_setting')
		.query({
			"account_id": accountId,
			"pref": "color",
			"type": "string", // Should be int
			"value": "shouldfail"
		})
		.send()
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(500);
			assert.deepStrictEqual(res.body, {
				error: 'could not query database'
			});
			done();
		});
	});
	
	it("Account settings", function (done) {
		api
		.get('/accounts/settings')
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {
				"subscription_type": 3,
				"base_theme": "dark",
				"rounder_bubbles": false,
				"global_color_theme": "default",
				"color": 123456,
				"color_dark": -4311478,
				"color_light": -1,
				"color_accent": -10011977,
				"use_global_theme": false,
				"apply_primary_color_toolbar": false,
				"passcode": null,
				"message_timestamp": false,
				"conversation_categories": true
			});
			done();
		});
	});

	/*
	it("Get article", function (done) {
		api
		.get('/article')
		.send({
			"url": "https://www.reuters.com/article/us-facebook-apple-idUSKBN28Q2LG"
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			res.body.title.should.equal('Facebook accuses Apple of anticompetitive behavior over privacy changes');
			done();
		});
		
	});
	*/
	
	it("Add auto replies", function (done) {
		expectMsg(accountId, {
			operation: "added_auto_reply",
			content: {
				"device_id": 1,
				"type": "testtype",
				"pattern": "testpattern",
				"response": "test"
			}
		}, () => expectMsg(accountId, {
			operation: "added_auto_reply",
			content: {
				"device_id": 2,
				"type": "testtype2",
				"pattern": "testpattern2",
				"response": "test2"
			}
		}));

		api
		.post('/auto_replies/add')
		.send({
			"account_id": accountId,
			"auto_replies": [
				{
					"device_id": 1,
					"reply_type": "testtype",
					"pattern": "testpattern",
					"response": "test"
				},
				{
					"device_id": 2,
					"reply_type": "testtype2",
					"pattern": "testpattern2",
					"response": "test2"
				}
			]
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Update auto reply", function (done) {
		expectMsg(accountId, {
			operation: "updated_auto_reply",
			content: {
				"device_id": 1,
				"type": "updatedtype",
				"pattern": "updatedpattern",
				"response": "updatedtest"
			}
		});

		api
		.post('/auto_replies/update/1')
		.query({
			"account_id": accountId
		})
		.send({
			"reply_type": "updatedtype",
			"pattern": "updatedpattern",
			"response": "updatedtest"
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});

	it("Get auto replies", function (done) {
		api
		.get('/auto_replies')
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, [
				{
					"id": res.body[0].id, // Auto incremented, could be any number
					"account_id": accountId,
					"device_id": 1,
					"reply_type": "updatedtype",
					"pattern": "updatedpattern",
					"response": "updatedtest"
				},
				{
					"id": res.body[1].id, // Auto incremented, could be any number
					"account_id": accountId,
					"device_id": 2,
					"reply_type": "testtype2",
					"pattern": "testpattern2",
					"response": "test2"
				}
			]);
			done();
		});
	});
	
	it("Remove auto reply", function (done) {
		expectMsg(accountId, {
			operation: "removed_auto_reply",
			content: {
				"id": 2
			}
		})
		api
		.post('/auto_replies/remove/2')
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Add blacklist", function (done) {
		expectMsg(accountId, {
			operation: "added_blacklist",
			content: {
				"id": 1,
				"phrase": "testphrase",
				"phone_number": ''
			}
		}, () => expectMsg(accountId, {
			operation: "added_blacklist",
			content: {
				"id": 2,
				"phrase": '',
				"phone_number": "44444"
			}
		}, () => expectMsg(accountId, {
			operation: "added_blacklist",
			content: {
				"id": 3,
				"phone_number": "55555",
				"phrase": "testphrase3"
			}
		})));

		api
		.post('/blacklists/add')
		.send({
			"account_id": accountId,
			"blacklists": [
				{
					"device_id": 1,
					"phrase": "testphrase"
					// phone_number optional
				},
				{
					"device_id": 2,
					// phrase optional
					"phone_number": "44444"
				},
				{
					"device_id": 3,
					"phone_number": "55555",
					"phrase": "testphrase3"
				}
			]
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Get blacklists", function (done) {
		api
		.get('/blacklists')
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, [
				{
					"id": res.body[0].id,
					"account_id": accountId,
					"device_id": 1,
					"phone_number":  null,
					"phrase": "testphrase"
				},
				{
					"id": res.body[1].id,
					"account_id": accountId,
					"device_id": 2,
					"phone_number": "44444",
					"phrase": null
				},
				{
					"id": res.body[2].id,
					"account_id": accountId,
					"device_id": 3,
					"phone_number": "55555",
					"phrase": "testphrase3"
				}
			]);
			done();
		});
	});
	
	it("Remove blacklist", function (done) {
		expectMsg(accountId, {
			operation: "removed_blacklist",
			content: {
				"id": 2
			}
		});

		api
		.post('/blacklists/remove/2')
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Add device", function (done) {
		api
		.post('/devices/add')
		.send({
			"account_id": accountId,
			"device": {
				"id": 1,
				"info": "testinfo",
				"name": "test",
				"primary": true,
				"fcm_token": "token"
			}
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {
				"id": 1
			});
			done();
		});
	});
	
	it("Add second device", function (done) {
		api
		.post('/devices/add')
		.send({
			"account_id": accountId,
			"device": {
				"id": 2,
				"info": "testinfo2",
				"name": "test2",
				"primary": false,
				"fcm_token": "token2"
			}
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {
				"id": 2
			});
			done();
		});
	});
	
	it("Update device (fcm_token)", function (done) {
		api
		.post('/devices/update/1')
		.query({
			"account_id": accountId,
			"fcm_token": "newtoken"
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});

	it("Update device (name)", function (done) {
		api
		.post('/devices/update/2')
		.query({
			"account_id": accountId,
			"name": "newname"
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Change primary device", function (done) {
		expectMsg(accountId, {
			operation: "update_primary_device",
			content: {
				"new_primary_device_id": "2"
			}
		})
		api
		.post('/devices/update_primary')
		.query({
			"account_id": accountId,
			"new_primary_device_id": 2
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Get devices", function (done) {
		api
		.get('/devices')
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, [
				{
					"account_id": accountId,
					"id": 1,
					"info": "testinfo",
					"name": "test",
					"primary": false,
					"fcm_token": "newtoken",
					"ios": false
				},
				{
					"account_id": accountId,
					"id": 2,
					"info": "testinfo2",
					"name": "newname",
					"primary": true,
					"fcm_token": "token2",
					"ios": false
				}
			]);
			done();
		});
	});
	
	it("Remove device", function (done) {
		api
		.post('/devices/remove/1')
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Add folders", function (done) {
		expectMsg(accountId, {
			operation: "added_folder",
			content: {
				"device_id": 1,
				"name": "foldername",
				"color": 6,
				"color_dark": 6,
				"color_light": 6,
				"color_accent": 6
			}
		}, () => expectMsg(accountId, {
			operation: "added_folder",
			content: {
				"device_id": 2,
				"name": "foldername2",
				"color": 6,
				"color_dark": 6,
				"color_light": 6,
				"color_accent": 6
			}
		}));

		api
		.post('/folders/add')
		.send({
			"account_id": accountId,
			"folders": [
				{
					"device_id": 1,
					"name": "foldername",
					"color": 6,
					"color_dark": 6,
					"color_light": 6,
					"color_accent": 6
				},
				{
					"device_id": 2,
					"name": "foldername2",
					"color": 6,
					"color_dark": 6,
					"color_light": 6,
					"color_accent": 6
				}
			]
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Update folder", function (done) {
		expectMsg(accountId, {
			operation: "updated_folder",
			content: {
				"device_id": 1,
				"name": "newfolder",
				"color": 5,
				"color_dark": 5,
				"color_light": 5,
				"color_accent": 5
			}
		})

		api
		.post('/folders/update/1')
		.query({
			"account_id": accountId
		})
		.send({
			"name": "newfolder",
			"color": 5,
			"color_dark": 5,
			"color_light": 5,
			"color_accent": 5
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Get folders", function (done) {
		api
		.get('/folders')
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, [
				{
					"id": res.body[0].id,
					"account_id": accountId,
					"device_id": 1,
					"name": "newfolder",
					"color": 5,
					"color_dark": 5,
					"color_light": 5,
					"color_accent": 5
				},
				{
					"id": res.body[1].id,
					"account_id": accountId,
					"device_id": 2,
					"name": "foldername2",
					"color": 6,
					"color_dark": 6,
					"color_light": 6,
					"color_accent": 6
				}
			]);
			done();
		});
	});
	
	it("Remove folder", function (done) {
		expectMsg(accountId, {
			operation: "removed_folder",
			content: {
				"id": 1
			}
		})
		api
		.post('/folders/remove/1')
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Add contacts", function (done) {
		expectMsg(accountId, {
			operation: "added_contact",
			content: {
				"phone_number": "555",
				"name": "name1",
				"color": 3,
				"color_dark": 3,
				"color_light": 3,
				"color_accent": 3,
				"type": 3
			}
		}, () => expectMsg(accountId, {
			operation: "added_contact",
			content: {
				"phone_number": "666",
				"name": "name2",
				"color": 4,
				"color_dark": 4,
				"color_light": 4,
				"color_accent": 4,
				"type": 4
			}
		}, () => expectMsg(accountId, {
			operation: "added_contact",
			content: {
				"phone_number": "777",
				"name": "name3",
				"color": 5,
				"color_dark": 5,
				"color_light": 5,
				"color_accent": 5,
				"type": 5
			}
		}, () => expectMsg(accountId, {
			operation: "added_contact",
			content: {
				"phone_number": "888",
				"name": "name4",
				"color": 6,
				"color_dark": 6,
				"color_light": 6,
				"color_accent": 6,
				"type": 6
			}
		}))));

		api
		.post('/contacts/add')
		.send({
			"account_id": accountId,
			"contacts": [
				{
					"device_id": 1,
					"phone_number": "555",
					"id_matcher": "idmatch1",
					"name": "name1",
					"color": 3,
					"color_dark": 3,
					"color_light": 3,
					"color_accent": 3,
					"contact_type": 3
				},
				{
					"device_id": 2,
					"phone_number": "666",
					"id_matcher": "idmatch2",
					"name": "name2",
					"color": 4,
					"color_dark": 4,
					"color_light": 4,
					"color_accent": 4,
					"contact_type": 4
				},
				{
					"device_id": 3,
					"phone_number": "777",
					"id_matcher": "idmatch3",
					"name": "name3",
					"color": 5,
					"color_dark": 5,
					"color_light": 5,
					"color_accent": 5,
					"contact_type": 5
				},
				{
					"device_id": 4,
					"phone_number": "888",
					"id_matcher": "idmatch4",
					"name": "name4",
					"color": 6,
					"color_dark": 6,
					"color_light": 6,
					"color_accent": 6,
					"contact_type": 6
				}
			]
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Update contact", function (done) {
		expectMsg(accountId, {
			operation: "updated_contact",
			content: {
				"device_id": 1,
				"phone_number": "123",
				"name": "newname",
				"color": 456,
				"color_dark": 456,
				"color_light": 456,
				"color_accent": 456,
				"type": 3
			}
		});

		api
		.post('/contacts/update_device_id')
		.query({
			"account_id": accountId,
			"device_id": 1
		})
		.send({
			"phone_number": "123",
			"name": "newname",
			"color": 456,
			"color_dark": 456,
			"color_light": 456,
			"color_accent": 456
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});


	it("Update contact phone number only", function (done) {
		expectMsg(accountId, {
			operation: "updated_contact",
			content: {
				"device_id": 2,
				"phone_number": "666666",
				"name": "name2",
				"color": 4,
				"color_dark": 4,
				"color_light": 4,
				"color_accent": 4,
				"type": 4
			}
		});

		api
		.post('/contacts/update_device_id')
		.query({
			"account_id": accountId,
			"device_id": 2
		})
		.send({
			"phone_number": "666666",
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});


	it("Update contact name only", function (done) {
		expectMsg(accountId, {
			operation: "updated_contact",
			content: {
				"device_id": 3,
				"phone_number": "777",
				"name": "newname3",
				"color": 5,
				"color_dark": 5,
				"color_light": 5,
				"color_accent": 5,
				"type": 5
			}
		});

		api
		.post('/contacts/update_device_id')
		.query({
			"account_id": accountId,
			"device_id": 3
		})
		.send({
			"name": "newname3",
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});

	
	it("Remove contact", function (done) {
		expectMsg(accountId, {
			operation: "removed_contact",
			content: {
				"device_id": 4,
				"phone_number": "888"
			}
		});

		api
		.post('/contacts/remove_device_id')
		.query({
			"account_id": accountId,
			"device_id": 4,
			"phone_number": "888"
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Get simple contacts", function (done) {
		api
		.get('/contacts/simple')
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, [
				{
					"id": res.body[0].id,
					"phone_number": "777",
					"id_matcher": "idmatch3",
					"name": "newname3",
					"color": 5,
					"color_accent": 5,
					"contact_type": 5
				},
				{
					"id": res.body[1].id,
					"phone_number": "666666",
					"id_matcher": "idmatch2",
					"name": "name2",
					"color": 4,
					"color_accent": 4,
					"contact_type": 4
				},
				{
					"id": res.body[2].id,
					"phone_number": "123",
					"name": "newname",
					"id_matcher": "idmatch1",
					"color": 456,
					"color_accent": 456,
					"contact_type": 3
				}
			]);
			contactsToRemove.push(res.body[1].id);
			contactsToRemove.push(res.body[2].id);
			done();
		});
	});

	it("Get simple contacts LIMIT 2", function (done) {
		api
		.get('/contacts/simple')
		.query({
			"account_id": accountId,
			"limit": 2
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, [
				{
					"id": res.body[0].id,
					"phone_number": "777",
					"id_matcher": "idmatch3",
					"name": "newname3",
					"color": 5,
					"color_accent": 5,
					"contact_type": 5
				},
				{
					"id": res.body[1].id,
					"phone_number": "666666",
					"id_matcher": "idmatch2",
					"name": "name2",
					"color": 4,
					"color_accent": 4,
					"contact_type": 4
				}
			]);
			done();
		});
	});


	it("Get simple contacts LIMIT 1 OFFSET 2", function (done) {
		api
		.get('/contacts/simple')
		.query({
			"account_id": accountId,
			"limit": 1,
			"offset": 2
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, [
				{
					"id": res.body[0].id,
					"phone_number": "123",
					"name": "newname",
					"id_matcher": "idmatch1",
					"color": 456,
					"color_accent": 456,
					"contact_type": 3
				}
			]);
			done();
		});
	});

	it("Get contacts LIMIT 2", function (done) {
		api
		.get('/contacts')
		.query({
			"account_id": accountId,
			"limit": 2
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, [
				{
					"id": res.body[0].id,
					"account_id": accountId,
					"device_id": 3,
					"phone_number": "777",
					"name": "newname3",
					"color": 5,
					"color_dark": 5,
					"color_light": 5,
					"color_accent": 5,
					"contact_type": 5
				},
				{
					"id": res.body[1].id,
					"account_id": accountId,
					"device_id": 2,
					"phone_number": "666666",
					"name": "name2",
					"color": 4,
					"color_dark": 4,
					"color_light": 4,
					"color_accent": 4,
					"contact_type": 4
				},
			]);
			done();
		});
	});

	it("Get contacts LIMIT 1 OFFSET 2", function (done) {
		api
		.get('/contacts')
		.query({
			"account_id": accountId,
			"limit": 1,
			"offset": 2
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, [
				{
					"id": res.body[0].id,
					"account_id": accountId,
					"device_id": 1,
					"phone_number": "123",
					"name": "newname",
					"color": 456,
					"color_dark": 456,
					"color_light": 456,
					"color_accent": 456,
					"contact_type": 3
				}
			]);
			done();
		});
	});
	
	it("Remove multiple contacts by id", function (done) {
		let ids = contactsToRemove.join(',');
		expectMsg(accountId, {
			operation: "removed_contact_by_id",
			content: {
				"id": ids
			}
		})
		api
		.post('/contacts/remove_ids/' + ids)
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Get contacts", function (done) {
		api
		.get('/contacts')
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, [
				{
					"id": res.body[0].id,
					"account_id": accountId,
					"device_id": 3,
					"phone_number": "777",
					"name": "newname3",
					"color": 5,
					"color_dark": 5,
					"color_light": 5,
					"color_accent": 5,
					"contact_type": 5
				}
			]);
			done();
		});
	});
	
	it("Clear contacts", function (done) {
		api
		.post('/contacts/clear')
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Add conversations", function (done) {
		expectMsg(accountId, {
			operation: "added_conversation",
			content: {
				"device_id": 10,
				"folder_id": -1,
				"color": 7,
				"color_dark": 7,
				"color_light": 7,
				"color_accent": 7,
				"led_color": 8,
				"pinned": false,
				"read": false,
				"timestamp": 1000,
				"title": "testtitle",
				"phone_numbers": "555,666",
				"snippet": "testsnippet",
				"id_matcher": "match",
				"mute": false,
				"archive": false,
				"private_notifications": false
			}
		}, () => expectMsg(accountId, {
			operation: "added_conversation",
			content: {
				"device_id": 20,
				"folder_id": -1,
				"color": 7,
				"color_dark": 7,
				"color_light": 7,
				"color_accent": 7,
				"led_color": 8,
				"pinned": true,
				"read": false,
				"timestamp": 1002,
				"title": "testtitle2",
				"phone_numbers": "444,666",
				"snippet": "testsnippet2",
				"ringtone": "ringer2",
				"id_matcher": "match2",
				"mute": false,
				"archive": true,
				"private_notifications": true
			}
		}, () => expectMsg(accountId, {
			operation: "added_conversation",
			content: {
				"device_id": 30,
				"folder_id": -1,
				"color": 7,
				"color_dark": 7,
				"color_light": 7,
				"color_accent": 7,
				"led_color": 8,
				"pinned": false,
				"read": false,
				"timestamp": 1003,
				"title": "testtitle3",
				"phone_numbers": "555,333",
				"snippet": "testsnippet3",
				"image_uri": "image3",
				"id_matcher": "match3",
				"mute": false,
				"archive": false,
				"private_notifications": false
			}
		}, () => expectMsg(accountId, {
			operation: "added_conversation",
			content: {
				"device_id": 40,
				"folder_id": -1,
				"color": 8,
				"color_dark": 8,
				"color_light": 8,
				"color_accent": 8,
				"led_color": 9,
				"pinned": false,
				"read": false,
				"timestamp": 1111,
				"title": "testtitle4",
				"phone_numbers": "567,123",
				"snippet": "testsnippet4",
				"image_uri": "image4",
				"id_matcher": "match4",
				"mute": false,
				"archive": false,
				"private_notifications": false
			}
		}))));

		api
		.post('/conversations/add')
		.send({
			"account_id": accountId,
			"conversations": [
				{
					"device_id": 10,
					"folder_id": -1,
					"color": 7,
					"color_dark": 7,
					"color_light": 7,
					"color_accent": 7,
					"led_color": 8,
					"pinned": false,
					"read": false,
					"timestamp": 1000,
					"title": "testtitle",
					"phone_numbers": "555,666",
					"snippet": "testsnippet",
					"id_matcher": "match",
					"mute": false,
					"archive": false,
					"private_notifications": false
				},
				{
					"device_id": 20,
					"folder_id": -1,
					"color": 7,
					"color_dark": 7,
					"color_light": 7,
					"color_accent": 7,
					"led_color": 8,
					"pinned": true,
					"read": false,
					"timestamp": 1002,
					"title": "testtitle2",
					"phone_numbers": "444,666",
					"snippet": "testsnippet2",
					"ringtone": "ringer2",
					"id_matcher": "match2",
					"mute": false,
					"archive": true,
					"private_notifications": true
				},
				{
					"device_id": 30,
					"folder_id": -1,
					"color": 7,
					"color_dark": 7,
					"color_light": 7,
					"color_accent": 7,
					"led_color": 8,
					"pinned": false,
					"read": false,
					"timestamp": 1003,
					"title": "testtitle3",
					"phone_numbers": "555,333",
					"snippet": "testsnippet3",
					"image_uri": "image3",
					"id_matcher": "match3",
					"mute": false,
					"archive": false,
					"private_notifications": false
				},
				{
					"device_id": 40,
					"folder_id": -1,
					"color": 8,
					"color_dark": 8,
					"color_light": 8,
					"color_accent": 8,
					"led_color": 9,
					"pinned": false,
					"read": false,
					"timestamp": 1111,
					"title": "testtitle4",
					"phone_numbers": "567,123",
					"snippet": "testsnippet4",
					"image_uri": "image4",
					"id_matcher": "match4",
					"mute": false,
					"archive": false,
					"private_notifications": false
				}
			]
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Update conversation with optional properties", function (done) {
		expectMsg(accountId, {
			operation: "updated_conversation",
			content: {
				"id": 10,
				"color": 7,
				"color_dark": 7,
				"color_light": 7,
				"color_accent": 7,
				"led_color": 8,
				"pinned": false,
				"read": false,
				"title": "newtitle",
				"snippet": "newsnippet",
				"ringtone": null,
				"mute": true,
				"archive": true,
				"private_notifications": false
			}
		});
		
		api
		.post('/conversations/update/10')
		.query({
			"account_id": accountId
		})
		.send({
			"title": "newtitle",
			"snippet": "newsnippet",
			"mute": true,
			"archive": true,
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});

	it("Update throwaway conversation with optional properties", function (done) {
		expectMsg(accountId, {
			operation: "updated_conversation",
			content: {
				"id": 40,
				"color": 9,
				"color_dark": 9,
				"color_light": 9,
				"color_accent": 9,
				"led_color": 10,
				"pinned": true,
				"read": true,
				"title": "testtitle4",
				"snippet": "testsnippet4",
				"ringtone": null,
				"mute": false,
				"archive": false,
				"private_notifications": false
			}
		});
		
		api
		.post('/conversations/update/40')
		.query({
			"account_id": accountId
		})
		.send({
			"color": 9,
			"color_dark": 9,
			"color_light": 9,
			"color_accent": 9,
			"led_color": 10,
			"pinned": true,
			"read": true,
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});

	it("Update throwaway conversation with different optional properties", function (done) {
		expectMsg(accountId, {
			operation: "updated_conversation",
			content: {
				"id": 40,
				"color": 9,
				"color_dark": 9,
				"color_light": 9,
				"color_accent": 9,
				"led_color": 10,
				"pinned": true,
				"read": true,
				"title": "testtitle44",
				"snippet": "testsnippet44",
				"ringtone": null,
				"mute": true,
				"archive": true,
				"private_notifications": true
			}
		});
		
		api
		.post('/conversations/update/40')
		.query({
			"account_id": accountId
		})
		.send({
			"timestamp": 22222,
			"title": "testtitle44",
			"snippet": "testsnippet44",
			"mute": true,
			"archive": true,
			"private_notifications": true
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});

	it("Get throwaway conversation to verify updated values", function (done) {
		api
		.get('/conversations/40')
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {
				"id": res.body.id,
				"account_id": accountId,
				"device_id": 40,
				"folder_id": -1,
				"color": 9,
				"color_dark": 9,
				"color_light": 9,
				"color_accent": 9,
				"led_color": 10,
				"pinned": true,
				"read": true,
				"timestamp": 22222,
				"title": "testtitle44",
				"phone_numbers": "567,123",
				"snippet": "testsnippet44",
				"ringtone": null,
				"image_uri": "image4",
				"id_matcher": "match4",
				"mute": true,
				"archive": true,
				"private_notifications": true
			});
			done();
		});
	});

	it("Remove throwaway conversation", function (done) {
		expectMsg(accountId, {
			operation: "removed_conversation",
			content: {
				"id": 40
			}
		})
		api
		.post('/conversations/remove/40')
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});

	
	it("Update conversation snippet with optional properties", function (done) {
		expectMsg(accountId, {
			operation: "update_conversation_snippet",
			content: {
				"id": 20,
				"read": true,
				"timestamp": 1008,
				"snippet": "testsnippet2",
				"archive": true
			}
		});
		
		api
		.post('/conversations/update_snippet/20')
		.query({
			"account_id": accountId
		})
		.send({
			"read": true,
			"timestamp": 1008
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});

	it("Update conversation snippet with different optional properties", function (done) {
		expectMsg(accountId, {
			operation: "update_conversation_snippet",
			content: {
				"id": 20,
				"read": true,
				"timestamp": 1008,
				"snippet": "updatedsnippet",
				"archive": false
			}
		});
		
		api
		.post('/conversations/update_snippet/20')
		.query({
			"account_id": accountId
		})
		.send({
			"snippet": "updatedsnippet",
			"archive": false
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Update conversation title", function (done) {
		expectMsg(accountId, {
			operation: "update_conversation_title",
			content: {
				"id": 20,
				"title": "updatedtitle"
			}
		});

		api
		.post('/conversations/update_title/20')
		.query({
			"account_id": accountId,
			"title": "updatedtitle"
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Update conversation read (without android_device)", function (done) {
		expectMsg(accountId, {
			operation: "read_conversation",
			content: {
				"id": 30
			}
		});
		
		api
		.post('/conversations/read/30')
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});

	it("Update conversation read (with android_device)", function (done) {
		expectMsg(accountId, {
			operation: "read_conversation",
			content: {
				"id": 10,
				"android_device": '1'
			}
		});
		
		api
		.post('/conversations/read/10')
		.query({
			"account_id": accountId,
			"android_device": 1
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Update conversation archive", function (done) {
		expectMsg(accountId, {
			operation: "archive_conversation",
			content: {
				"id": 30,
				"archive": true
			}
		});

		api
		.post('/conversations/archive/30')
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Update conversation unarchive", function (done) {
		expectMsg(accountId, {
			operation: "archive_conversation",
			content: {
				"id": 10,
				"archive": false
			}
		});

		api
		.post('/conversations/unarchive/10')
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Add conversation to folder", function (done) {
		expectMsg(accountId, {
			operation: "add_conversation_to_folder",
			content: {
				"id": 10,
				"folder_id": 2
			}
		});

		api
		.post('/conversations/add_to_folder/10')
		.query({
			"account_id": accountId,
			"folder_id": 2
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Add another conversation to folder", function (done) {
		expectMsg(accountId, {
			operation: "add_conversation_to_folder",
			content: {
				"id": 20,
				"folder_id": 2
			}
		});

		api
		.post('/conversations/add_to_folder/20')
		.query({
			"account_id": accountId,
			"folder_id": 2
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Remove conversation from folder", function (done) {
		expectMsg(accountId, {
			operation: "remove_conversation_from_folder",
			content: {
				"id": 20
			}
		});

		api
		.post('/conversations/remove_from_folder/20')
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Get conversations", function (done) {
		api
		.get('/conversations')
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, [
				{
					"id": res.body[0].id,
					"account_id": accountId,
					"device_id": 20,
					"folder_id": -1,
					"color": 7,
					"color_dark": 7,
					"color_light": 7,
					"color_accent": 7,
					"led_color": 8,
					"pinned": true,
					"read": true,
					"timestamp": 1008,
					"title": "updatedtitle",
					"phone_numbers": "444,666",
					"snippet": "updatedsnippet",
					"ringtone": "ringer2",
					"id_matcher": "match2",
					"image_uri": null,
					"mute": false,
					"archive": false,
					"private_notifications": true
				},
				{
					"id": res.body[1].id,
					"account_id": accountId,
					"device_id": 30,
					"folder_id": -1,
					"color": 7,
					"color_dark": 7,
					"color_light": 7,
					"color_accent": 7,
					"led_color": 8,
					"pinned": false,
					"read": true,
					"timestamp": 1003,
					"title": "testtitle3",
					"phone_numbers": "555,333",
					"snippet": "testsnippet3",
					"id_matcher": "match3",
					"ringtone": null,
					"image_uri": "image3",
					"mute": false,
					"archive": true,
					"private_notifications": false
				},
				{
					"id": res.body[2].id,
					"account_id": accountId,
					"device_id": 10,
					"folder_id": 2,
					"color": 7,
					"color_dark": 7,
					"color_light": 7,
					"color_accent": 7,
					"led_color": 8,
					"pinned": false,
					"read": true,
					"timestamp": 1000,
					"title": "newtitle",
					"phone_numbers": "555,666",
					"snippet": "newsnippet",
					"ringtone": null,
					"image_uri": null,
					"id_matcher": "match",
					"mute": true,
					"archive": false,
					"private_notifications": false
				}
			]);
			done();
		});
	});

	it("Get conversations LIMIT 2", function (done) {
		api
		.get('/conversations')
		.query({
			"account_id": accountId,
			"limit": 2
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, [
				{
					"id": res.body[0].id,
					"account_id": accountId,
					"device_id": 20,
					"folder_id": -1,
					"color": 7,
					"color_dark": 7,
					"color_light": 7,
					"color_accent": 7,
					"led_color": 8,
					"pinned": true,
					"read": true,
					"timestamp": 1008,
					"title": "updatedtitle",
					"phone_numbers": "444,666",
					"snippet": "updatedsnippet",
					"ringtone": "ringer2",
					"id_matcher": "match2",
					"image_uri": null,
					"mute": false,
					"archive": false,
					"private_notifications": true
				},
				{
					"id": res.body[1].id,
					"account_id": accountId,
					"device_id": 30,
					"folder_id": -1,
					"color": 7,
					"color_dark": 7,
					"color_light": 7,
					"color_accent": 7,
					"led_color": 8,
					"pinned": false,
					"read": true,
					"timestamp": 1003,
					"title": "testtitle3",
					"phone_numbers": "555,333",
					"snippet": "testsnippet3",
					"id_matcher": "match3",
					"ringtone": null,
					"image_uri": "image3",
					"mute": false,
					"archive": true,
					"private_notifications": false
				}
			]);
			done();
		});
	});

	it("Get conversations LIMIT 1 OFFSET 2", function (done) {
		api
		.get('/conversations')
		.query({
			"account_id": accountId,
			"limit": 1,
			"offset": 2
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, [
				{
					"id": res.body[0].id,
					"account_id": accountId,
					"device_id": 10,
					"folder_id": 2,
					"color": 7,
					"color_dark": 7,
					"color_light": 7,
					"color_accent": 7,
					"led_color": 8,
					"pinned": false,
					"read": true,
					"timestamp": 1000,
					"title": "newtitle",
					"phone_numbers": "555,666",
					"snippet": "newsnippet",
					"ringtone": null,
					"image_uri": null,
					"id_matcher": "match",
					"mute": true,
					"archive": false,
					"private_notifications": false
				}
			]);
			done();
		});
	});
	
	it("Get conversation by id", function (done) {
		api
		.get('/conversations/10')
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {
				"id": res.body.id,
				"account_id": accountId,
				"device_id": 10,
				"folder_id": 2,
				"color": 7,
				"color_dark": 7,
				"color_light": 7,
				"color_accent": 7,
				"led_color": 8,
				"pinned": false,
				"read": true,
				"timestamp": 1000,
				"title": "newtitle",
				"phone_numbers": "555,666",
				"snippet": "newsnippet",
				"ringtone": null,
				"image_uri": null,
				"id_matcher": "match",
				"mute": true,
				"archive": false,
				"private_notifications": false
			});
			done();
		});
	});
	
	it("Get conversations by folder", function (done) {
		api
		.get('/conversations/folder/2')
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, [
				{
					"id": res.body[0].id,
					"account_id": accountId,
					"device_id": 10,
					"folder_id": 2,
					"color": 7,
					"color_dark": 7,
					"color_light": 7,
					"color_accent": 7,
					"led_color": 8,
					"pinned": false,
					"read": true,
					"timestamp": 1000,
					"title": "newtitle",
					"phone_numbers": "555,666",
					"snippet": "newsnippet",
					"ringtone": null,
					"image_uri": null,
					"id_matcher": "match",
					"mute": true,
					"archive": false,
					"private_notifications": false
				}
			]);
			done();
		});
	});
	
	it("Get archived conversations", function (done) {
		api
		.get('/conversations/index_archived')
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, [
				{
					"id": res.body[0].id,
					"account_id": accountId,
					"device_id": 30,
					"folder_id": -1,
					"color": 7,
					"color_dark": 7,
					"color_light": 7,
					"color_accent": 7,
					"led_color": 8,
					"pinned": false,
					"read": true,
					"timestamp": 1003,
					"title": "testtitle3",
					"phone_numbers": "555,333",
					"snippet": "testsnippet3",
					"id_matcher": "match3",
					"ringtone": null,
					"image_uri": "image3",
					"mute": false,
					"archive": true,
					"private_notifications": false
				}
			]);
			done();
		});
	});


	it("Get archived conversations LIMIT 2 OFFSET 2 (will be empty since there is only one archived conversation)", function (done) {
		api
		.get('/conversations/index_archived')
		.query({
			"account_id": accountId,
			"limit": 2,
			"offset": 2
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, []);
			done();
		});
	});
	
	it("Get private conversations", function (done) {
		api
		.get('/conversations/index_private')
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, [
				{
					"id": res.body[0].id,
					"account_id": accountId,
					"device_id": 20,
					"folder_id": -1,
					"color": 7,
					"color_dark": 7,
					"color_light": 7,
					"color_accent": 7,
					"led_color": 8,
					"pinned": true,
					"read": true,
					"timestamp": 1008,
					"title": "updatedtitle",
					"phone_numbers": "444,666",
					"snippet": "updatedsnippet",
					"ringtone": "ringer2",
					"id_matcher": "match2",
					"image_uri": null,
					"mute": false,
					"archive": false,
					"private_notifications": true
				}
			]);
			done();
		});
	});

	it("Get private conversations LIMIT 2 OFFSET 2 (will be empty since there is only one private conversation)", function (done) {
		api
		.get('/conversations/index_private')
		.query({
			"account_id": accountId,
			"limit": 2,
			"offset": 2
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, []);
			done();
		});
	});
	
	it("Get non-private and non-archived conversations", function (done) {
		api
		.get('/conversations/index_public_unarchived')
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, [
				{
					"id": res.body[0].id,
					"account_id": accountId,
					"device_id": 10,
					"folder_id": 2,
					"color": 7,
					"color_dark": 7,
					"color_light": 7,
					"color_accent": 7,
					"led_color": 8,
					"pinned": false,
					"read": true,
					"timestamp": 1000,
					"title": "newtitle",
					"phone_numbers": "555,666",
					"snippet": "newsnippet",
					"ringtone": null,
					"image_uri": null,
					"id_matcher": "match",
					"mute": true,
					"archive": false,
					"private_notifications": false
				}
			]);
			done();
		});
	});


	it("Get non-private and non-archived conversations LIMIT 2 OFFSET 2 (will be empty since there is only one matching conversation)", function (done) {
		api
		.get('/conversations/index_public_unarchived')
		.query({
			"account_id": accountId,
			"limit": 2,
			"offset": 2
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, []);
			done();
		});
	});
	
	it("Add messages", function (done) {
		expectMsg(accountId, {
			operation: "added_message",
			content: {
				"id": 1,
				"conversation_id": 10,
				"type": 2,
				"data": "testdata",
				"timestamp": 1000,
				"mime_type": "testmime",
				"read": false,
				"seen": false,
				"from": "testfrom",
				"color": 6,
				"sent_device": 13,
				"sim_stamp": "teststamp"
			}
		}, () => expectMsg(accountId, {
			operation: "added_message",
			content: {
				"id": 2,
				"conversation_id": 20,
				"type": 2,
				"data": "testdata2",
				"timestamp": 2000,
				"mime_type": "testmime2",
				"read": false,
				"seen": false,
				"sent_device": 14,
				"sim_stamp": "teststamp2"
			}
		}, () => expectMsg(accountId, {
			operation: "added_message",
			content: {
				"id": 3,
				"conversation_id": 30,
				"type": 2,
				"data": "testdata3",
				"timestamp": 3000,
				"mime_type": "testmime3",
				"read": false,
				"seen": false,
				"from": "testfrom3",
				"sent_device": -1,
				"color": 6
			}
		})));

		api
		.post('/messages/add')
		.send({
			"account_id": accountId,
			"messages": [
				{
					"device_id": 1,
					"device_conversation_id": 10,
					"message_type": 2,
					"data": "testdata",
					"timestamp": 1000,
					"mime_type": "testmime",
					"read": false,
					"seen": false,
					"message_from": "testfrom",
					"color": 6,
					"sent_device": 13,
					"sim_stamp": "teststamp"
				},
				{
					"device_id": 2,
					"device_conversation_id": 20,
					"message_type": 2,
					"data": "testdata2",
					"timestamp": 2000,
					"mime_type": "testmime2",
					"read": false,
					"seen": false,
					"sent_device": 14,
					"sim_stamp": "teststamp2"
				},
				{
					"device_id": 3,
					"device_conversation_id": 30,
					"message_type": 2,
					"data": "testdata3",
					"timestamp": 3000,
					"mime_type": "testmime3",
					"read": false,
					"seen": false,
					"message_from": "testfrom3",
					"sent_device": -1,
					"color": 6,
				}
			]
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Update message with optional properties", function (done) {
		expectMsg(accountId, {
			operation: "updated_message",
			content: {
				"id": 1,
				"type": 4,
				"timestamp": 500,
				"read": null,
				"seen": null
			}
		})
		
		api
		.post('/messages/update/1')
		.query({
			"account_id": accountId
		})
		.send({
			"message_type": 4,
			"timestamp": 500,
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});

	it("Update message with other optional properties", function (done) {
		expectMsg(accountId, {
			operation: "updated_message",
			content: {
				"id": 1,
				"type": null,
				"timestamp": null,
				"read": true,
				"seen": true
			}
		});
		
		api
		.post('/messages/update/1')
		.query({
			"account_id": accountId
		})
		.send({
			"read": true,
			"seen": true
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Update message type", function (done) {
		expectMsg(accountId, {
			operation: "update_message_type",
			content: {
				"id": "2",
				"message_type": "7"
			}
		});
		
		api
		.post('/messages/update_type/2')
		.query({
			"account_id": accountId,
			"message_type": 7
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Update conversation seen", function (done) {
		expectMsg(accountId, {
			operation: "seen_conversation",
			content: {
				"id": 30
			}
		});

		api
		.post('/conversations/seen/30')
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Mark all conversations seen", function (done) {
		expectMsg(accountId, {
			operation: "seen_conversations",
			content: {}
		});

		api
		.post('/conversations/seen')
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});

	it("Get message by conversation_id", function (done) {
		api
		.get('/messages')
		.query({
			"account_id": accountId,
			"conversation_id": 20
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, [
				{
					"id": res.body[0].id,
					"account_id": accountId,
					"device_id": 2,
					"device_conversation_id": 20,
					"message_type": 7,
					"data": "testdata2",
					"timestamp": 2000,
					"mime_type": "testmime2",
					"read": false,
					"seen": true,
					"message_from": null,
					"color": null,
					"sent_device": 14,
					"sim_stamp": "teststamp2"
				},
			]);
			done();
		});
	});
	
	it("Get messages", function (done) {
		api
		.get('/messages')
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, [
				{
					"id": res.body[0].id,
					"account_id": accountId,
					"device_id": 3,
					"device_conversation_id": 30,
					"message_type": 2,
					"data": "testdata3",
					"timestamp": 3000,
					"mime_type": "testmime3",
					"read": false,
					"seen": true,
					"message_from": "testfrom3",
					"color": 6,
					"sent_device": -1,
					"sim_stamp": null
				},
				{
					"id": res.body[1].id,
					"account_id": accountId,
					"device_id": 2,
					"device_conversation_id": 20,
					"message_type": 7,
					"data": "testdata2",
					"timestamp": 2000,
					"mime_type": "testmime2",
					"read": false,
					"seen": true,
					"message_from":null,
					"color": null,
					"sent_device": 14,
					"sim_stamp": "teststamp2"
				},
				{
					"id": res.body[2].id,
					"account_id": accountId,
					"device_id": 1,
					"device_conversation_id": 10,
					"message_type": 4,
					"data": "testdata",
					"timestamp": 500,
					"mime_type": "testmime",
					"read": true,
					"seen": true,
					"message_from": "testfrom",
					"color": 6,
					"sent_device": 13,
					"sim_stamp": "teststamp"
				},
			]);
			done();
		});
	});

	it("Get messages LIMIT 2", function (done) {
		api
		.get('/messages')
		.query({
			"account_id": accountId,
			"limit": 2
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, [
				{
					"id": res.body[0].id,
					"account_id": accountId,
					"device_id": 3,
					"device_conversation_id": 30,
					"message_type": 2,
					"data": "testdata3",
					"timestamp": 3000,
					"mime_type": "testmime3",
					"read": false,
					"seen": true,
					"message_from": "testfrom3",
					"color": 6,
					"sent_device": -1,
					"sim_stamp": null
				},
				{
					"id": res.body[1].id,
					"account_id": accountId,
					"device_id": 2,
					"device_conversation_id": 20,
					"message_type": 7,
					"data": "testdata2",
					"timestamp": 2000,
					"mime_type": "testmime2",
					"read": false,
					"seen": true,
					"message_from": null,
					"color": null,
					"sent_device": 14,
					"sim_stamp": "teststamp2"
				}
			]);
			done();
		});
	});


	it("Get messages LIMIT 1 OFFSET 2", function (done) {
		api
		.get('/messages')
		.query({
			"account_id": accountId,
			"limit": 1,
			"offset": 2
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, [
				{
					"id": res.body[0].id,
					"account_id": accountId,
					"device_id": 1,
					"device_conversation_id": 10,
					"message_type": 4,
					"data": "testdata",
					"timestamp": 500,
					"mime_type": "testmime",
					"read": true,
					"seen": true,
					"message_from": "testfrom",
					"color": 6,
					"sent_device": 13,
					"sim_stamp": "teststamp"
				},
			]);
			done();
		});
	});

	
	it("Remove message", function (done) {
		expectMsg(accountId, {
			operation: "removed_message",
			content: {
				"id": 3
			}
		});

		api
		.post('/messages/remove/3')
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Add drafts", function (done) {
		expectMsg(accountId, {
			operation: "added_draft",
			content: {
				"id": 1,
				"conversation_id": 10,
				"mime_type": "testmime",
				"data": "test"
			}
		}, () => expectMsg(accountId, {
			operation: "added_draft",
			content: {
				"id": 2,
				"conversation_id": 20,
				"mime_type": "testmime2",
				"data": "test2"
			}
		}, () => expectMsg(accountId, {
			operation: "added_draft",
			content: {
				"id": 3,
				"conversation_id": 30,
				"mime_type": "testmime3",
				"data": "test3"
			}
		})));

		api
		.post('/drafts/add')
		.send({
			"account_id": accountId,
			"drafts": [
				{
					"device_id": 1,
					"device_conversation_id": 10,
					"mime_type": "testmime",
					"data": "test"
				},
				{
					"device_id": 2,
					"device_conversation_id": 20,
					"mime_type": "testmime2",
					"data": "test2"
				},
				{
					"device_id": 3,
					"device_conversation_id": 30,
					"mime_type": "testmime3",
					"data": "test3"
				}
			]
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Update draft", function (done) {
		expectMsg(accountId, {
			operation: "replaced_drafts",
			content: {
				"id": 1,
				"conversation_id": 10,
				"mime_type": "testmime",
				"data": "newtest"
			}
		});

		api
		.post('/drafts/update/1')
		.query({
			"account_id": accountId
		})
		.send({
			"data": "newtest"
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});

	it("Update draft (with mime_type)", function (done) {
		expectMsg(accountId, {
			operation: "replaced_drafts",
			content: {
				"id": 2,
				"conversation_id": 20,
				"mime_type": "newmime2",
				"data": "newtest2"
			}
		});

		api
		.post('/drafts/update/2')
		.query({
			"account_id": accountId
		})
		.send({
			"data": "newtest2",
			"mime_type": "newmime2"
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Replace draft", function (done) {
		expectMsg(accountId, {
			operation: "replaced_drafts",
			content: {
				"id": 5,
				"conversation_id": 30,
				"mime_type": "newmime",
				"data": "newtest3"
			}
		});

		/**
		 * Note the mismatch of 20 in the url param and 30 in the body.
		 * Only the value from the body is used! 20 will be unaffected.
		 * By all accounts, they should match anyway... but it's a good test.
		 */
		api
		.post('/drafts/replace/20')
		.query({
			"account_id": accountId
		})
		.send({
			"drafts": [
				{
					"device_id": 5,
					"device_conversation_id": 30,
					"data": "newtest3",
					"mime_type": "newmime"
				}
			]
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Get drafts", function (done) {
		api
		.get('/drafts')
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, [
				{
					"id": res.body[0].id,
					"account_id": accountId,
					"device_id": 5,
					"device_conversation_id": 30,
					"mime_type": "newmime",
					"data": "newtest3"
				},
				{
					"id": res.body[1].id,
					"account_id": accountId,
					"device_id": 2,
					"device_conversation_id": 20,
					"mime_type": "newmime2",
					"data": "newtest2"
				},
				{
					"id": res.body[2].id,
					"account_id": accountId,
					"device_id": 1,
					"device_conversation_id": 10,
					"mime_type": "testmime",
					"data": "newtest"
				}
			]);
			done();
		});
	});
	
	it("Get draft by conversation id", function (done) {
		api
		.get('/drafts/10')
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, [
				{
					"id": res.body[0].id,
					"account_id": accountId,
					"device_id": 1,
					"device_conversation_id": 10,
					"mime_type": "testmime",
					"data": "newtest"
				}
			]);
			done();
		});
	});
	
	it("Remove draft", function (done) {
		// TODO: Add a test without android_device
		expectMsg(accountId, {
			operation: "removed_drafts",
			content: {
				"id": 30,
				"android_device": "2"
			}
		});

		api
		.post('/drafts/remove/30')
		.query({
			"account_id": accountId,
			"android_device": 2
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Add scheduled messages", function (done) {
		expectMsg(accountId, {
			operation: "added_scheduled_message",
			content: {
				"id": 1,
				"to": "666",
				"data": "testdata",
				"mime_type": "testmime",
				"timestamp": 12345,
				"title": "title",
				"repeat": 1
			}
		}, () => expectMsg(accountId, {
			operation: "added_scheduled_message",
			content: {
				"id": 2,
				"to": "777,333",
				"data": "testdata2",
				"mime_type": "testmime2",
				"timestamp": 123456,
				"title": "title2",
				"repeat": 2
			}
		}));

		api
		.post('/scheduled_messages/add')
		.send({
			"account_id": accountId,
			"scheduled_messages": [
				{
					"device_id": 1,
					"to": "666",
					"data": "testdata",
					"mime_type": "testmime",
					"timestamp": 12345,
					"title": "title",
					"repeat": 1
				},
				{
					"device_id": 2,
					"to": "777,333",
					"data": "testdata2",
					"mime_type": "testmime2",
					"timestamp": 123456,
					"title": "title2",
					"repeat": 2
				}
			]
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Update scheduled message", function (done) {
		expectMsg(accountId, {
			operation: "updated_scheduled_message",
			content: {
				"id": 1,
				"to": "888",
				"data": "newdata",
				"mime_type": "newmime",
				"timestamp": 12345,
				"title": "title",
				"repeat": 1
			}
		});

		api
		.post('/scheduled_messages/update/1')
		.query({
			"account_id": accountId
		})
		.send({
			"to": "888",
			"data": "newdata",
			"mime_type": "newmime"
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});

	it("Update scheduled message with other optional properties", function (done) {
		expectMsg(accountId, {
			operation: "updated_scheduled_message",
			content: {
				"id": 2,
				"to": "777,333",
				"data": "testdata2",
				"mime_type": "testmime2",
				"timestamp": 654321,
				"title": "newtitle",
				"repeat": 22
			}
		});
		
		api
		.post('/scheduled_messages/update/2')
		.query({
			"account_id": accountId
		})
		.send({
			"timestamp": 654321,
			"title": "newtitle",
			"repeat": 22
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Get scheduled messages", function (done) {
		api
		.get('/scheduled_messages')
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, [
				{
					"id": res.body[0].id,
					"account_id": accountId,
					"device_id": 2,
					"to": "777,333",
					"data": "testdata2",
					"mime_type": "testmime2",
					"timestamp": 654321,
					"title": "newtitle",
					"repeat": 22
				},
				{
					"id": res.body[1].id,
					"account_id": accountId,
					"device_id": 1,
					"to": "888",
					"data": "newdata",
					"mime_type": "newmime",
					"timestamp": 12345,
					"title": "title",
					"repeat": 1
				}
			]);
			done();
		});
	});
	
	it("Remove scheduled message", function (done) {
		expectMsg(accountId, {
			operation: "removed_scheduled_message",
			content: {
				"id": 1
			}
		});

		api
		.post('/scheduled_messages/remove/1')
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Add templates", function (done) {
		expectMsg(accountId, {
			operation: "added_template",
			content: {
				"device_id": 1,
				"text": "testtext"
			}
		}, () => expectMsg(accountId, {
			operation: "added_template",
			content: {
				"device_id": 2,
				"text": "testtext2"
			}
		}));

		api
		.post('/templates/add')
		.send({
			"account_id": accountId,
			"templates": [
				{
					"device_id": 1,
					"text": "testtext"
				},
				{
					"device_id": 2,
					"text": "testtext2"
				}
			]
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Update template", function (done) {
		expectMsg(accountId, {
			operation: "updated_template",
			content: {
				"device_id": 1,
				"text": "newtext"
			}
		});

		api
		.post('/templates/update/1')
		.query({
			"account_id": accountId
		})
		.send({
			"text": "newtext"
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	

	it("Get templates", function (done) {
		api
		.get('/templates')
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, [
				{
					"device_id": 1,
					"text": "newtext"
				},
				{
					"device_id": 2,
					"text": "testtext2"
				}
			]);
			done();
		});
	});
	
	it("Remove template", function (done) {
		expectMsg(accountId, {
			operation: "removed_template",
			content: {
				"id": 1
			}
		})

		api
		.post('/templates/remove/1')
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Add media", function (done) {
		api
		.post('/media/add')
		.query({
			"account_id": accountId
		})
		.send({
			"message_id": 1,
			"data": "MYFILE"
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Get media", function (done) {
		api
		.get('/media/1')
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {
				"data": "MYFILE"
			});
			done();
		});
	});
	
	it("Cleanup conversation messages", function (done) {
		expectMsg(accountId, {
			operation: "cleanup_conversation_messages",
			content: {
				"timestamp": 3000,
				"conversation_id": "20"
			}
		});

		api
		.post('/conversations/cleanup_messages')
		.query({
			"account_id": accountId,
			"conversation_id": 20,
			"timestamp": 3000
			
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Clean up messages", function (done) {
		expectMsg(accountId, {
			operation: "cleanup_messages",
			content: {
				"timestamp": 1000
			}
		});

		api
		.post('/messages/cleanup')
		.query({
			"account_id": accountId,
			"timestamp": 1000
			
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	// This removes the draft as well!
	it("Remove conversation", function (done) {
		expectMsg(accountId, {
			operation: "removed_conversation",
			content: {
				"id": 10
			}
		});

		api
		.post('/conversations/remove/10')
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});

	it("Dismissed notification", function (done) {
		expectMsg(accountId, {
			operation: "dismissed_notification",
			content: {
				id: "1"
			}
		});

		api
		.post('/accounts/dismissed_notification')
		.query({
			"account_id": accountId,
			"id": 1
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});

	it("Dismissed notification with device_id", function (done) {
		expectMsg(accountId, {
			operation: "dismissed_notification",
			content: {
				"id": "1",
				"device_id": "3"
			}
		});
		
		api
		.post('/accounts/dismissed_notification')
		.query({
			"account_id": accountId,
			"id": 1,
			"device_id": 3
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Account stats", function (done) {
		api
		.get('/accounts/count')
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {
				device_count: 1,
				message_count: 0,
				conversation_count: 2,
				draft_count: 1, // Draft 20 remains due to how url params are ignored in drafts/replace
				scheduled_count: 1,
				blacklist_count: 2,
				contact_count: 0,
				template_count: 1,
				folder_count: 1,
				auto_reply_count: 1
			});
			done();
		});
	});

	it("Clean account", function (done) {
		expectMsg(accountId, {
			operation: 'cleaned_account',
			content: {
				id: accountId
			}
		});

		api
		.post('/accounts/clean_account')
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});
	
	it("Account stats after cleaning", function (done) {
		api
		.get('/accounts/count')
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {
				device_count: 1,
				message_count: 0,
				conversation_count: 0,
				draft_count: 0,
				scheduled_count: 0,
				blacklist_count: 0,
				contact_count: 0,
				template_count: 0,
				folder_count: 0,
				auto_reply_count: 0
			});
			done();
		});
	});

	it("Delete account", function (done) {
		expectMsg(accountId, {
			operation: "removed_account",
			content: {
				"id": accountId
			}
		});

		api
		.post('/accounts/remove_account')
		.query({
			"account_id": accountId
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function (err,res) {
			res.status.should.equal(200);
			assert.deepStrictEqual(res.body, {});
			done();
		});
	});

	it("should return 404",function(done){
		api
		.get("/shouldfail")
		.expect(404)
		.end(function(err,res){
			res.status.should.equal(404);
			done();
		});
	});

	it("All mqtt messages received",function(done){
		// All messages received
		msgCount.should.equal(75);
		done();
	});

	it("All mqtt messages tested",function(done){
		// All messages tested
		msgTested.should.equal(msgCount);
		done();
	});

	it("should close mqtt socket",function(done){
		mqttTestClose(function (successful) {
			successful.should.equal(true);
			done();
		})
	});

	/**
	 * Delete the dummy account
	 */
	deleteDummyAccount();

	/**
	 * All counts should be zero for dummy account after deletion
	 */
	postDeleteDummyCounts();

	/**
	 * Delete the gotify test application
	 */
	deleteUnifiedPushApp();
}); 
