////  https://expressjs.com/ko/guide/routing.html  를 참고.

//// Router 준비
const router = require('express').Router();
const bodyParser = require("body-parser");

//// 차계부용 DB 를 열기
const mysql = require('mysql');
var db_config = require('../config/db_config.js');

function access_db(sql_String, params, success_fucntion, fail_function) {
  db_config.database = 'mydiary';             // DB 를 새로 지정.
  var db = mysql.createConnection(db_config);
  db.connect(function(err) {
    if(err) {
      console.log('mysql connection error : ' + err);
    } else {
      console.log('mysql DB: "mydiary" connected.');
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
      console.log('[][][][] db error PROTOCOL_CONNECTION_LOST\n');
      // return handleDisconnect();                      
    } else if(err.code === 'PROTOCOL_PACKETS_OUT_OF_ORDER') { 
      console.log('[][][][] db error PROTOCOL_PACKETS_OUT_OF_ORDER\n');
      // return handleDisconnect();
    } else {
      console.log('[][][][] error code = ', err.code );
      // throw err;
    }
  });

}

/*********  SCRIPT 변환하기 위한 함수들 ***********/
// const isEmpty = (str) => (!str?.length);
const isEmpty = (str) => {
  if (str === undefined)
    return true;
  if (str === null)
    return true;
  if (str.length === 0)
    return true;
  return false;
}
var mode = "none";

var convert_to_html = (origin_text) => {
    var html_text = "";
    var lines = origin_text.split('\n');
    let lineNum = 0;

    // 시작하는 빈 공간을 skip.
    while(lineNum<lines.length) {
        // if ( (lines[lineNum] != "") && (lines[lineNum] != undefined) ) {       // 빈 문자열 이면 skip.
        if ( ! isEmpty(lines[lineNum]) ) {       // 빈 문자열 이면 skip.
            console.log("lineNum=",lineNum, "lines[lineNum]=", lines[lineNum]);
            switch(  lines[lineNum].charAt(0) ) {
                case '#':
                    html_text +=_change_mode("title");
                    console.log("[ Title ]=", lines[lineNum]);
                    html_text += parse_title( lines[lineNum] );
                    break;
                case "*":
                    html_text += _change_mode("dialog");
                    console.log("[ Man ]=", lines[lineNum]);
                    html_text += parse_man( lines[lineNum] );
                    break;
                case "+":
                    html_text += _change_mode("dialog");
                    console.log("[ Women ]=", lines[lineNum]);
                    html_text += parse_woman( lines[lineNum] );
                    break;
                case ">":
                    html_text += _change_mode("expression");
                    console.log("[ expression ]=", html_text);
                    html_text += parse_expression( lines[lineNum] );
                    break;
                default:
                    console.log("[ Unknown. ]=", lines[lineNum]);
                    break;
            }
        }
        lineNum++;
    }
    // 맨 마지막엔 TAG 들을 닫는다. 
    html_text += '</p>\n<hr>\n</article>\n';
    return html_text;
};

_change_mode = (new_mode) => {
    if (mode != new_mode) {         // mode 가 변경될 때에만 
        switch(mode) {  // 이전 상태의 모드가 
            case "title":   // title 이었다면, 새로운 모드는 dialog 를 시작.
                mode = new_mode;
                console.log(" new mode = dialog");
                return '<p class="dialog">\n';
            case "dialog":  // dialog 였으면, expression 시작
                mode = new_mode;
                console.log(" new mode = expression");
                return '</p>\n<p class="expression">';
            default:        // 몰라. 아무것도 안한다.
                break;
        }
    }
    // console.log(" mode not changed");
    mode = new_mode;
    return "";      // 변경 없음. 아무것도 추가하지 않음.
}

