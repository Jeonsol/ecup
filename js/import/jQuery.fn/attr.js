function attr_HOF(attrParams, callback) {

    var that = this;

    Array.prototype.forEach.call(attrParams, function(attrParam) {

        var attr, val, regExp;

        if (typeof attrParam !== 'string') throw new Error("check a type of attribute parameter");

        attrParam = $.trim(attrParam);
        attrParam += ' ';

        switch (callback) {
            case attr_PF_remove:
                regExp = /([^\s,]+)(?=[\s,])/g;
                break;
            case attr_PF_add:
            case attr_PF_toggle:
                regExp = /([^\s,]+)="([^",]+)"(?=[\s,])/g;
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

function attr_PF_add($dom, attr, val) {
    $dom.attr(attr, val);
}

function attr_PF_remove($dom, attr) {
    $dom.removeAttrOrigin(attr);
}

function attr_PF_toggle($doms, attr, val) {
    $.each($doms, function(i, dom) {
        var $dom = $(dom);
        if ($dom.attr(attr)) $dom.removeAttrOrigin(attr);
        else $dom.attr(attr, val);
    });
}


jQuery.fn.addAttr = function() {attr_HOF.call(this, arguments, attr_PF_add);};
jQuery.fn.removeAttrOrigin = jQuery.fn.removeAttr;
jQuery.fn.removeAttr = function() {attr_HOF.call(this, arguments, attr_PF_remove);};
jQuery.fn.toggleAttr = function() {attr_HOF.call(this, arguments, attr_PF_toggle);};
