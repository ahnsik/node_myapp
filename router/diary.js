////  https://expressjs.com/ko/guide/routing.html  를 참고.

const marked = require('marked');   // markdown 라이브러리가, docker 로는 동작하지 않고 에러가 발생하므로, 임시로. 

//// Router 준비
const router = require('express').Router();
const bodyParser = require("body-parser");

//// 일기쓰기용 DB 를 열기
const mysql = require('mysql');
var db_config = require('../config/db_config.js');

function access_db(sql_String, params, success_fucntion, fail_function) {
  db_config.database = 'mydiary';             // DB 를 새로 지정.
  var db = mysql.createConnection(db_config);
  db.connect(function(err) {
    if(err) {
      console.log('mysql connection error : ' + err);
    // } else {
      // console.log('mysql DB: "mydiary" connected.');
    }
    db.query(sql_String, params, function(err, rows, fields) {
        if(err) {
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
    console.log('[][][][] db(diary) error [][][][]\nMust be check MySQL connection. MySQL could be disconnected automatically when over 8 hours connection. [][]\n', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { 
      console.log('[][][][] db error PROTOCOL_CONNECTION_LOST\n');
    } else if(err.code === 'PROTOCOL_PACKETS_OUT_OF_ORDER') { 
      console.log('[][][][] db error PROTOCOL_PACKETS_OUT_OF_ORDER\n');
    } else {
      console.log('[][][][] error code = ', err.code );
    }
  });

}

router.get('/', function(req, res) {
  console.log("일기장 데이터 읽어 오기");
  const sql_String = "SELECT * from diary order by wrdate desc";

  access_db(sql_String, {}, function(err, rows, fields) {   // if succeed
    // console.log(' QUERY result\n\terr=' + err+ '\n\trows=' + rows+ '\n\tfields=' + fields +'\n' );
    var db_content = [];
    for (var i=0; i<rows.length; i++) {
      let item = {}; 
      ////////////////
      item.wrdate = rows[i].wrdate;
      item.title = rows[i].title;
      item.content = marked.parse(rows[i].content);   // 본문 내용은 markdown 으로 변경해서 렌더링 한다.
      db_content.push( item );
    }
    // console.log("[] dump - content:\n", db_content );
    res.render("list", { data: db_content });
  }, function(err, rows, fields) {    // if failed
    console.log('[][][][] db(diary) error [][][][]\n', err);
    res.send("<p>(bp/list) SELECT query FAIL... </p>")
  });
});
// define the about route
router.get('/about', function(req, res) {
  res.send('About 일기장 - routed.');
});
// 새로운 일기 글쓰기.
router.get('/write', function(req, res) {
  var wrdate;
  if (req.query.wrdate != null) {
    wrdate = new Date(req.query.wrdate).toISOString().split('T')[0];
  } else {
    wrdate = new Date().toISOString().split('T')[0];
  }
  console.log('글 Edit 쓰기 - wrdate = '+ wrdate);

  const sql_String = "SELECT wrdate,title,content from diary order by wrdate desc";
  access_db(sql_String, {}, function(err, rows, fields) {   // if succeed
    res.render("diarywrite", { written_date: wrdate, items: rows, data: fields });
  }, function(err, rows, fields) {    // if failed
    console.log('[][][][] db(diary) error [][][][]\n', err);
    res.send("<p>(bp/list) SELECT query FAIL... </p>")
  });
});

// delete.
router.get('/delete', function(req, res) {
  const sql_String = 'DELETE from diary where wrdate="' + req.query.wrdate + '";';
  console.log('Delete.. - wrdate='+ req.query.wrdate, " \n SQL = " , sql_String );
  access_db(sql_String, {}, function(err, rows, fields) {   // if succeed
    res.redirect('/diary');

  }, function(err, rows, fields) {    // if failed
    console.log('[][][][] db(diary) error [][][][]\n', err);
    res.send("<p>(bp/list) 'Delete.. - wrdate = "+ req.query.wrdate+" was failed. Check DB again.</p>")
  });
});

// delete.
router.get('/delete', function(req, res) {
  const sql_String = "DELETE from diary where wrdate=" + req.query.wrdate;
  console.log('Delete.. - wrdate = '+ req.query.wrdate);
  // access_db(sql_String, {}, function(err, rows, fields) {   // if succeed
    // res.render("diarywrite", { written_date: new Date().toISOString().split('T')[0], data: rows });
    alert("DELETE this post ? : wrdate="+ req.query.wrdate);

  // }, function(err, rows, fields) {    // if failed
  //   console.log('[][][][] db(diary) error [][][][]\n', err);
  //   // res.send("<p>(bp/list) 'Delete.. - wrdate = "+ req.query.wrdate+"</p>")
  // });
});

router.post('/record', function(req, res) {
  var body = req.body;
  console.log("======================\nPOST from diary/write...\n");

  // var sql = 'INSERT INTO diary (wrdate, content, title) VALUES ( ?, ?, ? )';   // 기존 코드 
  // 키 값(wrdate)이 중복되면 Update 아니면 새로 추가하도록 함.  refer https://passwd.tistory.com/entry/MySQL-INSERT-ON-DUPLICATE-KEY-UPDATE-insert-or-update
  var sql = 'INSERT INTO diary (wrdate, content, title) VALUES ( ?, ?, ? ) ON DUPLICATE KEY UPDATE content=VALUES(content),title=VALUES(title);';    
  var params = [body.wrdate, body.diary_text, body.title];

  access_db(sql, params, function(err, rows, fields) {   // if succeed
    console.log('write success... REDIRECT TO /diary...\n======================\n');
    res.redirect('/diary');
  }, function(err, rows, fields) {    // if failed
    // console.log('query is not excuted. insert fail...\n' + err);
    console.log('query ', sql, ' is not excuted. insert fail...\n\t' + err);
    res.send("<p>Diary : record update FAIL... </p>")
  });
})

module.exports = router;
