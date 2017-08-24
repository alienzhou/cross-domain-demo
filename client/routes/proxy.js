const express = require('express');
const router = express.Router();
const request = require('request');

router.get('/', (req, res, next) => {
    request.get('http://test.az.com:3000/info/normal', (err, response) => {
        res.json(JSON.parse(response.body));
    });
});

module.exports = router;