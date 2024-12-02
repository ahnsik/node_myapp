////  https://expressjs.com/ko/guide/routing.html  를 참고.

//// Router 준비
const router = require('express').Router();
const bodyParser = require("body-parser");

//// 나의 diary용 DB 를 열기
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
const isEmpty = (str) => (!str?.length);
var mode = "none";

var convert_to_html = (origin_text) => {
  var html_text = "";
  var lines = origin_text.split('\n');
  let lineNum = 0;

  // 입력된 일반 TEXT를 parsing 해서 HTML형태로 만들어 줌.
  while(lineNum<lines.length) {
    if ( ! isEmpty(lines[lineNum]) ) {       // 빈 문자열 이면 skip.
      let string_to_parse = pre_process_text_word( pre_process_text_bold( lines[lineNum] ) );
      // console.log("lineNum=",lineNum, "lines[lineNum]=", string_to_parse );
      switch(  string_to_parse.charAt(0) ) {
        case '#':   //   a_header 클래스의 디비전을 파싱. 
          html_text +=_change_mode("a_header");
          console.log("[ a_header ]=", string_to_parse);
          html_text += parse_header( string_to_parse );
          break;
        case "@":   //   dialog 클래스의 디비전을 파싱. 
          html_text += _change_mode("dialog");
          console.log("[ dialog ]=", string_to_parse);
          html_text += parse_dialogs( string_to_parse );
          break;
        case "+":   //   pattern 클래스의 디비전을 파싱. 
          html_text += _change_mode("pattern");
          console.log("[ pattern ]=", string_to_parse);
          html_text += parse_patterns( string_to_parse );
          break;
        case "-":   //   change 클래스의 디비전을 파싱. 
          html_text += _change_mode("change");
          console.log("[ change_words ]=", string_to_parse );
          html_text += parse_changing_words( string_to_parse );
          break;
        default:
          console.log("[ Unknown. ]=", string_to_parse);
          break;
      }
    }
    lineNum++;
  }
  // 맨 마지막엔 TAG 들을 닫는다. 
  html_text += '\n</article>\n';
  console.log("=====================");
  console.log(html_text);
  return html_text;
};

// BOLD 체 등을 처리하기 위해서,  * ~ * 로 감싸진 부분은 먼저 처리하도록 한다. 
var pre_process_text_bold = (text) => {  
  var len = text.length;
  var i = 0;
  var new_text = "", ch = "";
  var ok_flag=true;
  for (i=0; i<len; i++) {
    ch = text.charAt(i);
    if (ch=='*') {
      if (ok_flag) {
        new_text += "<b>";
        ok_flag = false;
      } else {
        new_text += "</b>";
        ok_flag = true;
      }
    } else {
      new_text += ch;
    }
  }
  if (ok_flag) {      // <b> - </b> 의 짝이 잘 맞으면 바뀐 TEXT를, 짝이 맞지 않으면 원본 문장을 리턴.
    return new_text;
  } else {
    return text;
  }
}
var pre_process_text_word = (text) => {  
  let len = text.length;
  let i = 0;
  let new_text = "", ch = "";
  let ok_flag=true;
  for (i=0; i<len; i++) {
    ch = text.charAt(i);
    if (ch=='[') {
      new_text += '<span class="word">';
      ok_flag = false;
    } else if (ch==']') {
      if (ok_flag==true) {        // 예상치 못한 단어 close 면 그냥 원본 문장을 리턴.
        return text;
      } else {
        new_text += '</span>';
        ok_flag = true;
      }
    } else {
      new_text += ch;
    }
  }
  if (ok_flag) {      // <b> - </b> 의 짝이 잘 맞으면 바뀐 TEXT를, 짝이 맞지 않으면 원본 문장을 리턴.
    return new_text;
  } else {
    return text;
  }
}
_change_mode = (new_mode) => {
  let ret_string = "";
  if (mode != new_mode) {         // mode 가 변경될 때에만 
    switch(new_mode) {  // 새로운 모드가 
      case "a_header":
        console.log(" new mode = a_header");
        // ret_string = '<p class="a_header">\n';
        break;
      case "dialog":  
        console.log(" new mode = dialog");
        ret_string = '<div class="dialog">\n';
        break;
      case "pattern": 
        console.log(" new mode = patterns");
        // TODO: </div> 는 이전 모드 mode 값이 dialog 일 때에만 하도록 하면 어떨까? 
        ret_string = '</div>\n<div class="pattern">\n<p><b>패턴</b> :\n';
        break;
      case "change":  
        console.log(" new mode = change");
        // TODO: </div> 는 이전 모드 mode 값이 dialog 일 때에만 하도록 하면 어떨까? 
        ret_string = '</div>\n<div class="change">\n<p><b>단어 바꿔보기</b> :\n';
        break;
      default:        // 몰라. 아무것도 안한다.
        break;
    }
  }
  // console.log(" mode not changed");
  mode = new_mode;
  return ret_string;      // 변경 없음. 아무것도 추가하지 않음.
}
var parse_header = (text) => {
  let html_out="";
  if (text.charAt(1) == '#') { // situdation paragraph
    if (text.charAt(2) == '#') { // situdation comments
      html_out += ' <div class="a_header"><p class="situation">' + text.substring(3) + '</p>\n </div>\n';
    } else {
      html_out += ' <H1 class="a_title">' + text.substring(2) + '</H1>\n';
    }
  } else {
    html_out = '<article id="' + text.substring(1) + '">\n';
  }
  return html_out;
}
var parse_dialogs = (text) => {
  let html_out="";
  if (text.charAt(1) == '@') { // 
    if (text.charAt(2) == '@') { // situdation comments
      html_out += '  <p class="kr">' + text.substring(3) + '</p>\n';
    } else {
      html_out += '    <span class="pronounce">' + text.substring(2) + '</span></p>\n';
    }
  } else {
    html_out = '  <p class="jp">' + text.substring(1) + '<br/>\n';
  }
  return html_out;
}
var parse_patterns = (text) => {
  let html_out="";
  if (text.charAt(1) == '+') { // 
    if (text.charAt(2) == '+') { // situdation comments
      html_out += '<br/>' + text.substring(3) + '</p>\n';
    } else {
      html_out += '<br/>' + text.substring(2);
    }
  } else {
    html_out = '<p>' + text.substring(1);
  }
  return html_out;
}
var parse_changing_words = (text) => {
  let html_out="";
  if (text.charAt(1) == '>') { // 
    html_out += '\n → ' + text.substring(2) + '<br/>';
  } else {
    html_out = '<br/>[ ' + text.substring(1) + ' ]<br/>';
  }
  return html_out;
}
/* 여기까지. ********  SCRIPT 변환하기 위한 함수들 ***********/


