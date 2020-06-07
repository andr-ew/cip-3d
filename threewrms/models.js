import * as THREE from './threepeat/three/build/three.module.js';
import { OBJLoader } from './threepeat/three/examples/jsm/loaders/OBJLoader.js';

export var makemodel = function(name, onload) {
    var objload = new OBJLoader();
    
    var grp = new THREE.Group();
//    scene.add(this.group);

    var bmload = new THREE.ImageBitmapLoader();
    bmload.setOptions( { imageOrientation: 'flipY' } );
    
    var me = grp;

    bmload.load(
        // resource URL
        'mod/' + name + '.bmp',
        ( imageBitmap ) => {
            me.tex = new THREE.CanvasTexture( imageBitmap );
            me.mat = new THREE.MeshBasicMaterial( { map: me.tex } );

            objload.load(
                './mod/' + name + '.obj',
                ( object ) => {
                    object.traverse( function ( node ) {

                        if ( node.isMesh ) node.material = me.mat;

                    } );

                    me.obj = object
                    me.add( object );
                    
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

export var tea = makemodel('teapot', (obj) => {
    obj.rotateX(-Math.PI / 2);
    obj.position.y = -50;
});

