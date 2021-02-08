import express from 'express';
import Mercury from '@postlight/mercury-parser';
import { MissingParamError } from '../models/responses/ErrorResponses.js';
import { ArticleResponse } from '../models/responses/ArticleResponses.js';

const router = express.Router();

router.route('/').get(function (req, res) {
    if (!req.body.url) {
        res.json(new MissingParamError);
        return;
    }
    
    Mercury.parse(req.body.url).then(result => {
        res.json(ArticleResponse.fromResult([result]));
    });
});

export default router;
 
