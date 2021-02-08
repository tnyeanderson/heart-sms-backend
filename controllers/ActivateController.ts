import express from 'express';
import db from '../db/query.js';
import { BaseResponse } from '../models/responses/BaseResponse.js';

const router = express.Router();

router.route('/').get(function (req, res) {
    let sql = "SELECT 1";
    
    db.query(sql, res, function (result) {
        res.json(new BaseResponse);
    });
});

export default router;
 
