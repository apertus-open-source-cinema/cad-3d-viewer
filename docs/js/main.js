'use strict';

import * as THREE from './three.js/three.module.js';
import { OrbitControls } from './three.js/controls/OrbitControls.js';
import { GLTFLoader } from './three.js/loaders/GLTFLoader.js';
import { RGBELoader } from './three.js/loaders/RGBELoader.js';
import { GUI } from './three.js/libs/dat.gui.module.js';

import anime from './anime.es.js';

var camera = null;
var controls = null;
var renderer = null;
var mainScene = null;
var gui = null;
var container = null;
var currentModel = null;
var timeline = null
var renderRequested = false;

var selectedFace = null;

var navigationScene = null;
var navigationCamera = null;
var navigationCube = null;
var navigationWidth = 150;
var navigationHeight = 150;
var navigationOffset = 10;

const loader = new GLTFLoader();

const material = {
    roughness: 0.5,
    metalness: 0.5
};

// const flipButton = document.getElementById('flip');
// flipButton.addEventListener('click', flip_model);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();


// TODO: Needs a fix
function onWindowResize() {

    camera.aspect = container.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function onMouseMove(event) {
    event.preventDefault();

    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components

    mouse.x = ((event.clientX - navigationOffset) / navigationWidth) * 2 - 1;
    mouse.y = - ((event.clientY - container.height + navigationHeight + navigationOffset) / navigationHeight) * 2 + 1;

    //mouse.x = ( event.clientX / container.clientWidth ) * 2 - 1;
    //mouse.y = - ( event.clientY / container.clientHeight ) * 2 + 1;
    // console.log(mouse);

    requestRenderIfNotRequested();
}

function flip_model() {
    var boundingBox = new THREE.Box3().setFromObject(currentModel);
    var rotation = currentModel.rotation.x
    var rotationAngle = 0;
    var heightOffset = -boundingBox.min.y;

    if (rotation == 0) {
        rotationAngle = THREE.Math.degToRad(180);
        heightOffset = boundingBox.max.y;
    }

    anime.timeline({
        easing: 'linear',
        duration: 200,
        update: camera.updateProjectionMatrix(),
        //begin: function(anim) {flipButton.disabled = true},
        //complete: function(anim) {flipButton.disabled = false},
        update: function (anim) { requestRenderIfNotRequested(); }
    }).add({ targets: currentModel.position, y: boundingBox.max.y * 2 })
        .add({ targets: currentModel.rotation, x: rotationAngle })
        .add({ targets: currentModel.position, y: heightOffset });
}

function setup_general() {
    container = document.getElementById('render_canvas');

    var aspectRatio = container.clientWidth / container.clientHeight;
    console.log("Aspect ratio: " + aspectRatio);

    camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.01, 1000);
    camera.position.set(-0.3, 0.3, 0.5);
    camera.lookAt(0.5, 0.3, 0.5)
    camera.setFocalLength(85);

    const size = 0.2;
    const near = 0;
    const far = 2;
    aspectRatio = navigationWidth / navigationHeight;
    navigationCamera = new THREE.OrthographicCamera((-aspectRatio * size) / 2, (aspectRatio * size) / 2, size / 2, -size / 2, near, far);
    // navigationCamera.zoom = 0.2;
    navigationCamera.position.set(0, 0, 1);
    navigationCamera.updateProjectionMatrix();


    //camera.lookAt(0.5, 0.3, 0.5)
    //camera.setFocalLength(85);

    controls = new OrbitControls(camera, document.querySelector('#app'));
    controls.target.set(0.0, 0.05, 0.0);
    //controls.enableDamping = true;

    mainScene = new THREE.Scene();
    navigationScene = new THREE.Scene();
}

function setup_renderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true, canvas: container });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x111522);

    renderer.physicallyCorrectLights = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.gammaFactor = 2.2;
    renderer.outputEncoding = THREE.sRGBEncoding;

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // document.body.appendChild(renderer.domElement);
}

function setup_hdr_background() {
    var environmentTexture = new RGBELoader().load('data/textures/hdri/abstract_room.hdr', () => {
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        var tex = pmremGenerator.fromEquirectangular(environmentTexture);

        var options = {
            generateMipmaps: true,
            minFilter: THREE.LinearMipmapLinearFilter,
            magFilter: THREE.LinearFilter
        };

        var envTexture = new THREE.WebGLCubeRenderTarget(4096, options).fromEquirectangularTexture(renderer, environmentTexture);
        // scene.background = envTexture.texture;
        mainScene.environment = envTexture.texture;
    });
}

