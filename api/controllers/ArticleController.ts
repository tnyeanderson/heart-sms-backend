import Mercury from '@postlight/mercury-parser';
import express from 'express';
import { ArticleRequest } from '../models/requests/ArticleRequests.js';
import { ArticleResponse } from '../models/responses/ArticleResponses.js';

const router = express.Router();

router.route('/').get(
    (req, res, next) => ArticleRequest.handler(req, res, next),
    function (req, res) {
        const r: ArticleRequest = res.locals.request;

        Mercury.parse(r.url).then(result => {
            res.json(ArticleResponse.fromResult([result]));
        });
    });

export default router;
 
