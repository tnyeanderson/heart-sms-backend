import { agent } from "supertest";
import should from "should";

// This starts the server and gets the urls object
//const { urls, server } = require("../server");

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
     * Test creating user without required params
     */
    let required = ['name', 'password', 'phone_number', 'real_name'];
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
    })
    
});