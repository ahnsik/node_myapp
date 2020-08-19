##################################################################
##  myApps 를 구성하는 기능 별로 별도의 DataBase 를 생성하여 관리
##################################################################

CREATE DATABASE mydiary;
CREATE DATABASE moneybook;
CREATE DATABASE carbook;
CREATE DATABASE health_diary;

##  일기장 DB의 Table
CREATE TABLE diary(
  wrdate DATETIME primary key,      // 기록 날짜 및 시간
  content varchar(16000)            // 일기 내용
);

##  금전출납부 DB의 Table
CREATE TABLE moneybook(
  wrdate DATE not null,             // 기록 날짜 - 시간은 중요치 않음. 중복 가능
  content varchar(1024),           // 내역 설명,
  amount int not null,              // 거래금액
  type varchar(128),                // 사용 형태 - 현금, 카드, 계좌이체, 등등..
  balance int                       // 잔액 등..
);

##  차계부 DB 의 테이블
CREATE TABLE maintenance(
  wrdate DATE primary key,
  distance int not null,
  memo varchar(2000),
  price int
);

##  혈압 기록의 테이블
TABLE health_diary :
+-----------------+-------------+------+-----+---------+-------+
| Field           | Type        | Null | Key | Default | Extra |
+-----------------+-------------+------+-----+---------+-------+
| date_written    | datetime    | NO   | PRI | NULL    |       |
| bp_h            | smallint(6) | YES  |     | NULL    |       |
| bp_l            | smallint(6) | YES  |     | NULL    |       |
| pulse           | smallint(6) | YES  |     | NULL    |       |
| weight          | float       | YES  |     | NULL    |       |
| body_fat        | float       | YES  |     | NULL    |       |
| fat_factor      | smallint(6) | YES  |     | NULL    |       |
| metabolism      | smallint(6) | YES  |     | NULL    |       |
| bmi             | float       | YES  |     | NULL    |       |
| slepttime       | float       | YES  |     | NULL    |       |
| stretching      | smallint(6) | YES  |     | NULL    |       |
| aerobic_workout | text        | YES  |     | NULL    |       |
| muscle_workout  | text        | YES  |     | NULL    |       |
| diary_subject   | text        | YES  |     | NULL    |       |
| diary_text      | text        | YES  |     | NULL    |       |
+-----------------+-------------+------+-----+---------+-------+
