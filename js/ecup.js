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
		var modules = ['markupLayer'];

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
				console.log(btnObj, groupType);
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
