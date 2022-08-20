
const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser');
const FileStore = require('session-file-store')(session)

var resvRouter = require('./lib/resv');               // 예약 관련 페이지 연결
var khtRouter = require('./lib/kht');                 // 관리자 페이지 연결
var authCheck = require('./lib/authCheck.js');        // 로그인 여부 판단
var template = require('./lib/template.js');

const app = express()
const port = process.env.PORT || 3000;

app.use(express.static('public'));                    // 정적폴더 사용
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: '~~~',
  resave: false,
  saveUninitialized: true,
  store:new FileStore(),
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})