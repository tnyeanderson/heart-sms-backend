import express from 'express';
import errors from '../utils/errors.js';
import Mercury from '@postlight/mercury-parser';

const router = express.Router();

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

export default router;
 
