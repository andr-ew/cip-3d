import * as THREE from './three/build/three.module.js';
import { OrbitControls } from './three/examples/jsm/controls/OrbitControls.js';
import Stats from './three/examples/jsm/libs/stats.module.js';


var w = window;
w.ll = 10;
w.fps = 60;
//w.t = 0;

var threecap = new THREEcap();

var scene, camera, renderer, stats;

var record = function(format, fps, size, reset) {
    var format = format || 'mp4';
    var fps = fps || 60;
    var size = size || 1;
    var reset = reset || false;

    /*
    width: window.innerWidth * size,
    height: window.innerHeight * size,
    fps: fps,
    */

}

w.record = record;
w.r = w.record;

w.reset = function() {
    threepeat(w.init, w.update);
}

function dataURItoBlob(dataURI) {
    var mimetype = dataURI.split(",")[0].split(':')[1].split(';')[0];
    var byteString = atob(dataURI.split(',')[1]);
    var u8a = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        u8a[i] = byteString.charCodeAt(i);
    }
    return new Blob([u8a.buffer], { type: mimetype });
};

function threepeat(init, done) {
    w.init = init;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );

    renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true, alpha: true});
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setPixelRatio( window.devicePixelRatio );
    document.body.appendChild( renderer.domElement );
    renderer.setClearColor( 0x0000ff, 1);

    scene.background = null;

    var stats = new Stats();
    document.body.appendChild( stats.dom );


    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

    });

    window.scene = scene;
    window.camera = camera;
    window.renderer = renderer;
    w.update = init(scene, camera, renderer);
    //animate();

    var len = w.fps * w.ll;
    for (var i = 0; i < len; i++) {

         update(i/(w.fps * w.ll));
         renderer.render( scene, camera );

         var r = new XMLHttpRequest();
         var message = i == len - 1 ? 'end' : 'name';
         r.open('POST', 'http://localhost:3999/' + message, false);
         var blob = dataURItoBlob(renderer.domElement.toDataURL());
         r.send(blob);
    }

    if(done) done();
}

export { threepeat, record }
