/////////////////////////////
//  안식 myApps  ver 0.1.0
//
// - ROOT 는 소개/기본 안내페이지 ( / )
// - 일기장 ( /diary )
// - 금전출납부 ( /money )
// - 차계부 ( /car )
// - 혈압 기록 ( /bp )
// - 최은행 ( /choi_bank )
/////////////////////////////

//// express 준비
var express = require('express');
var app = express();
var ejs = require('ejs');
var expressLayouts = require('express-ejs-layouts');

//// mysql 은 각각 route 하는 ja 파일에서 직접 준비하도록 함.
// var mysql = require('mysql');

//// others
var bodyParser = require('body-parser');

app.use(express.static(__dirname+'/public'));
app.use('/choi_bank', express.static(__dirname+'/choi_bank/public'));
//// prepare to views
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));

//// start routing...

app.get('/', function (req, res) {
    // res.send('ROOT');
    res.render('index.html');
});

/* 여기에서 부터는 게시판의 기본 기능을 확인하기 위한 임시 테스트 기능들. */
      // app.get('/list', function (req, res) {
      //     var sql = 'SELECT * FROM BOARD';
      //     db.query(sql, function (err, rows, fields) {
      //         if(err) console.log('query is not excuted. select fail...\n' + err);
      //         else res.render('list.ejs', {list : rows});
      //     });
      // });
      //
      // app.get('/write', function (req, res) {
      //     res.render('write.ejs');
      // });
      //
      // app.post('/writeAf', function (req, res) {
      //     var body = req.body;
      //     console.log(body);
      //
      //     var sql = 'INSERT INTO BOARD VALUES(?, ?, ?, NOW())';
      //     var params = [body.id, body.title, body.content];
      //     console.log(sql);
      //     db.query(sql, params, function(err) {
      //         if(err) console.log('query is not excuted. insert fail...\n' + err);
      //         else res.redirect('/list');
      //     });
      // });
/* 여기까지는 게시판의 기본 기능을 확인하기 위한 임시 테스트 기능들. */


app.use('/car', require('./router/cardiary') );
app.use('/money', require('./router/moneybook') );
app.use('/bp', require('./router/bp_diary') );
app.use('/diary', require('./router/diary') );
app.use('/chinese_dialog', require('./router/chinese_dialog') );
app.use('/travel_japanese_dialog', require('./router/travel_japanese_dialog') );
app.use('/choi_bank', require('./router/choi_bank') );


//// start server...
var server_port = 3000;
app.listen(server_port, () => console.log('Server is running on port '+server_port+'...'));
