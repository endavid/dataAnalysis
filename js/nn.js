function squareEuclideanDistance(a, b) {
  var sq = a.map(function(v,i) {return (v-b[i])*(v-b[i]);});
  var sum = sq.reduce(function(acc,v) { return acc+v; } );
  return sum;
}

function euclideanDistance(a, b) {
  return Math.sqrt(squareEuclideanDistance(a,b));
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

SelfOrganizingMap.prototype.weightUpdate = function(delta, target, uv) {
  var index = uv[1] * this.width + uv[0];
  this.weights[index] = this.weights[index].map(function (c,i) {
    return c + delta * (target[i] - c);
  });
};

SelfOrganizingMap.prototype.updateNeurons = function(learningRate, neighborhoodRadius, bmu, target) {
  for (var j = 0; j < this.height; j++) {
    for (var i = 0; i < this.width; i++) {
      var u = [i, j];
      var dd = squareEuclideanDistance(bmu, u);
      var rr = neighborhoodRadius * neighborhoodRadius;
      if (dd < rr) {
        var influence = Math.exp(-dd / (2*rr));
        this.weightUpdate(learningRate * influence, target, u);
      }
    }
  }
};

SelfOrganizingMap.prototype.learn = function(trainingData, numIterations) {
  this.init(trainingData);
  var startLearningRate = 0.1;
  var lambda = numIterations / Math.log(this.radius);
  for (var s = 0; s < numIterations; s++) {
    var t = Math.floor(trainingData.length * Math.random());
    var neighborhoodRadius = this.radius * Math.exp(-s/lambda);
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
    var alpha = startLearningRate * Math.exp(-s/numIterations);
    this.updateNeurons(alpha, neighborhoodRadius, u, Dt);
  } // iterate
};
