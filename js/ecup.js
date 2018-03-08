/*
[구조]

1. 메인 함수
    jQuery 확장객체를 통해 확장
    jQuery prototype 확장객체를 통해 확장

    부가기능
    - 디자이너에게 코멘트 달기
    <div></div>

2. jQuery 확장
    - 마크업 레이어
        1). 코드 파싱 모듈
        2). 뷰 처리 모듈
        2-1) external 모듈
        2-2) internal 모듈
        2-3) layer 모듈

3. jQuery prototype 확장 (jQuery 플러그인)
    - $().toggleAttr()
    - $().clickToggle($(dom));
    - ie 9 이하 애니메이션 처리

[마크업 레이어 모듈 절차]

1. 사용자 코드 파싱 (사용자 코드를 마크업레이어 DOM과 이벤트함수로 바꾸는 과정)
2. type에 따른 DOM(버튼.. 등) 생성과 이벤트 붙이기 (팝업창은 document.write, 기타는 나머지 방법?아마도 dom 생성에서 body에 추가)

 */
function markupLayer() {

    // type check => 뷰처리 함수 실행
    var obj = codeParsing(code, fn);


    function codeParsing(code, callback) {
        var obj = {
            dom: function(e) {

            }
        };

        callback(obj);
    }

    function windows() {

    }

    function internal() {

    }

    function external() {

    }

}

(function main() {

    var ecupExtended = {
        markupLayer: function() {
            // TODO
        }
    };

    var ecupPrototype = {
        toggleAttr: function() {
            // TODO
        }
    };

    // jquery 확장객체
    jQuery.ecup.extend(ecupExtended);

    // jquery prototype 확장객체
    jQuery.fn.extend(ecupPrototype..);

    // 부가기능 실행
    ecupExecuted.exec();
})();
