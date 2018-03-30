// JS 코드 색 입히기
var js_boxs = document.querySelectorAll('.code_js .inner_code');
var html_boxs = document.querySelectorAll('.code_html .inner_code');

eachLine(js_boxs, applyJsStyle);
eachLine(html_boxs, applyHTMLStyle);

function eachLine(boxs, callback) {
	for (var i = 0; i < boxs.length; ++i) {
	    var box = boxs[i];
		var lines = box.children;

		for (var j = 0; j < lines.length; ++j)
			callback(lines[j], j+1);
	}
}

function applyJsStyle(element, num) {

	$element = $(element);

	var newHTML = $element.html().replace(/(var(?=\s)|function(?=\())/g, '<span class="kw">$1</span>'); // 예약어
	newHTML = newHTML.replace(/('[^']+')/g, '<span class="str">$1</span>'); // 문자열
	newHTML = newHTML.replace(/(\/\/[\w\W]+)/gm, '<span class="cm">$1</span>'); // 주석
	newHTML = newHTML.replace(/(?<=\S)(\.[\w\$]+)(?=\()/g, '<span class="mtd">$1</span>'); // 메소드 호출
	newHTML = newHTML.replace(/(?<=: )(\d[\d.]+)(?=[\s,])/g, '<span class="num">$1</span>');
	newHTML = newHTML.replace(/\s{4}/g, '<span class="tab"></span>');

	$element.html(newHTML);
	$element.prepend(createNumberNode(num));
}

function applyHTMLStyle(element, num) {

	$element = $(element);

	var newHTML = $element.html().replace(/("[^"]*")/g, '<span class="val">$1</span>'); // 속성
	newHTML = newHTML.replace(/(&lt;[a-zA-Z]+)(?=&gt;|\s)/g, '<span class="tag">$1</span>'); // 태그
	newHTML = newHTML.replace(/(\/&gt;)/g, '<span class="tag">$1</span>'); // 태그
	newHTML = newHTML.replace(/(\/\/[\w\W]+)/gm, '<span class="cm">$1</span>'); // 주석

	$element.html(newHTML);
	$element.prepend(createNumberNode(num));
}

function createNumberNode(num) {
	return $('<span class="line">' + num + '</span>');
}
