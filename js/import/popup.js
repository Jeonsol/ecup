jQuery.fn.showPopup = function(options) {

	jQuery.fn.showPopup.serialNum = jQuery.fn.showPopup.serialNum || 1;

	for (var i = 0; i < this.length; ++i) {
		var width, height, title;
		var name = 'popup' + jQuery.fn.showPopup.serialNum++;

		var dom = this[i];

		var html = $('<div>').append($(dom).clone())[0].innerHTML,
			$css = $('head').find('link, style').clone(),
			css = $('<div>').append($css)[0].innerHTML;

		// 옵션 적용
		if (options && options.width) width = options.width;
		if (options && options.height) height = options.height;

		var features = 'width=' + width + ',height=' + height;
		var popup = window.open('', name, features);

		if (options && options.title) name = options.title;
		popup.document.head.innerHTML = '<title>' + name + '</title>' + css;
		popup.document.body.innerHTML = html;
	}

}
