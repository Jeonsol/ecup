/**
 *
 * Ecup.js
 * (Easy Control Markup)
 *
 * Version 1.0.0
 *
 **/

(function (ecupBasic, extendJQuery, autoApply) {

    // create $.ecup
    jQuery.ecup = ecupBasic;

	// extend jQuery
	extendJQuery();

	// autoApply
	// TODO: 아마 window.onload 후, 설정을 가져와서 설정에따라 적용시킬 기능만 적용하면 될듯.

})({
	/** ecup basic **/

	/** 마크업 검수 레이어 기능 **/
	markupLayer: function() {

        /* 뷰타입을 쉽게 참조하기 위한 모듈 */
		var viewModule = {
			'windows': windows,
			'external': external,
			'internal': internal
		};

		/* $.ecup.markupLayer() 를 통해 생성되는 함수 */
		var markupLayerManager = function(flag) {

			var userObj;

			if (typeof flag === 'string') {
				// flag가 문자열인 경우, 그룹이름이기 떄문에 설정해주고 추후 group 메소드로 그린다.
				userObj = new markupLayerManager();
				userObj.groupName = flag;
				return userObj;
			} else if (typeof flag === 'object') {
				// flag가 객체인 경우, flag가 바로 옵션이 되며 single로 그린다.
				userObj = new markupLayerManager();
				userObj.single(flag);
				return userObj;
			}

		};

		markupLayerManager.set = function(options) {
			if (typeof options === 'object') {
				for (var opt in options) {
					markupLayerManager[opt] = options[opt];
				}
			}

			$('body').append('<div class="ecup_section"><div class="statement_layer"></div><div class="dimmed"></div></div>');

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

			if (markupLayerManager.type === 'external') {

				positionSet(markupLayerManager.position);

				var $ecupDom = $('.ecup_section');

				$ecupDom.prepend('<button type="button" class="layer_btn"><span class="blind">레이어토글</span></button>');
				$ecupDom.find('.statement_layer').addClass(markupLayerManager.theme);

				$ecupDom.on('click', '.layer_btn', function () {
					var $target = $(this);

					if ($target.hasClass('off')) {
						$target.siblings().fadeIn(200);
					}

					else {
						$target.siblings().fadeOut(200);
					}

					$target.toggleClass('off');
				});
			}

			else {
				var $ecupDom = $('.ecup_section');

				$ecupDom.css({'display': 'none'}).find('.statement_layer').addClass(markupLayerManager.theme);

				//pc
				$(document).dblclick(function () {
					$ecupDom.fadeIn(300);

					var $layerWrap = $('.ecup_section .statement_layer');
					var layerHeight = $layerWrap.height();

					$layerWrap.css('top',-layerHeight);

					$layerWrap.animate({top:0},1000);

				});

				//mobile - swipe
				(function() {
					var touchStartEvent = "touchstart",
						touchStopEvent = "touchend",
						touchMoveEvent = "touchmove";
					$.event.special.swipeupdown = {
						setup: function() {
							var thisObject = this;
							var $this = $(thisObject);
							$this.bind(touchStartEvent, function(event) {
								var data = event.originalEvent.touches ?
										event.originalEvent.touches[ 0 ] :
										event,
									start = {
										time: (new Date).getTime(),
										coords: [ data.pageX, data.pageY ],
										origin: $(event.target)
									},
									stop;

								function moveHandler(event) {
									if (!start) {
										return;
									}
									var data = event.originalEvent.touches ?
										event.originalEvent.touches[ 0 ] :
										event;
									stop = {
										time: (new Date).getTime(),
										coords: [ data.pageX, data.pageY ]
									};

									// prevent scrolling
									if (Math.abs(start.coords[1] - stop.coords[1]) > 10) {
										event.preventDefault();
									}
								}
								$this
									.bind(touchMoveEvent, moveHandler)
									.one(touchStopEvent, function(event) {
										$this.unbind(touchMoveEvent, moveHandler);
										if (start && stop) {
											if (stop.time - start.time < 1000 &&
												Math.abs(start.coords[1] - stop.coords[1]) > 30 &&
												Math.abs(start.coords[0] - stop.coords[0]) < 75) {
												start.origin
													.trigger("swipeupdown")
													.trigger(start.coords[1] > stop.coords[1] ? "swipeup" : "swipedown");
											}
										}
										start = stop = undefined;
									});
							});
						}
					};
					$.each({
						swipedown: "swipeupdown",
						swipeup: "swipeupdown"
					}, function(event, sourceEvent){
						$.event.special[event] = {
							setup: function(){
								$(this).bind(sourceEvent, $.noop);
							}
						};
					});

				})();

				$(document).on('swipedown', function () {
					$ecupDom.fadeIn(300);

					var $layerWrap = $('.ecup_section .statement_layer');

					$layerWrap.css('top',-$layerWrap.height()).animate({top:0},1000);
				});
			}
		};

		markupLayerManager.prototype = {
			constructor: markupLayerManager,
			single: function(options) {
				// markupLayer.type 으로 불러온다.
				draw(options, viewModule[markupLayerManager.type] /* 타입에따른 */);
			},
			group: function() {
				// 마지막 인자가 옵션
				var options = arguments[arguments.length - 1];
				// 받아온 공통 dom의 selector들을 배열로 넣어서
				if (arguments.length > 1) {
					var commonDoms = [];
					for (var i = 0; i < arguments.length - 1; ++i) {
						commonDoms.push(arguments[i]);
					}
                }
				console.log(arguments.length);
				// group은 groupInfo를 먼저 생성
				var groupInfo = {
					groupName: this.groupName,
					groupDom: commonDoms
				};
				draw(options, viewModule[markupLayerManager.type], groupInfo);
			}
		};

		// 셋팅 초기화
		markupLayerManager.type = 'windows';
		markupLayerManager.theme = '';
		markupLayerManager.position = 'top right';

		return markupLayerManager;



		/** 내부 함수 **/

		/* 방식에 맞게 그려주는 콘트롤러 */
		function draw(options ,callback, groupInfo /* group인 경우 groupInfo 넘어온다. */) {
			callback(optionObj_to_eventFunc(options, groupInfo), groupInfo);
		}

		/* 옵션 객체를 이벤트 함수로 변환해서 리턴  */
		function optionObj_to_eventFunc(options, groupInfo) {

			// 공통 dom 을 사용하는 경우 생성
			if (groupInfo && groupInfo.groupDom) var commonTarget = $(groupInfo.groupDom.join(','));

			// 기능이 객체로 주어진 경우 함수로 변환
			for (var btnName in options) {

				var option = options[btnName];

				if (typeof option === 'object') {

					if (!option.target) option.target = commonTarget;
					else option.target = $(option.target);

					option = convert(option);
					options[btnName] = option;
				}

			}

			return options;

			/*  기능 객체를 함수로 변환 */
			function convert(option) {

				if (!option.target) throw new Error('target 이 반드시 필요합니다...');

				var fn, fnPart;
				var fnBody = 'var that = this;';

				for (var optFn in option) {
					if (optFn === 'target') continue;
					fnPart = "that." + optFn + "('" + option[optFn] + "');";
					fnBody += fnPart;
				}

				fn = new Function(fnBody);
				fn = fn.bind(option.target);

				return fn;

			}
		}


		/* 별도의 창으로 그려줌 */
		function windows(spec, groupInfo) {
			var newWindow = window.open('', 'newWindow', 'width=300, height=500');
			for(var obj in spec) {
				var name = obj,
					func = spec[obj];
				$(newWindow.document.body).append(new makeBtn(name, func));
			}

			function makeBtn(name, func){
				var html = '<button>' + name + '</button>';
				var btn = $.parseHTML(html);
				$(btn).on('click', func);
				return btn;
			}
		}


		/* 보이지 않게 내장되게 그려줌 */
		function internal(spec, groupInfo) {
			commonDrawLayer(spec, groupInfo);

			var $ecupDom = $('.ecup_section');

			$ecupDom.on('click', '.dimmed', function() {
				$ecupDom.fadeOut(200);
			});

			$ecupDom.on('click', '.event_btn', function() {
				$ecupDom.fadeOut(200);
			});
		}

		/* 화면상에 보이도록 그려줌 */
		function external(spec, groupInfo) {
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
	},

	layerControl : function(layerDom, openTarget, closeTarget) {

		$(layerDom).css('display', 'none');

		$(openTarget).click(function() {
			$(layerDom).css('display','block');
		});

		$(closeTarget).click(function() {
			$(layerDom).css('display','none');
		});

	},

	selectControl : function(btn, listBox, targetObj) {
		$(btn).click(function() {
			$(listBox).css('display','block').attr('aria-expanded','true');
		});

		var $selector = $(Object.keys(targetObj)[0]);
		var selectorControl = targetObj[Object.keys(targetObj)[0]];

		$selector.click(function() {
			var $target = $(this);

			/* aria 속성일 경우 */
			if(selectorControl.indexOf("aria")!==-1) {
				$selector.attr(selectorControl,"false");
				$target.attr(selectorControl,"true");
			}

			/* 클래스 일 경우*/
			else {
				var selector = selectorControl.split(" ");
				if(selector[selector.length-1].substr(0,1) !== '.') throw new Error('target must be class type or WAI-ARIA');

				var toggleClass = selector[selector.length-1].substr(1);
				$selector.removeClass(toggleClass);
				$target.addClass(toggleClass);
			}

			$(btn).text($target.text());
			$(listBox).css('display','none');

		});
	},
}, function() {
	/** jQuery 확장 **/

	/** 속성 다루기 addAttr, removeAttr, toggleAttr **/

	/* 속성 추가/수정 */
	jQuery.fn.addAttr = function() {
		jQuery.fn.addAttr.PF = function($dom, attr, val) {
			$dom.attr(attr, val);
		};
		HOF_parseParam.call(this, arguments, jQuery.fn.addAttr.PF);
	};

	/* 속성 삭제 */
	jQuery.fn.removeAttrOrigin = jQuery.fn.removeAttr;
	jQuery.fn.removeAttr = function() {
		jQuery.fn.removeAttr.PF = function($dom, attr) {
			$dom.removeAttrOrigin(attr);
		};
		HOF_parseParam.call(this, arguments, jQuery.fn.removeAttr.PF);
	};

	/* 속성 토글 */
	jQuery.fn.toggleAttr = function() {
		jQuery.fn.toggleAttr.PF = function($doms, attr, val) {
			$.each($doms, function(i, dom) {
				if (dom.hasAttribute(attr)) dom.removeAttribute(attr);
				else dom.setAttribute(attr, val);
			});
		};
		HOF_parseParam.call(this, arguments, jQuery.fn.toggleAttr.PF);
	};

	/* 인라인 스타일 추가/수정 */
	jQuery.fn.addStyle = function() {
		jQuery.fn.addStyle.PF = function($doms, style, val) {
			$.each($doms, function(i, dom) {
				dom.style[style] = val;
			});
		};
		HOF_parseParam.call(this, arguments, jQuery.fn.addStyle.PF);
	};

	/* 인라인 스타일 삭제 */
	jQuery.fn.removeStyle = function() {
		jQuery.fn.removeStyle.PF = function($doms, style) {
			$.each($doms, function(index, dom) {
				dom.style.removeProperty(style);
			});
		};
		HOF_parseParam.call(this, arguments, jQuery.fn.removeStyle.PF);
	};

	/* 인라인 스타일 토글 */
	jQuery.fn.toggleStyle = function() {
		jQuery.fn.toggleStyle.PF = function($doms, style, val) {
			$.each($doms, function(index, dom) {
				if(!dom.style[style] || dom.style[style] !== val) {
					dom.style[style] = val;
				} else {
					dom.style.removeProperty(style);
				}
			});
		};
		HOF_parseParam.call(this, arguments, jQuery.fn.toggleStyle.PF);
	};


	/* 고계 함수 - 문자열 파라미터 파싱 */
	function HOF_parseParam(attrParams, callback) {

		var that = this;

		Array.prototype.forEach.call(attrParams, function(attrParam) {

			var attr, val, regExp;

			if (typeof attrParam !== 'string') throw new Error("check a type of attribute parameter");

			attrParam = $.trim(attrParam);
			attrParam += ' ';

			switch (callback) {
				case jQuery.fn.removeAttr.PF:
				case jQuery.fn.removeStyle.PF:
					regExp = /([^\s,]+)(?=[\s,])/g;
					break;
				case jQuery.fn.addAttr.PF:
				case jQuery.fn.toggleAttr.PF:
					regExp = /([^\s,]+)="([^",]+)"(?=[\s,])/g;
					break;
				case jQuery.fn.addStyle.PF:
				case jQuery.fn.toggleStyle.PF:
					regExp = /([a-zA-Z\-]+)\s*:\s*(\S+)(?=;)/g;
					break;
			}

			while(true) {

				var temp = regExp.exec(attrParam);
				if (temp === null) break;

				if (temp[1]) attr = temp[1];
				if (temp[2]) val = temp[2];

				callback(that, attr, val);

			}

		});

	}

});
