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

// 타임아웃에 의해 MySQL 과의 접속이 자동으로 끊기게 되면 다시 재접속을 해서 계속 접속을 유지하게 만드는 함수.
// -> 개선 방향 : TODO: DB에 계속 접속 중인 상태로 있는 게 아니라, DB 액세스 해야 할 시점에만 빠르게 접속해서 처리하고 접속을 끊는 게 낫지 않을까?  
//    어차피 자주 안 쓰는 건데..??
function handleDisconnect() {
  db.connect(function(err) {            
    if(err) {                            
      // console.log('error when connecting to db:', err);
      console.log('mysql connection error : ' + err);
      setTimeout(handleDisconnect, 2000); 
      console.log('retry connect after 2 sec..');
    } else
      console.log('mysql DB: "health_diary" connected.');
  });

  db.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { 
      return handleDisconnect();                      
    } else {                                    
      throw err;                              
    }
  });
}
handleDisconnect();


// // middleware that is specific to this router
// router.use(function timeLog(req, res, next) {
//   console.log('Time: ', Date.now());
//   next();
// });
// define the home page route
router.get('/', function(req, res) {
  // res.send('Blood Pressure Main Page - routed.');
  // res.redirect('bp/write');
  res.render('bp_new');
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
router.post('/new_Af', function(req, res) {
  // db.query( ..... )
  var body = req.body;
  console.log(body);

  if (body.weight=="")
    body.weight = null;
  if (body.bmi=="")
    body.bmi = null;
  if (body.fat_rate=="")
    body.fat_rate = null;
  if (body.fatness=="")
    body.fatness = null;
  if (body.metabolism=="")
    body.metabolism = null;

  // var sql = 'INSERT INTO health_diary VALUES( NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )';
  var sql = 'INSERT INTO health_diary VALUES( NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )';
  var params = [body.bp_high, body.bp_low, body.h_beat, body.weight, body.fat_rate, body.fatness, body.metabolism, body.bmi, body.slept_time, body.stretching, body.aerobic_workout, body.muscle_workout, body.diary_subject, "" ];
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
  res.render('bp_list');
  // res.send("Blood Pressure Records LIST.");
});

module.exports = router;
