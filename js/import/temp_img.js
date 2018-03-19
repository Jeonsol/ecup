(function tempImg() {

	var type, id;
	var imgs = document.getElementsByTagName('img');

	for (var i = 0; i < imgs.length; ++i) {
		var img = imgs[i],
			src = img.getAttribute('src');

		/* src 가 있는 경우 지나감 (임시 이미지 아님) */
		if (!src || src[0] !== '#') continue;

		/* 임시이미지인 경우 */
		// 타입 파싱
		var typeArr = src.match(/#(p|l|n|사람|라이프스타일|자연)(\d?)/);
		type = typeArr && typeArr[1] ? getImgType(typeArr[1]) : getImgType(getRandomNumber());
		id = typeArr && typeArr[2] ? typeArr[2] : getRandomNumber();

		// 새 src 만들기
		var width = img.getAttribute('width') || 100,
			height = img.getAttribute('height') || width || 100,
			newSrc = 'http://dev.ui.naver.com/tmp/?' + width + 'x' + height + '_ecup' + type + id + '_n_CFE2F3_100';

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