function setup_light() {
    var hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 3);
    hemiLight.position.set(0, 300, 0);
    navigationScene.add(hemiLight);

    const light1 = new THREE.SpotLight(0xffffff, 5, 2, THREE.MathUtils.degToRad(13), 0.3);
    light1.position.set(0.4, 0.4, 0.7);
    light1.castShadow = true;
    mainScene.add(light1.target);
    light1.target.position.set(0.1, 0, -0.1);

    light1.shadow.bias = -0.001;

    //Set up shadow properties for the light
    light1.shadow.mapSize.width = 2048; // default
    light1.shadow.mapSize.height = 2048; // default
    light1.shadow.camera.near = 0.5; // default
    light1.shadow.camera.far = 2; // default
    light1.shadow.radius = 8;

    //light1.shadow.camera.fov = 20; // default

    mainScene.add(light1);

    const helper1 = new THREE.SpotLightHelper(light1);
    // scene.add( helper1 );

    const light2 = new THREE.SpotLight(0xffffff, 10, 2, THREE.MathUtils.degToRad(15), 0.3);
    light2.position.set(-0.4, 0.85, -0.2);
    light2.castShadow = true;
    mainScene.add(light2.target);
    light2.target.position.set(0.1, 0, -0.1);

    light2.shadow.bias = -0.001;

    //Set up shadow properties for the light
    light2.shadow.mapSize.width = 2048; // default
    light2.shadow.mapSize.height = 2048; // default
    light2.shadow.camera.near = 0.5; // default
    light2.shadow.camera.far = 2; // default
    light2.shadow.radius = 8;

    //light2.shadow.camera.fov = 25; // default

    mainScene.add(light2);

    const helper2 = new THREE.SpotLightHelper(light2);
    // scene.add( helper2 );

    const light3 = new THREE.SpotLight(0xffffff, 5, 3, THREE.MathUtils.degToRad(5), 0.5);
    light3.position.set(0.8, 0.4, -2);
    light3.castShadow = true;
    mainScene.add(light3.target);
    light3.target.position.set(0.1, 0, -0.1);

    light3.shadow.bias = -0.001;

    //Set up shadow properties for the light
    light3.shadow.mapSize.width = 2048; // default
    light3.shadow.mapSize.height = 2048; // default
    light3.shadow.camera.near = 0.5; // default
    light3.shadow.camera.far = 2; // default
    light3.shadow.radius = 8;

    //light2.shadow.camera.fov = 25; // default

    mainScene.add(light3);

    const helper3 = new THREE.SpotLightHelper(light3);
    // scene.add( helper3 );
}

function load_environment() {
    let file_path = 'data/models/environment/environment_V01.gltf';

    loader.load(
        file_path,
        function (gltf) {
            const gltfScene = gltf.scene;

            gltfScene.traverse(function (child) {
                if (child.isMesh) {
                    console.info("Enable shadow cast/receive");
                    child.castShadow = true;
                    child.receiveShadow = true;
                    if (child.material.map) child.material.map.anisotropy = 16;

                    // child.material.encoding = THREE.sRGBEncoding;
                }
            });

            mainScene.add(gltfScene);
            requestRenderIfNotRequested();
        },
        function (xhr) {
            console.log(file_path + ': ' + (xhr.loaded / xhr.total) * 100 + '% loaded');
        },
        function (error) {
            console.error(error);
        });

    // const geometry = new THREE.SphereGeometry( 0.01, 32, 32 );
    // const material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    // const sphere = new THREE.Mesh( geometry, material );
    // sphere.position.set(0, 0.02, 0);
    // sphere.castShadow = true;
    // scene.add( sphere );
}

