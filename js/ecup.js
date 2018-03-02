if(typeof(Module) == "undefined") var Module = {};
if(typeof(winModule) == "undefined") var winModule = {};
var newWindow;

(function(doc){
    Module.Element = function(){
        this.initalize.apply(this,arguments);
    }

    Module.Element.prototype = {
        initalize : function(target) {
            this.dom =  doc.querySelector(target);
            this.target = target;
            this.windows =  newWindow;
        },

        init_arguemnt : function(){
            this.eventType = null;
        },

        style : function(css){
            var dom = this.dom;
            this.style = css;
            if(this.eventType != null) {
                dom.addEventListener(this.eventType, function(){
                    var originData = dom.getAttribute('style');
                    if(originData != null)
                        dom.setAttribute('style', originData + css);
                    else
                        dom.setAttribute('style', css);
                })
            }else {
                var originData = dom.getAttribute('style');
                if(originData != null)
                    dom.setAttribute('style', originData + css);
                else
                    dom.setAttribute('style', css);
            }

            this.init_arguemnt();
            return this;
        },

        event : function(eventType){
            var dom = this.dom;
            this.eventType = eventType;
            return this;
        },

        addClass : function(className){
            var dom = this.dom;
            this.class = className;
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

        makeBtn : function(name){
            this.windows.init(this, name);
            return this;
        }
    }

    winModule.Page = function(){
        this.initalize.apply(this,arguments);
    }

    winModule.Page.prototype = {
        initalize : function(name) {
            this.obj = [];
            this.window = window.open('', 'newWindow', 'width=300, height=500');
        },

        init : function(obj, name){
            obj.name = name;
            console.log(obj);
            this.obj.push(obj);
            for(var index in obj) {
                if (obj.hasOwnProperty(index)) {
                    var attr = obj[index];
                    var originData = doc.querySelector(obj.target).getAttribute(index);

                    if(originData != null){
                        if(index == 'style')
                            doc.querySelector(obj.target).setAttribute(index, originData.replace(obj.style, '')  );
                        else
                            doc.querySelector(obj.target).setAttribute(index, originData.replace(attr, '')  );
                    }
               }
           }
           this.window.document.body.innerHTML = this.html();
        },

        html : function(){
            var context = this;
            var html = '';

            this.obj.forEach(function(value){
                html = html + '<button onclick="' + context.script(value) +'">'+value.name+'</button>';
            });

            return html;
        },

        // 명세서 script ( in button )
        script : function(obj){
            console.log(obj);
            var script = '';
            script = script + makeScript();
            return script;

            function makeScript(){
                var code = "window.opener.document.querySelector('" + obj.target + "')";

                for(var index in obj) {
                    if (obj.hasOwnProperty(index)) {
                        var attr = obj[index];
                        if(index == 'style' || index == 'class')
                            code = code + ".setAttribute('" + index + "', '"+ attr +" ')"
                   }
                }
                return code;
            }
        },

        _ : function(target){
            return new Module.Element(target);
        }
    }

})(document);

function _(target){
    return new Module.Element(target);
}

newWindow =  new winModule.Page();
