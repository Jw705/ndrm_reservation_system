var express = require('express');
var router = express.Router();

var template = require('./template.js');
var db = require('./dbtest');
var authCheck = require('./authCheck.js');        // 로그인 여부 판단

const readline = require('readline');


function tnToTime(tn){
    if (tn=="t0") return "00:00~01:00";
    else if (tn=="t1") return "01:00~02:00";   
    else if (tn=="t2") return "02:00~03:00";  
    else if (tn=="t3") return "03:00~04:00";  
    else if (tn=="t4") return "04:00~05:00";  
    else if (tn=="t5") return "05:00~06:00";  
    else if (tn=="t6") return "06:00~07:00";  
    else if (tn=="t7") return "07:00~08:00";  
    else if (tn=="t8") return "08:00~09:00";  
    else if (tn=="t9") return "09:00~10:00";  
    else if (tn=="t10") return "10:00~11:00";  
    else if (tn=="t11") return "11:00~12:00";  
    else if (tn=="t12") return "12:00~13:00";  
    else if (tn=="t13") return "13:00~14:00";  
    else if (tn=="t14") return "14:00~15:00";  
    else if (tn=="t15") return "15:00~16:00";  
    else if (tn=="t16") return "16:00~17:00";  
    else if (tn=="t17") return "17:00~18:00";  
    else if (tn=="t18") return "18:00~19:00"; 
    else if (tn=="t19") return "19:00~20:00"; 
    else if (tn=="t20") return "20:00~21:00";    
    else if (tn=="t21") return "21:00~22:00";   
    else if (tn=="t22") return "22:00~23:00";   
    else if (tn=="t23") return "23:00~24:00";
    else return "error";
}

/*-------------------------------------------------------------------------------------------------*/

// 관리 페이지 메인
router.get('/main', function (request, response) {
    /*
    if (!authCheck.isOwner(request, response)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
        response.redirect('/auth/login');
        return false;
    }
    */

    var title = "관리자 페이지";     
    var html = template.HTML(title,'<script src="script_kht_main.js"></script>',        
    `
    <h3 style="text-align: center;">남도레미 악기연습실 예약 시스템 - admin</h3>
        <div class="accountBox"> 
            <span><b>기획팀 홍길동</b>님 환영합니다</span>
            
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
        <p style="text-align: center"><a href="login.html" class=btn_noborder>로그아웃</a></span></p>
    `, '');    

    response.send(html);  
    
});


// 예약내역 확인
router.get('/:pageId', (request, response) => {

    var checkday = request.params.pageId
    let startday = new Date('2022-08-24');  // 예약을 시작할 날짜   
    let finalday = new Date('2022-09-24');  // 예약을 마감할 날짜

    /*URL을 이용한 부정 접근 방지*/
    if (new Date(checkday) <= startday || new Date(checkday) >= finalday) {
        response.redirect('/kht/main');
        return false;
    }
    /*=====================*/

    var title = "관리자 페이지";
    var list = `<p id="dateChoiceMenu2" style="color:black">${checkday}</p><div id="container3">`;

    db.query('SELECT * FROM reserveTable WHERE date = ?', [checkday], function (error, results) {
        if (error) throw error;

        for (const [key, value] of Object.entries(results[0])) {
            if (key !== "id" && key !== "date" && key !== "disable") {

                // 비활성화된 시간이면
                if (value === "disable") {
                    list = list + `
                      <div class="resvBox" style="background-color : #F9F9F9; border: none;">
                          <span><b>${checkday}</b> | ${tnToTime(key)}</span>
                          <span>
                            <form action="/kht/clear_process" method="post" style="display: inline;"
                            onsubmit="return confirm('${checkday} | ${tnToTime(key)}의 예약을 활성화 하시겠습니까?');">
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
                        <span><b>${checkday}</b> | ${tnToTime(key)}</span>
                        <span>
                            <button type="button" class="btn_noborder" onclick="sendPost('/kht/resv_process', { date: '${checkday}', time: '${key}' });">예약</button>
                            |
                            <form action="/kht/disable_process" method="post" style="display: inline;"
                            onsubmit="return confirm('${checkday} | ${tnToTime(key)}의 예약을 비활성화 하시겠습니까?');">
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
                          <span><b>${checkday}</b> | ${tnToTime(key)}</span><span>${value}</span>
                          <span>
                            <form action="/kht/clear_process" method="post" style="display: inline;"
                            onsubmit="return confirm('${checkday} | ${tnToTime(key)} ${value}님의 예약을 취소 하시겠습니까?');">
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
        var html = template.HTML(title, '<script src="script_kht_page.js"></script>',
            `
          <h3 style="text-align: center;">남도레미 악기연습실 예약 시스템 - admin</h3>
              <div class="accountBox"> 
                  <span><b>기획팀 홍길동</b>님 환영합니다</span>
                  
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
              <p style="text-align: center"><a href="login.html" class=btn_noborder>로그아웃</a></span></p>
          `, '');

        response.send(html);

    });
})


// 활성화 버튼 눌렀을 때
router.post('/clear_process', function (request, response) {
    var date = request.body.date;
    var time = request.body.time;
    db.query(`UPDATE reserveTable SET ${time}=null WHERE date=?`, [date], function (error, result) {
        if (error) throw error;        
        response.redirect(`/kht/${date}`);
    });
});
// 비활성화 버튼 눌렀을 때
router.post('/disable_process', function (request, response) {
    var date = request.body.date;
    var time = request.body.time;
    db.query(`UPDATE reserveTable SET ${time}="disable" WHERE date=?`, [date], function (error, result) {
        if (error) throw error;        
        response.redirect(`/kht/${date}`);
    });
});

// 예약 버튼 눌렀을 때
router.post('/resv_process', function (request, response) {
    var date = request.body.date;
    var time = request.body.time;
    var name = request.body.name;
    db.query(`UPDATE reserveTable SET ${time}=? WHERE date=?`, [name,date], function (error, result) {
        if (error) throw error;        
        response.redirect(`/kht/${date}`);
    });
});





module.exports = router; 