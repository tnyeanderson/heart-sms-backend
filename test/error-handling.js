import { agent } from "supertest";
import should from "should";

// This starts the server and gets the urls object
//const { urls, server } = require("../server");

// This will be used to store required params to test that missing params is being thrown
let required;

// Endpoints for which an account_id is required
let accountIdRequiredEndpoints = {
    get: [
        '/accounts/count',
        '/accounts/settings',
        '/auto_replies'
    ],
    post: [
        '/accounts/remove_account',
        '/accounts/dismissed_notification',
        '/accounts/update_setting',
        '/accounts/clean_account',
        '/accounts/update_subscription'
    ]
};

// This agent refers to PORT where program is runninng.
const api = agent("http://localhost:5000/api/v1");

let accountId = '';
let contactsToRemove = [];


function delay(interval = 3000) {
   return it('should delay', done => 
   {
      setTimeout(() => done(), interval)

   }).timeout(interval + 100) // The extra 100ms should guarantee the test will not fail due to exceeded timeout
}

// UNIT test begin

describe("heart-sms-backend error handling tests", function () {
    /**
     * Test GET endpoints that require an account_id
     */ 
    accountIdRequiredEndpoints.get.forEach(function (endpoint) {
        it(`Fail to GET ${endpoint} without account_id`, function (done) {
            api
            .get(endpoint)
            .expect("Content-type",/json/)
            .expect(200)
            .end(function (err,res) {
                res.status.should.equal(400);
                res.body.error.should.equal('missing required parameter account_id');
                done();
            });
        });
    });

    /**
     * Test POST endpoints that require an account_id
     */ 
    accountIdRequiredEndpoints.post.forEach(function (endpoint) {
        it(`Fail to POST ${endpoint} without account_id`, function (done) {
            api
            .post(endpoint)
            .send({})
            .expect("Content-type",/json/)
            .expect(200)
            .end(function (err,res) {
                res.status.should.equal(400);
                res.body.error.should.equal('missing required parameter account_id');
                done();
            });
        });
    })


    /**
     * Test creating user without required params
     */
    required = ['name', 'password', 'phone_number', 'real_name'];
    required.forEach(function (toBeEmpty) {
        let body = {
            "name": "shouldfail",
            "password": "shouldfail",
            "phone_number": "shouldfail",
            "real_name": "shouldfail"
        };
        body[toBeEmpty] = "";
        it(`Fail to create new user without ${toBeEmpty}`, function (done) {
            api
            .post('/accounts/signup')
            .send(body)
            .expect("Content-type",/json/)
            .expect(200)
            .end(function (err,res) {
                res.status.should.equal(400);
                res.body.error.should.equal(`missing required parameter ${toBeEmpty}`);
                done();
            });
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
            res.body.error.should.equal('username is not allowed');
            done();
        });
    });


    /**
     * Test logging in without required params
     */
    required = ['username', 'password'];
    required.forEach(function (toBeEmpty) {
        let body = {
            "username": "shouldfail",
            "password": "shouldfail"
        };
        body[toBeEmpty] = "";
        it(`Fail to log in without ${toBeEmpty}`, function (done) {
            api
            .post('/accounts/login')
            .send(body)
            .expect("Content-type",/json/)
            .expect(200)
            .end(function (err,res) {
                res.status.should.equal(400);
                res.body.error.should.equal(`missing required parameter ${toBeEmpty}`);
                done();
            });
        });
    });

    /**
     * Test updating account setting without required params
     */
    required = ['pref', 'type', 'value'];
    required.forEach(function (toBeEmpty) {
        let body = {
            "account_id": "shouldfail",
            "pref": "shouldfail",
            "type": "shouldfail",
            "value": "shouldfail"
        };
        body[toBeEmpty] = "";
        it(`Fail to update account setting without ${toBeEmpty}`, function (done) {
            api
            .post('/accounts/update_setting')
            .send(body)
            .expect("Content-type",/json/)
            .expect(200)
            .end(function (err,res) {
                res.status.should.equal(400);
                res.body.error.should.equal(`missing required parameter ${toBeEmpty}`);
                done();
            });
        });
    });
    
    

    it(`Fail to get article without required parameter: url`, function (done) {
        api
        .get('/article')
        .send()
        .expect("Content-type",/json/)
        .expect(200)
        .end(function (err,res) {
            res.status.should.equal(400);
            res.body.error.should.equal('missing required parameter url');
            done();
        });
    });
});