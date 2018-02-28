'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* ecup environment module */
ecup.ecup_env_module = {
    getFnBody: function getFnBody(options) {
        var body = '';
        if (options.addClass) body += 'ecup.ecup_function_module.addClass(that, "' + options.addClass + '");';
        return body;
    },
    classNamesToArray: function classNamesToArray(classNames) {
        return classNames.match(/\b\S+\b/g);
    },
    array_contain: function array_contain(arr, val) {},
    array_add: function array_add(arr, val) {},
    array_remove: function array_remove(arr, val) {}
};

/* ecup function module */
ecup.ecup_function_module = {
    addClass: function addClass(target, classNames) {
        ecup.ecup_env_module.classNamesToArray(classNames).forEach(function (className) {
            if (target.classList) return target.classList.add(className);else {
                var targetClasses = ecup.ecup_env_module.classNamesToArray(target.className);
                ecup.ecup_env_module.array_add(targetClasses, className);
                target.className = targetClasses.join(' ');
            }
        });
    }
};

/* ecup class */

var Ecup = function () {
    function Ecup(switch_selector) {
        _classCallCheck(this, Ecup);

        this.doms = document.querySelectorAll(switch_selector);
        this.event = 'click';
    }

    _createClass(Ecup, [{
        key: 'e',
        value: function e(event_type) {
            this.event = event_type;
            return this;
        }
    }, {
        key: 'target',
        value: function target(target_selector, options) {
            var body_fn = 'for (var i = 0; i < this.length; ++i) { var that = this[i];' + ecup.ecup_env_module.getFnBody(options) + '}';
            var fn = new Function('event', body_fn).bind(document.querySelectorAll(target_selector));

            for (var i = 0; i < this.doms.length; ++i) {
                var dom = this.doms[i];
                dom.addEventListener(this.event, fn, false);
            }
            return this;
        }
    }]);

    return Ecup;
}();

/*
function Ecup(switch_selector) {
    this.doms = document.querySelectorAll(switch_selector);
    this.event = 'click';
}
Ecup.prototype = {
    constructor: Ecup,
    e: (event_type) => {
        let that = this;
        that.event = event_type;
        return that;
    },
    target: (target_selector, options) => {
        let body_fn = 'for (var i = 0; i < this.length; ++i) { var that = this[i];'
            + ecup.ecup_env_module.getFnBody(options)
            + '}';
        let fn = (new Function('event', body_fn)).bind(document.querySelectorAll(target_selector));

        for (let i = 0; i < this.doms.length; ++i) {
            let dom = this.doms[i];
            if (dom.addEventListener) dom.addEventListener(this.event, fn, false);
            else if (dom.attachEvent) dom.attachEvent('on' + this.event, fn);
        }
        return this;
    }
};
*/

/* ecup factory method */


function ecup(switch_selector) {

    return new Ecup(switch_selector);
}