function load_object(model, scene, alignOrigin = false) {
    let file_path = 'data/models/' + model;

    loader.load(
        file_path,
        function (gltf) {
            const gltfScene = gltf.scene;

            if (scene == navigationScene)
                navigationCube = gltfScene;
            else {
                currentModel = gltfScene;
            }
            //currentModel.children[0].dynamic = true;

            var boundingBox = new THREE.Box3().setFromObject(gltfScene);
            //console.log(boundingBox)
            if (alignOrigin) {
                var width = Math.abs(boundingBox.min.x);
                var height = Math.abs(boundingBox.min.y);
                var length = Math.abs(boundingBox.max.z);
                gltfScene.position.set(width, height, -length);
            }
            // var helper = new THREE.BoxHelper(gltfScene);
            // helper.geometry.computeBoundingBox();
            // scene.add(helper);           

            gltfScene.traverse(function (child) {
                console.log("Child:" + child);

                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    if (child.material.map) {
                        child.material.map.anisotropy = 16;
                    }
                    // assign metal material to object
                    const aluminummaterial = new THREE.MeshPhysicalMaterial({ color: 0xb1b1b1 });
                    aluminummaterial.roughness = 0.5;
                    aluminummaterial.metal = 0.5;
                    aluminummaterial.specular = 0.5;
                    child.material = aluminummaterial;
                }
            });

            scene.add(gltfScene);
            requestRenderIfNotRequested();
        },
        function (xhr) {
            console.log(file_path + ': ' + (xhr.loaded / xhr.total) * 100 + '% loaded');
        },
        function (error) {
            console.error(error);
        });
}

function requestRenderIfNotRequested() {
    if (!renderRequested) {
        renderRequested = true;
        requestAnimationFrame(render);
    }
}


function load_gui() {
    controls.enabled = false;

    gui = new GUI();
    const object_material_folder = gui.addFolder('Object Material');
    object_material_folder.open();
    object_material_folder.add(material, 'roughness', 0, 1, 0.01).onChange(function (value) {
        currentModel.children[0].material.roughness = value;
        currentModel.children[0].material.needsUpdate = true;
        requestRenderIfNotRequested();
    });
    object_material_folder.add(material, 'metalness', 0, 1, 0.01).onChange(function (value) {
        currentModel.children[0].material.metalness = value;
        currentModel.children[0].material.needsUpdate = true;
        requestRenderIfNotRequested();
    });

    const actions_folder = gui.addFolder('Action');
    actions_folder.open();
    var obj = { flip: function () { flip_model(); } };
    actions_folder.add(obj, 'flip').name('Flip');

    controls.enabled = true;
}

function init() {
    setup_general();
    setup_renderer();

    setup_hdr_background();
    setup_light();

    load_environment();
    load_object("cap-bottom-v5.gltf", mainScene, true)
    load_object("multi_material_test.gltf", navigationScene)

    load_gui();

    controls.addEventListener('change', requestRenderIfNotRequested);
    window.addEventListener('resize', onWindowResize);
    container.addEventListener('mousemove', onMouseMove, false);

    renderer.domElement.addEventListener('click', raycast, false);
}

function raycast() {
    var normal = undefined;

    raycaster.setFromCamera(mouse, navigationCamera);
    const intersects = raycaster.intersectObjects([navigationCube], true);
    if (intersects.length != 0) {
        normal = intersects[0].face.normal;
    }

    if(normal) {
        const targetOrientation = new THREE.Quaternion().set(normal.x, normal.y, normal.z, 1).normalize();
        var camPos = camera.position;
        console.log(camPos);
        var targetPos = normal;
        console.log(targetPos);
        targetPos.multiplyScalar(camera.position.length());
        console.log(targetPos)
        anime({
            duration: 1000,
            update: function (anim) {
                camPos.lerp(targetPos, anim.progress / 100);
                camera.position.copy(camPos);
                camera.lookAt(0, 0, 0);
                requestRenderIfNotRequested();
            }
        });
    }
}

var insetWidth = 150;
var insetHeight = 150;

function render() {
    renderRequested = undefined;

    //controls.update();

    renderer.autoClear = true;
    renderer.setViewport(0, 0, container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x111522);
    renderer.render(mainScene, camera);

    renderer.autoClear = false;
    renderer.setClearColor(0x330000);
    //renderer.clearDepth(); // important!
    renderer.setViewport(navigationOffset, navigationOffset, navigationWidth, navigationHeight);


    raycaster.setFromCamera(mouse, navigationCamera);
    const intersects = raycaster.intersectObjects([navigationCube], true);
    if (intersects.length != 0) {
        for (let i = 0; i < intersects.length; i++) {
            if (selectedFace != undefined && intersects[i] != selectedFace) {
                selectedFace.material.color.setHex(0xFFFFFF);
                selectedFace = intersects[i].object;
                console.log(selectedFace.name)
            }

            selectedFace = intersects[i].object;
            selectedFace.material.color.setHex(0xFF0000);
        }
    }
    else {
        if (selectedFace)
            selectedFace.material.color.setHex(0xFFFFFF);
    }
    navigationCube.rotation.setFromRotationMatrix(camera.matrix.invert())

    renderer.render(navigationScene, navigationCamera);
}

init();
