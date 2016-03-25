self.importScripts('nn.js');

onmessage = function(e) {
  var soms = [];
  var i;
  for (i=0; i<e.data.bins.length;i++) {
    var som = new SelfOrganizingMap(
      e.data.width, e.data.height,
      e.data.numIterations, e.data.bins[i]
    );
    var initResult = {
      index: i,
      solution: som.weights
    };
    soms.push(som);
    postMessage(initResult);
  }
  for (var s=0; s<e.data.numIterations; s++) {
    for (i=0; i<soms.length; i++) {
      soms[i].solve(s);
      var itResult = {
        index: i,
        solution: soms[i].weights
      };
      postMessage(itResult);
    }
  }
  console.info("somWorker is Done. Terminating.");
  close(); // this worker is done, terminate
};
