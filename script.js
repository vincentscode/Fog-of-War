// animation shim
window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, 1000 / 60);
    };
})();


// settings
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);


window.serverGameId = urlParams.gameId ?? "adfs89asdfmasdmf0asdf9asd0fsadf";
window.serverHost = "https://2aa34c504636.ngrok.io" // urlParams.serverHost ?? "http://localhost:8899"
window.serverUrl = serverHost + "/data/" + serverGameId;
window.isDm = urlParams.get("isDm") ?? false;

console.log(serverUrl, "|", isDm)

window.areas = [];
window.stepSizeX = 50;
window.stepSizeY = 10;
window.overlayColor = "#0FFF0F11";

if (isDm) {
	window.translucentOverlay = true;
	window.rectColor = "#0FFF0F55";
	var xhr = new XMLHttpRequest();
	xhr.open("GET", serverUrl, true);
	xhr.send();
	xhr.onload = function() {
	    var data = JSON.parse(this.responseText);
	    // console.log(data);
	    window.areas = data;
	};
} else {
	window.translucentOverlay = false;
	window.rectColor = "#00000000";

    window.setInterval(function() {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", serverUrl, true);
		xhr.send();
		xhr.onload = function() {
		    var data = JSON.parse(this.responseText);
		    // console.log(data);
		    window.areas = data;
		};
    	// console.log("pulling")
    }, 1000 / 2);
}

