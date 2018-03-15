/* 속성 추가/수정 */
jQuery.fn.addAttr = function() {
    jQuery.fn.addAttr.PF = function($dom, attr, val) {
        $dom.attr(attr, val);
    };
    HOF_parseMap.call(this, arguments, jQuery.fn.addAttr.PF);
};

/* 속성 삭제 */
jQuery.fn.removeAttrOrigin = jQuery.fn.removeAttr;
jQuery.fn.removeAttr = function() {
    jQuery.fn.removeAttr.PF = function($dom, attr) {
        $dom.removeAttrOrigin(attr);
    };
    HOF_parseMap.call(this, arguments, jQuery.fn.removeAttr.PF);
};

/* 속성 토글 */
jQuery.fn.toggleAttr = function() {
    jQuery.fn.toggleAttr.PF = function($doms, attr, val) {
        $.each($doms, function(i, dom) {
            if (dom.hasAttribute(attr)) dom.removeAttribute(attr);
            else dom.setAttribute(attr, val);
        });
    };
    HOF_parseMap.call(this, arguments, jQuery.fn.toggleAttr.PF);
};

/* 인라인 스타일 추가/수정 */
jQuery.fn.addStyle = function() {
    jQuery.fn.addStyle.PF = function($doms, style, val) {
        $.each($doms, function(i, dom) {
            dom.style[style] = val;
        });
    };
    HOF_parseMap.call(this, arguments, jQuery.fn.addStyle);
};

/* 인라인 스타일 삭제 */
jQuery.fn.removeStyle = function() {
    jQuery.fn.removeStyle.PF = function() {

    };
    HOF_parseMap.call(this, arguments, jQuery.fn.removeStyle);
};

/* 인라인 스타일 토글 */
jQuery.fn.toggleStyle = function() {
    jQuery.fn.toggleStyle.PF = function() {

    };
    HOF_parseMap.call(this, arguments, jQuery.fn.toggleStyle);
};



function HOF_parseMap(attrParams, callback) {

    var that = this;

    Array.prototype.forEach.call(attrParams, function(attrParam) {

        var attr, val, regExp;

        if (typeof attrParam !== 'string') throw new Error("check a type of attribute parameter");

        attrParam = $.trim(attrParam);
        attrParam += ' ';

        switch (callback) {
            case jQuery.fn.removeAttr.PF:
            case jQuery.fn.removeStyle.PF:
                regExp = /([^\s,]+)(?=[\s,])/g;
                break;
            case jQuery.fn.addAttr.PF:
            case jQuery.fn.toggleAttr.PF:
                regExp = /([^\s,]+)="([^",]+)"(?=[\s,])/g;
                break;
            case jQuery.fn.addStyle.PF:
            case jQuery.fn.toggleStyle.PF:
                regExp = /([\w-]+)\s*:\s*([^\S]+)(?=[,;])/g;
                break;
        }

        while(true) {

            var temp = regExp.exec(attrParam);
            if (temp === null) break;

            if (temp[1]) attr = temp[1];
            if (temp[2]) val = temp[2];

            callback(that, attr, val);

        }

    });

}
