import express from 'express';
import { BaseResponse } from '../models/responses/BaseResponse.js';

const router = express.Router();

// Not implemented because there is no beta program.

router.route('/register').post(function (req, res, next) {
    // Respond for compatibility
    res.json(new BaseResponse);
});


router.route('/remove').post(function (req, res, next) {
    // Respond for compatibility
    res.json(new BaseResponse);
});


export default router;
 
