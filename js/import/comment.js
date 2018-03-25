function comment() {

	function commentManager() {

	}

	commentManager.prototype = {
		constructor: commentManager,
		write : function(flag) {
			if (typeof  flag === 'string') {
				singleWrite(arguments[0],arguments[1]);
			}

			else if(typeof flag === 'object') {
				groupWrite(flag);
			}
		}
	};

	commentManager.targetDom = $('<div class="ecup_comment_section"></div>');
	$('body').append(commentManager.targetDom);

	return new commentManager;

	function singleWrite(target,msg) {
		var $target = $(target);
		var top = $target.offset().top/$(window).height()*100+'%';
		var left = $target.offset().left/$(window).width()*100+'%';

		var $commentArea = $('<div class="comment_area"><div class="outer_comment"><div class="inner_comment">' + msg + '</div></div></div>');

		commonWrite(top,left,$commentArea);
	}

	function groupWrite(flag) {
		for (var opt in flag) {
			var top = $(opt).offset().top/$(window).height()*100+'%';
			var left = $(opt).offset().left/$(window).width()*100+'%';

			var $commentArea = $('<div class="comment_area"><div class="outer_comment"><div class="inner_comment">' + flag[opt] + '</div></div></div>');

			commonWrite(top,left,$commentArea);

		}
	}

	function commonWrite(top,left,$commentArea) {

		var $commentDom = $('<div class="ecup_comment"></div>');
		var $commentBtn = $('<button type="button" class="comment_btn"><span class="blind">코멘트토글</span></button>');

		$commentDom.append($commentBtn).append($commentArea);
		$commentDom.css({'top': top, 'left': left});

		commentManager.targetDom.append($commentDom);

		$commentBtn.click(function() {
			var $commentArea = $(this).next('.comment_area');

			$commentArea.toggle();

			var $commentAreaRightOffset = $commentArea.offset().left+$commentArea.innerWidth();

			if($(window).width() - $commentAreaRightOffset < 20) {
				$commentArea.css({'right':'0','left':'auto'});
			}

		});

	}

}
