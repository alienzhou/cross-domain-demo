const express = require('express');
const router = express.Router();
const request = require('request');

router.get('*', (req, res, next) => {
    console.log(req.headers);
    let path = req.path.replace(/^\/proxy/, '');
    request.get(`http://test.az.com:3000${path}`, (err, response) => {
        res.json(JSON.parse(response.body));
    });
});

module.exports = router;