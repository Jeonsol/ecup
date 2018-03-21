var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('lib_layer', { title: 'NTS 마크업 라이브러리 : 레이어' });
});

router.get('/layer', function(req, res, next) {
  res.render('lib_layer', { title: 'NTS 마크업 라이브러리 : 레이어' });
});

router.get('/jquery', function(req, res, next) {
  res.render('lib_jquery', { title: 'NTS 마크업 라이브러리 : jquery' });
});

router.get('/etc', function(req, res, next) {
  res.render('lib_etc', { title: 'NTS 마크업 라이브러리 : 부가기능' });
});

module.exports = router;
