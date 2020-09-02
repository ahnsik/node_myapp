////  https://expressjs.com/ko/guide/routing.html  를 참고.

var express = require('express');
var router = express.Router();

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});

module.exports = router;


////  https://expressjs.com/ko/guide/routing.html  를 참고.

//// Router 준비
var router = require('express').Router();

//// 차계부용 DB 를 열기
var mysql = require('mysql');
var db_config = require('../config/db_config.js');
db_config.database = 'health_diary';             // DB 를 새로 지정.
var db = mysql.createConnection(db_config);
db.connect( function(err) {
  if (err)
    console.log('mysql connection error : ' + err);
  else
    console.log('mysql DB: "health_diary" connected.');
});



// // middleware that is specific to this router
// router.use(function timeLog(req, res, next) {
//   console.log('Time: ', Date.now());
//   next();
// });
// define the home page route
router.get('/', function(req, res) {
  // res.send('Blood Pressure Main Page - routed.');
  res.redirect('bp/write');
});
// define the about route
router.get('/about', function(req, res) {
  res.send('Blood Pressure About Page - routed.');
});

// new data record - input form
router.get('/write', function(req, res) {
  res.render('bp_new');
});
// new Record to DB. posted.
router.post('/bp_new_Af', function(req, res) {
  // db.query( ..... )
  var body = req.body;
  console.log(body);

  var sql = 'INSERT INTO health_diary VALUES( NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )';
  var params = [body.bp_h, body.bp_l, body.pulse, body.weight, body.body_fat, body.fat_factor, body.metabolism, body.bmi, body.slect_time, body.stretching, body.aerobic_workout, body.muscle_workout, body.duary_subject ];
  console.log(sql);
  db.query(sql, params, function(err) {
      if(err) {
        console.log('query is not excuted. insert fail...\n' + err);
        res.send("<p>Blood Pressure : record update FAIL... </p>")
      } else {
        res.redirect('/list');
      }
  });

})

// list up record
router.get('/list', function(req, res) {
  // res.render('bp_list');
  res.send("Blood Pressure Records LIST.");
});

module.exports = router;
