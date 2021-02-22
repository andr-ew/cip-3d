this.inlets = 1;
this.outlets = 1;

function dice() {
  var D = 3;
  var x = 0;

  for(var i = 0; i < D; i++) {
  	x = x + Math.random();
  }
	
  return x * 2 - D;
}

function calc(pmean, pdev, qmean, qdev) {
	var q = qmean + dice() * qdev;
}