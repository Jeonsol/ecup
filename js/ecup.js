/*
 [구조]

 1. 메인 함수
 jQuery 확장객체를 통해 확장
 jQuery prototype 확장객체를 통해 확장

 부가기능
 - 디자이너에게 코멘트 달기
 <div></div>

 2. jQuery 확장
 - 마크업 레이어
 1). 코드 파싱 모듈
 2). 뷰 처리 모듈
 2-1) external 모듈
 2-2) internal 모듈
 2-3) layer 모듈

 3. jQuery prototype 확장 (jQuery 플러그인)
 - $().toggleAttr()
 - $().clickToggle($(dom));
 - ie 9 이하 애니메이션 처리

 [마크업 레이어 모듈 절차]

 1. 사용자 코드 파싱 (사용자 코드를 마크업레이어 DOM과 이벤트함수로 바꾸는 과정)
 2. type에 따른 DOM(버튼.. 등) 생성과 이벤트 붙이기 (팝업창은 document.write, 기타는 나머지 방법?아마도 dom 생성에서 body에 추가)

 */
/*
 *
 * 메인함수 기본 구조
 *
 * 사용자 기준으로 single, group > 그리는 메소드
 * draw > 내부적으로 그리는 함수
 *
 * */
function markupLayer() {

	var viewModule = {
		'windows': windows,
		'external': external,
		'internal': internal
	};

	/* 테스트에서 ecup으로 쓰여있는함수 */
	var Main = function(flag) {

		var userObj;

		if (typeof flag === 'string') {
			// flag가 문자열인 경우, 그룹이름이기 떄문에 설정해주고 추후 group 메소드로 그린다.
			userObj = new Main();
			userObj.groupName = flag;
			return userObj;
		} else if (typeof flag === 'object') {
			// flag가 객체인 경우, flag가 바로 옵션이 되며 single로 그린다.
			userObj = new Main();
			userObj.single(flag);
			return userObj;
		}

	};

	Main.set = function(options) {
		if (typeof options === 'object')
			for (var opt in options)
				markupLayer[opt] = options[opt];

		$('body').append('<div class="ecup_section"><div class="statement_layer"></div><div class="dimmed"></div></div>');

		positionSet(markupLayer.position);

		function positionSet(position) {
			var positionInfo = position.split(" ");
			var $ecupLayer = $('.ecup_section .statement_layer');

			if(positionInfo[0] === 'center') {
				$ecupLayer.css({'top': '50%', 'left': '50%', 'transform': 'translate(-50%, -50%)', '-webkit-transform': 'translate(-50%, -50%)', '-ms-transform': 'translate(-50%, -50%)'})
			}

			else {
				$ecupLayer.css(positionInfo[0],'100px').css(positionInfo[1],'100px');
			}
		}

		if(markupLayer.type === 'internal') {
			var $ecupDom = $('.ecup_section');

			$ecupDom.prepend('<button type="button" class="layer_btn"><span class="blind">레이어토글</span></button>');
			$ecupDom.find('.statement_layer').addClass(markupLayer.theme);

			$ecupDom.on('click','.layer_btn',function() {
				var $target = $(this);

				if($target.hasClass('off')) {
					$target.siblings().fadeIn(200);
					$target.parent('.ecup_section').css({'z-index':'1000'})
				}

				else {
					$target.siblings().fadeOut(200);
					$target.parent('.ecup_section').css({'z-index':'-1'})
				}

				$target.toggleClass('off');
			});
		}

		else if(markupLayer.type === 'external') {
			var $ecupDom = $('.ecup_section');

			$ecupDom.css({'display':'none'}).find('.statement_layer').addClass(markupLayer.theme);

			//pc
			$(document).dblclick(function() {
				$ecupDom.fadeIn(300);
			});

			//mobile

			(function($){

				$.event.special.doubletap = {
					bindType: 'touchend',
					delegateType: 'touchend',

					handle: function(event) {
						var handleObj   = event.handleObj,
							targetData  = jQuery.data(event.target),
							now         = new Date().getTime(),
							delta       = targetData.lastTouch ? now - targetData.lastTouch : 0,
							delay       = delay == null ? 300 : delay;

						if (delta < delay && delta > 30) {
							targetData.lastTouch = null;
							event.type = handleObj.origType;
							['clientX', 'clientY', 'pageX', 'pageY'].forEach(function(property) {
								event[property] = event.originalEvent.changedTouches[0][property];
							});

							handleObj.handler.apply(this, arguments);
						} else {
							targetData.lastTouch = now;
						}
					}
				};

			})(jQuery);

			$(document).on('doubletap',function(){
				$ecupDom.fadeIn(300);
			});
		}
	};

	Main.prototype = {
		constructor: Main,
		single: function(options) {
			/* single은 type에따라서 그리면된다. */
			// markupLayer.type 으로 불러온다.
			draw(options, viewModule[markupLayer.type] /* 타입에따른 */);
		},
		group: function() {
			// 마지막 인자가 옵션
			var options = arguments[arguments.length - 1];
			// 받아온 공통 dom의 selector들을 배열로 넣어서
			if (arguments.length > 1) {
				var commonDoms = [];
				for (var i = 0; i < arguments.length - 1; ++i)
					commonDoms.push(arguments[i]);
			}
			/* group은 groupInfo를 먼저 생성 */
			var groupInfo = {
				groupName: this.groupName,
				groupDom: commonDoms
			};
			draw(options, viewModule[markupLayer.type], groupInfo);
		}
	};

	// 셋팅 초기화
	markupLayer.type = 'windows';
	markupLayer.theme = '';
	markupLayer.position = 'top right';

	return Main;





	function draw(options ,callback, groupInfo /* group인 경우 groupInfo 넘어온다. */) {

		callback(codeParser(), groupInfo);

		function codeParser() {

			// 공통 dom 생성
			if (groupInfo)
				var commonTarget = $(groupInfo.groupDom.join(','));


			// option 의 객체/함수 여부 검사
			for (var btnName in options) {

				var option = options[btnName];
				// 함수가 아닐경우
				if (typeof option === 'object') {

					// 옵션에 타겟이 없는 경우, 공통 타겟을 할당
					if (!option.target) option.target = commonTarget;
					else option.target = $(option.target);

					option = parsing(option);
					options[btnName] = option;
				}

			}

			return options;


			// 옵션을 함수로 변환
			function parsing(option) {

				if (!option.target) throw new Error('target 이 반드시 필요합니다...');

				var fn, fnPart;
				var fnBody = 'var that = this;';

				for (var optFn in option) {
					if (optFn === 'target') continue;
					fnPart = 'that.' + optFn + '("' + option[optFn] + '");';
					fnBody += fnPart;
				}

				fn = new Function(fnBody);
				fn = fn.bind(option.target);

				return fn;

			}
		}
	}


	function windows(spec, groupInfo) {
		/* 뷰처리 - 팝업
		 spec을 가지고 dom을 생성해서 뷰를 그려줌
		 즉, 타입에 따라서 그려주는 module
		 */

		/* 테스트용  */
		for (var btnName in spec) {
			var $btn = $('<button type="button">' + btnName + '</button>');
			$btn.click(spec[btnName]);
			$(document.body).append($btn);
		}

		if (groupInfo)
			console.log(groupInfo.groupName);
	}
	function external(spec, groupInfo) {
		// 뷰처리 - 내장
		commonDrawLayer(spec, groupInfo);

		var $ecupDom = $('.ecup_section');

		$ecupDom.on('click', '.dimmed', function() {
			$ecupDom.fadeOut(200);
		});

		$ecupDom.on('click', '.event_btn', function() {
			$ecupDom.fadeOut(200);
		});
	}

	function internal(spec, groupInfo) {
		// 뷰처리 - 레이어
		commonDrawLayer(spec, groupInfo);
	}

	function commonDrawLayer(spec, groupInfo) {
		var $layerDom = $('<div class="layer"></div>');

		if(typeof groupInfo !== 'undefined') {
			var groupTitle = '<strong class="title">'+groupInfo.groupName+'</strong>'
			$layerDom.append(groupTitle);
		}

		for(var btnName in spec) {
			var $btn = $('<button type="button" class="event_btn">'+btnName+'</button>');
			$btn.click(spec[btnName]);
			$layerDom.append($btn);
		}

		$('.ecup_section .statement_layer').append($layerDom);
	}

}

var ecup = {};
ecup.markupLayer = markupLayer;


/*
 추후 고민할 부분
 (function main() {

 var ecupExtended = {
 markupLayer: function() {
 // TODO
 }
 };

 var ecupPrototype = {
 toggleAttr: function() {
 // TODO
 }
 };

 // jquery 확장객체
 jQuery.ecup.extend(ecupExtended);

 // jquery prototype 확장객체
 jQuery.fn.extend(ecupPrototype..);

 // 부가기능 실행
 ecupExecuted.exec();
 })();
 */
