import { agent } from 'supertest';
import * as assert from 'assert';
import { init as mqttTestInit, expectMsg } from './mqtt-test.js'


/**
 *
 * The point of this is to add data from a second dummy account.
 * When we run the gets for the real account, we shouldn't see any data from this one.
 * At the end, we initialize the mqtt tester. Messages sent as a result of this file are ignored.
 */


// This agent refers to PORT where program is runninng.
const api = agent("http://localhost:5000/api/v1");

let accountId = '';

let testAccountUsername = 'test2@email.com'

// Password is 'tester', this is the SHA256 hash
// The password is hashed on the client and again on the server to maintain perfect secrecy
let testAccountPassword = '9bba5c53a0545e0c80184b946153c9f58387e3bd1d4ee35740f29ac2e718b019'


export function deleteDummyAccount () {
	it("Delete dummy account", function (done) {
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
}


export function postDeleteDummyCounts () {
	it("Check counts for dummy account after deleting", function (done) {
		api
		.get('/accounts/count')
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
}


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

	it("Create new user", function (done) {
		api
		.post('/accounts/signup')
		.send({
			"name": testAccountUsername,
			// Password is 'tester', this is the SHA256 hash
			"password": testAccountPassword,
			"phone_number": "5555555555",
			"real_name": "testname",
			"push_url": "gotify1.unifiedpush.org"
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
				"push_url": "gotify1.unifiedpush.org"
			  });
			console.log('\n', "Account ID: ", res.body.account_id, '\n');
			done();
		});
	});


	it("Add auto replies", function (done) {
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


	it("Add blacklist", function (done) {
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

	it("Add folders", function (done) {
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

	it("Add contacts", function (done) {
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

	it("Add conversations", function (done) {
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

	it("Add messages", function (done) {
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

	it("Add drafts", function (done) {
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

	it("Add scheduled messages", function (done) {
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

	it("Add templates", function (done) {
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

	it("Account stats for dummy account", function (done) {
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
				device_count: 2,
				message_count: 3,
				conversation_count: 4,
				draft_count: 3,
				scheduled_count: 2,
				blacklist_count: 3,
				contact_count: 4,
				template_count: 2,
				folder_count: 2,
				auto_reply_count: 2
			});
			done();
		});
	});

	it("Initialize mqtt tester", function (done) {
		mqttTestInit((successful) => {
			successful.should.equal(true);
			done()
		});
	});

});
