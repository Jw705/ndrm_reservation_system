var express = require('express');
var router = express.Router();

var template = require('./template.js');
var db = require('./dbtest');
var authCheck = require('./authCheck.js');        // 로그인 여부 판단
var func = require('./funcCollection.js');        // 기타 함수 모음

/* resv */
/*----------------------------------------------------------------------------------------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------------------------------------------------------------------------------------*/
/* 로그인,아웃 */

// 로그인 화면
router.get('/login', function (request, response) {
    var title = '로그인';
    var html = template.HTML(title,'',`
            <h2>로그인</h2>
            <form class="loginform" action="/resv/login_process" method="post">
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
        
        db.query('SELECT * FROM userTable WHERE username = ? AND userchn = ?', [username, password], function(error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {       // db에서의 반환값이 있으면 로그인 성공
                request.session.is_logined = true;      // 세션 정보 갱신
                request.session.nickname = username;
                db.query(`INSERT INTO logTable (created, username, action, command, actiondetail) VALUES (NOW(), ?, 'login' , ?, ?)`
                , [request.session.nickname, '-', `로그인`] , function (error, result) {});
                request.session.save(function () {
                    response.redirect(`/resv/main`);
                });
            } else {              
                response.send(`<script type="text/javascript">alert("로그인 정보가 일치하지 않습니다."); 
                document.location.href="/resv/login";</script>`);    
            }            
        });

    } else {
        response.send(`<script type="text/javascript">alert("아이디와 비밀번호를 입력하세요!"); 
        document.location.href="/resv/login";</script>`);    
    }
});

// 로그아웃
router.get('/logout', function (request, response) {
    request.session.destroy(function (err) {
        response.redirect('/');
    });
});



/*----------------------------------------------------------------------------------------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------------------------------------------------------------------------------------*/
// 메인 화면
router.get('/main', function (request, response) {
    if (!authCheck.isLogin(request, response)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
        response.redirect('/resv/login');
        return false;
    }
    var title = '예약';
    var html = template.HTML(title, `<script src="/static/js/script_main.js"></script>`, 
    `
    <h3 style="text-align: center;">남도레미 악기연습실 예약 시스템</h3>
    <div class="accountBox"> 
        <span><b>${request.session.nickname}</b>님 환영합니다</span>    
        <span style="color: #6A679E">
            <a class=btn_clicked>예약하기</a> | 
            <a href="./check" class=btn>예약확인</a></span>
    </div>
    <button type="button" class="collapsible" onclick="collapse(this);" id="dateChoiceMenu">예약일자</button>
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
    <button type="button" class="collapsible" onclick="collapse(this);" id="timeChoiceMenu">예약시간</button>
    <div class="content">
        <p id="dateChoiceMenu2">예약일을 먼저 선택해 주세요</p>
    </div>
    <button type="button" class="collapsible" onclick="collapse(this);">유의사항</button>
    <div class="content">
        <p style="text-align: left; font-size: 14px;">  1. 연습실(지하 1층 다목적실)은 08:00부터 24:00까지 사용할 수 있습니다. </p>
        <p style="text-align: left; font-size: 14px;">  2. 일주일(월~일)에 최대 5시간까지 예약할 수 있습니다. </p>
        <p style="text-align: left; font-size: 14px;">  3. 이미 예약된 시간에 함께 연주하고 싶으시면 예약하신 분과 연락하여 협의하시면 됩니다. </p>
    </div>  
    <p style="text-align: center"><a href="./logout" class=btn_noborder>로그아웃</a></span></p>
    `, '');
    response.send(html);
});


// 예약확인, 취소 화면------------------------------------------------------------------------------------------------------------------------------------------
router.get('/check', function (request, response) {
    if (!authCheck.isLogin(request, response)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
        response.redirect('/resv/login');
        return false;
    }

    let name = request.session.nickname;
    
    let today = new Date();
    today.setHours(0, 0, 0, 0);    // 비교 편의를 위해 today의 시간을 초기화

    let todayPlus14 = new Date();
    todayPlus14.setDate(todayPlus14.getDate() + 14);    // 오늘로부터 14일 후

    let thisMonday = func.findMonday(new Date());            // 이번 주 월요일
    
          
    db.query('SELECT * FROM reserveTable WHERE date BETWEEN ? AND ?', [thisMonday, todayPlus14], function (error, results) {
        if (error) throw error;        

        var list = `<div id="container_block">`;

        for (let i = 0; i < results.length; i++) {
            if(func.dateToDayKr(results[i].date)==='월'){                           // 새 일주일이 시작될 때 구분선 추가
                list = list + `<div style="line-height:30%;"><br><hr><br></div>`;
            }
            for (const [key, value] of Object.entries(results[i])) {   
                if (key !== "id" && key !== "date" && key !== "disable") {
                    
                    
                    if (value === name) {
                        let resvdate = func.dateToString(results[i].date);
                        let resvtime = func.tnToTime(key)

                        if(new Date(resvdate)<today){
                            list = list + `
                            <div class="resvBoxDisable">
                                <span style="color: gray;" ><b>${resvdate} (${func.dateToDayKr(results[i].date)})</b> | ${resvtime}</span>
                            </div>
                            `;
                        }
                        else{
                            list = list + `
                            <div class="resvBox">
                                <span><b>${resvdate} (${func.dateToDayKr(results[i].date)})</b> | ${resvtime}</span>
                                <span>
                                    <form class="editform" action="/resv/clear_process" method="post" 
                                    onsubmit="return confirm('${resvdate} | ${resvtime} 예약을 취소 하시겠습니까?');">
                                        <input type="hidden" name="date" value="${resvdate}">
                                        <input type="hidden" name="time" value="${key}">
                                        <input type="submit" class="btn_clicked" value="취소하기">
                                    </form>
                                </span>
                            </div>
                            `;
                        }

                    }
                }
            }
        }
        
        list = list + '</div>'; // 예약 정보 리스트 완성

        
        var title = '예약내역 확인';
        var html = template.HTML(title, `
        <script>
            window.onload = function () {     // 웹 페이지가 로드되면 resvList 펼치기
                collapse(document.getElementById("resvList"));
            }

            function collapse(element) {
                var before = document.getElementsByClassName("active")[0]               // 기존에 활성화된 버튼
                if (before && document.getElementsByClassName("active")[0] != element) {  // 자신 이외에 이미 활성화된 버튼이 있으면
                    before.nextElementSibling.style.maxHeight = null;   // 기존에 펼쳐진 내용 접고
                    before.classList.remove("active");                  // 버튼 비활성화
                }
                element.classList.toggle("active");         // 활성화 여부 toggle

                var content = element.nextElementSibling;
                if (content.style.maxHeight != 0) {         // 버튼 다음 요소가 펼쳐져 있으면
                    content.style.maxHeight = null;         // 접기
                } else {
                    content.style.maxHeight = content.scrollHeight + "px";  // 접혀있는 경우 펼치기
                }
            }
        </script>
        `,
                `
        <h3 style="text-align: center;">남도레미 악기연습실 예약 시스템</h3>
            <div class="accountBox">
                <span><b>${request.session.nickname}</b>님 환영합니다</span>
                <span style="color: #6A679E">
                    <a href="./main" class=btn>예약하기</a> |
                    <a class=btn_clicked>예약확인</a>
                </span>
            </div>

            <button type="button" class="collapsible" onclick="collapse(this);" id="resvList">예약정보</button>
            <div class="content">
                ${list}
            </div>

            <button type="button" class="collapsible" onclick="collapse(this);">유의사항</button>
            <div class="content">
                <p style="text-align: left; font-size: 14px;">  1. 연습실(지하 1층 다목적실)은 08:00부터 24:00까지 사용할 수 있습니다. </p>
                <p style="text-align: left; font-size: 14px;">  2. 일주일(월~일)에 최대 5시간까지 예약할 수 있습니다. </p>
                <p style="text-align: left; font-size: 14px;">  3. 이미 예약된 시간에 함께 연주하고 싶으시면 예약하신 분과 연락하여 협의하시면 됩니다. </p>
            </div>  
            <p style="text-align: center"><a href="./logout" class=btn_noborder>로그아웃</a></span></p>
        `, '');
        response.send(html);

    });
});

// 선택요일 예약내용 확인------------------------------------------------------------------------------------------------------------------------------------------
router.get('/:pageId', (request, response) => {
    if (!authCheck.isLogin(request, response)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
        response.redirect('/resv/login');
        return false;
    }

    let today = new Date();
    today.setHours(0, 0, 0, 0);    // 비교 편의를 위해 today의 시간을 초기화
    let todayPlus14 = new Date();
    todayPlus14.setDate(todayPlus14.getDate() + 14);    // 오늘로부터 14일 후

    var checkday = request.params.pageId
    let startday = today;           // 예약페이지 접근이 가능한 날짜 시작일   
    let finalday = todayPlus14      // 예약페이지 접근이 가능한 날짜 마감일 
    console.log(checkday);

    /*URL을 이용한 부정 접근 방지*/
    if (new Date(checkday) <= startday || new Date(checkday) >= finalday) {
        response.redirect('/resv/main');
        return false;
    }
    /*=====================*/

    var title = "예약";
    var list = `<p id="dateChoiceMenu2" style="color:black">${checkday}</p><div id="container">`;

    db.query('SELECT * FROM reserveTable WHERE date = ?', [checkday], function (error, results) {
        if (error) throw error;

        for (const [key, value] of Object.entries(results[0])) {
            if (key !== "id" && key !== "date" && key !== "disable") {

                // 비활성화된 시간이면
                if (value === "disable") {
                }
                // 예약 정보가 없으면
                else if (value === null) {
                    list = list + `
                    <form class="resvform" action="/resv/resv_process" method="post" 
                    onsubmit="return confirm('${checkday} | ${func.tnToTime(key)} 시간에 예약하시겠습니까?');">          
                        <input type="hidden" name="date" value="${checkday}">
                        <input type="hidden" name="time" value="${key}">
                        <input type="hidden" name="name" value="${request.session.nickname}">
                        <input type="submit" class="btn_resv" value="${func.tnToTime(key)}"><br>
                        <span class="resv">예약가능</span>
                    </form>
                    `
                }
                // 예약 정보가 있으면
                else {
                    list = list + `                    
                    <div class="resvform">                
                        <input type="submit" class="btn_disable" value="${func.tnToTime(key)}"><br>
                        <span class="resv" style="color: #CCCCCC;">예약 : ${value}</span>
                    </div>
                    `
                }
            }
        }
        list = list + '</div>'; // 예약 정보 리스트 완성
        
        // html 만들기
        var html = template.HTML(title, '<script src="/static/js/script_resv.js"></script>',
            `
            <h3 style="text-align: center;">남도레미 악기연습실 예약 시스템</h3>
            <div class="accountBox"> 
                <span><b>${request.session.nickname}</b>님 환영합니다</span>    
                <span style="color: #6A679E">
                    <a class=btn_clicked>예약하기</a> | 
                    <a href="./check" class=btn>예약확인</a></span>
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
              <button type="button" class="collapsible" onclick="collapse(this);" id="timeChoiceMenu">예약시간</button>
              <div class="content">             
                ${list}
              </div>
              <button type="button" class="collapsible" onclick="collapse(this);">유의사항</button>
              <div class="content">
                <p style="text-align: left; font-size: 14px;">  1. 연습실(지하 1층 다목적실)은 08:00부터 24:00까지 사용할 수 있습니다. </p>
                <p style="text-align: left; font-size: 14px;">  2. 일주일(월~일)에 최대 5시간까지 예약할 수 있습니다. </p>
                <p style="text-align: left; font-size: 14px;">  3. 이미 예약된 시간에 함께 연주하고 싶으시면 예약하신 분과 연락하여 협의하시면 됩니다. </p>
              </div>  
              <p style="text-align: center"><a href="./logout" class=btn_noborder>로그아웃</a></span></p>
          `, '');

        response.send(html);

    });
});


/*-------------------------------------------------------------------------------------------------*/
/*-------------------------------------------------------------------------------------------------*/
/*-------------------------------------------------------------------------------------------------*/



// 활성화 버튼 눌렀을 때
router.post('/clear_process', function (request, response) {
    let date = request.body.date;
    let time = request.body.time;
    db.query(`INSERT INTO logTable (created, username, action, command, actiondetail) VALUES (NOW(), ?, 'cancel' , ?, ?)`
        , [request.session.nickname, `UPDATE reserveTable SET ${time}=null WHERE date=${date}`, `${date} ${func.tnToTime(time)} 예약취소`] , function (error, result) {});

    db.query(`UPDATE reserveTable SET ${time}=null WHERE date=?`, [date], function (error, result) {
        if (error) throw error;        
        response.redirect(`/resv/check`);
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
            document.location.href="/resv/${date}";</script>`);
        }
        else if (resvCount < limitCount) {  // limitCount보다 더 적게 예약된 경우 실행
            db.query(`INSERT INTO logTable (created, username, action, command, actiondetail) VALUES (NOW(), ?, 'resv' , ?, ?)`
                , [request.session.nickname, `UPDATE reserveTable SET ${time}='${name}' WHERE date=${date}`, `${date} ${func.tnToTime(time)} 예약 ${name}`], function (error, result) { });
            db.query(`UPDATE reserveTable SET ${time}=? WHERE date=?`, [name, date], function (error, result) {
                if (error) throw error;
                response.redirect(`/resv/${date}`);
            });
        }
        else {  // limitCount만큼 예약되어 있는 경우 알림 띄우고 추가 예약 막는다.
            response.send(`<script type="text/javascript">alert("일주일에 최대 ${limitCount}시간까지만 예약할 수 있습니다!"); 
            document.location.href="/resv/${date}";</script>`);
        }
    });

});


module.exports = router; 