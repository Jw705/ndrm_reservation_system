var express = require('express');
var router = express.Router();

var template = require('./template_kht.js');
var db = require('./dbtest');
var authCheck = require('./authCheck.js');        // 로그인 여부 판단
var func = require('./funcCollection.js');        // 기타 함수 모음


/*----------------------------------------------------------------------------------------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------------------------------------------------------------------------------------*/
/* 관리자 로그인 */

// 로그인 화면
router.get('/login', function (request, response) {
    var title = '로그인';
    var html = template.HTML(title,'',`
            <h2>관리자 로그인</h2>
            <form class="loginform" action="/kht/login_process" method="post">
                <p><input class="login" type="text" name="username" placeholder="아이디"></p>
                <p><input class="login" type="password" name="pwd" placeholder="비밀번호"></p>
                <p><input class="btn_login" type="submit" value="로그인"></p>
            </form>
            <br>
            <p style="font-size: 14px">남도레미 관리자 페이지입니다</p>
            <p style="font-size: 14px">기획팀 정주완 (010-3786-0969) 에게 문의해주세요.</p>
        `, '');
    response.send(html);
});

// 로그인 프로세스
router.post('/login_process', function (request, response) {
    var username = request.body.username;
    var password = request.body.pwd;
    if (username && password) {             // id와 pw가 입력되었는지 확인        
        db.query('SELECT * FROM khtTable WHERE username = ? AND userpassword = ?', [username, password], function(error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {       // db에서의 반환값이 있으면 로그인 성공
                request.session.kht_is_logined = true;      // 세션 정보 갱신
                request.session.kht_nickname = username;                
                db.query(`INSERT INTO logTable (created, username, action, command, actiondetail) VALUES (NOW(), ?, 'kht_login' , ?, ?)`
                , [request.session.kht_nickname, '-', `관리자 로그인`] , function (error, result) {});
                request.session.save(function () {
                    response.redirect(`/kht/main`);
                });
            } else {              
                response.send(`<script type="text/javascript">alert("로그인 정보가 일치하지 않습니다."); 
                document.location.href="/kht/login";</script>`);    
            }            
        });
    } else {
        response.send(`<script type="text/javascript">alert("아이디와 비밀번호를 입력하세요!"); 
        document.location.href="/kht/login";</script>`);    
    }
});

// 로그아웃
router.get('/logout', function (request, response) {
    request.session.destroy(function (err) {
        response.redirect('/kht/login');
    });
});


/*----------------------------------------------------------------------------------------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------------------------------------------------------------------------------------*/

// 관리 페이지 메인
router.get('/main', function (request, response) {
    if (!authCheck.isKht(request, response)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
        response.redirect('/kht/login');
        return false;
    }

    var title = "관리자 페이지";     
    var html = template.HTML(title,'<script src="/static/js/script_kht_main.js"></script>',        
    `
    <h3 style="text-align: center;">남도레미 악기연습실 예약 시스템 - 관리자용</h3>
        <div class="accountBox"> 
            <span><b>${request.session.kht_nickname}</b>님 환영합니다</span>            
            <span style="color: #6A679E">
                <a class=btnred_clicked>관리자 페이지</a>
            </span>
        </div>

        <button type="button" class="collapsible" onclick="collapse(this);" id="dateChoiceMenu">예약일자 선택</button>
        <div class="content">
            <table class="Calendar">
                <thead>
                    <tr>
                        <td onClick="prevCalendar();" style="cursor:pointer;">&#60;</td>
                        <td colspan="5">
                            <span id="calYear"></span>년
                            <span id="calMonth"></span>월
                        </td>
                        <td onClick="nextCalendar();" style="cursor:pointer;">&#62;</td>
                    </tr>
                    <tr>
                        <td>일</td>
                        <td>월</td>
                        <td>화</td>
                        <td>수</td>
                        <td>목</td>
                        <td>금</td>
                        <td>토</td>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
            <p style="text-align: center; font-size: 13px;">예약 희망일 14일전부터 예약할 수 있습니다.</p>
        </div>
        <button type="button" class="collapsible" onclick="collapse(this);" id="timeChoiceMenu">예약내용 관리</button>
        <div class="content">
            <p id="dateChoiceMenu2" >예약일을 먼저 선택해 주세요</p>
        </div>
        <button type="button" class="collapsible" onclick="collapse(this);">유의사항</button>
        <div class="content">
            <p> 오류 발생시 총무 정주완 (010-3786-0969) 에게 연락 바랍니다. </p>
        </div>
        <p style="text-align: center"><a href="./logout" class=btn_noborder>로그아웃</a></span></p>
    `, '');    

    response.send(html);  
    
});


