/* 인라인 & 레이어 마크업 버튼 */

function internal(spec, groupInfo) {
	// 뷰처리 - 레이어
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

function external(spec, groupInfo) {
    // 뷰처리 - 내장
}