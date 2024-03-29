import cors from 'cors';
import express, { json, NextFunction, Request, Response } from 'express';
import 'reflect-metadata';

// Controllers
import AccountsController from './controllers/AccountsController.js';
import ActivateController from './controllers/ActivateController.js';
import ArticleController from './controllers/ArticleController.js';
import AutoRepliesController from './controllers/AutoRepliesController.js';
import BlacklistsController from './controllers/BlacklistsController.js';
import ContactsController from './controllers/ContactsController.js';
import ConversationsController from './controllers/ConversationsController.js';
import DevicesController from './controllers/DevicesController.js';
import DraftsController from './controllers/DraftsController.js';
import FoldersController from './controllers/FoldersController.js';
import MediaController from './controllers/MediaController.js';
import MessagesController from './controllers/MessagesController.js';
import PurchasesController from './controllers/PurchasesController.js';
import ScheduledMessagesController from './controllers/ScheduledMessagesController.js';
import TemplatesController from './controllers/TemplatesController.js';
import { BaseError } from './models/errors/Errors.js';
import { ErrorResponse, UnhandledPathError } from './models/responses/ErrorResponses.js';
import { splash } from './utils/splash.js';

// Show the console splash
splash();

const app = express();

/**
 * Used when defining routes to add the base path to the path
 * @param path top-level api url path (e.g. '/accounts')
 */
function getUrl (path: string) {
	return `/api/v1${path}`;
}

// Allow cross-site requests
app.use(cors());

// Parse JSON in request body
app.use(json())

// Define routes to controllers
app.use(getUrl('/accounts'), AccountsController);
app.use(getUrl('/activate'), ActivateController);
app.use(getUrl('/article'), ArticleController);
app.use(getUrl('/auto_replies'), AutoRepliesController);
app.use(getUrl('/blacklists'), BlacklistsController);
app.use(getUrl('/contacts'), ContactsController);
app.use(getUrl('/conversations'), ConversationsController);
app.use(getUrl('/devices'), DevicesController);
app.use(getUrl('/drafts'), DraftsController);
app.use(getUrl('/folders'), FoldersController);
app.use(getUrl('/media'), MediaController);
app.use(getUrl('/messages'), MessagesController);
app.use(getUrl('/purchases'), PurchasesController);
app.use(getUrl('/scheduled_messages'), ScheduledMessagesController);
app.use(getUrl('/templates'), TemplatesController);

// Log requests with no endpoint
app.use((req: Request, res: Response, next) => {
	next(new UnhandledPathError(req.path)); // Passing the request to the next handler in the stack.
});

// Error handling
app.use((err: ErrorResponse, req: Request, res: Response, next: NextFunction) => {
	// If err.msg is set, use that. Otherwise generate a generic error
	const message: BaseError = err.msg || new BaseError('unexpected error');

	// Log the error
	console.log(`\n ${JSON.stringify(message)} \n`);

	// Avoid bugs when sending error after res.send() is called
	if (res.headersSent) {
		return next(err)
	}

	// Set status. Default: 500 Internal Server Error
	res.status(err.status || 500);
	// Send error
	res.json(message);
	next(); // Passing the request to the next handler in the stack.
});

export default app;