// 예약내역 확인
router.get('/:pageId', (request, response) => {
    if (!authCheck.isKht(request, response)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
        response.redirect('/kht/login');
        return false;
    }

    var checkday = request.params.pageId
    let startday = new Date('2022-08-24');  // 예약을 시작할 날짜   
    let finalday = new Date('2022-12-31');  // 예약을 마감할 날짜

    /*URL을 이용한 부정 접근 방지*/
    if (new Date(checkday) <= startday || new Date(checkday) >= finalday) {
        response.redirect('/kht/main');
        return false;
    }
    /*=====================*/

    var title = "관리자 페이지";
    var list = `<p id="dateChoiceMenu2" style="color:black">${checkday}</p><div id="container3">`;
    console.log(checkday);

    db.query('SELECT * FROM reserveTable WHERE date = ?', [checkday], function (error, results) {
        if (error) throw error;

        for (const [key, value] of Object.entries(results[0])) {
            if (key !== "id" && key !== "date" && key !== "disable") {

                // 비활성화된 시간이면
                if (value === "disable") {
                    list = list + `
                      <div class="resvBox" style="background-color : #F9F9F9; border: none;">
                          <span><b>${checkday}</b> | ${func.tnToTime(key)}</span>
                          <span>
                            <form class="editform" action="/kht/clear_process" method="post" 
                            onsubmit="return confirm('${checkday} | ${func.tnToTime(key)}의 예약을 활성화 하시겠습니까?');">
                                <input type="hidden" name="date" value="${checkday}">
                                <input type="hidden" name="time" value="${key}">
                                <input type="submit" class="btn_noborder" value="활성화">
                            </form>
                          </span>
                      </div>
                      `
                }
                // 예약 정보가 없으면
                else if (value === null) {
                    list = list + `
                      <div class="resvBox">
                        <span><b>${checkday}</b> | ${func.tnToTime(key)}</span>
                        <span>
                            <button type="button" class="btn_noborder" onclick="sendPost('/kht/resv_process', { date: '${checkday}', time: '${key}' });">예약</button>
                            |
                            <form class="editform" action="/kht/disable_process" method="post"
                            onsubmit="return confirm('${checkday} | ${func.tnToTime(key)}의 예약을 비활성화 하시겠습니까?');">
                                <input type="hidden" name="date" value="${checkday}">
                                <input type="hidden" name="time" value="${key}">
                                <input type="submit" class="btn_noborder" value="비활성화">
                            </form>
                        </span>
                      </div>
                      `
                }
                // 예약 정보가 있으면
                else {
                    list = list + `
                      <div class="resvBox">
                          <span><b>${checkday}</b> | ${func.tnToTime(key)}</span><span>${value}</span>
                          <span>
                            <form class="editform" action="/kht/clear_process" method="post" 
                            onsubmit="return confirm('${checkday} | ${func.tnToTime(key)} ${value}님의 예약을 취소 하시겠습니까?');">
                                <input type="hidden" name="date" value="${checkday}">
                                <input type="hidden" name="time" value="${key}">
                                <input type="submit" class="btn_clicked" value="취소">
                            </form>
                          </span>
                      </div>
                      `
                }
            }
        }
        list = list + '</div>'; // 예약 정보 리스트 완성
        
        // html 만들기
        var html = template.HTML(title, '<script src="/static/js/script_kht_page.js"></script>',
            `
          <h3 style="text-align: center;">남도레미 악기연습실 예약 시스템 - 관리자용</h3>
              <div class="accountBox"> 
                  <span><b>${request.session.kht_nickname}</b>님 환영합니다</span>
                  
                  <span style="color: #6A679E">
                      <a class=btnred_clicked>관리자 페이지</a>
                  </span>
              </div>
  
              <button type="button" class="collapsible" onclick="collapse(this);" id="dateChoiceMenu">예약일자 : ${checkday}</button>
              <div class="content">
                  <table class="Calendar">
                      <thead>
                          <tr>
                              <td onClick="prevCalendar();" style="cursor:pointer;">&#60;</td>
                              <td colspan="5">
                                  <span id="calYear"></span>년
                                  <span id="calMonth"></span>월
                              </td>
                              <td onClick="nextCalendar();" style="cursor:pointer;">&#62;</td>
                          </tr>
                          <tr>
                              <td>일</td>
                              <td>월</td>
                              <td>화</td>
                              <td>수</td>
                              <td>목</td>
                              <td>금</td>
                              <td>토</td>
                          </tr>
                      </thead>
                      <tbody></tbody>
                  </table>
                  <p style="text-align: center; font-size: 13px;">예약 희망일 14일전부터 예약할 수 있습니다.</p>
              </div>
              <button type="button" class="collapsible" onclick="collapse(this);" id="timeChoiceMenu">예약내용 관리</button>
              <div class="content_admintime">
                  ${list}
              </div>
              <button type="button" class="collapsible" onclick="collapse(this);">유의사항</button>
              <div class="content">
                  <p> 오류 발생시 총무 정주완 (010-3786-0969) 에게 연락 바랍니다. </p>
              </div>
              <p style="text-align: center"><a href="./logout" class=btn_noborder>로그아웃</a></span></p>
          `, '');

        response.send(html);

    });
})


