import * as THREE from './threepeat/three/build/three.module.js';
import { OBJLoader } from './threepeat/three/examples/jsm/loaders/OBJLoader.js';

function Crv() {
    THREE.Curve.call( this );
}
Crv.prototype = Object.create( THREE.Curve.prototype );
Crv.prototype.constructor = Crv;

var w = window;

export var makecrv = function(getPoint) {
    let crv = new Crv();
    crv.getPoint = getPoint;

    // let cmat = new THREE.MeshBasicMaterial();
    // let cmsh = new THREE.Mesh( crv, cmat );

    return new THREE.TubeBufferGeometry(
        crv , 100, 1, 3, true );
}

export var makemodel = function(name, onload) {
    var objload = new OBJLoader();

    var grp = new THREE.Group();
//    scene.add(this.group);

    var bmload = new THREE.TextureLoader();
    //bmload.setOptions( { imageOrientation: 'flipY' } );

    var me = {};

    bmload.load(
        // resource URL
        'mod/' + name + '.bmp',
        ( tex ) => {
            me.tex = tex;
            me.mat = new THREE.MeshBasicMaterial( { map: me.tex } );

            objload.load(
                './mod/' + name + '.obj',
                ( object ) => {
                    object.traverse( function ( node ) {

                        //if ( node.isMesh ) {
                            node.material = me.mat;
                        // }

                    } );

                    //me.obj = object

                    if(onload) onload(object);
                },
                undefined,
                function ( error ) {

                    console.log(error);
                }
            );
        },
        undefined,
        function ( err ) {
            console.log( err);
        }
    );

    return grp;
}

export var maketea = (onload) => { return makemodel('teapot3', (obj) => {

    // obj.rotateX(-Math.PI / 2);
    obj.position.y = -50 * 0.25;
    obj.scale.set(0.25, 0.25, 0.25);

    // console.log(obj);
    window.tea = obj;

    if(onload) onload(obj);
}); };

export var Wrm = function(makemodel, crv, nsegs) {

    var direction = new THREE.Vector3();
    var binormal = new THREE.Vector3();
    var normal = new THREE.Vector3();
    var position = new THREE.Vector3();
    var lookAt = new THREE.Vector3();

    var segments = []

    makemodel((model) => {
        for(let i = 0; i < nsegs; i++) {
            let obj = model.clone;
            obj.position.y = -50 * 0.25;
            obj.scale.set(0.25, 0.25, 0.25);

            segments[i] = obj;
            scene.add( segments[i] );
        }
    });

    this.update = function(T) {

        for(let i in segments) {

            let seg = segments[i];
            let t = (T + (i/nsegs)) % 1;

            crv.parameters.path.getPointAt( t, position );
            position.multiplyScalar( 1 );

            // interpolation

            var tangents = crv.tangents.length;
            var pickt = t * tangents;
            var pick = Math.floor( pickt );
            var pickNext = ( pick + 1 ) % tangents;

            binormal.subVectors( crv.binormals[ pickNext ], crv.binormals[ pick ] );
            binormal.multiplyScalar( pickt - pick ).add( crv.binormals[ pick ] );

            crv.parameters.path.getTangentAt( t, direction );
            var offset = 15;

            normal.copy( binormal ).cross( direction );

            // we move on a offset on its binormal

            position.add( normal.clone().multiplyScalar( offset ) );

            seg.position.copy( position );

            // using arclength for stablization in look ahead

            crv.parameters.path.getPointAt( ( t + 30 / crv.parameters.path.getLength() ) % 1, lookAt );
            lookAt.multiplyScalar( 1 );

            // camera orientation 2 - up orientation via normal

            if ( ! true ) lookAt.copy( position ).add( direction );
            seg.matrix.lookAt( seg.position, lookAt, normal );
            seg.quaternion.setFromRotationMatrix( seg.matrix );
        }
    }
}
