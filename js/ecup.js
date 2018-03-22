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
	$(window.document).ready(autoApply);

})({
	/** ecup basic **/

	/** 마크업 검수 레이어 기능 **/
	markupLayer: function() {

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

			function positionSet(position) {
				var positionInfo = position.split(" ");
				var $ecupLayer = $('.__NTS_markup');

				if(positionInfo[0] === 'center') {
					$ecupLayer.css({'top': '50%', 'left': '50%', 'transform': 'translate(-50%, -50%)', '-webkit-transform': 'translate(-50%, -50%)', '-ms-transform': 'translate(-50%, -50%)'})
				}

				else {
					$ecupLayer.css(positionInfo[0],'100px').css(positionInfo[1],'100px');
				}
			}

			if (markupLayerManager.type === 'external') {

				positionSet(markupLayerManager.position);

				var $ecupDom = $('.__NTS_markup');

				$ecupDom.addClass('external').prepend('<button type="button" class="layer_btn"><span class="blind">레이어토글</span></button>');
				$ecupDom.addClass(markupLayerManager.theme);
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
		};

		markupLayerManager.show = function() {
			/* 그리기 타입을 쉽게 참조하기 위한 모듈 */
			var paintTo = {
				'windows': windows,
				'external': external,
				'internal': internal
			};

			var layer = renderLayer(paintTo[markupLayerManager.type]);
		}

		markupLayerManager.prototype = {
			constructor: markupLayerManager,
			single: function(options) {
				createRenderMap(options);
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

				// group은 groupInfo를 먼저 생성
				var groupInfo = {
					groupName: this.groupName,
					groupDom: commonDoms,
                    groupType: markupLayerManager.buttonType[this.groupName]
				};

				createRenderMap(options, groupInfo);
			}
		};

		// markupLayer 셋팅 초기화
		markupLayerManager.type = 'windows';
		markupLayerManager.theme = '';
		markupLayerManager.position = 'top right';
        markupLayerManager.buttonArray = [];
        markupLayerManager.newWindow = null;

		return markupLayerManager;



		/** 내부 함수 **/

		/* Render Map 생성 */
		function createRenderMap(option, groupInfo) {
			var map = markupLayerManager.buttonArray;

			var groupName = !groupInfo ? '__single' : groupInfo.groupName;
            var groupType = !groupInfo ? 'check' : groupInfo.groupType;
			var spec = optionObj_to_eventFunc(option, groupInfo);

			if (groupName === '__single') {
				if (map[0] && map[0]['name'] && map[0]['name'] === '__single') {
					for (btnName in spec) {
						map[0]['button'][btnName] = spec[btnName];
					}
				} else {
					map.splice(0, 0, {name: groupName, button: spec, type: groupType});
				}
			} else {
				map.push({name: groupName, button: spec, type: groupType});
			}
		}

		/* 옵션 객체를 이벤트 함수로 변환해서 리턴  */
		function optionObj_to_eventFunc(options, groupInfo) {

			// 공통 dom 을 사용하는 경우 생성
			if (groupInfo && groupInfo.groupDom) var commonTarget = $(groupInfo.groupDom.join(','));

			// 기능이 객체로 주어진 경우 함수로 변환
			for (var btnName in options) {

				var option = options[btnName];

				if (option instanceof Array) {
					options[btnName] = {
						origin: option[0],
						opposite: option[1]
					};
				} else if (typeof option === 'object') {

					if (!option.target) option.target = commonTarget;
					else option.target = $(option.target);

					var originOpt = convert(option);
					var oppositeOpt = convert(option, true);
					options[btnName] = {
						origin: originOpt,
						opposite: oppositeOpt
					};

				} else if (typeof option === 'function') {
					options[btnName] = {origin: options[btnName]};
				}
			}

			return options;


			/*  기능 객체를 함수로 변환 */
			function convert(option, oppositeFlag) {

				if (!option.target) throw new Error('target 이 반드시 필요합니다...');

				var oppositeMap = {
					'addClass': 'removeClass',
					'removeClass': 'addClass',
					'toggleClass': 'toggleClass',
					'addAttr': 'removeAttr',
					'removeAttr': 'addAttr',
					'toggleAttr': 'toggleAttr',
					'addStyle': 'removeStyle',
					'toggleStyle': 'toggleStyle',
					'show': 'hide',
					'hide': 'show',
					'toggle': 'toggle'
				}

				var fn, fnPart;
				var fnBody = 'var that = this;';

				for (var optFn in option) {
					if (optFn === 'target') continue;
					if (oppositeFlag) optFn = oppositeMap[optFn];
					fnPart = "that." + optFn + "('" + option[optFn] + "');";
					fnBody += fnPart;
				}

				fn = new Function('e', fnBody);
				fn = fn.bind(option.target);

				console.log(fn);

				return fn;
			}
		}

        /* 마크업 레이어 dom 생성 및 반환 */
        function renderLayer(paintModule) {

			// 최상위 DOM 생성
            var $wrap = $('<div />', {
                class: '__NTS_markup'
            });

			// 제어 영역 DOM 생성
			var $controlArea = $('<div />', {
				class: '__area_env'
			}), $controlComment = $('<a href="#"><span class="__view"></span>UI 주석보기</a>');
			$controlArea.append($controlComment);

			// 버튼 영역 DOM 생성
			var $btnArea = $('<div />', {
				class: '__area_btns'
			});
			$.each(markupLayerManager.buttonArray, function(index, button){
                $btnArea.append(groupping(button, button.type));
            });

			// 전체 DOM
            $wrap.append($('<h2>마크업 검수 레이어</h2>'))
				.append($controlArea)
				.append($btnArea);

            return paintModule($wrap);

			// 버튼 그룹 생성 및 개별 이벤트 할당
            function groupping(btnObj, groupType) {
                var $groups = $('<div />', { class: '__area_btn'});

				if (btnObj.name === '__single') {
					$groups.addClass('__area_single');
				} else {
					$groups.addClass('__area_group')
					$groups.prepend($('<strong>').text(btnObj.name));
				}

                for(var btn in btnObj.button)
                    $groups.append(makeBtn(btn, btnObj.button[btn], groupType));

                makeEvent();
                return $groups;

                // 그룹 내 타입별 버튼 생성
                function makeBtn(name, func, type) {
                    var $a =  $('<a />', {
                        text: name,
                        role: 'button',
                        'aria-pressed': false
                    });

                    if(func.opposite != null)
                        $a.addClass('__'+ type);
                    else
                        $a.addClass('__button');

                    $a.prepend('<span class="__view"></span>');
                    return $a;
                }

                // 각각의 버튼 이벤트 할당
                function makeEvent(){
                    if(groupType == 'radio'){ // 라디오 버튼 타입 이벤트
                        $groups.on('click', 'a', function(e){
                            var $my = $(this);
                            var a = $(this).parent().children('a');


                            if(!$(this).hasClass('__button'))
                                $.each(a, function(index){
                                    if($(a[index]).attr('aria-pressed') == 'true' && !$(a[index]).hasClass('__button')){
                                        $(a[index]).attr('aria-pressed', 'false');

                                        var name = $(a[index]).text();
                                        if(btnObj.button[name].opposite != null)
                                            btnObj.button[name].opposite();
                                    }
                                });

                            if($(this).attr('aria-pressed') == 'false') {
                                btnObj.button[$(this).text()].origin();
                                $(this).attr('aria-pressed','true');
                            }
                        })
                    } else if(groupType == 'button') { // 기본 버튼 타입 이벤트
                        $groups.on('click', 'a', function(e){
                            var name = $(this).text();
                            if($(this).attr('aria-pressed') == 'false') {
                                btnObj.button[name].origin();
                                $(this).attr('aria-pressed','true');
                            }
                        })
                    } else { // 체크박스 버튼 타입 이벤트 ( default )
                        $groups.on('click', 'a', function(e){
                            var name = $(this).text();
                            if($(this).attr('aria-pressed') == 'true' ) {
                                if(btnObj.button[name].opposite != null) {
                                    btnObj.button[name].opposite();
                                    $(this).attr('aria-pressed','false');
                                }
                            } else {
                                btnObj.button[name].origin();
                                $(this).attr('aria-pressed','true');
                            }
                        })
                    }
                }
            }
        }

        /* 별도의 창으로 그려줌 */
        function windows($wrap) {

            if(markupLayerManager.newWindow == null) init();

            $(markupLayerManager.newWindow.document.body).html($wrap);

            setTimeout(function(){
                var height = $wrap.height();
                markupLayerManager.newWindow.resizeTo(300, height + 70);
            },100);

            function init() {
                markupLayerManager.newWindow = window.open('', 'newWindow', 'width=300,height=400');
                $(markupLayerManager.newWindow.document.head).append(stylesheet());
            }

            function stylesheet() {
                return $("<link />", { rel: 'stylesheet', href: "http://view.gitlab2.uit.navercorp.com/NT11398/ecup/raw/develop/server/public/stylesheets/ecup_ui.css"});
            }

		}

		/* 보이지 않게 내장되게 그려줌 */
		function internal($wrap) {

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
		}

		/* 화면상에 보이도록 그려줌 */
		function external($wrap) {
			// commonDrawLayer(spec, groupInfo);
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

	/** 인라인 스타일 다루기 addStyle, removeStyle, toggleStyle **/
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

	jQuery.fn.longClick = function(fn, ms) {

		var event;

		this.on('mousedown', function(e) {
			event = e;

			setTimeout(function() {
				var eFlag = e;
				if (event === eFlag) {
					fn(e);
				}
			}, ms);
		});

		this.on('mouseup', function(e) {
			event = undefined;
		});
	}

});
