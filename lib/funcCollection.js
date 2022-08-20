module.exports = {
  tnToTime: function (tn) {
    if (tn == "t0") return "00:00~01:00";
    else if (tn == "t1") return "01:00~02:00";
    else if (tn == "t2") return "02:00~03:00";
    else if (tn == "t3") return "03:00~04:00";
    else if (tn == "t4") return "04:00~05:00";
    else if (tn == "t5") return "05:00~06:00";
    else if (tn == "t6") return "06:00~07:00";
    else if (tn == "t7") return "07:00~08:00";
    else if (tn == "t8") return "08:00~09:00";
    else if (tn == "t9") return "09:00~10:00";
    else if (tn == "t10") return "10:00~11:00";
    else if (tn == "t11") return "11:00~12:00";
    else if (tn == "t12") return "12:00~13:00";
    else if (tn == "t13") return "13:00~14:00";
    else if (tn == "t14") return "14:00~15:00";
    else if (tn == "t15") return "15:00~16:00";
    else if (tn == "t16") return "16:00~17:00";
    else if (tn == "t17") return "17:00~18:00";
    else if (tn == "t18") return "18:00~19:00";
    else if (tn == "t19") return "19:00~20:00";
    else if (tn == "t20") return "20:00~21:00";
    else if (tn == "t21") return "21:00~22:00";
    else if (tn == "t22") return "22:00~23:00";
    else if (tn == "t23") return "23:00~24:00";
    else return "error";
  },
  findMonday: function (inputDay) {
    var day = inputDay.getDay();
    // day = 일요일 0 월요일 1 ~ 토요일 6      
    inputDay.setDate(inputDay.getDate() - day + (day == 0 ? -6 : 1));
    // 해당 주 월요일 계산 (월요일이 주의 시작이라 가정)
    return inputDay;
  },
  findSunday: function (inputDay) {
    var day = inputDay.getDay();
    // day = 일요일 0 월요일 1 ~ 토요일 6      
    inputDay.setDate(inputDay.getDate() - day + (day == 0 ? -6 : 1) + 6);
    // 해당 주 일요일 계산 (월요일+6일)
    return inputDay;
  },
  leftPad: function (value) {
    if (value < 10) {
      value = "0" + value;
      return value;
    }
    return value;
  },
  dateToDayKr: function (date) {
    var week = ['일', '월', '화', '수', '목', '금', '토']; 
    return week[date.getDay()];
  },
  dateToString: function (date) {  

    let month = date.getMonth() + 1;
    let day = date.getDate();
    month = month >= 10 ? month : '0' + month;
    day = day >= 10 ? day : '0' + day;

    /*
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();
    hour = hour >= 10 ? hour : '0' + hour;
    minute = minute >= 10 ? minute : '0' + minute;
    second = second >= 10 ? second : '0' + second;
    */

    return date.getFullYear() + '-' + month + '-' + day;
  } 
}