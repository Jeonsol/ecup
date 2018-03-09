/* 사용자 코드 파싱, obj 추출 */
function codeParser(options, callback, groupInfo) {

    // 공통 dom 생성
    if (groupInfo)
        var commonTarget = $(groupInfo.groupDom.join(','));


    // option 의 객체/함수 여부 검사
    for (var btnName in options) {

        var option = options[btnName];
        // 함수가 아닐경우
        if (typeof option === 'object') {

            console.log(option);

            // 옵션에 타겟이 없는 경우, 공통 타겟을 할당
            if (!option.target) option.target = commonTarget;
            else option.target = $(option.target);

            option = parsing(option);
            options[btnName] = option;
        }

    }

    return options;


    // 옵션을 함수로 변환
    function parsing(option) {

        if (!option.target) throw new Error('target 이 반드시 필요합니다...');

        var fn, fnPart;
        var fnBody = 'var that = this;';

        for (var optFn in option) {
            if (optFn === 'target') continue;
            fnPart = 'that.' + optFn + '("' + option[optFn] + '");';
            fnBody += fnPart;
        }

        fn = new Function(fnBody);
        fn = fn.bind(option.target);

        return fn;

    }

}