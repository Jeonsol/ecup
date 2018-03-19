/* IE9 애니메이션 지원 */

jQuery.fn.animation = function(animate, option = null) {
    var target = this;
    if(typeof animate == 'object'){

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
jQuery.animation.run = function(){

}

function convertAnimation($target, func, option){
    console.log(option)
    var duration = isNaN(Number(option.duration)) == true ? Number(option.duration.replace('s','')) * 1000 : Number(option.duration);
    var animateOption = getOption(func, duration);

    // for( var point in func ) {
    //     switch(Number(point)) {
    //         case 0 :
    //             $target.css(func[point]);
    //             break;
    //         case 100:
    //             $target.animate(func[point], {
    //                 duration: duration,
    //                 done: function(){
    //                     $target.removeAttr('style');
    //                 }
    //             });
    //             break;
    //         default :
    //
    //
    //             break;
    //     }
    // }
    // console.log(animateOption);
    // for( var point in animateOption ) {
    //     var dur = animateOption[point].duration;
    //     var css = animateOption[point].css;
    //     // console.log(animateOption[point]);
    //     if(point == 0) {
    //         $target.css(css);
    //     } else {
    //         $target.animate(css, {
    //             duration: duration,
    //             done: function(){
    //                 $target.removeAttr('style');
    //             }
    //         });
    //     }
    // }

    $.each(animateOption, function(index){
        var dur = animateOption[index].duration;
        var css = animateOption[index].css;

        if(animateOption[index].duration == 0) {
             $target.css(css);
        } else {
            $target.animate(css, {
               duration: dur,
               done: function(){
                   $target.removeAttr('style');
               }
           });
        }
    })

    function getOption(option, dur){
        var opt = [];
        for( var point in option ) {
            // opt[point] = { duration: dur / 100 * point, css: option[point]};
            opt.push({ point: Number(point) ,duration: dur / 100 * point, css: option[point]});
        }
        return opt;
    }
    $target.animate();
}
