var supertest = require("supertest");
var should = require("should");

// This starts the server and gets the urls object
const { urls, server } = require("../server");

// This agent refers to PORT where program is runninng.
var api = supertest.agent(urls.api + "/api/v1");

// UNIT test begin

var accountId = '';
var contactsToRemove = [];


function delay(interval) {
   return it('should delay', done => 
   {
      setTimeout(() => done(), interval)

   }).timeout(interval + 100) // The extra 100ms should guarantee the test will not fail due to exceeded timeout
}

console.log("Dont forget to run this in another terminal: wscat -c " + urls.websocket + "/api/v1/stream?account_id=test");

describe("heart-sms-backend unit test", function () {

    it("Create new user", function (done) {
        api
        .post('/accounts/signup')
        .send({
            "name": "test@email.com",
            "password": "tester",
            "phone_number": "5555555555",
            "real_name": "testname"
        })
        .expect("Content-type",/json/)
        .expect(200)
        .end(function (err,res) {
            res.status.should.equal(200);
            done();
        });
    });
    
    it("Log in", function (done) {
        api
        .post('/accounts/login')
        .send({
            "username": "test@email.com",
            "password": "tester"
        })
        .expect("Content-type",/json/)
        .expect(200)
        .end(function (err,res) {
            res.status.should.equal(200);
            res.body.should.have.property('account_id');
            res.body.should.have.property('salt2');
            accountId = res.body.account_id;
            console.log('\n', "Account ID: ", accountId, '\n');
            done();
        });
    });
    
    console.log("Waiting to give you time to open a websocket connection...");
    delay(8000);
    
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
            res.body.should.have.property('base_theme');
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
            "type": "updatedtype",
            "pattern": "updatedpattern",
            "response": "updatedtest"
        })
        .expect("Content-type",/json/)
        .expect(200)
        .end(function (err,res) {
            res.status.should.equal(200);
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
            res.body.should.have.lengthOf(2);
            res.body[0].response.should.equal('updatedtest');
            res.body[0].pattern.should.equal('updatedpattern');
            res.body[1].response.should.equal('test2');
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
            res.body.should.have.lengthOf(2);
            res.body[0].phrase.should.equal('testphrase');
            res.body[1].phrase.should.equal('testphrase2');
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
            res.body.should.have.lengthOf(2);
            res.body[0].primary.should.equal(false);
            res.body[0].name.should.equal("test");
            res.body[0].fcm_token.should.equal("newtoken");
            res.body[1].primary.should.equal(true);
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
            "color_dark": 6,
            "color_light": 6,
            "color_accent": 6
        })
        .expect("Content-type",/json/)
        .expect(200)
        .end(function (err,res) {
            res.status.should.equal(200);
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
            res.body.should.have.lengthOf(2);
            res.body[0].name.should.equal("newfolder");
            res.body[0].color.should.equal(5);
            res.body[0].color_dark.should.equal(6);
            res.body[1].name.should.equal("foldername2");
            res.body[1].color.should.equal(6);
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
            res.body.should.have.lengthOf(3);
            res.body[0].name.should.equal("newname");
            res.body[0].phone_number.should.equal("123");
            res.body[1].name.should.equal("name2");
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
            res.body.should.have.lengthOf(1);
            res.body[0].device_id.should.equal(1);
            res.body[0].phone_number.should.equal("123");
            res.body[0].contact_type.should.equal(3);
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
            res.body.should.have.lengthOf(3);
            res.body[0].device_id.should.equal(20);
            res.body[0].archive.should.equal(false);
            res.body[0].folder_id.should.equal(-1);
            res.body[0].snippet.should.equal('updatedsnippet');
            res.body[0].timestamp.should.equal(1008);
            res.body[0].title.should.equal('updatedtitle');
            res.body[1].device_id.should.equal(30);
            res.body[1].archive.should.equal(true);
            res.body[2].device_id.should.equal(10);
            res.body[2].title.should.equal('newtitle');
            res.body[2].ringtone.should.equal('newringer');
            res.body[2].mute.should.equal(true);
            res.body[2].folder_id.should.equal(2);
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
            res.body.title.should.equal('newtitle');
            res.body.ringtone.should.equal('newringer');
            res.body.mute.should.equal(true);
            res.body.folder_id.should.equal(2);
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
            res.body.should.have.lengthOf(1);
            res.body[0].title.should.equal('newtitle');
            res.body[0].ringtone.should.equal('newringer');
            res.body[0].mute.should.equal(true);
            res.body[0].folder_id.should.equal(2);
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
            res.body.should.have.lengthOf(1);
            res.body[0].archive.should.equal(true);
            res.body[0].device_id.should.equal(30);
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
            res.body.should.have.lengthOf(1);
            res.body[0].archive.should.equal(false);
            res.body[0].private_notifications.should.equal(true);
            res.body[0].folder_id.should.equal(-1);
            res.body[0].snippet.should.equal('updatedsnippet');
            res.body[0].timestamp.should.equal(1008);
            res.body[0].title.should.equal('updatedtitle');
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
            res.body.should.have.lengthOf(1);
            res.body[0].private_notifications.should.equal(false);
            res.body[0].archive.should.equal(false);
            res.body[0].title.should.equal('newtitle');
            res.body[0].ringtone.should.equal('newringer');
            res.body[0].mute.should.equal(true);
            res.body[0].folder_id.should.equal(2);
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
            "type": 4,
            "timestamp": 500,
            "read": true,
            "seen": true
        })
        .expect("Content-type",/json/)
        .expect(200)
        .end(function (err,res) {
            res.status.should.equal(200);
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
            res.body.should.have.lengthOf(3);
            res.body[0].seen.should.equal(true);
            res.body[1].read.should.equal(false);
            res.body[1].seen.should.equal(true);
            res.body[1].message_type.should.equal(7);
            res.body[2].timestamp.should.equal(500);
            res.body[2].read.should.equal(true);
            res.body[2].seen.should.equal(true);
            res.body[2].message_type.should.equal(4);
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
            done();
        });
    });
    
    it("Replace draft", function (done) {
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
                    "data": "newtest2",
                    "mime_type": "newmime"
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
            res.body.should.have.lengthOf(3);
            res.body[0].data.should.equal('newtest');
            res.body[1].device_id.should.equal(5);
            res.body[1].device_conversation_id.should.equal(30);
            res.body[1].data.should.equal("newtest2");
            res.body[1].mime_type.should.equal("newmime");
            res.body[2].data.should.equal("test3");
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
            res.body.should.have.lengthOf(1);
            res.body[0].data.should.equal('newtest');
            res.body[0].device_conversation_id.should.equal(10);
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
            res.body.draft_count.should.equal(0);
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