var parse_title = (text) => {
  var html_out="";
  var title_split = text.split("#");
  //console.log( title_split );

  html_out += '<article id="'+title_split[1].trim()+'">\n';
  html_out += '  <h1><span class="zh">'+title_split[1].trim()+'</span>';
  html_out += '  <span class="kr">'+title_split[2].trim()+'</span>';
  html_out += '  <span class="gotoTop"><a href="#chapter">▲</a></span></h1>';
  return html_out;
}
var parse_man = (text) => {
    var html_out = "";
    console.log(" text :" + text );
    if (text.indexOf("***") == 0 ) {        // 한글 번역
        html_out += '<span class="kr">' + text.substring(3)+'</span><br/>';
    } else if (text.indexOf("**") == 0 ) {
        html_out += '<span class="en">' + text.substring(2)+'</span><br/>';
    } else {
        html_out += '<span class="man">' + text.substring(1)+'</span><br/>';
    }
    console.log("parse_man :" + html_out );
    return html_out;
}
var parse_woman = (text) => {
    var html_out = "";
    console.log(" text :" + text );
    if (text.indexOf("+++") == 0 ) {        // 한글 번역
        html_out += '<span class="kr">' + text.substring(3)+'</span><br/>';
    } else if (text.indexOf("++") == 0 ) {
        html_out += '<span class="en">' + text.substring(2)+'</span><br/>';
    } else {
        html_out += '<span class="woman">' + text.substring(1)+'</span><br/>';
    }
    console.log("parse_woman :" + html_out );
    return html_out;
}
var parse_expression = (text) => {
    var html_out = "";
    console.log(" text :" + text );
    if (text.indexOf(">>>") == 0 ) {        // 한글 번역
        html_out += '<span class="kr">' + text.substring(3)+'</span><br/>';
    } else if (text.indexOf(">>") == 0 ) {
        html_out += '<span class="en">' + text.substring(2)+'</span><br/>';
    } else {
        html_out += '<span class="zh">' + text.substring(1)+'</span><br/>';
    }
    return html_out;
}
/* 여기까지. ********  SCRIPT 변환하기 위한 함수들 ***********/


router.get('/', function(req, res) {

  console.log("중국어회화200 페이지 열기");
  const sql_String = "SELECT * from chinese_dialog";    // ${mysql.escapeId('application.table')};   //--> refer :https://stackoverflow.com/questions/57598136/error-er-no-db-error-no-database-selected-node-js-mysql-when-always-using

  access_db(sql_String, {}, function(err, rows, fields) {   // if succeed
    console.log('chinese200.. read success from DB mydiary.chinese_dialog QUERY result\n\terr=' + err+ '\n\trows=' + rows+ '\n\tfields=' + fields +'\n' );
    console.log("typeof rows :", typeof(rows) );
    var db_content = [];
    for (var i=0; i<rows.length; i++) {
      let item = {}; 
      item.content = convert_to_html(rows[i].content);
      db_content.push( item );
    }
    console.log("content:\n", db_content );
    res.render("chinese200", { data: db_content });
  }, function(err, rows, fields) {    // if failed
    console.log('[][][][] db(BP) error [][][][]\n', err);
    res.send("<p>(bp/list) SELECT query FAIL... </p>")
  });

});
// define the about route
router.get('/about', function(req, res) {
  console.log("중국어회화200 설명 페이지 열기");
  res.send('중국어표현 200개 목록을 보여주기로 함..');
});
// new data record - input form
router.get('/write', function(req, res) {
  console.log("중국어회화200 추가로 입력하기");
  res.render('edit_chinese200');
});

router.use(bodyParser.urlencoded({extended: false}));

// edit_chinese 로 부터 새로운 항목이 추가되면.. DB에 추가해야 함.
// new Record to DB. posted.
router.post('/new_dialog', function(req, res) {
  var body = req.body;
  console.log("======================\nPOST from edit_chinese200...\n");
  console.log("------- data : --------------\n  dlg_text=", body.dlg_text, ", DATE=", new Date() ) ;

  var sql = 'INSERT INTO chinese_dialog VALUES( ?, ?, ? )';
  var params = [null, new Date(), body.dlg_text ];
  console.log(sql);
  access_db(sql, params, function(err, rows, fields) {   // if succeed
    console.log('REDIRECT TO chinese_dialog...\n');
    res.redirect('/chinese_dialog');
  }, function(err, rows, fields) {    // if failed
    console.log('query is not excuted. insert fail...\n' + err);
    res.send("<p>Blood Pressure : record update FAIL... </p>")
  });
})

// // list up record
// router.get('/list', function(req, res) {
//   console.log('list...\n');

//   var sql = 'SELECT * from health_diary order by date_written DESC limit 15';      //  DATE_FORMAT(wrdate, "%Y-%m-%d")
//   console.log('QUERY string...' + sql );
//   access_db(sql, {}, function(err, rows, fields) {   // if succeed
//     console.log('/bp/list.. QUERY result\n\terr=' + err+ '\n\trows=' + rows+ '\n\tfields=' + fields +'\n' );
//     res.render('bp_list', { list: rows } );
//   }, function(err, rows, fields) {    // if failed
//     console.log('query returns err=' + err);
//     res.send("<p>(bp/list) SELECT query FAIL... </p>")
//   });
// });

module.exports = router;
