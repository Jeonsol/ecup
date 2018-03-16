function comment() {

	var userObj;

	function Main(flag) {

		if (typeof  flag === 'string') {
			userObj = new Main();
			userObj.singleWrite(arguments[0],arguments[1]);
		}

		else if(typeof flag === 'object') {
			userObj = new Main();
			userObj.groupWrite(flag);
		}

	}

	Main.prototype = {
		constructor: Main,
		singleWrite : function(target,msg) {

			var $target = $(target);
			var top = $target.offset().top/$(window).height()*100+'%';
			var left = $target.offset().left/$(window).width()*100+'%';

			var $commentArea = $('<div class="comment_area"><div class="outer_comment"><div class="inner_comment">' + msg + '</div></div></div>');

			commonWrite(top,left,$commentArea);

		},
		groupWrite : function(flag) {

			for (var opt in flag) {
				var top = $(opt).offset().top/$(window).height()*100+'%';
				var left = $(opt).offset().left/$(window).width()*100+'%';

				var $commentArea = $('<div class="comment_area"><div class="outer_comment"><div class="inner_comment">' + flag[opt] + '</div></div></div>');

				commonWrite(top,left,$commentArea);

			}

		}
	};

	comment.targetDom = $('<div class="ecup_comment_section"></div>');
	$('body').append(comment.targetDom);

	return Main;

	function commonWrite(top,left,$commentArea) {

		var $commentDom = $('<div class="ecup_comment"></div>');
		var $commentBtn = $('<button type="button" class="comment_btn"><span class="blind">코멘트토글</span></button>');

		$commentDom.append($commentBtn).append($commentArea);
		$commentDom.css({'top': top, 'left': left});

		comment.targetDom.append($commentDom);

		$commentBtn.click(function() {
			$(this).next('.comment_area').toggle();
		});

	}

}
