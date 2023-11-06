# node.js 로 작성한 myApps
-----------------------------
#### 개요
개인 정보 관리 서버 프로그래밍
 - 초간단 일기장 ( markdown 편집기 희망 )
 - 초간단 금전출납부 ( 은행 계좌 관리 희망 )
 - 차계부
 - 혈압 기록 관리 ( 운동 기록 관리 희망 )

대충 이런 기능들을 가진 개인 WebServer 를 의도하고 있음. (희망사항)

-----------------------------
#### 구성
각 기능(카테고리) 별로 별도의 js 파일로 만들어 routing 할 예정.
 - ROOT 는 소개/기본 안내페이지 ( / )
 - 일기장 ( /diary )
 - 금전출납부 ( /money )
 - 차계부 ( /car )
 - 혈압 기록 ( /bp )