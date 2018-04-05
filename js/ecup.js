/**
 *
 * Ecup.js
 * (Easy Control Markup)
 *
 * Version 1.0.0
 *
 **/
(function (features, extendJQuery, autoApply) {

	/** IE8 대응 **/
	if (!Function.prototype.bind) {
	  Function.prototype.bind = function(oThis) {
	    if (typeof this !== 'function') {
	      // ECMAScript 5 내부 IsCallable 함수와
	      // 가능한 가장 가까운 것
	      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
	    }

	    var aArgs   = Array.prototype.slice.call(arguments, 1),
	        fToBind = this,
	        fNOP    = function() {},
	        fBound  = function() {
	          return fToBind.apply(this instanceof fNOP
	                 ? this
	                 : oThis,
	                 aArgs.concat(Array.prototype.slice.call(arguments)));
	        };

	    if (this.prototype) {
	      // Function.prototype은 prototype 속성이 없음
	      fNOP.prototype = this.prototype;
	    }
	    fBound.prototype = new fNOP();

	    return fBound;
	  };
	}

	// Ecup CSS 파일 추가
	$(document.head).append($('<link rel="stylesheet" href="http://view.gitlab2.uit.navercorp.com/NT11398/ecup/raw/develop/ui/ecup_ui.css">'));

    // create $.Ecup
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
			},
			show: function() {
				markupLayerManager.show();
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
		markupLayerManager.theme = 'naver';
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
			if (groupInfo && groupInfo.groupDom) {
				var commonTarget = $(groupInfo.groupDom.join(','));
				var commonList = [];
				$.each(groupInfo.groupDom, function(index, selector) {
					commonList.push($(selector));
				});
			}

			// 기능이 객체로 주어진 경우 함수로 변환
			for (var btnName in options) {

				var option = options[btnName];

				if (option instanceof Array) {
					options[btnName] = {
						origin: convertFn(option[0], commonList),
						opposite: convertFn(option[1], commonList)
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
					options[btnName] = {origin: convertFn(options[btnName], commonList)};
				}
			}

			return options;


			/*  기능 객체를 함수로 변환 */
			function convert(option, oppositeFlag) {

				if (!option.target) throw new Error('target 이 반드시 필요합니다...');

				function toOpposite(fnString) {
					switch(fnString) {
						case 'addClass':case 'removeClass':case 'toggleClass':
							return 'toggleClass';
						case 'addAttr':case 'removeAttr':case 'toggleAttr':
							return 'toggleAttr';
						case 'addStyle':case 'removeStyle':case 'toggleStyle':
							return 'toggleStyle';
						case 'show':case 'hide':case 'toggle':
							return 'toggle';
					}
				}

				var fn, fnPart, fnParam;
				var fnBody = 'var that = this;';

				for (var optFn in option) {
					if (optFn === 'target') continue;

					var param = option[optFn];
					if (oppositeFlag) optFn = toOpposite(optFn);

					if (optFn === 'addClass' || optFn === 'removeClass' || optFn === 'toggleClass') {
						fnParam = '"' + param + '"';
					} else {
						fnParam = JSON.stringify(param);
					}

					fnPart = "that.$" + optFn + "(" + fnParam + ");";
					fnBody += fnPart;
				}

				fn = new Function('e', fnBody);
				fn = fn.bind(option.target);

				return fn;
			}

			function convertFn(fn, groupDom) {
				var newFn = fn;
				var fnBody = fn.toString();
				fnBody = fnBody.substring(fnBody.indexOf('{') + 1, fnBody.lastIndexOf('}'));

				if (fnBody.search(/\$\$\d/) !== -1) {
					newFn = new Function('$$1', '$$2', '$$3', '$$4', '$$5', '$$6', '$$7', '$$8', '$$9', fnBody);
					newFn = newFn.bind({}, groupDom[0], groupDom[1], groupDom[2], groupDom[3], groupDom[4], groupDom[5], groupDom[6], groupDom[7], groupDom[8]);
				}

				return newFn;
			}
		}

        /* 마크업 레이어 dom 생성 및 반환 */
        function renderLayer(paintModule) {

			// 최상위 DOM 생성
	        var $wrap = $('<div class="__NTS_markup '+markupLayerManager.theme+'"></div>');

			// 제어 영역 DOM 생성
			var $controlArea = $('<div class = "__area_env"></div>');
			var $controlComment = $('<a href="#" class="__commentBtn"><span class="__view"></span><span class="__text">UI 주석끄기</span></a>');

			$controlComment.click(function() {
				var $commentToggleBtn = $(this);

				$commentToggleBtn.toggleClass('off');

				if($commentToggleBtn.hasClass('off')) {
					$commentToggleBtn.find('.__text').text('UI 주석보기');
					$('.__ecup_comment_section').css('display','none');
				}

				else {
					$commentToggleBtn.find('.__text').text('UI 주석끄기');
					$('.__ecup_comment_section').css('display','block');
				}

			});

			$controlArea.append($controlComment);

			// 버튼 영역 DOM 생성
			var $btnArea = $('<div class="__area_btns"></div>');

			$.each(markupLayerManager.buttonArray, function(index, button){
                $btnArea.append(groupping(button, button.type));
            });

			// 전체 DOM
            $wrap.append($('<h2>마크업 검수 레이어</h2>'))
				.append($controlArea)
				.append($btnArea);

			$(window).load(function() {
				paintModule($wrap);
			});
            return 0;


			// 버튼 그룹 생성 및 개별 이벤트 할당
            function groupping(btnObj, groupType) {
                var $groups = $('<div class="__area_btn"><div/>');

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
					else $a.addClass('__button').addClass('__'+ type);;

                    $a.prepend('<span class="__view"></span>');
                    return $a;
                }

                // 각각의 버튼 이벤트 할당
				function makeEvent(){
                    if(groupType == 'radio'){ // 라디오 버튼 타입 이벤트
                        $groups.on('click', 'a', function(e){
                            var $my = $(this);
                            var a = $(this).parent().children('a');

                            if(!$(this).hasClass('__button')) {
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
                            } else {
                                var name = $(this).text();
                                $(this).siblings('a').attr('aria-pressed', 'false');
                                $(this).attr('aria-pressed','true');
                                btnObj.button[name].origin();
                            }

                        });
                    } else { // 체크박스 버튼 타입 이벤트 ( default )
                        $groups.on('click', 'a', function(e){
                            var name = $(this).text();
                            if($(this).hasClass('__button')) {
                                $(this).siblings('a').attr('aria-pressed', 'false');
                                $(this).attr('aria-pressed','true');
                                btnObj.button[name].origin();
                            }
                            else {
                                if($(this).attr('aria-pressed') == 'true' ) {
                                    if(btnObj.button[name].opposite != null) {
                                        btnObj.button[name].opposite();
                                        $(this).attr('aria-pressed','false');
                                    }
                                } else {
                                    btnObj.button[name].origin();
                                    $(this).attr('aria-pressed','true');
                                }
                            }
                        })
                    }
                }
			}
        }

        /* 별도의 창으로 그려줌 */
        function windows($wrap) {
            var doc;
            if(markupLayerManager.newWindow == null) init();
            if(doc.querySelector('.__NTS_markup') != null) {
                $(doc.querySelector('.__NTS_markup')).remove();
            }

            doc.write($wrap.get(0).outerHTML);
            doc.write(stylesheet().get(0).outerHTML);

            setTimeout(function(){
                $.each(markupLayerManager.buttonArray, function(index, button){
                    makeEvent(index, button, button.type);
                });
                markupLayerManager.newWindow.resizeTo(300,  $(doc.querySelector('.__NTS_markup')).height() + ieCheck());
            },200);

            $(doc.querySelector('.__commentBtn')).click(function() {
                var $commentToggleBtn = $(this);

                $commentToggleBtn.toggleClass('off');

                if($commentToggleBtn.hasClass('off')) {
                    $commentToggleBtn.find('.__text').text('UI 주석보기');
                    $('.__ecup_comment_section').css('display','none');
                }

                else {
                    $commentToggleBtn.find('.__text').text('UI 주석끄기');
                    $('.__ecup_comment_section').css('display','block');
                }

            });

            function init() {
                markupLayerManager.newWindow = window.open('', 'newWindow', 'location=no,width=300,height=400');
                doc = markupLayerManager.newWindow.document;
            }

            function ieCheck(){
                var agt = navigator.userAgent.toLowerCase();
                if (agt.indexOf("chrome") != -1) return 50;
                else return 70;
            }

            function stylesheet() {
                return $("<link />", { rel: 'stylesheet', href: "http://view.gitlab2.uit.navercorp.com/NT11398/ecup/raw/develop/ui/ecup_ui.css"});
            }

            // 각각의 버튼 이벤트 할당
			function makeEvent(index, btnObj, groupType){
                var $groups = $(doc.querySelectorAll('.__area_btn')[index]);

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
                    });
                } else { // 체크박스 버튼 타입 이벤트 ( default )
                    $groups.on('click', 'a', function(e){
                        var name = $(this).text();
                        if($(this).hasClass('__button')) {
                            var name = $(this).text();
                            if($(this).attr('aria-pressed') == 'false') {
                                $(this).attr('aria-pressed','true');
                            }
                            btnObj.button[name].origin();
                        } else {
                            if($(this).attr('aria-pressed') == 'true' ) {
                                if(btnObj.button[name].opposite != null) {
                                    btnObj.button[name].opposite();
                                    $(this).attr('aria-pressed','false');
                                }
                            } else {
                                btnObj.button[name].origin();
                                $(this).attr('aria-pressed','true');
                            }
                        }
                    });
                }
            }
		}

		/* 보이지 않게 내장되게 그려줌 */
		function internal($wrap) {

			var topOrigin, showEvent, animationType;

			// check browser
			var isPC = false;
			var isIE8_IE9 = false;
			var browser = $.checkBrowser();
			if (browser === 'IE8' || browser === 'IE9') {
				isPC = true;
				isIE8_IE9 = true;
			} else if (browser === 'PC') {
				isPC = true;
			}

			// DOM 생성 초기화
			var $opacityController = createOpacityController($wrap);
			if ($opacityController) $wrap.append($opacityController);
			var $body = $(document.body);
			$btnHide = $('<a role="button" aria-label="마크업검수 레이어 숨기기" class="__NTS_markup_hide"></a>');
			$body.append($wrap.append($btnHide));

			topOrigin = -$wrap.outerHeight();

			// 이벤트 바인딩 - PC 와 모바일일 경우 이벤트가 다름
			var $target = markupLayerManager.internal ? $(markupLayerManager.internal) : $body;
			if ($target !== $body) $target.on('click touchstart', hideLayer);
			$btnHide.click(hideLayer);
			if (isPC) $target.dblclick(showLayer);
			else $target.dbltouch(showLayer, 200);

			// IE8, IE9 일경우 transform 미지원으로 jQuery 애니메이션
			if (isIE8_IE9) {
				$wrap.css({
					top: topOrigin,
					maxWidth: '500px',
					opacity: 0.5
				});
			} else {
				$wrap.css({
					transform: 'translateY(' + topOrigin + 'px)',
					maxWidth: '500px',
					opacity: 0.5,
				});
			}

			function showLayer(e) {
				setLayer(0, 0.9, 'true');
			}

			function hideLayer(e) {
				if ($wrap.attr('data-show') === 'true') {
					setLayer(topOrigin, 0.5, 'false');
				}
			}

			function setLayer(destTop, destOpacity, data) {
				if (isIE8_IE9) {
					$wrap.animate({
						top: destTop,
						opacity: destOpacity
					}, 500);
				} else {
					$wrap.css({
						transform: 'translateY('+ destTop + 'px)',
						opacity: destOpacity,
						transition: 'transform 0.5s, opacity 0.5s'
					});
				}
				setTimeout(function() {
					$wrap.attr('data-show', data);
				}, 500);
			}
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

			var $externalWrap = $('<div class="__NTS_markup_wrap '+markupLayerManager.theme+'"></div>'),
				$btnShow = $('<a class="__NTS_markup_show" role="button" aria-label="마크업검수 레이어 보기"></a>'),
				$btnShowText = $('<span>' + btnShowText + '</span>'),
                $btnHide = $('<a class="__NTS_markup_hide" role="button" aria-label="마크업검수 레이어 숨기기">'),
				$opacityController = createOpacityController($externalWrap);

			$btnShow.click(onClickListenerBtnShow);
            $btnHide.click(onClickListenerBtnHide);

			$externalWrap.css({right: wrapRight, bottom: wrapBottom});
			if ($opacityController) $wrap.append($opacityController);
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

		function createOpacityController($target) {
			var browser = $.checkBrowser();
			if (browser !== 'IE8' || browser !== 'IE9') {
				var $controller = $('<input type="range" min="30" max="90" value="90" class="__NTS_markup_range">');
				$controller.on('change', function() {
					var opacityVal = $(this).val() / 100;
					$target.css('opacity', opacityVal);
				});
				return $controller;
			} else {
				return null;
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
		var btnText;
 		$(btn).click(function() {
     		$(this).attr('aria-expanded','true');
     		$(listBox).css('display','block');
     		btnText = $(this).text().replace( /(\s\s)/g, '').replace( /(\t)/g, '');
 		});

		var $selector, selector;

		for(var target in targetObj) {
			selector = target;
			$selector = $(target);
		}

		var selectorControl = targetObj[selector];

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

			var text = ($(btn).html()).replace(btnText,$target.text().replace( /(\s\s)/g, '').replace( /(\t)/g, ''));
			$(btn).html(text);
			$(listBox).css('display','none');
			$(btn).attr('aria-expanded','false');

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
				if($element.css('overflow-x') === 'scroll' || $element.css('overflow-x') === 'auto' || $element.css('overflow-y') === 'scroll' || $element.css('overflow-y') === 'auto')
					$elementTarget.push($element);
			}
			commentManager.overflowTarget = $elementTarget;

			reRenderComment();

		}


		function singleWrite(target,msg) {
			var $commentArea = $('<p class="__comment_area">' + msg + '</p>');

			commonWrite(target,$commentArea);
		}

		function groupWrite(flag) {
			for (var opt in flag) {
				var $commentArea = $('<p class="__comment_area">' + flag[opt] + '</p>');

				commonWrite(opt,$commentArea);
			}
		}

		function commonWrite(target,$commentArea) {

			$(window).load(function() {

				if(commentManager.show) {

					var $commentDom = $('<div class="__ecup_comment"></div>');
					var $commentBtn = $('<button type="button" class="__comment_btn"><span class="__comment_blind">코멘트토글</span></button>');

					$commentDom.append($commentBtn).append($commentArea);

					var $target = $(target);

					if($target.length) {
						var top = $target.offset().top;
						var left = $target.offset().left;
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
						$(this).siblings('.__comment_area').toggle();
						$(window).resize();
					});

					commentManager.targetData.push(target);
				}
			});

		}

		function reRenderComment() {
			var targetData, commentData, $targetData, $commentData, top, left, $scrolltarget, $commentArea;
			var $window = $(window);

			$window.on("resize scroll",function() {

				targetData = commentManager.targetData || [];
				commentData = commentManager.targetDom.find('.__ecup_comment') || [];

				for (var i = 0; i < targetData.length; i++) {
					$targetData = $(targetData[i]);
					$commentData = $(commentData[i]);
					$commentArea = $commentData.find('.__comment_area');

					if($targetData.css('display')==='none') {
						$commentData.css('display','none');
					}

					else {
						$commentData.css('display','block');
					}

					if($targetData.length) {
						top = $targetData.offset().top;
						left = $targetData.offset().left;
					}

					$commentData.css({'top': top, 'left': left});

					var $commentAreaRightOffset = $commentArea.offset().left + $commentArea.outerWidth();
					if ($window.width() - $commentAreaRightOffset < 110) $commentArea.css({'width':'100px','margin-left':'-101px'});
					else $commentArea.css({'width':'auto','margin-left':'2em'});
				}
			});

			$window.on("resize",function() {

				commentData = commentManager.targetDom.find('.__ecup_comment') || [];

				for (var i = 0; i < targetData.length; i++) {
					$commentData = $(commentData[i]);
					$commentArea = $commentData.find('.__comment_area');

					var $commentAreaRightOffset = $commentArea.offset().left + $commentArea.outerWidth();
					if ($window.width() - $commentAreaRightOffset < 110) $commentArea.css({'width':'100px','margin-left':'-101px'});
					else $commentArea.css({'width':'auto','margin-left':'2em'});
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
								top = $targetData.offset().top;
								left = $targetData.offset().left;
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

	/** DOM 캐시 관리자
	* 해당 DOM의 속성 / 인라인 스타일을 저장해뒀다가
	* remove 또는 toggle시 rollback 한다.
	**/
	/* 구조
	{
		dom: DOM 주소값,
		attr: {
			attrName: attrVal,
			...
		},
		style: {
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
		set: function(domAddress, type, name, value) {
			var cache = this.cache,
				index = this.find(domAddress);

			if (index === -1) {
				var data = {
					dom: domAddress
				};
				data[type] = {};

				cache.push(data);
				index = cache.length - 1;
			}
			cache[index][type][name] = value;
		},
		get: function(domAddress, type, name) {
			var cache = this.cache,
				index = this.find(domAddress);

			if (index !== -1) return cache[index][type][name];
			else return undefined;
		}
	}
	var domCacheStorage = new DomCacheManager();

	jQuery.fn.$addClass = jQuery.fn.addClass;
	jQuery.fn.$removeClass = jQuery.fn.removeClass;
	jQuery.fn.$toggleClass = jQuery.fn.toggleClass;
	jQuery.fn.$addAttr = function() {HOF_param(this, arguments, jQuery.fn.$addAttr.PF);};
	jQuery.fn.$removeAttr = function() {HOF_param_remove(this, arguments, jQuery.fn.$removeAttr.PF);};
	jQuery.fn.$toggleAttr = function() {HOF_param(this, arguments, jQuery.fn.$toggleAttr.PF);};
	jQuery.fn.$addStyle = function() {HOF_param(this, arguments, jQuery.fn.$addStyle.PF);};
	jQuery.fn.$removeStyle = function() {HOF_param_remove(this, arguments, jQuery.fn.$removeStyle.PF);};
	jQuery.fn.$toggleStyle = function() {HOF_param(this, arguments, jQuery.fn.$toggleStyle.PF);};

	/* 속성 추가/수정 */
	jQuery.fn.$addAttr.PF = function($dom, attr, val) {
		if ($dom.attr(attr)) domCacheStorage.set($dom[0], 'attr', attr, $dom.attr(attr));
		$dom.attr(attr, val);
	};
	/* 속성 삭제 */
	jQuery.fn.$removeAttr.PF = function($dom, attr) {
		var rollback = domCacheStorage.get($dom[0], 'attr', attr);
		if (rollback !== undefined) {
			$dom[0].setAttribute(attr, rollback);
			domCacheStorage.set($dom[0], 'attr', attr, undefined);
		} else {
			$dom.removeAttr(attr);
		}
	};
	/* 속성 토글 */
	jQuery.fn.$toggleAttr.PF = function($dom, attr, val) {
		var dom = $dom[0];
		if (!dom.hasAttribute(attr)) {
			dom.setAttribute(attr, val);
		} else if (dom.getAttribute(attr) !== val) {
			domCacheStorage.set(dom, 'attr', attr, dom.getAttribute(attr));
			dom.setAttribute(attr, val);
		} else if (dom.getAttribute(attr) === val) {
			var rollback = domCacheStorage.get(dom, 'attr', attr);
			if (rollback !== undefined && rollback !== val) dom.setAttribute(attr, rollback);
			else dom.removeAttribute(attr);
		}
	};
	/* 인라인 스타일 추가/수정 */
	jQuery.fn.$addStyle.PF = function($dom, style, val) {
		if (style === 'color' || style === 'background-color') val = $.hexToRgb(val);
		if ($dom[0].style[style]) domCacheStorage.set($dom[0], 'style', style, $dom[0].style[style]);
		$dom.css(style, val);
	};
	/* 인라인 스타일 삭제 */
	jQuery.fn.$removeStyle.PF = function($dom, style) {
		if (style === 'color' || style === 'background-color') val = $.hexToRgb(val);
		var dom = $dom[0];
		var rollback = domCacheStorage.get(dom, 'style', style);
		if (rollback !== undefined) {
			dom.style[style] = rollback;
			domCacheStorage.set(dom, 'style', style, undefined);
		} else {
			if (dom.style.removeProperty) dom.style.removeProperty(style);
			else dom.style.removeAttribute(style);
		}
	};
	/* 인라인 스타일 토글 */
	jQuery.fn.$toggleStyle.PF = function($dom, style, val) {
		if (style === 'color' || style === 'background-color') val = $.hexToRgb(val);
		var dom = $dom[0];
		if (!dom.style[style]) {
			dom.style[style] = val;
		} else if (dom.style[style] !== val) {
			domCacheStorage.set(dom, 'style', style, dom.style[style]);
			dom.style[style] = val;
		} else if (dom.style[style] === val) {
			var rollback = domCacheStorage.get(dom, 'style', style);
			if (rollback !== undefined && rollback !== val) {
				dom.style[style] = rollback;
			} else {
				if (dom.style.removeProperty) dom.style.removeProperty(style);
				else dom.style.removeAttribute(style);
			}
		}
	};

	/* 고계 함수 - 파라미터 분기처리 - 삭제 메서드*/
	function HOF_param_remove($target, args, callback) {

		$.each(args, function(index, attrParam) {
			callback($target, attrParam);
		});

	}

	/* 고계 함수 - 파라미터 분기처리 */
	function HOF_param($target, args, callback) {

		var map = {};

		if (typeof args[0] === 'object') map = args[0];
		else if (typeof args[0] === 'string') map[args[0]] = args[1];

		for (name in map) callback($target, name, map[name]);

	}

	jQuery.fn.dbltouch = function(fn, ms) {

		var $target = this,
			dbltouchFlag = false;

		$target.on('touchstart', function(e) {
			if (dbltouchFlag) fn(e);
		}).on('touchend', function() {
			dbltouchFlag = true;
			setTimeout(function() {
				dbltouchFlag = false;
			}, ms);
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

	/* 라디오 타입 이벤트 */
    jQuery.fn.radioEvent = function(optionObj){
        $(this).on('click', function(){
            for(var attr in optionObj) {
                var value = optionObj[attr];

				if(typeof value == 'boolean') {
                    if($(this).attr(attr) == value)
                        break;

                    $(this).attr(attr, value);
                    $(this).siblings(this.selector).attr(attr, !value);
                }else {
                    if($(this).attr(attr).match(value))
                        break;

                    var values = $(this).attr(attr).split(' ');
                    values.push(value);
                    $(this).attr(attr, values.join(' '));
                    values.pop();
                    $(this).siblings(this.selector).attr(attr, values.join(' '));
                }
            }
        })
    }

	jQuery.checkBrowser = function() {

		var browser;
		var deviceFilter = 'win16|win32|win64|mac|macintel';

		if (navigator.platform && deviceFilter.indexOf(navigator.platform.toLowerCase()) < 0) {
			browser = 'MOBILE';
		} else {
			browser = 'PC'

			if (navigator.appName == 'Microsoft Internet Explorer') {
				var regExp = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
				if (regExp.exec(navigator.userAgent)) browser = 'IE' + parseFloat(RegExp.$1);
			}
		}

		return browser;
	}

	jQuery.hexToRgb = function(hex) {
		if (hex[0] === '#' && hex.length === 4) hex += hex[1] + hex[1] + hex[1];
	    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	    return result ? 'rgb(' + parseInt(result[1], 16) + ', '
			+ parseInt(result[2], 16) + ', '
			+ parseInt(result[3], 16) + ')' : hex;
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