/*----------------------------------------------------------------------------------------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------------------------------------------------------------------------------------*/


// 활성화 버튼 눌렀을 때
router.post('/clear_process', function (request, response) {
    let date = request.body.date;
    let time = request.body.time;
    db.query(`INSERT INTO logTable (created, username, action, command, actiondetail) VALUES (NOW(), ?, 'kht_clear' , ?, ?)`
        , [request.session.kht_nickname, `UPDATE reserveTable SET ${time}=null WHERE date=${date}`, `${date} ${func.tnToTime(time)} 초기화`] , function (error, result) {});

    db.query(`UPDATE reserveTable SET ${time}=null WHERE date=?`, [date], function (error, result) {
        if (error) throw error;        
        response.redirect(`/kht/${date}`);
    });
});

// 비활성화 버튼 눌렀을 때
router.post('/disable_process', function (request, response) {
    let date = request.body.date;
    let time = request.body.time;
    db.query(`INSERT INTO logTable (created, username, action, command, actiondetail) VALUES (NOW(), ?, 'kht_disable' , ?, ?)`
        , [request.session.kht_nickname, `UPDATE reserveTable SET ${time}="disable" WHERE date=${date}`, `${date} ${func.tnToTime(time)} 비활성화`] , function (error, result) {});
    db.query(`UPDATE reserveTable SET ${time}="disable" WHERE date=?`, [date], function (error, result) {
        if (error) throw error;        
        response.redirect(`/kht/${date}`);
    });
});

// 예약 버튼 눌렀을 때
router.post('/resv_process', function (request, response) {
    let date = request.body.date;
    let time = request.body.time;
    let name = request.body.name;

    let limitStartDay = func.findMonday(new Date(date));    // 예약 횟수 제한을 시작할 날 (선택 주 월요일)
    let limitFinalDay = func.findSunday(new Date(date));    // 예약 횟수 제한이 끝나는 날 (선택 주 일요일)  
    const limitCount = 5;       // 주당 예약 가능한 시간
    
    db.query('SELECT * FROM reserveTable WHERE date BETWEEN ? AND ?', [func.dateToString(limitStartDay), func.dateToString(limitFinalDay)], function (error, results) {
        if (error) throw error;        
        // 선택된 주에 해당 이름을 가진 사람이 예약한 횟수 확인        
        let resvCount = 0;
        let alreadyResv = false;
        for (let i = 0; i < results.length; i++) {
            for (const [key, value] of Object.entries(results[i])) {   
                if (key !== "id" && key !== "date" && key !== "disable") {       
                    if (value === name) resvCount++;
                }
            }   
            // 다른사람이 그 사이 사용자가 선택한 시간에 예약했는지 확인
            if (func.dateToString(results[i].date) === date && results[i][time] !== null) {
                alreadyResv = true;
            }            
        }

        if (alreadyResv === true){  // 이미 예약된 시간이면 
            response.send(`<script type="text/javascript">alert("이미 예약된 시간입니다"); 
            document.location.href="/kht/${date}";</script>`);
        }
        else if (resvCount < limitCount) {  // limitCount보다 더 적게 예약된 경우 실행            
            db.query(`INSERT INTO logTable (created, username, action, command, actiondetail) VALUES (NOW(), ?, 'kht_resv' , ?, ?)`
                , [request.session.kht_nickname, `UPDATE reserveTable SET ${time}='${name}' WHERE date=${date}`, `${date} ${func.tnToTime(time)} 예약 ${name}`], function (error, result) { });
            db.query(`UPDATE reserveTable SET ${time}=? WHERE date=?`, [name, date], function (error, result) {
                if (error) throw error;
                response.redirect(`/kht/${date}`);
            });
        }
        else {  // limitCount만큼 예약되어 있는 경우 알림 띄우고 추가 예약 막는다.
            response.send(`<script type="text/javascript">alert("일주일에 최대 ${limitCount}시간까지만 예약할 수 있습니다!"); 
            document.location.href="/kht/${date}";</script>`);
        }
    });

});



module.exports = router; 