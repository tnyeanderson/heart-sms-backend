import express from 'express';
import db from '../db/query';

const router = express.Router();

router.route('/').get(function (req, res) {
    let sql = "SELECT 1";
    
    db.query(sql, res, function (result) {
        res.json(result);
    });
});

module.exports = router;
 
