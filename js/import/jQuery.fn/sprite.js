/* 스프라이트 */
jQuery.fn.sprite = function(obj) {

    var target = $(this);
    var url =  obj.url,
        count = obj.count != null ? obj.count : 10,
        pos = obj.pos != null ? obj.pos : 40,
        ori = obj.orient == 'horizontal'? 'y' : 'x',
        dur = obj.duration != null ? obj.duration * 100 : 100,
        mode = obj.mode != null ? obj.mode : 'maintain';

    if(url != null) {
        target.css('background-image', 'url('+ url+')');
    }

    var aniInterval = null;
    select_animation();

    function select_animation(){
        var index = 1;

        target.css('background-position-'+ ori,'0');

        if(aniInterval != null) {
            clearInterval(aniInterval);
        }

        aniInterval = setInterval(function(){
            if(index <= count-1)
                target.css('background-position-'+ ori, -(pos * index++) + 'px' );
            else {
                mode == 'remove' ? target.removeAttr('style') : '';
                clearInterval(aniInterval);
            }
        }, dur);
    }
};
