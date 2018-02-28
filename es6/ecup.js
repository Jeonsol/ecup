
/* ecup environment module */
ecup.ecup_env_module = {
    getFnBody: (options) => {
        let body = '';
        if (options.addClass) body += 'ecup.ecup_function_module.addClass(that, "' + options.addClass + '");';
        return body;
    },
    classNamesToArray: function(classNames) {
        return classNames.match(/\b\S+\b/g);
    },
    array_contain: (arr, val) => {
        
    },
    array_add: (arr, val) => {

    },
    array_remove: (arr, val) => {

    }
};

/* ecup function module */
ecup.ecup_function_module = {
    addClass: function(target, classNames) {
        ecup.ecup_env_module.classNamesToArray(classNames).forEach(function(className) {
            if (target.classList) return target.classList.add(className);
            else {
                let targetClasses = ecup.ecup_env_module.classNamesToArray(target.className);
                ecup.ecup_env_module.array_add(targetClasses, className);
                target.className = targetClasses.join(' ');
            }
        });
    }
};

/* ecup class */
class Ecup {
    constructor(switch_selector) {
        this.doms = document.querySelectorAll(switch_selector);
        this.event = 'click';
    }

    e(event_type) {
        this.event = event_type;
        return this;
    }

    target(target_selector, options) {
        let body_fn = 'for (var i = 0; i < this.length; ++i) { var that = this[i];'
        + ecup.ecup_env_module.getFnBody(options)
        + '}';
        let fn = (new Function('event', body_fn)).bind(document.querySelectorAll(target_selector));

        for (let i = 0; i < this.doms.length; ++i) {
            let dom = this.doms[i];
            dom.addEventListener(this.event, fn, false);
        }
        return this;
    }
}

/* ecup factory method */
function ecup(switch_selector) {

    return new Ecup(switch_selector);
}

