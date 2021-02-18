import express from 'express';
import Mercury from '@postlight/mercury-parser';
import { MissingParamError } from '../models/responses/ErrorResponses.js';
import { ArticleResponse } from '../models/responses/ArticleResponses.js';
import { ArticleRequest } from '../models/requests/ArticleRequests.js';

const router = express.Router();

router.route('/').get(
    (req, res, next) => ArticleRequest.handler(req, res, next),
    function (req, res, next) {
        let r: ArticleRequest = res.locals.request;

        Mercury.parse(r.url).then(result => {
            res.json(ArticleResponse.fromResult([result]));
        });
    });

export default router;
 
