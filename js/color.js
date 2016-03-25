(function() {
	"use strict";

	var myCanvas;
	var myWorker;
	var colorBins;
	var colorConversions = {
		spaceSrgb: {
			to: intToNormalizedSrgb,
			from: normalizedSrgbToInt
		},
		spaceRgb: {
			to: function(rgb) {
				return normalizedSrgbToRgb(intToNormalizedSrgb(rgb));
			},
			from: function(rgb) {
				return normalizedSrgbToInt(linearRgbToNormalizedSrgb(rgb));
			}
		},
		spaceLab: {
			to: function(rgb) {
				return xyzToLab(linearRgbToXyz(normalizedSrgbToRgb(intToNormalizedSrgb(rgb))));
			},
			from: function(lab) {
				return normalizedSrgbToInt(linearRgbToNormalizedSrgb(xyzToLinearRgb(labToXyz(lab))));
			}
		}
	};

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
	function normalizedSrgbToRgb(rgbVector) {
		var linearRgb = rgbVector.map(function (c) {
				if (c <= 0.04045) {
					return c / 12.92;
				}
				return Math.pow((c + 0.055) / 1.055, 2.4);
		});
		return linearRgb;
	}
	function linearRgbToNormalizedSrgb(rgb) {
		var srgb = rgb.map(function (c) {
			if (c <= 0.0031308) {
				return c * 12.92;
			}
			return Math.pow(c * 1.055, 1/2.4) - 0.055;
		});
		return srgb;
	}
	function linearRgbToXyz(rgb) {
		var x = rgb[0] * 0.4124 + rgb[1] * 0.3576 + rgb[2] * 0.1805;
		var y = rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
 		var z = rgb[0] * 0.0193 + rgb[1] * 0.1192 + rgb[2] * 0.9505;
		return [x,y,z];
	}
	function xyzToLinearRgb(xyz) {
		var r = xyz[0] *  3.2406 + xyz[1] * -1.5372 + xyz[2] * -0.4986;
		var g = xyz[0] * -0.9689 + xyz[1] *  1.8758 + xyz[2] *  0.0415;
		var b = xyz[0] *  0.0557 + xyz[1] * -0.2040 + xyz[2] *  1.0570;
		return [r, g, b];
	}
	function xyzToLab(xyz) {
		// D65 White point (x,y)=0.31382,0.33100;
		var rXyz = [xyz[0]/0.95047, xyz[1], xyz[2]/1.08883];
		var e=216/24389; // the actual CIE standard is 0.008856
		var k=24389/27;  // the actual CIE standard is 903.3
		var fXyz = xyz.map(function (c) {
			if (c <= e) {
				return (k * c + 16) / 116;
			}
			return Math.pow(c, 1/3);
		});
		var lab = [116 * fXyz[1] - 16, 500 * (fXyz[0] - fXyz[1]), 200 * (fXyz[1] - fXyz[2])];
		return lab;
	}
	function labToXyz(lab) {
		var e=216/24389; // the actual CIE standard is 0.008856
		var y = ( lab[0] + 16 ) / 116;
 		var x = lab[1] / 500 + y;
		var z = y - lab[2] / 200;
		var xyz = [x, y, z].map(function(c) {
			var c3 = Math.pow(c, 3);
			if (c3 <= e) {
				return (c - 16 / 116) / 7.787;
			}
			return c3;
		});
		// D65 White reference point
		return [xyz[0]*0.95047, xyz[1] ,xyz[2]*1.08883];
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

	function startSomWork(bins, width, height, iterations, space) {
		var fnTo = colorConversions[space].to;
		var fnFrom = colorConversions[space].from;
		var load = {
			numIterations: iterations,
			width: width,
			height: height,
			bins: bins.map(function(a) {return a.map(fnTo);})
		};
		for (var i=0; i<bins.length;i++) {
			if ($("#som"+i).length === 0) {
				$('#main').append($('<img>').attr('id', "som"+i));
			}
		}
		if (window.Worker) {
			myWorker = new Worker("somWorker.js");
			myWorker.postMessage(load);
			myWorker.onmessage = function(e) {
				var somId = e.data.index;
				var somRgbData = e.data.solution.map(fnFrom);
				var imgSrc = createImageSrc(width, height, somRgbData);
				$("#som"+somId).attr('src', imgSrc);
				//document.getElementById("myBar").style.width = e.data.done + "%";
				$("#myBar").css('width', e.data.done + "%");
			};
		}
	}

	function updateParameters() {
		myWorker.terminate();
		var width = $('#somWidth').val();
		var height = $('#somHeight').val();
		var iterations = $('#somIterations').val();
		var space = $('#somColorSpace').val();
		startSomWork(colorBins, width, height, iterations, space);
	}

	function createDropdownList(id, list, callback) {
    var updateFunction = function(event) {
      var i = event.target.selectedIndex;
      callback(event.target.options[i].innerHTML, event.target.value);
    };
    var select = $('<select>').attr('id', id).change(updateFunction);
    list.forEach(function (obj) {
      select.append($('<option>').attr('value', obj.value).append(obj.name));
    });
		return select;
	}

  function main() {
		var w = 64, h = 64, its = 400;
		myCanvas = document.createElement('canvas');
		$('#main').append($("<input type='button' value='Restart'>").click(updateParameters));
		$('#main').append(" Width = ");
		$('#main').append($("<input type='number' maxlength='3' id='somWidth' value='"+w+"'>"));
		$('#main').append(" Height = ");
		$('#main').append($("<input type='number' maxlength='3' id='somHeight' value='"+h+"'>"));
		$('#main').append(" Color Space = ");
		$('#main').append(createDropdownList("somColorSpace", [
			{name: "sRGB", value: "spaceSrgb"},
			{name: "RGB", value: "spaceRgb"},
			{name: "Lab", value: "spaceLab"}
		], updateParameters));
		$('#main').append(" Iterations = ");
		$('#main').append($("<input type='number' maxlength='3' id='somIterations' value='"+its+"'>"));
		$('#main').append($("<p>"));
		$('#main').append($('<div>').attr('id',"myProgress").append($('<div>').attr('id',"myBar")));
		$('#main').append($("<p>"));
		loadBinary("cc14.raw", function(bytes) {
			colorBins = createColorBins(bytes);
			//createImageBins(bins);
			startSomWork(colorBins, w, h, its, "spaceSrgb");
		});
  }

  $( document ).ready(function() {
		main();
		window.normalizedSrgbToRgb = normalizedSrgbToRgb;
		window.linearRgbToXyz = linearRgbToXyz;
		window.linearRgbToNormalizedSrgb = linearRgbToNormalizedSrgb;
		window.xyzToLinearRgb = xyzToLinearRgb;
		window.xyzToLab = xyzToLab;
		window.labToXyz = labToXyz;
	});

})();
