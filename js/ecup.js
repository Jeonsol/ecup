if(typeof(Module) == "undefined") var Module = {};
(function(doc){
    Module.Element = function(){
        this.initalize.apply(this,arguments);
    }

    Module.Element.prototype = {
        initalize : function(target) {
            this.dom =  doc.querySelector(target);
        },

        init_arguemnt : function(){
            this.eventType = null;
        },

        style : function(css){
            var dom = this.dom;
            if(this.eventType != null) {
                dom.addEventListener(this.eventType, function(){
                    dom.setAttribute('style', css);
                })
            }else {
                dom.setAttribute('style', css);
            }

            this.init_arguemnt();
            return this;
        },

        event : function(type){
            var dom = this.dom;
            this.eventType = type;
            return this;
        },

        addClass : function(className){
            var dom = this.dom;

            if(this.eventType != null) {
                dom.addEventListener(this.eventType, function(){
                    dom.className += ' ' + className;

                })
            }
            else {
                dom.className += ' ' + className;
            }
            return this;
        },
    }
})(document);

function _(target){
    return new Module.Element(target);
}
