const express = require('express');
const router = express.Router();
const db = require('../db/query');
const errors = require('../utils/errors');

router.route('/').get(function (req, res) {
    let sql = "SELECT 1";
    
    db.query(sql, res, function (result) {
        res.json(result);
    });
});

module.exports = router;
 
