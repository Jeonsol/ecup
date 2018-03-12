// 코드박스 예약어 색 입히기
var boxs = document.getElementsByClassName('box_code');

for (var i = 0; i < boxs.length; ++i) {
    var box = boxs[i];
    var newHTML = box.innerHTML.replace(/(var|function|;)/g, '<span class="id">$1</span>'); // 키워드
    newHTML = newHTML.replace(/('[^']+')/g, '<span class="str">$1</span>'); // 문자열
    newHTML = newHTML.replace(/(\/\/[^\n]*(?=<\/p>))/gm, '<span class="cm">$1</span>'); // 주석
    newHTML = newHTML.replace(/(?<=\S)(\.\w+)(?=\()/g, '<span class="fn">$1</span>'); // 메소드 호출
    box.innerHTML = newHTML;
}