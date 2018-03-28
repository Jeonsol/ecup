/* IE9 애니메이션 지원 */

jQuery.fn.animation = function(animate, option = null) {
    var target = this;
    if(typeof animate == 'object'){
        convertAnimation(animate);
    } else {
        var func = jQuery.animation.keyframes.get(animate);
        convertAnimation(target, func, option);
    }
};

jQuery.animation = function(code){;
    var name = code.name;
    var animate = code.animate;

    jQuery.animation.keyframes.set(name, animate);
}
jQuery.animation.keyframes = new Map();

function convertTransition(animate){
    var pro = animate.property != null ? animate.property : 'a;l'
}

function convertAnimation($target, func, option){
    var duration = isNaN(Number(option.duration)) == true ? Number(option.duration.replace('s','')) * 1000 : Number(option.duration);
    var animateOption = getOption(func, duration);

    var animateEvent = null;
    $.each(animateOption, function(index){
        animateReturn(animateOption, index);
    })

    $target.animate();

    function animateReturn(animateOption, index){
        var point = animateOption[index].point;
        var dur = animateOption[index].duration;
        var css = animateOption[index].css;

        if(point == 0) {
            $target.css(css);
        } else if(point == 100) {
            $target.animate(css, {
               duration: dur,
               done: function(){
                   $target.removeAttr('style');
               }
            })
        } else {
            if(animateEvent == null) {
                animateEvent = $target.animate(css, {
                   duration: dur
               })
            } else {
               animateEvent.delay(animateOption[index-1]).animate(css, {
                  duration: dur,
              })
           }
        }
    }

    function getOption(option, dur){
        var opt = [];
        for( var point in option ) {
            opt.push({ point: Number(point) ,duration: dur / 100 * point, css: option[point]});
        }
        return opt;
    }
}
