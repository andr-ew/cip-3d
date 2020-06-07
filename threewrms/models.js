import * as THREE from './lib/three/build/three.module.js';
import { OBJLoader } from './lib/three/examples/jsm/loaders/OBJLoader.js';

export var Objmod = function(name) {
    var objload = new OBJLoader();
    
    this.grp = new THREE.Group();
//    scene.add(this.group);

    var bmload = new THREE.ImageBitmapLoader();
    bmload.setOptions( { imageOrientation: 'flipY' } );
    
    var me = this;

    bmload.load(
        // resource URL
        'mod/' + name + '.bmp',
        ( imageBitmap ) => {
            me.tex = new THREE.CanvasTexture( imageBitmap );
            me.mat = new THREE.MeshBasicMaterial( { map: this.tex } );

            objload.load(
                './mod/' + name + '.obj',
                ( object ) => {
                    object.traverse( function ( node ) {

                        if ( node.isMesh ) node.material = me.mat;

                    } );

                    me.obj = object
                    me.obj.rotateX(-Math.PI / 2);
                    me.obj.position.y = -50;

                    me.grp.add( object );
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
}

