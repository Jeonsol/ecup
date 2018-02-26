/*
    user_xx 함수 :  사용자 사용 함수
    win_xx 함수 : 새창 제어 함수
*/

var ecup = {};
var newWindow;
ecup.go  = function(){
    this.open = ecup.win_init;
    this.click = ecup.user_click;
    this.style = ecup.user_style;
    this.target = '';
    this.obj = {
        target: '',
        events: [],
    }
}

// 명세서 새창
ecup.win_init = function(){
    newWindow = window.open('', 'newWindow', 'width=300, height=500');
    newWindow.document.body.innerHTML = ecup.win_css() +  ecup.win_html();
}

// 명세서 css
ecup.win_css = function(){
    var css = '<style>button { border: none; background: white; }</style>';
    return css;
}

// 명세서 html
ecup.win_html = function(){
    var html = '';
    html = html + '<button onclick="' + ecup.win_script('h1','alert') +'">button</button>';

    return html;
}

// 명세서 script ( in button )
ecup.win_script = function(target, className){
    var script = '';
    script = script + addclass();
    return script;

    function addclass(){
        var code = '';
        code = code + "window.opener.document.querySelector('" + target + "').setAttribute('class','" + className + "')";
        return code;
    }
}

// 사용자 click 이벤트 설정 함수
ecup.user_click = function(target){
    this.obj.target = target;
    return this;
}

// 사용자 css 설정 함수
ecup.user_style = function(style){
    document.querySelector(this.obj.target).addEventListener('click', function(){
        this.setAttribute('style',style);
    });
    this.obj.target = '';
}
