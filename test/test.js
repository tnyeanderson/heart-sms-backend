import { agent } from 'supertest';
import * as assert from 'assert'

// This starts the server and gets the urls object
//const { urls, server } = require("../server");

// This agent refers to PORT where program is runninng.
const api = agent("http://localhost:5000/api/v1");

let accountId = '';
let contactsToRemove = [];

// Password is 'tester', this is the SHA256 hash
// The password is hashed on the client and again on the server to maintain perfect secrecy
let password = '9bba5c53a0545e0c80184b946153c9f58387e3bd1d4ee35740f29ac2e718b019'


function delay(msg = 'should delay', interval = 3000) {
    return it('should delay', done => 
    {
        console.log(msg);
        setTimeout(() => done(), interval)

    }).timeout(interval + 100) // The extra 100ms should guarantee the test will not fail due to exceeded timeout
}

// UNIT test begin

describe("heart-sms-backend unit test", function () {

    it("Create new user", function (done) {
        api
        .post('/accounts/signup')
        .send({
            "name": "test@email.com",
            // Password is 'tester', this is the SHA256 hash
            "password": password,
            "phone_number": "5555555555",
            "real_name": "testname"
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
            "real_name": "shouldfail"
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
            "name": "test@email.com",
            // Password is 'tester', this is the SHA256 hash
            "password": password,
            "phone_number": "5555555555",
            "real_name": "testname"
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
            "username": "test@email.com",
            "password": password
        }

        api
        .post('/accounts/login')
        .send(body)
        .expect("Content-type",/json/)
        .expect(200)
        .end(function (err,res) {
            res.status.should.equal(200);
            res.body.should.have.property('account_id');
            res.body.should.have.property('salt1');
            res.body.should.have.property('salt2');
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
                "apply_primary_color_to_toolbar": true,
                "passcode": null,
                "message_timestamp": false,
                "conversation_categories": true
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
            "password": password
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
            "username": "test@email.com",
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
            "username": "test@email.com",
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
            "username": "test@email.com",
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
            "username": "test@email.com",
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

    it("MQTT fail acl", function (done) {
        api
        .post('/mqtt/acl')
        .send({
            "username": "bad",
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
        api
        .post('/accounts/update_setting')
        .query({
            "account_id": accountId
        })
        .send({
            "pref": "base_theme",
            "type": "string",
            "value": "dark"
        })
        .expect("Content-type",/json/)
        .expect(200)
        .end(function (err,res) {
            res.status.should.equal(200);
            assert.deepStrictEqual(res.body, {});
            done();
        });
    });

    it("Update account apply_primary_color_to_toolbar boolean setting", function (done) {
        api
        .post('/accounts/update_setting')
        .query({
            "account_id": accountId
        })
        .send({
            "pref": "apply_primary_color_to_toolbar",
            "type": "boolean",
            "value": "false"
        })
        .expect("Content-type",/json/)
        .expect(200)
        .end(function (err,res) {
            res.status.should.equal(200);
            assert.deepStrictEqual(res.body, {});
            done();
        });
    });

    it("Update account color integer setting", function (done) {
        api
        .post('/accounts/update_setting')
        .query({
            "account_id": accountId
        })
        .send({
            "pref": "color",
            "type": "int",
            "value": "123456"
        })
        .expect("Content-type",/json/)
        .expect(200)
        .end(function (err,res) {
            res.status.should.equal(200);
            assert.deepStrictEqual(res.body, {});
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
                "apply_primary_color_to_toolbar": false,
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
        api
        .post('/blacklists/add')
        .send({
            "account_id": accountId,
            "blacklists": [
                {
                    "device_id": 1,
                    "phone_number": "33333",
                    "phrase": "testphrase"
                },
                {
                    "device_id": 2,
                    "phone_number": "44444",
                    "phrase": "testphrase2"
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
                    "phone_number": "33333",
                    "phrase": "testphrase"
                },
                {
                    "id": res.body[1].id,
                    "account_id": accountId,
                    "device_id": 2,
                    "phone_number": "44444",
                    "phrase": "testphrase2"
                }
            ]);
            done();
        });
    });
    
    it("Remove blacklist", function (done) {
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
    
    it("Update device", function (done) {
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
    
    it("Change primary device", function (done) {
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
                    "name": "test2",
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
    
    it("Remove contact", function (done) {
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
                    "phone_number": "123",
                    "name": "newname",
                    "id_matcher": "idmatch1",
                    "color": 456,
                    "color_accent": 456,
                    "contact_type": 3
                },
                {
                    "id": res.body[1].id,
                    "phone_number": "666",
                    "id_matcher": "idmatch2",
                    "name": "name2",
                    "color": 4,
                    "color_accent": 4,
                    "contact_type": 4
                },
                {
                    "id": res.body[2].id,
                    "phone_number": "777",
                    "id_matcher": "idmatch3",
                    "name": "name3",
                    "color": 5,
                    "color_accent": 5,
                    "contact_type": 5
                }
            ]);
            contactsToRemove.push(res.body[1].id);
            contactsToRemove.push(res.body[2].id);
            done();
        });
    });
    
    it("Remove multiple contacts by id", function (done) {
        api
        .post('/contacts/remove_ids/' + contactsToRemove.join(','))
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
        api
        .post('/conversations/add')
        .send({
            "account_id": accountId,
            "conversations": [
                {
                    "account_id": accountId,
                    "device_id": 10,
                    "folder_id": -1,
                    "color": 7,
                    "color_dark": 7,
                    "color_light": 7,
                    "color_accent": 7,
                    "led_color": 8,
                    "pinned": false,
                    "read": true,
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
                    "account_id": accountId,
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
                    "image_uri": "image2",
                    "id_matcher": "match2",
                    "mute": false,
                    "archive": true,
                    "private_notifications": true
                },
                {
                    "account_id": accountId,
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
                    "id_matcher": "match3",
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
    
    it("Update conversation", function (done) {
        api
        .post('/conversations/update/10')
        .query({
            "account_id": accountId
        })
        .send({
            "title": "newtitle",
            "snippet": "newsnippet",
            "ringtone": "newringer",
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
    
    it("Update conversation snippet", function (done) {
        api
        .post('/conversations/update_snippet/20')
        .query({
            "account_id": accountId
        })
        .send({
            "read": true,
            "timestamp": 1008,
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
    
    it("Update conversation read", function (done) {
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
    
    it("Update conversation archive", function (done) {
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
                    "image_uri": "image2",
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
                    "image_uri": null,
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
                    "ringtone": "newringer",
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
                "ringtone": "newringer",
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
                    "ringtone": "newringer",
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
                    "image_uri": null,
                    "mute": false,
                    "archive": true,
                    "private_notifications": false
                }
            ]);
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
                    "image_uri": "image2",
                    "mute": false,
                    "archive": false,
                    "private_notifications": true
                }
            ]);
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
                    "ringtone": "newringer",
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
                    "message_from": "testfrom2",
                    "color": 6,
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
                    "color": 6,
                    "sent_device": 15,
                    "sim_stamp": "teststamp3"
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
    
    it("Update message", function (done) {
        api
        .post('/messages/update/1')
        .query({
            "account_id": accountId
        })
        .send({
            "message_type": 4,
            "timestamp": 500,
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
                    "sent_device": 15,
                    "sim_stamp": "teststamp3"
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
                    "message_from": "testfrom2",
                    "color": 6,
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
    
    it("Remove message", function (done) {
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
    
    it("Replace draft", function (done) {
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
                    "device_id": 1,
                    "device_conversation_id": 10,
                    "mime_type": "testmime",
                    "data": "newtest"
                },
                {
                    "id": res.body[1].id,
                    "account_id": accountId,
                    "device_id": 2,
                    "device_conversation_id": 20,
                    "mime_type": "testmime2",
                    "data": "test2"
                },
                {
                    "id": res.body[2].id,
                    "account_id": accountId,
                    "device_id": 5,
                    "device_conversation_id": 30,
                    "mime_type": "newmime",
                    "data": "newtest3"
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
            done();
        });
    });
    
    it("Update scheduled message", function (done) {
        api
        .post('/scheduled_messages/update/1')
        .query({
            "account_id": accountId
        })
        .send({
            "to": "888",
            "data": "newdata"
        })
        .expect("Content-type",/json/)
        .expect(200)
        .end(function (err,res) {
            res.status.should.equal(200);
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
            res.body.should.have.lengthOf(2);
            res.body[0].to.should.equal("888");
            res.body[0].data.should.equal("newdata");
            res.body[0].mime_type.should.equal("testmime");
            res.body[1].to.should.equal("777,333");
            res.body[1].timestamp.should.equal(123456);
            done();
        });
    });
    
    it("Remove scheduled message", function (done) {
        api
        .post('/scheduled_messages/remove/1')
        .query({
            "account_id": accountId
        })
        .expect("Content-type",/json/)
        .expect(200)
        .end(function (err,res) {
            res.status.should.equal(200);
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
            done();
        });
    });
    
    it("Update template", function (done) {
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
            res.body.should.have.lengthOf(2);
            res.body[0].device_id.should.equal(1);
            res.body[0].text.should.equal("newtext");
            res.body[1].device_id.should.equal(2);
            res.body[1].text.should.equal("testtext2");
            done();
        });
    });
    
    it("Remove template", function (done) {
        api
        .post('/templates/remove/1')
        .query({
            "account_id": accountId
        })
        .expect("Content-type",/json/)
        .expect(200)
        .end(function (err,res) {
            res.status.should.equal(200);
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
            res.body.data.should.equal("MYFILE");
            done();
        });
    });
    
    it("Cleanup conversation messages", function (done) {
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
            done();
        });
    });
    
    it("Clean up messages", function (done) {
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
            done();
        });
    });
    
    // This removes the draft as well!
    it("Remove conversation", function (done) {
        api
        .post('/conversations/remove/10')
        .query({
            "account_id": accountId
        })
        .expect("Content-type",/json/)
        .expect(200)
        .end(function (err,res) {
            res.status.should.equal(200);
            done();
        });
    });

    it("Dismissed notification", function (done) {
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
            Object.keys(res.body).length.should.equal(0);
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
            res.body.device_count.should.equal(1);
            res.body.message_count.should.equal(0);
            res.body.conversation_count.should.equal(2);
            // Draft 20 remains due to how url params are ignored in drafts/replace
            res.body.draft_count.should.equal(1);
            res.body.scheduled_count.should.equal(1);
            res.body.blacklist_count.should.equal(1);
            res.body.contact_count.should.equal(0);
            res.body.template_count.should.equal(1);
            res.body.folder_count.should.equal(1);
            res.body.auto_reply_count.should.equal(1);
            done();
        });
    });

    it("Clean account", function (done) {
        api
        .post('/accounts/clean_account')
        .query({
            "account_id": accountId
        })
        .expect("Content-type",/json/)
        .expect(200)
        .end(function (err,res) {
            res.status.should.equal(200);
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
            res.body.device_count.should.equal(1);
            res.body.message_count.should.equal(0);
            res.body.conversation_count.should.equal(0);
            res.body.draft_count.should.equal(0);
            res.body.scheduled_count.should.equal(0);
            res.body.blacklist_count.should.equal(0);
            res.body.contact_count.should.equal(0);
            res.body.template_count.should.equal(0);
            res.body.folder_count.should.equal(0);
            res.body.auto_reply_count.should.equal(0);
            done();
        });
    });

    it("Delete account", function (done) {
        api
        .post('/accounts/remove_account')
        .query({
            "account_id": accountId
        })
        .expect("Content-type",/json/)
        .expect(200)
        .end(function (err,res) {
            res.status.should.equal(200);
            res.body.should.have.property('success');
            done();
        });
    });

    it("should return 404",function(done){
        api
        .get("/random")
        .expect(404)
        .end(function(err,res){
            res.status.should.equal(404);
            done();
        });
    });
}); 
