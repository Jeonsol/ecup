function attr_HOF(attributes, callback) {

    if (typeof attributes !== 'string') throw new Error("check a type of attribute parameter");

    attributes.trim();
    attributes += ' ';

    var regExp = /(\S+)="([^"]+)"(?=\s)/g;

    while(true) {

        var temp = regExp.exec(attributes);
        if (temp === null) break;

        var attr = temp[1],
            val = temp[2];

        callback(this, attr, val);

    }

}

function attr_PF_add($dom, attr, val) {
    $dom.attr(attr, val);
}

function attr_PF_remove


jQuery.fn.addAttr = function(attributes) {attr_HOF.call(this, attributes, attr_PF_add)};