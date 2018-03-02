var ecup;
(function(doc) {
	ecup = function (selector) {
		function Ecup() {
			this.target = doc.querySelectorAll(selector);
		}
		Ecup.prototype = {
			colorChange: function (event, color) {
				let objThis;
				let fn = function () {
					this.style.color = color;
					if (event === 'mouseover') {
						objThis = this;
						objThis.onmouseout = function () {
							objThis.style.color = "";
						}
					}
				};
				this.target.forEach(data => {
					data.addEventListener(event, fn, false);
				});
				return this;
			},
			aria: function (event, aria, boolData) {
				let fn = function () {
					let siblings = this.parentNode.children;
					Array.from(siblings).forEach(function (data) {
						data.setAttribute(aria, !boolData);
					});
					this.setAttribute(aria, boolData);
				};
				this.target.forEach(data => {
					data.addEventListener(event, fn, false);
				});
				return this;
			},
			layerToggle: function (target, open, close) {
				let objThis = this;
				let fn_layer_open = function () {
					objThis.target[0].querySelector(target).setAttribute('style', 'display:block;');
				};
				let fn_layer_close = function () {
					objThis.target[0].querySelector(target).setAttribute('style', 'display:none;');
				};
				this.target.forEach(parent => {
					let btn_open = parent.querySelector(open);
					let btn_close = parent.querySelector(close);
					btn_open.addEventListener('click', fn_layer_open, false);
					btn_close.addEventListener('click', fn_layer_close, false);
				});
				return this;
			}
		};
		return new Ecup();
	};
})(document);