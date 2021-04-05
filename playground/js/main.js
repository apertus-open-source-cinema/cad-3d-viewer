'use strict';

import * as THREE from './three.js/three.module.js';
import { OrbitControls } from './three.js/controls/OrbitControls.js';
import { GLTFLoader } from './three.js/loaders/GLTFLoader.js';
import { RGBELoader } from './three.js/loaders/RGBELoader.js';

var camera = null;
var controls = null;
var renderer = null;
var scene = null;

var container = container;

const loader = new GLTFLoader();

function setup_general() {
    container = document.getElementById('render_canvas');

    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.01, 1000);
    camera.position.set(0, 0.3, 0.5);
    camera.setFocalLength(85);

    controls = new OrbitControls(camera, container);
    
    scene = new THREE.Scene();
}

function setup_renderer() {
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor( 0x111522 );

    renderer.physicallyCorrectLights = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.gammaFactor = 2.2;
    renderer.outputEncoding = THREE.sRGBEncoding;

    renderer.shadowMap.enabled = true;
    // renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild(renderer.domElement);
}

function setup_hdr_background() {
    var environmentTexture = new RGBELoader().load('data/textures/hdri/HDR_029_Sky_Cloudy_Ref.hdr', () => {
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        var tex = pmremGenerator.fromEquirectangular(environmentTexture);
    
         var options = {
            generateMipmaps: true,
            minFilter: THREE.LinearMipmapLinearFilter,
            magFilter: THREE.LinearFilter
        };
        
        var envTexture = new THREE.WebGLCubeRenderTarget(4096, options).fromEquirectangularTexture( renderer, environmentTexture );
        // scene.background = envTexture.texture;
        scene.environment = envTexture.texture;
    });
}

function setup_light() {
    var hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444, 3 );
    hemiLight.position.set( 0, 300, 0 );
    scene.add( hemiLight );    

    const light = new THREE.SpotLight( 0xffffff, 75, 2, 135);
    light.position.set( 1, 1, 1 ); //default; light shining from top
    light.castShadow = true; // default false

    light.shadow.bias = -0.0001;

    //Set up shadow properties for the light
    light.shadow.mapSize.width = 1024; // default
    light.shadow.mapSize.height = 1024; // default
    light.shadow.camera.near = 0.5; // default
    light.shadow.camera.far = 3; // default
    light.shadow.camera.fov = 35; // default
    
    scene.add( light );

    const helper = new THREE.CameraHelper( light.shadow.camera );
    scene.add( helper );
}

function load_environment() {
    let file_path = 'data/models/environment/environment V01.gltf';

    loader.load(
        file_path,
        function (gltf) {
            const gltfScene = gltf.scene;

            gltfScene.traverse( function( child ) { 
                if ( child.isMesh ) {
                    console.info("Enable shadow cast/receive");
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            } );

            scene.add(gltfScene);
        },
        function (xhr) {
            console.log(file_path + ': ' + (xhr.loaded / xhr.total) * 100 + '% loaded');
        },
        function (error) {
            console.error(error);
        });

        const geometry = new THREE.SphereGeometry( 0.01, 32, 32 );
        const material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
        const sphere = new THREE.Mesh( geometry, material );
        sphere.position.set(0, 0.02, 0);
        sphere.castShadow = true;
        scene.add( sphere );
}

function init() {
    setup_general();
    setup_renderer();

    setup_hdr_background();
    setup_light();

    load_environment();

    render();
}

function render() {
	requestAnimationFrame(render);

	controls.update();

	renderer.render(scene, camera);
}

init();