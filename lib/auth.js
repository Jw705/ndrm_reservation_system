var express = require('express');
var router = express.Router();

var template = require('./template.js');
var db = require('./dbtest');

// 로그인 화면
router.get('/login', function (request, response) {
    var title = '로그인';
    var html = template.HTML(title,'',`
            <h2>로그인</h2>
            <form action="/auth/login_process" method="post">
                <p><input class="login" type="text" name="username" placeholder="이름 (ex:홍길동)"></p>
                <p><input class="login" type="password" name="pwd" placeholder="전화번호 (ex:01012345678)"></p>
                <p><input class="btn_login" type="submit" value="로그인"></p>
            </form>
            <br>
            <p style="font-size: 14px">남도레미 지원시 작성하신 전화번호를 이용하여 로그인 하실 수 있습니다.</p>
            <p style="font-size: 14px">오류 발생시 기획팀 정주완 (010-3786-0969) 에게 문의해주세요.</p>
        `, '');
    response.send(html);
});

// 로그인 프로세스
router.post('/login_process', function (request, response) {
    var username = request.body.username;
    var password = request.body.pwd;
    if (username && password) {             // id와 pw가 입력되었는지 확인
        
        db.query('SELECT * FROM usertable WHERE username = ? AND userchn = ?', [username, password], function(error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {       // db에서의 반환값이 있으면 로그인 성공
                // console.log("성공");
                request.session.is_logined = true;      // 세션 정보 갱신
                request.session.nickname = username;
                request.session.save(function () {
                    response.redirect(`/resv/main`);
                });
            } else {              
                response.send(`<script type="text/javascript">alert("로그인 정보가 일치하지 않습니다."); 
                document.location.href="/auth/login";</script>`);    
            }            
        });

    } else {
        response.send(`<script type="text/javascript">alert("아이디와 비밀번호를 입력하세요!"); 
        document.location.href="/auth/login";</script>`);    
    }
});

// 로그아웃
router.get('/logout', function (request, response) {
    request.session.destroy(function (err) {
        response.redirect('/');
    });
});

module.exports = router; 