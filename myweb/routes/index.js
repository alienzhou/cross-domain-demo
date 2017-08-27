var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.cookie('test', 'test-me');
  res.render('index', { title: '跨域访问' });
});

module.exports = router;
