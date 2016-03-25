(function() {
	"use strict";

	var myCanvas;


	function saturate(a) {
		return a < 0 ? 0 : a > 1 ? 1 : a;
	}
	function normalizedSrgbToInt(vector) {
		var v = vector.map(saturate);
		var r = Math.round(255.0*v[0]);
		var g = Math.round(255.0*v[1]);
		var b = Math.round(255.0*v[2]);
		return (r << 16) | (g << 8) | b;
	}

	function intToNormalizedSrgb(rgb) {
		var r = (1/255.0) * ((rgb >> 16) & 0xff);
		var g = (1/255.0) * ((rgb >> 8) & 0xff);
		var b = (1/255.0) * (rgb & 0xff);
		return [r, g, b];
	}

	function createImageSrc(width, height, rgbData) {
		myCanvas.width = width;
		myCanvas.height = height;
		var ctx = myCanvas.getContext("2d");
		var imgData=ctx.createImageData(width, height);
		var rgb;
		for (var i=0,j=0;i<imgData.data.length;i+=4,j++) {
			rgb = rgbData[j % rgbData.length];
	  	imgData.data[i+0]=(rgb >> 16) & 0xff;
	  	imgData.data[i+1]=(rgb >> 8) & 0xff;
	  	imgData.data[i+2]=rgb & 0xff;
	  	imgData.data[i+3]=255; // alpha
  	}
		ctx.putImageData(imgData,0,0);
		return myCanvas.toDataURL("image/png");
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
					bins[0].push(rgb); // there's no cat 0; use that bin to store all colors
				}
			}
		}
		return bins;
	}

	function createImageBins(bins) {
		var img;
		for (var i=0; i <= 13; i++) {
			img = createImage(128, 128, bins[i]);
			$('#main').append(img);
		}
	}

	function startSomWork(bins, width, height) {
		var load = {
			numIterations: 1000,
			width: width,
			height: height,
			bins: bins.map(function(a) {return a.map(intToNormalizedSrgb);})
		};
		for (var i=0; i<bins.length;i++) {
			$('#main').append($('<img>').attr('id', "som"+i));
		}
		if (window.Worker) {
			var myWorker = new Worker("somWorker.js");
			myWorker.postMessage(load);
			myWorker.onmessage = function(e) {
				var somId = e.data.index;
				var somRgbData = e.data.solution.map(normalizedSrgbToInt);
				var imgSrc = createImageSrc(width, height, somRgbData);
				$("#som"+somId).attr('src', imgSrc);
			};
		}
	}

  function main() {
		myCanvas = document.createElement('canvas');
		loadBinary("cc14.raw", function(bytes) {
			var bins = createColorBins(bytes);
			//createImageBins(bins);
			startSomWork(bins, 64, 64);
		});
  }

  $( document ).ready(function() {
		main();
	});

})();
