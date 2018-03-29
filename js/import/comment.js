function comment() {

	function commentManager() {

		init();

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

	commentManager.targetData = [];
	commentManager.targetDom = $('<div class="__ecup_comment_section"></div>');
	$('body').append(commentManager.targetDom);

	return new commentManager;

	function init() {
		var $elementTarget = [];
		for(var i = 0; i < document.all.length; i++) {
			var $element = $(document.all[i]);
			if($element.css('overflow') === 'scroll' || $element.css('overflow') === 'auto' || $element.css('overflow-x') === 'scroll' || $element.css('overflow-x') === 'auto' || $element.css('overflow-y') === 'scroll' || $element.css('overflow-y') === 'auto')
				$elementTarget.push($element);
		}
		commentManager.overflowTarget = $elementTarget;

		reRenderComment();

	}


	function singleWrite(target,msg) {
		var $commentArea = $('<div class="__comment_area">' + msg + '</div>');

		commonWrite(target,$commentArea);
	}

	function groupWrite(flag) {
		for (var opt in flag) {
			var $commentArea = $('<div class="__comment_area">' + flag[opt] + '</div>');

			commonWrite(opt,$commentArea);
		}
	}

	function commonWrite(target,$commentArea) {

		var $commentDom = $('<div class="__ecup_comment"></div>');
		var $commentBtn = $('<button type="button" class="__comment_btn"><span class="blind">코멘트토글</span></button>');

		$commentDom.append($commentBtn).append($commentArea);

		var $target = $(target);
		if($target.length) {
			var top = $target.offset().top/$(window).height()*100+'%';
			var left = $target.offset().left/$(window).width()*100+'%';
		}

		$commentDom.css({'top': top, 'left': left});

		commentManager.targetDom.append($commentDom);

		$commentBtn.click(function() {
			var $commentArea = $(this).next('.__comment_area');

			$commentArea.toggle();

			var $commentAreaRightOffset = $commentArea.offset().left+$commentArea.innerWidth();

			if($(window).width() - $commentAreaRightOffset < 20) {
				$commentArea.css({'right':'0','left':'auto'});
			}

		});

		commentManager.targetData.push(target);

	}

	function reRenderComment() {
		var targetData, commentData, $targetData, $commentData, top, left, $scrolltarget;

		$(window).on("resize scroll",function() {
			targetData = commentManager.targetData || [];
			commentData = commentManager.targetDom.find('.__ecup_comment') || [];

			for (var i = 0; i < targetData.length; i++) {
				$targetData = $(targetData[i]);
				$commentData = $(commentData[i]);

				if($targetData.length) {
					top = $targetData.offset().top / $(window).height() * 100 + '%';
					left = $targetData.offset().left / $(window).width() * 100 + '%';
				}

				$commentData.css({'top': top, 'left': left});

			}
		});

		$(document).ready(function() {
			$scrolltarget = commentManager.overflowTarget;

			for(var t = 0;t < $scrolltarget.length ;t++) {
				$scrolltarget[t].on("scroll",function() {
					targetData = commentManager.targetData || [];
					commentData = commentManager.targetDom.find('.__ecup_comment') || [];

					for(var i = 0; i < targetData.length; i++) {
						$targetData = $(targetData[i]);
						$commentData = $(commentData[i]);

						if($targetData.length) {
							top = $targetData.offset().top / $(window).height() * 100 + '%';
							left = $targetData.offset().left / $(window).width() * 100 + '%';
						}

						$commentData.css({'top': top, 'left': left});
					}

				})
			}
		})

	}
}
