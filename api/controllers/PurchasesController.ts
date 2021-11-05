import express from 'express';
import { BaseResponse } from '../models/responses/BaseResponse.js';

const router = express.Router();

// Not implemented because we don't care about purchases. Everyone has a lifetime subscription.

router.route('/record').post(function (req, res) {
    // Respond for compatibility
    res.json(new BaseResponse);
});

export default router;

