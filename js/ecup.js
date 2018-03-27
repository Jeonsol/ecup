/**
 *
 * Ecup.js
 * (Easy Control Markup)
 *
 * Version 1.0.0
 *
 **/
(function (features, extendJQuery, autoApply) {

    // create $.ecup
    jQuery.Ecup = function() {
		var modules = ['markupLayer','comment'];

		for (feature in features) {
			if ($.inArray(feature, modules) === -1) this[feature] = features[feature];
			else this[feature] = features[feature]();
		}
	};

	window.ecup = new jQuery.Ecup();

	// extend jQuery
	extendJQuery();

	// autoApply
	$(window.document).ready(autoApply);

})({
	/** features **/

	/** 마크업 검수 레이어 기능 **/
	markupLayer: function(args) {

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

		markupLayerManager.set = function(options) {
			if (typeof options === 'object') {
				for (var opt in options) {
					markupLayerManager[opt] = options[opt];
				}
			}
		};

		markupLayerManager.show = function() {
			/* 그리기 타입을 쉽게 참조하기 위한 모듈 */
			var paintTo = {
				'windows': windows,
				'external': external,
				'internal': internal
			};

			if (!(markupLayerManager.type in paintTo)) throw new Error('layer type을 체크해주세요.');

			var layer = renderLayer(paintTo[markupLayerManager.type]);
		}

		// markupLayer 셋팅 초기화
		markupLayerManager.type = 'windows';
		markupLayerManager.theme = 'dark';
		markupLayerManager.position = 'top right';
        markupLayerManager.newWindow = null;
		markupLayerManager.buttonType = {};

		return markupLayerManager;



		/** 내부 함수 **/

		/* Render Map 생성 */
		function createRenderMap(option, groupInfo) {
			var map = markupLayerManager.buttonArray = markupLayerManager.buttonArray || [];

			var groupName = groupInfo && groupInfo.groupName ? groupInfo.groupName : '__single';
            var groupType = groupInfo && groupInfo.groupType ? groupInfo.groupType : 'check';
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

		/* 옵션 객체를 이벤트 함수로 변환해서 리턴 */
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

				return fn;
			}
		}

        /* 마크업 레이어 dom 생성 및 반환 */
        function renderLayer(paintModule) {

			// 최상위 DOM 생성
            var $wrap = $('<div />', {
                class: '__NTS_markup ' + markupLayerManager.theme
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

                    if (func.opposite) $a.addClass('__'+ type);
                    else $a.addClass('__button');

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
                markupLayerManager.newWindow.resizeTo(300, height + 50);
            },100);

            function init() {
                markupLayerManager.newWindow = window.open('', 'newWindow', 'width=300,height=400');
                $(markupLayerManager.newWindow.document.head).append(stylesheet());
            }

            function stylesheet() {
                return $("<link />", { rel: 'stylesheet', href: "http://view.gitlab2.uit.navercorp.com/NT11398/ecup/raw/develop/ui/ecup_ui.css"});
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

			var wrapHeight = 0,
				wrapRight = 20,
				wrapBottom = 20,
				btnShowWidth = 0,
				btnShowText = '검수';

			if (markupLayerManager.external) {
				btnShowText = markupLayerManager.external.btnText || btnShowText;
				wrapRight = markupLayerManager.external.right || wrapRight;
				wrapBottom = markupLayerManager.external.bottom || wrapBottom;
			}

			var $externalWrap = $('<div>', {class: '__NTS_markup_wrap'}),
				$btnShow = $('<a>', {class: '__NTS_markup_show', role: 'button', 'aria-label': '마크업검수 레이어 보기'}),
				$btnShowText = $('<span>', {text: btnShowText}),
                $btnHide = $('<a>', {class: '__NTS_markup_hide', role: 'button', 'aria-label': '마크업검수 레이어 숨기기'});

			$btnShow.click(onClickListenerBtnShow);
            $btnHide.click(onClickListenerBtnHide);

			$externalWrap.css({right: wrapRight, bottom: wrapBottom});
			$externalWrap.append($btnShow.append($btnShowText)).append($wrap.append($btnHide));
			$(document.body).append($externalWrap);

			wrapHeight = $wrap.outerHeight();
			btnShowWidth = $btnShow.outerWidth();

            $wrap.css('display', 'none');
			$btnShow.css('width', btnShowWidth);

            function onClickListenerBtnShow(e) {
				$btnShowText.animate({opacity: 0});
				$btnShow.animate({width: 260, height: wrapHeight}, 300, function() {
					$wrap.fadeIn(200);
				});
            }

			function onClickListenerBtnHide(e) {
				$wrap.fadeOut(200, function() {
					$btnShowText.animate({opacity: 1});
					$btnShow.animate({width: btnShowWidth, height: 32});
				});
			}

		}

	},

	layerControl : function(layerDom, openTarget, closeTarget) {

		var $layerDom = $(layerDom);
		var $openTarget = $(openTarget);
		var $closeTarget = $(closeTarget);

		layerDomSet($layerDom,'none');

		$openTarget.each(function(t, data){
			$(data).click(function () {
				layerDomSet($layerDom,'block');
			});
		});

		$closeTarget.each(function(t, data){
			$(data).click(function () {
				layerDomSet($layerDom,'none');
			});
		});

		function layerDomSet(layerDom, displayValue) {
			layerDom.each(function(i, val){

				if(displayValue === 'none') {
					$(val).attr('aria-hidden','true');
				}

				else {
					$(val).attr('aria-hidden','false');
				}

				if(typeof val ==='string') {
					if(val.indexOf(':') === -1) {
						$(val).css('display', displayValue);
					}

					else {
						var style = '<style>'+val+'{display:'+displayValue+'}</style>';
						$(style).appendTo('head');
					}
				}

				else {
					if($(val).attr('class').indexOf(':') === -1){
						$(val).css('display', displayValue);
					}

					else {
						var style = '<style>.'+val+'{display:'+displayValue+'}</style>';
						$(style).appendTo('head');
					}
				}

			});
		}

	},

	selectControl : function(btn, listBox, targetObj) {
		$(btn).click(function() {
			$(this).attr('aria-expanded','true');
			$(listBox).css('display','block');
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
	comment: function() {

		init();

		function commentManager(flag) {

			if (typeof  flag === 'string') {
				singleWrite(arguments[0],arguments[1]);
			}

			else if(typeof flag === 'object') {
				groupWrite(flag);
			}
		}

		commentManager.prototype = {
			constructor: commentManager
		};

		commentManager.targetData = [];
		commentManager.targetDom = $('<div class="__ecup_comment_section"></div>');
		commentManager.show = true;

		$('body').append(commentManager.targetDom);

		return commentManager;

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

			$(document).ready(function() {

				if(commentManager.show) {

					var $commentDom = $('<div class="__ecup_comment"></div>');
					var $commentBtn = $('<button type="button" class="__comment_btn"><span class="blind">코멘트토글</span></button>');

					$commentDom.append($commentBtn).append($commentArea);

					var $target = $(target);

					if($target.length) {
						var top = $target.offset().top/$(window).height()*100+'%';
						var left = $target.offset().left/$(window).width()*100+'%';
					}

					$commentDom.css({'top': top, 'left': left});

					if($target.css('display')==='none') {
						$commentDom.css('display','none');
					}

					else {
						$commentDom.css('display','block');
					}

					commentManager.targetDom.append($commentDom);

					$commentBtn.click(function() {
						var $commentArea = $(this).next('.__comment_area');

						$commentArea.toggle();

						var $commentAreaRightOffset = $commentArea.offset().left+$commentArea.innerWidth();

						if($(window).width() - $commentAreaRightOffset < 20) {
							$commentArea.css({'width':'100px','margin-left':'-101px'});
						}

						else {
							$commentArea.css({'width':'auto','margin-left':'2em'});
						}

					});

					commentManager.targetData.push(target);
				}
			});

		}

		function reRenderComment() {
			var targetData, commentData, $targetData, $commentData, top, left, $scrolltarget;

			$(window).on("resize scroll",function() {
				targetData = commentManager.targetData || [];
				commentData = commentManager.targetDom.find('.__ecup_comment') || [];

				for (var i = 0; i < targetData.length; i++) {
					$targetData = $(targetData[i]);
					$commentData = $(commentData[i]);

					if($targetData.css('display')==='none') {
						$commentData.css('display','none');
					}

					else {
						$commentData.css('display','block');
					}

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
}, function() {
	/** jQuery 확장 **/

	/** DOM 캐시 관리자 **/
	/* 구조
	{
		dom: DOM 주소값,
		attr: {
			attrName: attrVal,
			...
		},
		style: { // 확장 예정
			styleName: styleVal,
			...
		}
	}
	 */
	function DomCacheManager() {
		this.cache = [];
	}

	DomCacheManager.prototype = {
		constructor: DomCacheManager,
		find: function(dom) {
			var cache = this.cache;
			for (var i = 0; i < cache.length; ++i) {
				if (cache[i]['dom'] === dom) return i;
			}
			return -1;
		},
		setAttr: function(domAddress, attrName, attrVal) {
			var cache = this.cache,
				index = this.find(domAddress);

			if (index === -1) {
				cache.push({
					dom: domAddress,
					attr: {}
				});
				index = cache.length - 1;
			}
			cache[index]['attr'][attrName] = attrVal;
		},
		getAttr: function(domAddress, attrName) {
			var cache = this.cache,
				index = this.find(domAddress);

			if (index !== -1) return cache[index]['attr'][attrName];
			else return undefined;
		}
	}
	var domCacheStorage = new DomCacheManager();

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
				if (!dom.hasAttribute(attr)) {
					dom.setAttribute(attr, val);
				} else if (dom.getAttribute(attr) !== val) {
					domCacheStorage.setAttr(dom, attr, dom.getAttribute(attr));
					dom.setAttribute(attr, val);
				} else if (dom.getAttribute(attr) === val) {
					var rollback = domCacheStorage.getAttr(dom, attr);
					if (rollback !== undefined) dom.setAttribute(attr, rollback);
					else dom.removeAttribute(attr);
				}
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
        var deviceFilter = 'win16|win32|win64|mac';

        var mousedownEvent = 'mousedown',
            mouseupEvent = 'mouseup';

        // check mobile device
        if (navigator.platform && deviceFilter.indexOf(navigator.platform.toLowerCase()) < 0) {
            mousedownEvent = 'touchstart',
            mouseupEvent = 'touchend';
        }

		this.on(mousedownEvent, function(e) {
			event = e;

			setTimeout(function() {
				var eFlag = e;
				if (event === eFlag) {
					fn(e);
				}
			}, ms);
		});

		this.on(mouseupEvent, function(e) {
			event = undefined;
		});
	}

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
    }

    /* IE9 애니메이션 지원 */
    jQuery.fn.animation = function(animate, option) {
        var target = this;
        if(typeof animate == 'object'){
            convertAnimation(animate);
        } else {
            var func = jQuery.animation.keyframes[animate];
            convertAnimation(target, func, option);
        }
    };

    jQuery.animation = function(code){;
        var name = code.name;
        var animate = code.animate;
        jQuery.animation.keyframes[code.name] = animate;
    }
    jQuery.animation.keyframes = {};

    function convertTransition(animate){
        var pro = animate.property != null ? animate.property : 'all';
    }

    function convertAnimation($target, func, option){
        var duration = option.duration != null ? option.duration : 1000;
            duration = isNaN(Number(duration)) == true ? Number(duration.replace('s','')) * 1000 : Number(duration);
        var fillMode = option.fillMode != null ? option.fillMode : 'none';
        var delay = option.delay != null ? option.delay : 0,
            delay = isNaN(Number(delay)) == true ? Number(delay.replace('s','')) * 1000 : Number(delay);
        var animateOption = getOption(func, duration);

        var animateEvent = null;

        setTimeout(function(){
            $.each(animateOption, function(index){
                animateReturn(animateOption, index);
            })
        }, delay);

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
                        if(fillMode == 'none')
                            $target.removeAttr('style');
                   }
                })
            } else {
                if(animateEvent == null) {
                    console.log(delay);
                    animateEvent = $target.delay(delay).animate(css, {
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

}, function() {

    /** document.ready 후 자동적용 되야하는 기능 **/

    /** 임시이미지 작용하기 **/
    (function tempImg() {

    	var type, id, text, src_type;
    	var imgs = document.getElementsByTagName('img');

    	for (var i = 0; i < imgs.length; ++i) {
    		var img = imgs[i],
    			src = img.getAttribute('src');

    		/* src 가 있는 경우 지나감 (임시 이미지 아님) */
    		if (!src || src[0] !== '#') continue;

    		var srcArr = src.split('_');
    		src_type = srcArr[0];
    		text = srcArr[1] ? 'y' : 'n';

    		/* 임시이미지인 경우 */
    		// 타입 파싱
    		var typeArr = src_type.match(/#(p|l|n|사람|라이프스타일|자연)(\d?)/);
    		type = typeArr && typeArr[1] ? getImgType(typeArr[1]) : getImgType(getRandomNumber());
    		id = typeArr && typeArr[2] ? typeArr[2] : getRandomNumber();

    		// 새 src 만들기
    		var width = img.getAttribute('width') || 100,
    			height = img.getAttribute('height') || width || 100,
    			newSrc = 'http://dev.ui.naver.com/tmp/?' + width + 'x' + height + '_ecup' + type + id + '_' + text + '_FFFFFF_100';

    		img.setAttribute('src', newSrc);
    	}

    	/* 랜덤 숫자 얻기 */
    	function getRandomNumber() {
    		return Math.floor(3 * Math.random()) + 1;
    	}

    	/* 이미지타입 얻기 */
    	function getImgType(flag) {
    		var map = {
    			1: 'person',
    			2: 'life',
    			3: 'nature',
    			'p': 'person',
    			'l': 'life',
    			'n': 'nature',
    			'사람': 'person',
    			'라이프스타일': 'life',
    			'자연': 'nature'
    		}
    		return map[flag];
    	}

    })();

});
