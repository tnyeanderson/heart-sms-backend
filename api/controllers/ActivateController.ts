import express from 'express';
import db from '../db/query.js';
import { ActivateRequest } from '../models/requests/ActivateRequesets.js';
import { BaseResponse } from '../models/responses/BaseResponse.js';

const router = express.Router();

router.route('/').get(
    (req, res, next) => ActivateRequest.handler(req, res, next), 
    function (req, res, next) {
        // TODO: Actual activate logic... should return a LoginResponse
        res.json(new BaseResponse);
    });

export default router;
 
