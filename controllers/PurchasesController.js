const express = require('express');
const router = express.Router();
const db = require('../db/query');
const errors = require('../utils/errors');

// Not implemented because we don't care about purchases. Everyone has a lifetime subscription.

router.route('/record').post(function (req, res) {
    // Respond for compatibility
    res.json({});
});

module.exports = router;
 
