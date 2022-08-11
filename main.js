
const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser');
const FileStore = require('session-file-store')(session)

var authRouter = require('./lib/auth');               // 로그인 관련 페이지 연결
var resvRouter = require('./lib/resv');               // 예약 관련 페이지 연결
var authCheck = require('./lib/authCheck.js');        // 로그인 여부 판단
var template = require('./lib/template.js');

const app = express()
const port = 3000

app.use(express.static('public'));                    // 정적폴더 사용
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: '~~~',
  resave: false,
  saveUninitialized: true,
  //store:new FileStore(),
}))

app.get('/', (req, res) => {
  if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
    res.redirect('/auth/login');
    return false;
  } else {                                      // 로그인 되어있으면 메인 페이지로 이동시킴
    res.redirect('/resv/main');
    return false;
  }
})

// 인증 라우터
app.use('/auth', authRouter);
app.use('/resv', resvRouter);

/*
// 메인 페이지
app.get('/main', (req, res) => {
  if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
    res.redirect('/auth/login');
    return false;
  }
  var html = template.HTML('Welcome',
    `<hr>
        <h2>메인 페이지에 오신 것을 환영합니다</h2>
        <p>로그인에 성공하셨습니다.</p>`,
    authCheck.statusUI(req, res)
  );
  res.send(html);
})
*/

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

