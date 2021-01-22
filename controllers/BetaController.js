const express = require('express');
const router = express.Router();

// Not implemented because there is no beta program.

router.route('/register').post(function (req, res) {
    // Respond for compatibility
    res.json({});
});


router.route('/remove').post(function (req, res) {
    // Respond for compatibility
    res.json({});
});


module.exports = router;
 
