//*

this.inlets = 1;
this.outlets = 1;

var pi = 3.14159265359;

var window = new JitterObject("jit.window","wrm");
window.size = [500, 350];

var render = new JitterObject("jit.gl.render","wrm");
render.camera = [0, 0, 7]

var teapotTex = new JitterObject("jit.gl.texture", "wrm");
teapotTex.file = "teapot.bmp";

var teapot = new JitterObject("jit.gl.model", "wrm");
teapot.file = "teapot.obj";
teapot.texture = teapotTex.name;
teapot.lighting_enable = 1;

outlet(0, "name", teapot.name)

var handle = new JitterObject("jit.gl.handle", "wrm");

var path = new JitterObject("jit.gl.path", "wrm");

var anim = new JitterObject("jit.anim.path");

anim.targetname = teapot.name;
//anim.drawpath = path.name;

anim.interpmode = "spline";
anim.evalquat = 1;

var p  = [ 
				[ -2.05, 0.01, 0.3 ],
				[ 0.4, 2.1, 0.2 ],
				[ 2, 0.3, 0 ],
				[ 0,2, -2.1, 0.04 ]
			];

anim.append(10, p[0][0], p[0][1], p[0][2]);
anim.append(1, p[1][0], p[1][1], p[1][2]);
anim.append(10, p[2][0], p[2][1], p[2][2]);
anim.append(1, p[3][0], p[3][1], p[3][2]);
anim.append(1, p[0][0], p[0][1], p[0][2]);

//anim.setrotatexyz(0, 0, 0, 0 + 90);
//anim.setrotatexyz(1, 0, 0, -90 + 90);
//anim.setrotatexyz(2, 0, 0, -180 + 90);
//anim.setrotatexyz(3, 0, 0, -270 + 90);
//anim.setrotatexyz(4, 0, 0, -360 + 90);
//anim.start();

var th_init = 90;

function vectorAngle(x, y) {
	var th;
	
	if (x == 0) { // special cases
        th = (y > 0) ? 90 : (y == 0) ? 0 : 270;
	}
    else if (y == 0) { // special cases
        th = (x >= 0)? 0 : 180;
	}
	else {
    	th = (Math.atan(y / x) * (180 / pi));
		
    	if (x < 0 && y < 0) // quadrant Ⅲ
        	th = 180 + th;
    	else if (x < 0) // quadrant Ⅱ
        	th = 180 + th;
    	else if (y < 0) // quadrant Ⅳ
        	th = 270 + (90 + th);
	}
	
	return th;
}

function quatbtw2vects(u, v) {
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
	
	u = normalized(u);
  	v = normalized(v);

	//post("u ", u[0], u[1], u[2]);
	//post("v ", v[0], v[1], v[2]);

	if (equals(u, negative(v))) {
    	// 180 degree rotation around any orthogonal vector
    	return orthogonal(u);
  	}

	var half = normalized(sum(u, v));
	var xyz = cross(u, half);
	
	return [ xyz[0], xyz[1], xyz[2], dot(u, half) ];
}

//anim.setrotatexyz(0, 0, 0, th_init);

for(var i = 1; i < p.length; i++) {
	var i1 = (i - 1);
	var i2 = (i + 1) % p.length;
	
	var v_init = [0, 1, 0];
	
	var dx = p[i2][0] - p[i1][0];
	var dy = p[i2][1] - p[i1][1];
	var dz = p[i2][2] - p[i1][2];
	
	var quat = quatbtw2vects(v_init, [ dx, dy, dz ]);
	
	
	anim.setquat(i, quat[0], quat[1], quat[2], quat[3]);
	
	post(i, quat[0], quat[1], quat[2], quat[3]);
}

function eval(n) {
	anim.eval(n);
}

function bang() {
	render.position = handle.position;
	render.rotate = handle.rotate;
	
	render.erase(); // erase the drawing context
	render.drawclients(); // draw the client objects
	render.swap(); // swap in the new drawing
}

