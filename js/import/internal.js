var $body = $(document.body);
$body.append($wrap);

var topOrigin = -$wrap.height();

$wrap.css({
    top: topOrigin,
    maxWidth: '400px',
    opacity: 0.5
});

$body.longClick(function(e) {
    $wrap.animate({
        top: 0,
        opacity: 1
    }, 300);
}, 1000);

$body.on('mousedown', function(e) {
    $wrap.animate({
        top: topOrigin,
        opacity: 0.5
    }, 300);
});
