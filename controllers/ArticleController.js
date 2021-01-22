const express = require('express');
const router = express.Router();
const errors = require('../utils/errors');
const Mercury = require('@postlight/mercury-parser');

router.route('/').get(function (req, res) {
    if (!req.body.url) {
        res.json(errors.missingParam);
        return;
    }
    
    Mercury.parse(req.body.url).then(result => {
        let out = {
            title: result.title,
            description: result.excerpt,
            image_url: result.lead_image_url,
            domain: result.domain,
            web_url: result.url
        }
        
        res.json(out);
    });
});

module.exports = router;
 
