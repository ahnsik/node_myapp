////  https://expressjs.com/ko/guide/routing.html  를 참고.

//// Router 준비
var router = require('express').Router();

//// 차계부용 DB 를 열기
var mysql = require('mysql');
var db_config = require('../config/db_config.js');
db_config.database = 'carbook';             // DB 를 새로 지정.
var db = mysql.createConnection(db_config);
db.connect( function(err) {
  if (err)
    console.log('mysql connection error : ' + err);
  else
    console.log('mysql DB: "carbook" connected.');
});



// // middleware that is specific to this router
// router.use(function timeLog(req, res, next) {
//   console.log('Time: ', Date.now());
//   next();
// });
// define the home page route
router.get('/', function(req, res) {
  // res.send('Car Diary Main Page - routed.');
  res.redirect('car/write');
  // res.static('index.html', {} );
});
// define the about route
router.get('/about', function(req, res) {
  res.send('Car Diary About Page - routed.');
});
// new data record
router.get('/write', function(req, res) {
  res.render('new_car_history' );
});
// new data record
router.post('/car_new_Af', function(req, res) {

  var body = req.body;
  console.log(body);
  var date = new Date();
  var timeStr = body.date + " " + date.getHours() + ":"+ date.getMinutes()+ ":"+ date.getSeconds();
  console.log(", DATE: " + timeStr);
  console.log(" .. --> time="+ timeStr+",distance="+body.accum_distance+",lpg="+body.lpg+",gasoline="+body.gasoline+",price="+body.price+",memo="+body.memo);

  var memo="";
  if (body.gasoline == "") {
    body.gasoline = 0.0;
  } else {
    if (memo!="") {
      memo+=",";
    }
    memo += "휘발유:"+body.gasoline+"리터";
  }
  if (body.lpg == "") {
    body.lpg = 0.0;
  } else {
    if (memo!="") {
      memo+=" ,";
    }
    memo += "LPG:"+body.lpg+"리터";
  }
  if (memo == "") {
    memo = body.memo;
  } else {
    if (body.memo!="") {
      memo+=" ,"+body.memo;
    }
  }

  var sql = 'INSERT INTO maintenance( wrdate, distance, lpg, gasoline, price, memo ) VALUES ( ?, ?, ?, ?, ?, ? )';
  var params = [timeStr, body.accum_distance, body.lpg, body.gasoline, body.price, memo ];
  console.log(sql);
  db.query(sql, params, function(err) {
      if(err) {
        console.log('query is not excuted. insert fail...\n' + err);
        res.send("<p>Car maintenance record: Insert/Update FAIL... </p>")
      } else {
        res.redirect('list');
      }
  });

});

// list up record
router.get('/list', function(req, res) {
  // var sql = 'SELECT DATE_FORMAT(wrdate,"%Y-%m-%d"),distance,memo,price from maintenance limit 5';      //  DATE_FORMAT(wrdate, "%Y-%m-%d")
  var sql = 'SELECT * from maintenance order by wrdate DESC limit 15';      //  DATE_FORMAT(wrdate, "%Y-%m-%d")
  console.log('QUERY string...' + sql );
  db.query(sql, { }, function(err, rows, fields) {    //  wrdate:"2020-08-24"
    if(err != null) {
      console.log('query returns err=' + err);
      res.send("<p>SELECT query FAIL... </p>")
    } else {
      console.log('QUERY result\n\terr=' + err+ '\n\trows=' + rows+ '\n\tfields=' + fields +'\n' );
      res.render('car_history_list', { list: rows } );
    }
  });
});

module.exports = router;
