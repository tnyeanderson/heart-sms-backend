var express = require('express');
var app = express();
var router = express.Router();
var cors = require('cors');


function getUrl (path) {
    return '/api/v1' + path;
}


// Import Controllers
var controllers = require('require-all')(__dirname + '/controllers');

// Allow cross-site requests
app.use(cors());

// Parse JSON in request body
app.use(express.json())

// Define routes to controllers
app.use(getUrl('/accounts'),           controllers.AccountsController);
app.use(getUrl('/activate'),           controllers.ActivateController);
app.use(getUrl('/article'),            controllers.ArticleController);
app.use(getUrl('/auto_replies'),       controllers.AutoRepliesController);
app.use(getUrl('/blacklists'),         controllers.BlacklistsController);
app.use(getUrl('/contacts'),           controllers.ContactsController);
app.use(getUrl('/conversations'),      controllers.ConversationsController);
app.use(getUrl('/devices'),            controllers.DevicesController);
app.use(getUrl('/drafts'),             controllers.DraftsController);
app.use(getUrl('/folders'),            controllers.FoldersController);
app.use(getUrl('/media'),              controllers.MediaController);
app.use(getUrl('/messages'),           controllers.MessagesController);
app.use(getUrl('/mqtt'),               controllers.MQTTController);
app.use(getUrl('/purchases'),          controllers.PurchasesController);
app.use(getUrl('/scheduled_messages'), controllers.ScheduledMessagesController);
app.use(getUrl('/templates'),          controllers.TemplatesController);


module.exports = app;
 
