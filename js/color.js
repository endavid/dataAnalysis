(function() {
	"use strict";

	var myCanvas;

	function createImage(width, height, rgbData) {
		myCanvas.width = width;
		myCanvas.height = height;
		var ctx = myCanvas.getContext("2d");
		var imgData=ctx.createImageData(width, height);
		var rgb;
		for (var i=0;i<imgData.data.length;i+=4) {
			rgb = rgbData[i % rgbData.length];
	  	imgData.data[i+0]=(rgb >> 16) & 0xff;
	  	imgData.data[i+1]=(rgb >> 8) & 0xff;
	  	imgData.data[i+2]=rgb & 0xff;
	  	imgData.data[i+3]=255; // alpha
  	}
		ctx.putImageData(imgData,0,0);
		var image = new Image();
		image.src = myCanvas.toDataURL("image/png");
		return image;
	}
  // http://stackoverflow.com/a/21944028/1765629
  function loadBinary(url, callback) {
    var byteArray = [];
    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.overrideMimeType('text\/plain; charset=x-user-defined');
		req.onreadystatechange = function() {
			if (req.readyState == 4 && req.status == 200) {
				for (var i = 0; i < req.responseText.length; ++i) {
		      byteArray.push(req.responseText.charCodeAt(i) & 0xff);
		    }
				callback(byteArray);
			}
		};
		req.send();
  }

	function createColorBins(categoryLut) {
		var i, cat, rgb;
		var bins = [];
		for (i = 0; i < 14; i++) {
			bins[i] = [];
		}
		for (var b = 0; b < 32; b++) {
			for (var g = 0; g < 32; g++) {
				for (var r = 0; r < 32; r++) {
					rgb = (r * 8) << 16 | (g * 8) << 8 | (b * 8);
					i = r*32*32+g*32+b;
					cat = categoryLut[i];
					bins[cat].push(rgb);
				}
			}
		}
		return bins;
	}

	function createImageBins(bins) {
		var img;
		for (var i=1; i <= 13; i++) {
			img = createImage(128, 128, bins[i]);
			$('#main').append(img);
		}
	}

  function main() {
		myCanvas = document.createElement('canvas');
		loadBinary("cc14.raw", function(bytes) {
			var bins = createColorBins(bytes);
			createImageBins(bins);
		});
  }

  $( document ).ready(function() {
		main();
	});

})();
