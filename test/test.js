var supertest = require("supertest");
var should = require("should");

// This agent refers to PORT where program is runninng.

var server = supertest.agent("http://localhost:5000/api/v1");

// UNIT test begin

var accountId = '';

describe("heart-sms-backend unit test", function () {

    it("Create new user", function (done) {
        server
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
        server
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
    
    it("Account settings", function (done) {
        server
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
        server
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
        server
        .post('/auto_replies/update/1')
        .query({
            "account_id": accountId
        })
        .send({
            "type": "updatedtype",
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
        server
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
            res.body[1].response.should.equal('test2');
            done();
        });
    });
    
    it("Remove auto reply", function (done) {
        server
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
        server
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
        server
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
        server
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
        server
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
        server
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
        server
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
        server
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
        server
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
        server
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
        server
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
        server
        .post('/folders/update/1')
        .query({
            "account_id": accountId
        })
        .send({
            "name": "newfolder",
            "color": 5
        })
        .expect("Content-type",/json/)
        .expect(200)
        .end(function (err,res) {
            res.status.should.equal(200);
            done();
        });
    });
    
    it("Get folders", function (done) {
        server
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
        server
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
    
    it("Add conversations", function (done) {
        server
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
        server
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
        server
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
        server
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
        server
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
    
    it("Update conversation seen", function (done) {
        server
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
        server
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
    
    it("Update conversation archive", function (done) {
        server
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
        server
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
        server
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
        server
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
        server
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
        server
        .get('/conversations')
        .query({
            "account_id": accountId
        })
        .expect("Content-type",/json/)
        .expect(200)
        .end(function (err,res) {
            res.status.should.equal(200);
            res.body.should.have.lengthOf(3);
            res.body[0].title.should.equal('newtitle');
            res.body[0].ringtone.should.equal('newringer');
            res.body[0].mute.should.equal(true);
            res.body[0].folder_id.should.equal(2);
            res.body[1].archive.should.equal(false);
            res.body[1].folder_id.should.equal(-1);
            res.body[1].snippet.should.equal('updatedsnippet');
            res.body[1].timestamp.should.equal(1008);
            res.body[1].title.should.equal('updatedtitle');
            res.body[2].archive.should.equal(true);
            done();
        });
    });
    
    it("Add drafts", function (done) {
        server
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
        server
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
        server
        .post('/drafts/replace/20')
        .query({
            "account_id": accountId
        })
        .send({
            "drafts": [
                {
                    "device_id": 5,
                    "device_conversation_id": 30,
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
        server
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
            res.body[1].mime_type.should.equal("newmime");
            res.body[2].data.should.equal("test3");
            done();
        });
    });
    
    it("Remove draft", function (done) {
        server
        .post('/drafts/remove/30')
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
    
    it("Add scheduled messages", function (done) {
        server
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
        server
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
        server
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
        server
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
        server
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
        server
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
        server
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
        server
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
    
    it("Remove conversation", function (done) {
        server
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
        server
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
        server
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
        server
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
        server
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
        server
        .get("/random")
        .expect(404)
        .end(function(err,res){
            res.status.should.equal(404);
            done();
        });
    });
}); 
