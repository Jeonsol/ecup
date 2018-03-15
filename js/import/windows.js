/* 새창 마크업 버튼 */

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
        markupLayerManager.buttonArray = [];
        markupLayerManager.newWindow = null;

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
            if(markupLayerManager.newWindow == null)  init();
            if(groupInfo == null) groupInfo = Math.floor(Math.random(10)*100);

            markupLayerManager.buttonArray.push({name: groupInfo, button: spec});
            drawing(markupLayerManager.buttonArray);

            function init() {
                markupLayerManager.newWindow = window.open('', 'newWindow', 'width=500, height=500');
                $(markupLayerManager.newWindow.document.head).append(css());
            }

            function drawing(btnArray) {
                var $wrap = $('<div />', {
	                class: '__NTS_markup',
                });
                $wrap.append($('<h2>마크업 검수 레이어</h2>'));
                $.each(btnArray, function(index){
                    $wrap.append(groupping(btnArray[index]));
                })
            	$(markupLayerManager.newWindow.document.body).html($wrap);
            }

            function groupping(btnObj) {
                var $groups = $('<div />', { class: '__area_btns'}).append($('<strong>').text(btnObj.name));
                for(var btn in btnObj.button)
                    $groups.append(makeBtn(btn, btnObj.button[btn]));
                return $groups;
            }

			function makeBtn(name, func) {
                var $a =  $('<a />', {
                    text: name,
                    click: func,
                    role: 'button',
                    class: '__checked',
                    href: '#'
                });
                $a.prepend('<span class="__view __radio"></span>');
                return $a;
			}

            function css(){
                return $("<link />", { rel: 'stylesheet', href: "http://10.67.16.105/suns/ecup/ui_ecup/css/internal.css"});
            }
		}


		/* 보이지 않게 내장되게 그려줌 */
		function internal(spec, groupInfo) {
			// TODO
		}

		/* 화면상에 보이도록 그려줌 */
		function external(spec, groupInfo) {
			// TODO
		}
	}
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
