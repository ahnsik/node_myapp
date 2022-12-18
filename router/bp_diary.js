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

function access_db(sql_String, params, success_fucntion, fail_function) {
  db_config.database = 'health_diary';             // DB 를 새로 지정.
  var db = mysql.createConnection(db_config);
  db.connect(function(err) {
    if(err) {
      console.log('mysql connection error : ' + err);
    } else {
      console.log('mysql DB: "health_diary" connected.');
    }
    console.log('query string is ...\n' + sql_String);
    db.query(sql_String, params, function(err, rows, fields) {
        if(err) {
          // console.log('query is not excuted. insert fail...\n' + err);
          // res.send("<p>Car maintenance record: Insert/Update FAIL... </p>")
          console.log('query fail');
          fail_function(err, rows, fields);
        } else {
          console.log('query success');
          success_fucntion(err, rows, fields);          // res.redirect('list');
        }
        db.end();
    }); // end of query
  });   // end of connect

  db.on('error', function(err) {
    console.log('[][][][] db(BP) error [][][][]\n', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { 
      // return handleDisconnect();                      
    } else if(err.code === 'PROTOCOL_PACKETS_OUT_OF_ORDER') { 
      // return handleDisconnect();
    } else {
      console.log('[][][][] error code = ', err.code );
      // throw err;
    }
  });

}



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
  var sql = 'INSERT INTO health_diary VALUES( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )';
  var params = [body.date, body.bp_high, body.bp_low, body.h_beat, body.weight, body.fat_rate, body.fatness, body.metabolism, body.bmi, body.slept_time, body.stretching, body.aerobic_workout, body.muscle_workout, body.diary_subject, body.memo ];
  console.log(sql);
  access_db(sql, params, function(err, rows, fields) {   // if succeed
    console.log('REDIRECT TO /list...\n');
    res.redirect('list');
  }, function(err, rows, fields) {    // if failed
    console.log('query is not excuted. insert fail...\n' + err);
    res.send("<p>Blood Pressure : record update FAIL... </p>")
  });
})

// list up record
router.get('/list', function(req, res) {
  console.log('list...\n');

  var sql = 'SELECT * from health_diary order by date_written DESC limit 15';      //  DATE_FORMAT(wrdate, "%Y-%m-%d")
  console.log('QUERY string...' + sql );
  access_db(sql, {}, function(err, rows, fields) {   // if succeed
    console.log('/bp/list.. QUERY result\n\terr=' + err+ '\n\trows=' + rows+ '\n\tfields=' + fields +'\n' );
    res.render('bp_list', { list: rows } );
  }, function(err, rows, fields) {    // if failed
    console.log('query returns err=' + err);
    res.send("<p>(bp/list) SELECT query FAIL... </p>")
  });
});

module.exports = router;