// main function
(function() {
	"use strict";
	
	var _Canvas;
	let _backImageSrc = 'map.png';
	let _backImage;
	let _blackMask;
	let _mouseX = 0;
	let _mouseY = 0;
	let _mouseDownX = 0;
	let _mouseDownY = 0;
	let _mouseUpX = 0;
	let _mouseUpY = 0;
	let _mouseIsDown = false;
	let _maskCount = 2500;
	let _tweenTime = 1; // 0.5;
	let _pauseTime = 0; // 0.25;
	let _delayTime = .01; // 0.08;
	let _maskArray = [];
	let _maskSize = 100;
	let _imgWidth = 4000;
	let _imgHeight = 2028;
	let _srcArray = ["stains/s1.png", "stains/s2.png", "stains/s3.png"];
	
	function init() {
		_Canvas = new Canvas({stage:document.getElementById('stage')});

		_backImage = new MaskedImage({src:_backImageSrc, width:_imgWidth, height:_imgHeight});

		generateMasks();

		addListeners();
	}

	function sendDataToServer() {
		if (!isDm) { return; }
		console.log("sendDataToServer", JSON.stringify(window.areas))
		var xhr = new XMLHttpRequest();
		xhr.open("POST", serverUrl, true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(JSON.stringify(window.areas));
		xhr.onload = function() {
		    var data = JSON.parse(this.responseText);
		    console.log(data);
		};
	}

	function generateMasks() {
		console.log("generateMasks", _maskCount)
		for(let i=_maskArray.length;i<_maskCount;i++){
			let ranSrc = _srcArray[Math.floor(Math.random() * _srcArray.length)];
			let mask = new MaskedImage({src:ranSrc, delay:i, width:100, height:100});
			_maskArray.push(mask);
		}
	}
	
	function addListeners() {
		_Canvas.el.addEventListener('mousemove', onCanvasMouseMove);
		_Canvas.el.addEventListener('mousedown', onCanvasMouseDown);
		_Canvas.el.addEventListener('mouseup', onCanvasMouseUp);
		_Canvas.el.addEventListener('mouseout', onCanvasMouseOut);
	}
	
	function onCanvasMouseMove(event) {
		_mouseX = event.pageX - $(this).offset().left;
		_mouseY = event.pageY - $(this).offset().top;
		// console.log("move", _mouseIsDown, _mouseX, _mouseY);
	}
	
	function onCanvasMouseDown(event) {
		_mouseIsDown = true;
		_mouseDownX = _mouseX = event.pageX - $(this).offset().left;
		_mouseDownY = _mouseY = event.pageY - $(this).offset().top;
		console.log("down", _mouseIsDown, _mouseX, _mouseY);
	}
	
	function onCanvasMouseUp(event) {
		_mouseIsDown = false;
		_mouseUpX = _mouseX = event.pageX - $(this).offset().left;
		_mouseUpY = _mouseY = event.pageY - $(this).offset().top;
		console.log("up", _mouseIsDown, _mouseX, _mouseY);

		if (!isDm) { return; }
		window.areas = window.areas.concat([[_mouseDownX, _mouseDownY, -(_mouseDownX - _mouseX), -(_mouseDownY - _mouseY)]]);
		sendDataToServer();
	}
	
	function onCanvasMouseOut(event) {
		_mouseIsDown = false;
	}
	
	function onEnterFrame() {
		// stage
		_Canvas.clearStage();
		drawStage();
		
		// selection rect
		_Canvas.context.fillStyle = "#FF0F0F55"
		if (_mouseIsDown && isDm) {
			_Canvas.context.fillRect(_mouseDownX, _mouseDownY, -(_mouseDownX - _mouseX), -(_mouseDownY - _mouseY));
		}
		
		// draw
		window.requestAnimFrame(onEnterFrame, 60);
	}
	
	function drawStage() {
		_Canvas.context.save();

		var mCdummy = 0;
		for (let areaI in window.areas) {
			let area = window.areas[areaI];
			for (var x = area[0] + (_maskSize / 1.5); x < area[0] + area[2] - (_maskSize / 1.5); x += stepSizeX) {
				for (var y = area[1] + (_maskSize / 1.5); y < area[1] + area[3] - (_maskSize / 1.5); y += stepSizeY) {
					mCdummy++;
				}
			}
		}
		if (mCdummy >= _maskCount) {
			_maskCount = mCdummy + 100;
			generateMasks();
		}

		// reveal
		var mC = 0;
		for (let areaI in window.areas) {
			let area = window.areas[areaI];
			var drawn = false;
			for (var x = area[0] + (_maskSize / 1.5); x < area[0] + area[2] - (_maskSize / 1.5); x += stepSizeX) {
				for (var y = area[1] + (_maskSize / 1.5); y < area[1] + area[3] - (_maskSize / 1.5); y += stepSizeY) {
					_maskArray[mC].empty.x = x;
					_maskArray[mC].empty.y = y;
					_maskArray[mC].tweenDraw();
					mC++;
					drawn = true;
				}
			}

			if (!drawn) {
				console.log("too small!")
				window.areas.splice(areaI, 1)
			}
		}
		
		// background
		_Canvas.context.globalCompositeOperation = 'source-in';
		_backImage.draw();
		_Canvas.context.restore();

		// area rect
		for (let areaI in window.areas) {
			let area = window.areas[areaI];
			_Canvas.context.fillStyle = window.rectColor;
			_Canvas.context.fillRect(area[0], area[1], area[2], area[3]);
		}
	}
	
	class MaskedImage {
		constructor(options) {
			this.hasImg = false;
			this.img = new Image();
			this.empty = {scale:0, alpha:1, x:0, y:0};
			this.delay = options.delay;
			this.rotation = Math.random() * 360;
			this.width = options.width;
			this.height = options.height;
			this.halfWidth = this.width/2;
			this.img.src = options.src;
			this.img.onload = function() {
				this.hasImg = true;
				if(this.delay){ 
					setTimeout(function() {this.scale();}.bind(this), this.delay*(_delayTime * 1000));
				}
				this.draw(); 
			}.bind(this);
		}
		
		draw(x=0,y=0) {
			if(this.hasImg) {
				_Canvas.context.drawImage(this.img, x, y, this.width, this.height,
											x, y, _Canvas.width, _Canvas.height);
			}
		}
		
		tweenDraw() {
			if(this.hasImg) {
				let curWidth = this.width * this.empty.scale; 
				_Canvas.context.save();
				_Canvas.context.globalAlpha = this.empty.alpha;
				
				_Canvas.context.translate(this.empty.x, this.empty.y);
				_Canvas.context.rotate(this.rotation * Math.PI / 180);
				_Canvas.context.scale(1.5 * (curWidth/this.width), 1.5*(curWidth/this.width));
				_Canvas.context.translate(-this.empty.x, -this.empty.y);
				_Canvas.context.drawImage(this.img,this.empty.x-this.halfWidth,this.empty.y-this.halfWidth);
				_Canvas.context.globalAlpha = 1;
				_Canvas.context.restore();
			}
		}
		
		scale() {
			this.empty.x = _mouseX;
			this.empty.y = _mouseY;
			this.rotation = Math.random() * 360;
			TweenMax.fromTo(this.empty, _tweenTime, {alpha:1, scale:0},{alpha:1, scale:1, onComplete:function(){
				setTimeout(this.fadeOut.bind(this), _pauseTime * 1000);
			}.bind(this)
			});
		}
		
		fadeOut() {
			// TweenMax.to(this.empty, _tweenTime,{alpha:0, onComplete:this.scale.bind(this)});
		}
		
	}
	
	class Canvas {
		constructor(options) {
			this._stage = options.stage;
			this._stageWidth = this._stage.width = window.innerWidth;
			this._stageHeight = this._stage.height = window.innerHeight;
			this._stageContext = this._stage.getContext('2d');
		}
		
		// clear stage of current content
		clearStage(options) {
			if(typeof options === "undefined") {
				this._stageContext.clearRect(0,0,this._stageWidth, this._stageHeight);
				if (translucentOverlay) {
					this._stageContext.fillStyle = window.overlayColor;
					this._stageContext.fillRect(0,0,this._stageWidth, this._stageHeight);
				}
			}
		}
		
		get width() { return this._stageWidth; }
		get height() { return this._stageHeight; }
		get el() {return this._stage; }
		get context() {return this._stageContext; }
	}
	
	init();
	onEnterFrame();
	
})();
