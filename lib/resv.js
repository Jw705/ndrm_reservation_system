var express = require('express');
var router = express.Router();

var template = require('./template.js');
var db = require('./dbtest');

var authCheck = require('./authCheck.js');        // 로그인 여부 판단

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

// 로그인 화면
router.get('/main', function (request, response) {
    if (!authCheck.isOwner(request, response)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
        response.redirect('/auth/login');
        return false;
    }
    var title = '메인ㄴ';
    var html = template.HTML(title,'<script src="script.js"></script>',`
    <h3 style="text-align: center;">남도레미 악기연습실 예약 시스템</h3>
    <div class="accountBox"> 
        <span><b>홍길동</b>님 환영합니다</span>   
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
    <p style="text-align: center"><a href="./design/login.html" class=btn_noborder>로그아웃</a></span></p>
    `, '');
    response.send(html);
});



/*-------------------------------------------------------------------------------------------------*/

// 예약확인, 취소 화면
router.get('/check', function (request, response) {
    if (!authCheck.isOwner(request, response)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
        response.redirect('/auth/login');
        return false;
    }
    var title = '메인ㄴ';
    var html = template.HTML(title,`
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
            <span><b>홍길동</b>님 환영합니다</span>
            <span style="color: #6A679E">
                <a href="./main" class=btn>예약하기</a> |
                <a class=btn_clicked>예약확인</a>
            </span>
        </div>

        <button type="button" class="collapsible" onclick="collapse(this);" id="resvList">예약정보</button>
        <div class="content">
            <div id="container2">
                <div class="resvBox">
                    <span><b>2022-08-10</b> | 08:00~09:00</span>
                    <span>
                        <a href="./index.html" class=btn_clicked>취소하기</a>
                    </span>
                </div>
                <div class="resvBox">
                    <span><b>2022-08-10</b> | 08:00~09:00</span>
                    <span>
                        <a href="./index.html" class=btn_clicked>취소하기</a>
                    </span>
                </div>
                <p style="text-align: center; font-size: 13px;">'취소하기' 버튼을 누르면 예약이 취소됩니다.</p>
            </div>
        </div>

        <button type="button" class="collapsible" onclick="collapse(this);">유의사항</button>
        <div class="content">
            <p style="text-align: left; font-size: 14px;"> 1. 연습실(지하 1층 다목적실)은 08:00부터 24:00 사이 사용할 수 있습니다 :) </p>
            <p style="text-align: left; font-size: 14px;"> 2. 이미 예약된 시간에 함께 연주하고 싶으시면 예약하신 분과 연락하여 협의하시면 됩니다. </p>
        </div>
        <p style="text-align: center"><a href="login.html" class=btn_noborder>로그아웃</a></span></p>
    `, '');
    response.send(html);
});






/*-------------------------------------------------------------------------------------------------*/

// 관리 페이지
router.get('/admin', function (request, response) {
    /*
    if (!authCheck.isOwner(request, response)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
        response.redirect('/auth/login');
        return false;
    }
    */

    
    db.query(`UPDATE reserveTable SET t10=? WHERE date=?`, ["홍길동", "2022-08-25"],function (error, result) {
      if (error) throw error;
      //response.redirect(`/page/${post.id}`);
    });
    

    var title = '메인ㄴ';    
    var list = '<div id="container3">';
    
    console.log(list);
    var checkday = "2022-08-25"

    db.query('SELECT * FROM reserveTable WHERE date = ?', [checkday], function (error2, results) {
        //console.log(results);
        //console.log(results[0].t2);
        for (const [key, value] of Object.entries(results[0])) {
            if (key !== "id" && key !== "date" && key !== "disable") {
                console.log(`${key}: ${value}`);

                if(value==="disable"){
                    list = list + `
                    <div class="resvBox" style="background-color : #F9F9F9; border: none;">
                        <span><b>${checkday}</b> | ${tnToTime(key)}</span>
                        <span><a class=btn_noborder>활성화</a></span>
                    </div>
                    ` 
                }
                else if(value===null){
                    list = list + `
                    <div class="resvBox">
                        <span><b>${checkday}</b> | ${tnToTime(key)}</span>
                        <span><a class=btn_noborder>예약</a> | <a class=btn_noborder>비활성화</a></span>
                    </div>
                    `
                }
                else{
                    list = list + `
                    <div class="resvBox">
                        <span><b>${checkday}</b> | ${tnToTime(key)}</span><span>${value}</span>
                        <span><a class=btn_clicked>취소</a></span>
                    </div>
                    `
                }
            }
        }        
        list = list+'</div>';
        //console.log(list);        

        var html = template.HTML(title,'<script src="script_admin.js"></script>',        
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


    
});









module.exports = router; 