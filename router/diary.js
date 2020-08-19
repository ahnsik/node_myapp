var router = require('express').Router();

//// DB 를 따로 또 열 수 있는지 확인하기 위한 것.
var mysql = require('mysql');
var db_config = require('../config/db_config.js');
db_config.database = 'mydiary';             // DB 를 새로 지정.
var db = mysql.createConnection(db_config);
db.connect( function(err) {
  if (err)
    console.log('mysql connection error : ' + err);
  else
    console.log('mysql connected.');
});



// // middleware that is specific to this router
// router.use(function timeLog(req, res, next) {
//   console.log('Time: ', Date.now());
//   next();
// });
// define the home page route
router.get('/', function(req, res) {
  res.send('일기장 - routed.');
});
// define the about route
router.get('/about', function(req, res) {
  res.send('About 일기장 - routed.');
});

// query test
router.get('/test', function(req, res) {
  var date = new Date();
  let start_date = new Date(date.getFullYear(),1, 1 );
  let end_date = new Date(date.getFullYear(),date.getMonth()+1, 0);
  query_string = 'select * from mydiary where date between date("' + start_date.toLocaleDateString() + '") and date("' + end_date.toLocaleDateString() + '");' ;
  // query_string = 'select * from mydiary where memo like "%'+req.query.search+'%";' ;
  console.log ( query_string );

  db.query(query_string, function(err, result, fields) {
    if (err) throw err;
    // console.log(result);
    res.render('new_forms.ejs', { db:result, curr:date });
  });
});



module.exports = router;
