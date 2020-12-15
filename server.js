var express = require('express');
var app = express();
var router = express.Router();
var cors = require('cors');
var port = process.env.port || 5000;
var wsPort = process.env.wsPort || 5050;

var apiBaseUrl = '/api/v1';

function getUrl (path) {
    return apiBaseUrl + path;
}


// Import Controllers
var controllers = require('require-all')(__dirname + '/controllers');

// Allow cross-site requests
app.use(cors());


// Set up websockets
controllers.StreamController.init(wsPort);

// Parse JSON in request body
app.use(express.json())

// Define routes to controllers
app.use(getUrl('/accounts'),           controllers.AccountsController);
app.use(getUrl('/activate'),           controllers.ActivateController);
app.use(getUrl('/auto_replies'),       controllers.AutoRepliesController);
app.use(getUrl('/blacklists'),         controllers.BlacklistsController);
app.use(getUrl('/contacts'),           controllers.ContactsController);
app.use(getUrl('/conversations'),      controllers.ConversationsController);
app.use(getUrl('/devices'),            controllers.DevicesController);
app.use(getUrl('/drafts'),             controllers.DraftsController);
app.use(getUrl('/folders'),            controllers.FoldersController);
app.use(getUrl('/media'),              controllers.MediaController);
app.use(getUrl('/messages'),           controllers.MessagesController);
app.use(getUrl('/purchases'),          controllers.PurchasesController);
app.use(getUrl('/scheduled_messages'), controllers.ScheduledMessagesController);
//app.use(getUrl('/stream'),             controllers.StreamController);
app.use(getUrl('/templates'),          controllers.TemplatesController);


app.listen(port, function () {
    console.log("Server running on port " + port);
});
