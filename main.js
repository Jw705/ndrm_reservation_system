
const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser');
const FileStore = require('session-file-store')(session)

var resvRouter = require('./lib/resv');               // 예약 관련 페이지 연결
var khtRouter = require('./lib/kht');                 // 관리자 페이지 연결
var authCheck = require('./lib/authCheck.js');        // 로그인 여부 판단

const app = express()
const PORT = 8001

console.log('ver 1.0 release 22.09.04');

app.use('/static', express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: '~~~',
  resave: false,
  saveUninitialized: true,
}))

app.get('/', (req, res) => {
  if (!authCheck.isLogin(req, res)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
    res.redirect('/resv/login');
    return false;
  } else {                                      // 로그인 되어있으면 메인 페이지로 이동시킴
    res.redirect('/resv/main');
    return false;
  }
})

// 라우터
app.use('/resv', resvRouter);
app.use('/kht', khtRouter);

app.listen(PORT, () => {
  console.log(`Example app listening on the port ${PORT}`)
})