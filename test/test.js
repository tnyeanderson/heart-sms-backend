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
            res.body.conversation_count.should.equal(0);
            res.body.draft_count.should.equal(0);
            res.body.scheduled_count.should.equal(0);
            res.body.blacklist_count.should.equal(1);
            res.body.contact_count.should.equal(0);
            res.body.template_count.should.equal(0);
            res.body.folder_count.should.equal(0);
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
