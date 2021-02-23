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
        '/auto_replies',
        '/blacklists',
        '/contacts',
        '/contacts/simple',
        '/conversations',
        '/conversations/index_archived',
        '/conversations/index_private',
        '/conversations/index_public_archived',
        '/conversations/index_public_unread',
        '/conversations/1',
        '/conversations/folder/1',
        '/devices'
    ],
    post: [
        '/accounts/remove_account',
        '/accounts/clean_account',
        '/accounts/update_subscription',
        '/auto_replies/remove/1',
        '/blacklists/remove/1',
        '/contacts/clear',
        '/contacts/remove_ids/1',
        '/conversations/remove/1',
        '/conversations/read/1',
        '/conversations/seen/1',
        '/conversations/archive/1',
        '/conversations/unarchive/1',
        '/conversations/remove_from_folder/1',
        '/devices/remove/1',
        
    ]
};

let requiredPropEndpoints = [
    {
        path: '/accounts/signup',
        props: ['name', 'password', 'phone_number', 'real_name']
    },
    {
        path: '/accounts/login',
        props: ['username', 'password']
    },
    {
        path: '/accounts/update_setting',
        props: ['account_id', 'pref', 'type', 'value']
    },
    {
        path: '/accounts/dismissed_notification',
        props: ['account_id', 'id']
    },
    {
        method: 'GET',
        path: '/article',
        props: ['url']
    },
    {
        path: '/auto_replies/update/1',
        props: ['account_id', 'reply_type', 'pattern', 'response']
    },
    {
        path: '/contacts/update_device_id',
        props: ['account_id', 'device_id'],
        atLeastOneOther: 'phone_number'
    },
    {
        path: '/contacts/remove_device_id',
        props: ['account_id', 'phone_number', 'device_id']
    },
    {
        path: '/conversations/update/1',
        props: ['account_id'],
        atLeastOneOther: 'color'
    },
    {
        path: '/conversations/update_snippet/1',
        props: ['account_id'],
        atLeastOneOther: 'read'
    },
    {
        path: '/conversations/update_title/1',
        props: ['account_id', 'title']
    },
    {
        path: '/conversations/add_to_folder/1',
        props: ['account_id', 'folder_id']
    },
    {
        path: '/conversations/cleanup_messages',
        props: ['account_id', 'conversation_id', 'timestamp']
    },
    {
        path: '/devices/update/1',
        props: ['account_id'],
        atLeastOneOther: 'fcm_token'
    },
    {
        path: '/devices/update_primary',
        props: ['account_id', 'new_primary_device_id']
    },
]

/**
 * Endpoints which require a list of items (/add requests)
 * Since these all require an account_id, there is no need to list it explicitly
 */
