import { OrbitControls } from './three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from './three/examples/jsm/postprocessing/EffectComposer.js'
import { MaskPass } from './three/examples/jsm/postprocessing/MaskPass.js'
import { ShaderPass } from './three/examples/jsm/postprocessing/ShaderPass.js'
import { RenderPass } from './three/examples/jsm/postprocessing/RenderPass.js'
import { DotScreenShader } from './three/examples/jsm/shaders/DotScreenShader.js'
import { RGBShiftShader } from './three/examples/jsm/shaders/RGBShiftShader.js'
import Stats from './three/examples/jsm/libs/stats.module.js';


var w = window;
w.lt = 10;
w.fps = 60;

var threecap = new THREEcap();

var scene, camera, renderer, stats, composer, capture;

w.record = function(reset) {
    var rec = function() {
        let div = 4;
        
        capture.record({
            width: window.innerWidth / div,
            height: window.innerHeight / div,
            fps: 25,
            time: window.lt,
            format: 'gif',
//            scriptbase: "./threecap/",
            //canvas: canvasDomElement,   // optional, slowest
            composer: composer // optional, fastest
        }).then(function(video) {
            video.saveFile('myVideo.gif');
        });
    }
    
    if(reset) main(w.init, w.update, rec);
    else rec();
}

w.init = function() {
    main(init, update);
}

export function main(init, update, done) {
    w.init = init;
    w.update = update;
    
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
    
    composer = new EffectComposer( renderer );
    composer.addPass( new RenderPass( scene, camera) );


    var effect = new ShaderPass( RGBShiftShader );
    effect.renderToScreen = false;
    composer.addPass( effect );

    capture = new THREEcap({composer: composer, scriptbase: './lib/threecap/'});
//  var captureui = new THREEcapUI(capture);
    
    var animate = function() {
        requestAnimationFrame( animate );

        update();

        stats.update();
        renderer.render( scene, camera );
        composer.render();
    };
    
    $(window).on("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

    })
    
    window.scene = scene;
    window.camera = camera;
    window.renderer = renderer;
    window.composer = composer;
    
    var update = init(scene, camera, renderer);
    animate();
    if(done) done();
}