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
        
        db.query('SELECT * FROM usertable WHERE username = ? AND userchn = ?', [username, password], function(error, results, fields) {
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
    var title = '예약시간 선택';
    var html = template.HTML(title, `<script src="script_resv.js"></script>`, 
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
        <div id="container">
            <label><input type="checkbox" name="0800" value="8" onclick="CountChecked(this)" disabled> <span>08:00~09:00</span> <br><span class="resv">예약 : 홍길동</span> </label>
            <label><input type="checkbox" name="0800" value="8" onclick="CountChecked(this)"> <span>08:00~09:00</span> <br><span class="resv">예약가능</span> </label>
            <label><input type="checkbox" name="0800" value="8" onclick="CountChecked(this)" disabled> <span>08:00~09:00</span> <br><span class="resv">예약 : 홍길동</span> </label>
            
            <label><input type="checkbox" name="0800" value="8" onclick="CountChecked(this)"> <span>08:00~09:00</span> <br><span class="resv">예약가능</span> </label>           
            <label><input type="checkbox" name="0800" value="8" onclick="CountChecked(this)"> <span>08:00~09:00</span> <br><span class="resv">예약가능</span> </label>            
            <label><input type="checkbox" name="0800" value="8" onclick="CountChecked(this)"> <span>08:00~09:00</span> <br><span class="resv">예약가능</span> </label>

            <label><input type="checkbox" name="0800" value="8" onclick="CountChecked(this)"> <span>08:00~09:00</span> <br><span class="resv">예약가능</span> </label>           
            <label><input type="checkbox" name="0800" value="8" onclick="CountChecked(this)"> <span>08:00~09:00</span> <br><span class="resv">예약가능</span> </label>            
            <label><input type="checkbox" name="0800" value="8" onclick="CountChecked(this)"> <span>08:00~09:00</span> <br><span class="resv">예약가능</span> </label>


            <label><input type="checkbox" name="0800" value="8" onclick="CountChecked(this)" disabled> <span>08:00~09:00</span> <br><span class="resv">예약 : 홍길동</span> </label>
            <label><input type="checkbox" name="0800" value="8" onclick="CountChecked(this)" disabled> <span>08:00~09:00</span> <br><span class="resv">예약 : 홍길동</span> </label>          
            <label><input type="checkbox" name="0800" value="8" onclick="CountChecked(this)"> <span>08:00~09:00</span> <br><span class="resv">예약가능</span> </label>

            <label><input type="checkbox" name="0800" value="8" onclick="CountChecked(this)"> <span>08:00~09:00</span> <br><span class="resv">예약가능</span> </label>           
            <label><input type="checkbox" name="0800" value="8" onclick="CountChecked(this)"> <span>08:00~09:00</span> <br><span class="resv">예약가능</span> </label>            
            <label><input type="checkbox" name="0800" value="8" onclick="CountChecked(this)"> <span>08:00~09:00</span> <br><span class="resv">예약가능</span> </label>
            
            <label><input type="checkbox" name="0800" value="8" onclick="CountChecked(this)" disabled> <span>08:00~09:00</span> <br><span class="resv">예약 : 홍길동</span> </label>
            <label><input type="checkbox" name="0800" value="8" onclick="CountChecked(this)"> <span>08:00~09:00</span> <br><span class="resv">예약가능</span> </label>           
            <label><input type="checkbox" name="0800" value="8" onclick="CountChecked(this)"> <span>08:00~09:00</span> <br><span class="resv">예약가능</span> </label>            
            <label><input type="checkbox" name="0800" value="8" onclick="CountChecked(this)"> <span>08:00~09:00</span> <br><span class="resv">예약가능</span> </label>
        </div>
    </div>
    <button type="button" class="collapsible" onclick="collapse(this);">유의사항</button>
    <div class="content">
        <p> 1. 연습실(지하 1층 다목적실)은 08:00부터 24:00 사이 사용할 수 있습니다 :) </p>
        <p> 2. 이미 예약된 시간에 함께 연주하고 싶으시면 예약하신 분과 연락하여 협의하시면 됩니다. </p>
    </div>  
    <p style="text-align: center"><a href="./logout" class=btn_noborder>로그아웃</a></span></p>
    `, '');
    response.send(html);
});



/*-------------------------------------------------------------------------------------------------*/


// 예약확인, 취소 화면
router.get('/check', function (request, response) {
    if (!authCheck.isLogin(request, response)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
        response.redirect('/resv/login');
        return false;
    }

    let name = request.session.nickname;
    console.log(name);

    let today = new Date();
    let todayPlus14 = new Date();
    todayPlus14.setDate(todayPlus14.getDate() + 14);    
    
    console.log(todayPlus14);        
    
    db.query('SELECT * FROM reserveTable WHERE date BETWEEN ? AND ?', [today, todayPlus14], function (error, results) {
        if (error) throw error;        
        // 선택된 주에 해당 이름을 가진 사람이 예약한 횟수 확인        
        //let resvCount = 0;

        var list = `<div id="container_block">`;

        for (let i = 0; i < results.length; i++) {
            for (const [key, value] of Object.entries(results[i])) {   
                if (key !== "id" && key !== "date" && key !== "disable") {       
                    if (value === name) {
                        let resvdate = func.dateToString(results[i].date);
                        let resvtime = func.tnToTime(key)

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
                <p style="text-align: left; font-size: 14px;"> 1. 연습실(지하 1층 다목적실)은 08:00부터 24:00 사이 사용할 수 있습니다 :) </p>
                <p style="text-align: left; font-size: 14px;"> 2. 이미 예약된 시간에 함께 연주하고 싶으시면 예약하신 분과 연락하여 협의하시면 됩니다. </p>
            </div>
            <p style="text-align: center"><a href="./logout" class=btn_noborder>로그아웃</a></span></p>
        `, '');
        response.send(html);

    });
});

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







module.exports = router; 