let itemsRequiredEndpoints = [
    {
        path: '/auto_replies/add',
        prop: 'auto_replies',
        itemProps: ['reply_type', 'pattern', 'response', 'device_id']
    },
    {
        path: '/blacklists/add',
        prop: 'blacklists',
        itemProps: ['device_id'],
        atLeastOneOther: 'phone_number'
    },
    {
        path: '/contacts/add',
        prop: 'contacts',
        itemProps: ['device_id', 'phone_number', 'id_matcher', 'name', 'color', 'color_dark', 'color_light', 'color_accent', 'contact_type']
    },
    {
        path: '/conversations/add',
        prop: 'conversations',
        itemProps: ['device_id', 'folder_id', 'color', 'color_dark', 'color_light', 'color_accent', 'led_color', 'pinned', 'read', 'timestamp', 'title', 'phone_numbers', 'snippet', 'id_matcher', 'mute', 'archive', 'private_notifications']
    },
    {
        path: '/devices/add',
        prop: 'device',
        itemProps: ['id', 'info', 'name', 'primary', 'fcm_token']
    }
    //['/drafts/add', 'drafts'],
    //['/folders/add', 'folders'],
    //['/messages/add', 'messages'],
    //['/scheduled_messages/add', 'scheduled_messages'],
    //['/templates/add', 'templates'],
]

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
    });


    /**
     * Test endpoints that require an certain fields
     */ 
    requiredPropEndpoints.forEach(function (endpoint) {
        let method = endpoint.method || 'POST';

        if (endpoint.atLeastOneOther) {
            // Even if all of the required params are provided, at least one other is too
            let body = {};

            // Set all the body properties to 'shouldfail'
            endpoint.props.forEach((prop) => {
                body[prop] = 'shouldfail';
            });

            // Run the test
            it(`Fail to ${method} to ${endpoint.path} without at least one optional property`, function (done) {
                let tester;

                if (method === 'GET') {
                    tester = api.get(endpoint.path);
                } else {
                    tester = api.post(endpoint.path);
                }
                
                tester
                .send(body)
                .expect("Content-type",/json/)
                .expect(200)
                .end(function (err,res) {
                    res.status.should.equal(400);
                    res.body.error.should.equal('missing required parameter ');
                    done();
                });
            });
        }

        endpoint.props.forEach(function (toBeEmpty) {
            let body = {};

            // Set all the body properties to 'shouldfail'
            endpoint.props.forEach((prop) => {
                body[prop] = 'shouldfail';
            });

            // Override the property being tested with an empty value
            body[toBeEmpty] = '';

            // Run the test
            it(`Fail to ${method} to ${endpoint.path} without ${toBeEmpty}`, function (done) {
                let tester;

                if (method === 'GET') {
                    tester = api.get(endpoint.path);
                } else {
                    tester = api.post(endpoint.path);
                }
                
                tester
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
    });



    /**
     * Test POST endpoints that require an items field
     */ 
    itemsRequiredEndpoints.forEach(function (endpoint) {
        it(`Fail to POST ${endpoint.path} without items ${endpoint.prop}`, function (done) {
            api
            .post(endpoint.path)
            .send({
                account_id: 'should-fail'
            })
            .expect("Content-type",/json/)
            .expect(200)
            .end(function (err,res) {
                res.status.should.equal(400);
                res.body.error.should.equal(`missing required parameter ${endpoint.prop}`);
                done();
            });
        });

        it(`Fail to POST ${endpoint.path} without account_id`, function (done) {
            let body = {};
            let item = {};

            // Create the items property in the body
            body[endpoint.prop] = [];

            // Set all the item properties to 'shouldfail'
            endpoint.itemProps.forEach((prop) => {
                item[prop] = 'shouldfail';
            });

            if (endpoint.atLeastOneOther) {
                item[endpoint.atLeastOneOther] = 'shouldfail';
            }

            // Add the item to the item properties of the body
            body[endpoint.prop].push(item);

            // devices/add is a special case because it is not sent in an array
            if (endpoint.prop === 'device') {
                // Don't wrap item in an array, device is singular here!
                body[endpoint.prop] = item;
            }
            
            api
            .post(endpoint.path)
            .send(body)
            .expect("Content-type",/json/)
            .expect(200)
            .end(function (err,res) {
                res.status.should.equal(400);
                res.body.error.should.equal(`missing required parameter account_id`);
                done();
            });
        });

        if (endpoint.atLeastOneOther) {
            let body = {};
            let item = {};

            body.account_id = 'shouldfail';

            // Create the items property in the body
            body[endpoint.prop] = [];

            // Set all the item properties to 'shouldfail'
            endpoint.itemProps.forEach((prop) => {
                item[prop] = 'shouldfail';
            });

            // Add the item to the item properties of the body
            body[endpoint.prop].push(item);

            // devices/add is a special case because it is not sent in an array
            if (endpoint.prop === 'device') {
                // Don't wrap item in an array, device is singular here!
                body[endpoint.prop] = item;
            }

            // Run the test
            it(`Fail to POST to ${endpoint.path} without at least one optional property`, function (done) {
                api
                .post(endpoint.path)
                .send(body)
                .expect("Content-type",/json/)
                .expect(200)
                .end(function (err,res) {
                    res.status.should.equal(400);
                    res.body.error.should.equal('missing required parameter ');
                    done();
                });
            });
        }


        endpoint.itemProps.forEach(function (toBeEmpty) {
            let body = {};
            let item = {};

            body.account_id = 'shouldfail';

            // Create the items property in the body
            body[endpoint.prop] = [];

            // Set all the item properties to 'shouldfail'
            endpoint.itemProps.forEach((prop) => {
                item[prop] = 'shouldfail';
            });

            // Override the property being tested with an empty value
            item[toBeEmpty] = '';

            // Add the item to the item properties of the body
            body[endpoint.prop].push(item);

            // devices/add is a special case because it is not sent in an array
            if (endpoint.prop === 'device') {
                // Don't wrap item in an array, device is singular here!
                body[endpoint.prop] = item;
                console.log(body);
            }

            // Run the test
            it(`Fail to POST ${endpoint.path} without ${endpoint.prop} property ${toBeEmpty}`, function (done) {
                api
                .post(endpoint.path)
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
    

});