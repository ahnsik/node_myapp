////  https://expressjs.com/ko/guide/routing.html  를 참고.

var express = require('express');
var router = express.Router();

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});
// define the home page route
router.get('/', function(req, res) {
  res.send('Car Diary Main Page - routed.');
});
// define the about route
router.get('/about', function(req, res) {
  res.send('Car Diary About Page - routed.');
});

module.exports = router;
