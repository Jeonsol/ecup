
window.onload = function() {
	// 자바스크립트 예약어 색 입히기
	var js_boxs = document.getElementsByClassName('code_js');

	for (var i = 0; i < js_boxs.length; ++i) {
	    var box = js_boxs[i];
	    var newHTML = box.innerHTML.replace(/(var|function|;)/g, '<span class="id">$1</span>'); // 키워드
	    newHTML = newHTML.replace(/('[^']+')/g, '<span class="str">$1</span>'); // 문자열
	    newHTML = newHTML.replace(/(\/\/[^\n]*(?=<\/p>))/gm, '<span class="cm">$1</span>'); // 주석
	    newHTML = newHTML.replace(/(?<=\S)(\.\w+)(?=\()/g, '<span class="fn">$1</span>'); // 메소드 호출
	    box.innerHTML = newHTML;
	}

	// HTML 예약어 색 입히기
	var html_boxs = document.getElementsByClassName('code_html');

	for (var i = 0; i < html_boxs.length; ++i) {
	    var box = html_boxs[i];
	    var newHTML = box.innerHTML.replace(/("[^"]*")/g, '<span class="val">$1</span>'); // 속성
	    newHTML = newHTML.replace(/(&lt;[a-zA-Z]+)(?=&gt;|\s)/g, '<span class="tag">$1</span>'); // 태그
	    newHTML = newHTML.replace(/(\/&gt;)/g, '<span class="tag">$1</span>'); // 태그
	    newHTML = newHTML.replace(/(\/\/[^\n]*(?=<\/p>))/gm, '<span class="cm">$1</span>'); // 주석
	    box.innerHTML = newHTML;
	}
}
