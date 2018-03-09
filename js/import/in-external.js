/* 인라인 & 레이어 마크업 버튼 */

let testData = [
	{
		"변역 레이어" : {
			"활성": {
				//이벤트 내용
			},
			"비활성": {
				//이벤트 내용
			}
		}
	},
	{
		"로그인 상태" : {
			"로그인 전": {
				//이벤트 내용
			},
			"로그인 후": {
				//이벤트 내용
			}
		}
	},
	{
		"하단 로딩 이미지" : {
			"로딩 전": {
				//이벤트 내용
			},
			"로딩 후": {
				//이벤트 내용
			}
		}
	}
];

function external(testData) {
	const theme = 'naver'; //default, naver, pink
	let groupTitle,layerDomData,btnSet;
	$('body').append('<div class="ecup_section"><button type="button" class="layer_btn"><span class="blind">레이어토글</span></button></button><div class="statement_layer"></div></div>');
	$('.ecup_section .statement_layer').addClass(theme);
	testData.forEach(groupData => {
		groupTitle = Object.keys(groupData)[0];
		btnSet = '';
		for(var key in groupData[groupTitle]) {
			btnSet = btnSet +'<button type="button" class="event_btn">'+key+'</button>'
		}
		layerDomData = '<div class="layer"><strong class="title">'+groupTitle+'</strong>'+btnSet+'</div>';
		$('.ecup_section .statement_layer').append(layerDomData);
	});




	$('.ecup_section .layer_btn').on('click',function() {
		if($(this).hasClass('off')) {
			$(this).next('.statement_layer').css('display','block');
		}
		else {
			$(this).next('.statement_layer').css('display','none');
		}
		$(this).toggleClass('off');
	});
}