router.get('/', function(req, res) {

  console.log("간단한 여행 일본어 회화 정리");
  const sql_String = "SELECT * from travel_japanese_dialog";    // ${mysql.escapeId('application.table')};   //--> refer :https://stackoverflow.com/questions/57598136/error-er-no-db-error-no-database-selected-node-js-mysql-when-always-using

  access_db(sql_String, {}, function(err, rows, fields) {   // if succeed
    // console.log('travel_japanese.. read success from DB mydiary.travel_japanese_dialog QUERY result\n\terr=' + err+ '\n\trows=' + rows+ '\n\tfields=' + fields +'\n' );
    console.log("typeof rows :", typeof(rows) );
    var db_content = [];
    for (var i=0; i<rows.length; i++) {
      let item = {}; 
      item.content = convert_to_html(rows[i].content);
      db_content.push( item );
    }
    // console.log("content:\n", db_content );
    res.render("travel_japanese", { data: db_content });
  }, function(err, rows, fields) {    // if failed
    console.log('[][][][] db(BP) error [][][][]\n', err);
    res.send("<p>(bp/list) SELECT query FAIL... </p>")
  });

});
// define the about route
router.get('/about', function(req, res) {
  console.log("여행일본어 설명 페이지 열기");
  res.send('여행일본어에 대해서..');
});
// new data record - input form
router.get('/write', function(req, res) {
  console.log("여행일본어 회화를 새로 추가로 입력하기");
  res.render('edit_travel_japanese');
});
// Read a record from DB.
router.get('/read', function(req, res) {
  console.log("여행일본어 하나의 글 읽기 - number="+req.query.number);
  const sql_String = "SELECT content from travel_japanese_dialog where number="+req.query.number;
  access_db(sql_String, {}, function(err, rows, fields) {   // if succeed
    // console.log('travel_japanese.. read success from DB mydiary.travel_japanese_dialog QUERY result\n\terr=' + err+ '\n\trows=' + rows+ '\n\tfields=' + fields +'\n' );
    if (rows.length > 0) {
      console.log("\n================================\nresult :", rows[0].content );
      res.send(rows[0].content);
    }
  }, function(err, rows, fields) {    // if failed
    console.log('[][][][] db(BP) error [][][][]\n', err);
    res.send("<p>(bp/list) SELECT query FAIL... </p>")
  });
});
// delete a record with parameter(number)
router.get('/delete', function(req, res) {
  console.log("여행일본어회화200 하나의 글 삭제 - number="+req.query.number);
});


router.use(bodyParser.urlencoded({extended: false}));

// edit_travel_japanese 로 부터 새로운 항목이 추가되면.. DB에 추가해야 함.
// new Record to DB. posted.
router.post('/new_post', function(req, res) {
  var body = req.body;
  console.log("======================\nPOST from edit_travel_japanese...\n");
  console.log("------- data : --------------\n  dlg_text=", body.dlg_text, ", DATE=", new Date() ) ;

  var sql = 'INSERT INTO travel_japanese_dialog VALUES( ?, ?, ? )';
  var params = [null, new Date(), body.dlg_text ];
  console.log(sql);
  access_db(sql, params, function(err, rows, fields) {   // if succeed
    console.log('REDIRECT TO travel_japanese_dialog...\n');
    res.redirect('/travel_japanese_dialog');
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
