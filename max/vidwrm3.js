//*

this.inlets = 1;
this.outlets = 1;

var pi = 3.14159265359;

/*
var window = new JitterObject("jit.window","wrm");
window.size = dim;
*/

/*
var mtrx = new JitterMatrix(4, "char", dim[0], dim[1]);
mtrx.name = "wrm";
*/

/*
var render = new JitterObject("jit.gl.render","wrm");
render.camera = [0,0,5];
*/

var teapotTex = new JitterObject("jit.gl.texture", "wrm");
teapotTex.file = "teapot.bmp";

var p  = [ 
				[ -2.05, 0.01, 0.3 ],
				[ 0.4, 3.1, 0.2 ],
				[ 2, 0.3, 0 ],
				[ 0,2, -2.1, 0.04 ]
			];
			
var quatInit = [0, 0, 0, 0];
			
function quatbtw2vects(u, v, qinit) {
	function cross(a, b) {
		return [a[1]*b[2] - a[2]*b[1], a[2]*b[0] - a[0]*b[2], a[0]*b[1] - a[1]*b[0]];
	}
	
	function dot(a, b) {
		return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	}
	
	function magnitude(a) {
		return Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2));
	}
	
	function normalized(a) {
		var m = magnitude(a)
		
		return [ a[0] / m, a[1] / m, a[2] / m ];
	}
	
	function orthogonal(a) {
    	var x = Math.abs(a[0]);
    	var y = Math.abs(a[1]);
    	var z = Math.abs(a[2]);

    	var other = x < y ? (x < z ? [1,0,0] : [0,0,1]) : (y < z ? [0,1,0] : [0,0,1]);

    	return cross(a, other);
	}
	
	function sum(a, b) {
		return [ a[0] + b[0], a[1] + b[1], a[2] + b[2] ];
	}
	
	function negative(a) {
		return [ -a[0], -a[1], -a[2] ];
	}
	
	function equals(a, b) {
		return a[0] == b[0] && a[1] == b[1] && a[2] == b[2];
	}
	
	function qprod(a, b) {
		return [
        	a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3],  // 1
        	a[0] * b[1] + a[1] * b[0] - a[2] * b[3] + a[3] * b[2],  // i
        	a[0] * b[2] + a[1] * b[3] + a[2] * b[0] - a[3] * b[1],  // j
        	a[0] * b[3] - a[1] * b[2] + a[2] * b[1] + a[3] * b[0]   // k
    	];
	}
	
	u = normalized(u);
  	v = normalized(v);

	if (equals(u, negative(v))) {
    	// 180 degree rotation around any orthogonal vector
    	return orthogonal(u);
  	}

	var half = normalized(sum(u, v));
	var xyz = cross(u, half);
	
	return qprod([ dot(u, half), xyz[0], xyz[1], xyz[2] ], [ qinit[3], qinit[0], qinit[1], qinit[2] ]);
	//return [ dot(u, half), xyz[0], xyz[1], xyz[2] ];
}

function Frame() {
	this.model = new JitterObject("jit.gl.model", "wrm");
	this.model.file = "teapot.obj";
	this.model.texture = teapotTex.name;
	this.model.lighting_enable = 1;
	
	this.path = new JitterObject("jit.gl.path", "wrm");
	
	this.model.scale = [0.5,0.5,0.5];
	
	this.anim = new JitterObject("jit.anim.path");
	this.anim.targetname = this.model.name;
	
	this.anim.interpmode = "spline";
	this.anim.evalquat = 1;

	for(k in p) {
		this.anim.append(1, p[k][0], p[k][1], p[k][2]);
	}
	
	this.anim.append(1, p[0][0], p[0][1], p[0][2]);
	
	this.updateQuats = function(p, quatInit) {
		
		for(l in p) {
			this.anim.edit(l, 1, p[l][0], p[l][1], p[l][2]);
		}
	
		this.anim.edit(p.length, 1, p[0][0], p[0][1], p[0][2]);
		
		for(var j = 1; j < p.length; j++) {
			var i1 = (j - 1);
			var i2 = (j + 1) % p.length;
	
			var v_init = [0, 1, 0];
	
			var dx = p[i2][0] - p[i1][0];
			var dy = p[i2][1] - p[i1][1];
			var dz = p[i2][2] - p[i1][2];
	
			var quat = quatbtw2vects(v_init, [ dx, dy, dz ], quatInit);
	
			this.anim.setquat(j, quat[1], quat[2], quat[3], quat[0]);
		}
		
		var j = 1;
	}
	
	this.updateQuats(p, quatInit);
}

var frames = [];
var framecount = 1;

function init(fc) {
	framecount = fc;
	
	frames = [];
	
	for(var i = 0; i < framecount; i++) {
		frames[i] = new Frame();
		frames[i].anim.eval(i/framecount);
	}
}

function initquat(x,y,z,w) {
	quatInit = [x,y,z,w];
	
	for(var i = 0; i < framecount; i++) {
		frames[i].updateQuats(p, quatInit);
	}
}

function eval(n) {
	for(var i = 0; i < framecount; i++) {
		n = (Math.floor(((n + (i/framecount)) * 1000)) % 1000) / 1000;
		
		frames[i].anim.eval(n);
	}
}

function mode(m) {
	post("mode", m);
	
	if(m == 1) {
		for(var i = 0; i < framecount; i++) {
			frames[i].anim.drawpath = frames[i].path.name;
			post(frames[i].anim.drawpath);
		}
	} else {
		for(var i = 0; i < framecount; i++) {
			frames[i].anim.drawpath = null;
		}
	}
}

/*
function bang() {
	//var render = mtrx;
	
	render.position = handle.position;
	render.rotate = handle.rotate;
	
	render.erase(); // erase the drawing context
	render.drawclients(); // draw the client objects
	render.swap(); // swap in the new drawing
	
	outlet(0, "jit_matrix", mtrx.name); 
}
*/

