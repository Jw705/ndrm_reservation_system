window.onload = function () {     // 웹 페이지가 로드되면 buildCalendar 실행    
    checkDate = new Date(document.getElementById("dateChoiceMenu2").innerText); // 선택된 날
    nowMonth = checkDate; // 선택된 날을 달력의 현재 달로 설정

    buildCalendar();
    document.getElementById("container3").style.display = "block";      // 예약내용 관리 메뉴 컨테이너 활성화 
    collapse(document.getElementById("timeChoiceMenu"));                // 예약내용 관리 메뉴 펼치기
}

let nowMonth = new Date();  // 현재 달을 페이지를 로드한 날의 달로 초기화
let today = new Date();     // 페이지를 로드한 날짜를 저장
today.setHours(0, 0, 0, 0);    // 비교 편의를 위해 today의 시간을 초기화

// 달력 생성 : 해당 달에 맞춰 테이블을 만들고, 날짜를 채워 넣는다.
function buildCalendar() {

    let firstDate = new Date(nowMonth.getFullYear(), nowMonth.getMonth(), 1);       // 이번달 1일
    let lastDate = new Date(nowMonth.getFullYear(), nowMonth.getMonth() + 1, 0);    // 이번달 마지막날    

    let tbody_Calendar = document.querySelector(".Calendar > tbody");
    document.getElementById("calYear").innerText = nowMonth.getFullYear();             // 연도 숫자 갱신
    document.getElementById("calMonth").innerText = leftPad(nowMonth.getMonth() + 1);  // 월 숫자 갱신

    while (tbody_Calendar.rows.length > 0) {                        // 이전 출력결과가 남아있는 경우 초기화
        tbody_Calendar.deleteRow(tbody_Calendar.rows.length - 1);
    }

    let nowRow = tbody_Calendar.insertRow();        // 첫번째 행 추가           

    for (let j = 0; j < firstDate.getDay(); j++) {  // 이번달 1일의 요일만큼
        let nowColumn = nowRow.insertCell();        // 열 추가
    }

    for (let nowDay = firstDate; nowDay <= lastDate; nowDay.setDate(nowDay.getDate() + 1)) {   // day는 날짜를 저장하는 변수, 이번달 마지막날까지 증가시키며 반복  

        let nowColumn = nowRow.insertCell();        // 새 열을 추가하고

        let newDIV = document.createElement("p");
        newDIV.innerHTML = leftPad(nowDay.getDate());        // 추가한 열에 날짜 입력
        nowColumn.appendChild(newDIV);

        if (nowDay.getDay() == 6) {                 // 토요일인 경우
            nowRow = tbody_Calendar.insertRow();    // 새로운 행 추가
        }

        if (nowDay < new Date('2022-09-01T00:00:00')||nowDay > new Date('2022-12-31T00:00:00')) {   // 예약불가일자는 비활성화
            newDIV.className = "pastDay";
        }
        else if (nowDay.getFullYear() == checkDate.getFullYear() && nowDay.getMonth() == checkDate.getMonth() && nowDay.getDate() == checkDate.getDate()) { // 선택된날인 경우!
            newDIV.className = "choiceDay";
            newDIV.onclick = function () { choiceDate(this); }
        }
        else if (nowDay.getFullYear() == today.getFullYear() && nowDay.getMonth() == today.getMonth() && nowDay.getDate() == today.getDate()) { // 오늘인 경우           
            newDIV.className = "today";
            newDIV.onclick = function () { choiceDate(this); }
        }
        else {                                      // 미래인 경우
            newDIV.className = "futureDay";
            newDIV.onclick = function () { choiceDate(this); }
        }
    }
}

// 날짜 선택    // 이 페이지에서는 체크 표시할 필요 없으니까 바로 페이지 전환만 함.
function choiceDate(newDIV) {   
    var choiceDateValue = nowMonth.getFullYear() + "-" + leftPad(nowMonth.getMonth() + 1) + "-" + newDIV.innerHTML;    
    window.location.assign(`./${choiceDateValue}`);
}

// 이전달 버튼 클릭
function prevCalendar() {
    nowMonth = new Date(nowMonth.getFullYear(), nowMonth.getMonth() - 1, nowMonth.getDate());   // 현재 달을 1 감소
    buildCalendar();    // 달력 다시 생성
}
// 다음달 버튼 클릭
function nextCalendar() {
    nowMonth = new Date(nowMonth.getFullYear(), nowMonth.getMonth() + 1, nowMonth.getDate());   // 현재 달을 1 증가
    buildCalendar();    // 달력 다시 생성
}

// input값이 한자리 숫자인 경우 앞에 '0' 붙혀주는 함수
function leftPad(value) {
    if (value < 10) {
        value = "0" + value;
        return value;
    }
    return value;
}

// 아코디언 메뉴
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


// '예약'버튼 클릭시 예약자 이름을 prompt()로 받아서 post로 전송하는 함수
function sendPost(url, params) {
    var form = document.createElement('form');
    form.setAttribute('method', 'post');    // POST 메서드 적용
    form.setAttribute('action', url);	    // 데이터를 전송할 url

    let name = prompt("예약자 이름을 입력해 주세요");  
    
    // 이름을 입력 받았으면 (취소 누르면 null 반환됨)
    if (name !== null) {
        // params로 들어온 값 추가
        for (var key in params) {	// key, value로 이루어진 객체 params
            var hiddenField = document.createElement('input');
            hiddenField.setAttribute('type', 'hidden'); //값 입력
            hiddenField.setAttribute('name', key);
            hiddenField.setAttribute('value', params[key]);
            form.appendChild(hiddenField);
        }

        // prompt로 입력받은 값 추가
        var hiddenField = document.createElement('input');
        hiddenField.setAttribute('type', 'hidden');
        hiddenField.setAttribute('name', 'name');
        hiddenField.setAttribute('value', name);
        form.appendChild(hiddenField);

        document.body.appendChild(form);
        form.submit();	// 전송!
    }   
    
}