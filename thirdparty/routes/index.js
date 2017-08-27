var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.cookie('test', '8888888');
  res.render('index', { title: 'cors' });
});

module.exports = router;
