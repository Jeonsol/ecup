/* 인라인 & 레이어 마크업 버튼 */

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