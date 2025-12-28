const express = require('express');
const router = express.Router();
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

// choi_bank의 views 경로 설정을 위한 미들웨어
router.use((req, res, next) => {
  // choi_bank의 views 경로 설정
  req.app.set('views', path.join(__dirname, '../choi_bank/views'));
  // layout 사용 설정
  req.app.use(expressLayouts);
  req.app.set('layout', 'layout');
  next();
});

// choi_bank의 라우터 가져오기
const accountRoutes = require('../choi_bank/routes/account');
const txRoutes = require('../choi_bank/routes/transaction');

// choi_bank의 라우터 연결
router.use('/accounts', accountRoutes);
router.use('/transactions', txRoutes);

// 기본 경로 - accounts 페이지로 리다이렉트
router.get('/', (req, res) => {
  res.redirect('/choi_bank/accounts');
});

module.exports = router;
