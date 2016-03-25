(function() {
	"use strict";

	var myCanvas;

	function euclideanDistance(a, b) {
		var sq = a.map(function(v,i) {return (v-b[i])*(v-b[i]);});
		var sum = sq.reduce(function(acc,v) { return acc+v; } );
		return Math.sqrt(sum);
	}

	function SelfOrganizingMap(width, height) {
		var self = this instanceof SelfOrganizingMap ? this : Object.create(SelfOrganizingMap.prototype);
		self.width = width;
		self.height = height;
		self.radius = 0.5 * (width > height ? width : height);
		self.weights = [];
		self.distance = euclideanDistance;
	}

	// instead of random weights, use the data we have
	SelfOrganizingMap.prototype.init = function(trainingData) {
		for (var j = 0; j < this.height; j++) {
			for (var i = 0; i < this.width; i++) {
				var index = j *  this.width + i;
				var ir = Math.floor(trainingData.length * Math.random());
				this.weights[index] = trainingData[ir];
			}
		}
	};

	SelfOrganizingMap.prototype.learn = function(trainingData, numIterations) {
		var self = this;
		var closeNeighbors = [[-1, 0], [1, 0], [0, 1], [0, -1]];
		var otherNeighbors = [[-1,-1], [1, -1], [-1, 1], [1, 1]];
		function wrap(ni, nx) {
			var x = ni[0] + nx[0];
			var y = ni[1] + nx[1];
			if (x >= self.width) {
				x = x - self.width;
			} else if (x < 0) {
				x += self.width;
			}
			if (y >= self.height) {
				y = y - self.height;
			} else if (y < 0) {
				y += self.height;
			}
			return [x, y];
		}
		function weightUpdate(neuronDistance, target, n) {
			var index = n[1] * self.width + n[0];
			self.weights[index] = self.weights[index].map(function (c,i) {
				return c + neuronDistance * (target[i] - c);
			});
		}
		this.init(trainingData);
		var startLearningRate = 0.1;
		var lambda = numIterations / Math.log(this.radius);
		for (var s = 0; s < numIterations; s++) {
			var t = Math.floor(trainingData.length * Math.random());
			var neighborhoodRadius = this.radius * Math.exp(-s/lambda);
			var alpha = startLearningRate * Math.exp(-s/numIterations);
			var Dt = trainingData[t];
			var minDistance = this.distance(Dt, this.weights[0]);
			var u = [0, 0];
			for (var j = 0; j < this.height; j++) {
				for (var i = 0; i < this.width; i++) {
					var index = j *  this.width + i;
					var d = this.distance(Dt, this.weights[index]);
					if (d < minDistance) {
						minDistance = d;
						u = [i, j];
					}
				}
			}
			for (var jj = 0; jj < this.height; jj++) {
				for (var ii = 0; ii < this.width; ii++) {
					var uu = [ii, jj];
					var dd = euclideanDistance(u, uu);
					if (dd < neighborhoodRadius) {
						var influence = Math.exp(-dd*dd / (2*neighborhoodRadius*neighborhoodRadius));
						weightUpdate(alpha * influence, Dt, uu);
					}
				}
			}
		} // iterate
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

	function createImage(width, height, rgbData) {
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

	function somTest(bins) {
		var som = new SelfOrganizingMap(64, 64);
		var td = bins[7].map(intToNormalizedSrgb);
		som.learn(td, 1000);
		var somRgbData = som.weights.map(normalizedSrgbToInt);
		var img = createImage(som.width, som.height, somRgbData);
		$('#main').append(img);
	}

  function main() {
		myCanvas = document.createElement('canvas');
		loadBinary("cc14.raw", function(bytes) {
			var bins = createColorBins(bytes);
			createImageBins(bins);
			somTest(bins);
		});
  }

  $( document ).ready(function() {
		main();
	});

})();
