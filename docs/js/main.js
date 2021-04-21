"use strict";

import * as THREE from "./three.js/three.module.js";
import { OrbitControls } from "./three.js/controls/OrbitControls.js";
import { GUI } from "./three.js/libs/dat.gui.module.js";
import { NavigationCube } from "./scenes/NavigationCube.js";
import { MainScene } from "./scenes/MainScene.js";
import "./pubsub.js";

export class App {
  renderContainer = undefined;
  uiContainer = undefined;
  scene = undefined;
  camera = undefined;
  controls = undefined;
  renderer = undefined;

  isRenderingActive = false;

  clock = new THREE.Clock();

  cameraTargetPosition = new THREE.Vector3(0, 0.06, 0);

  animationTimeline = undefined;

  navigationCube = undefined;

  // Overlay
  overlayCamera = undefined;
  overlayScene = undefined;

  Init() {
    this.renderContainer = document.getElementById("render_canvas");
    this.uiContainer = document.getElementById("ui");

    this.SetupScene();

    this.SetupGeneral();
    this.SetupRenderer();

    this.SetupHDR();
    this.SetupGUI();

    this.navigationCube = new NavigationCube();
    this.SetupOverlay();

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.copy(this.cameraTargetPosition);
    this.controls.update();

    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.addEventListener("change", () => {
      // if (this.controls.target.y < 0) {
      //   this.controls.target.y = 0;
      // }
      this.RequestFrame();
    });
  }

  SetupGeneral() {
    var aspectRatio =
      this.renderContainer.clientWidth / this.renderContainer.clientHeight;
    console.log("Aspect ratio: " + aspectRatio);

    this.camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.01, 1000);
    this.camera.position.set(-0.3, 0.3, 0.5);
    this.camera.lookAt(this.cameraTargetPosition);
    this.camera.setFocalLength(85);
    this.camera.updateProjectionMatrix();

    this.animationTimeline = document.getElementById("timeline");
    this.animationTimeline.addEventListener("click", (e) =>
      this.PlayAnimation(e)
    );
  }

  SetupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      canvas: this.renderContainer,
    });
    this.renderer.setSize(
      this.renderContainer.clientWidth,
      this.renderContainer.clientHeight
    );
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x223344);

    this.renderer.physicallyCorrectLights = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.gammaFactor = 2.2;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  SetupScene() {
    this.scene = new MainScene();
    var token = PubSub.subscribe("scene_loaded", () => {
      this.SetupTimeline();
      this.RequestFrame();
    });

    PubSub.subscribe("scene_animation_started", () => {
      this.EnableAnimationLoop();
    });

    PubSub.subscribe("scene_animation_finished", () => {
      this.DisableAnimationLoop();
    });

    PubSub.subscribe("scene_update_required", () => {
      this.RequestFrame();
    });
  }

  // TODO: replace with real HDR
  SetupHDR() {
    var environmentTexture = new THREE.TextureLoader().load(
      "data/textures/hdri/abstract_room.png"
    );
    environmentTexture.mapping = THREE.EquirectangularReflectionMapping;
    environmentTexture.encoding = THREE.sRGBEncoding;
    this.scene.scene.environment = environmentTexture;
    //this.scene.scene.background = environmentTexture;
  }

  SetupTimeline() {
    for (var i = 0; i < this.scene.currentAnimations.length; i++) {
      var li = document.createElement("li");
      li.textContent = i;
      li.setAttribute("animationIndex", i);
      this.animationTimeline.appendChild(li);
    }
  }

  SetupGUI() {
    let material = this.scene.currentMaterial;

    var gui = new GUI({ autoPlace: false });
    gui.domElement.id = "dat_gui";
    const object_material_folder = gui.addFolder("Object Material");
    object_material_folder.open();
    object_material_folder
      .addColor(material, "color")
      .onChange(() => this.UpdateSceneMaterial());
    object_material_folder
      .add(material, "roughness", 0, 1, 0.01)
      .onChange(() => this.UpdateSceneMaterial());
    object_material_folder
      .add(material, "metalness", 0, 1, 0.01)
      .onChange(() => this.UpdateSceneMaterial());
    object_material_folder
      .add(material, "reflectivity", 0, 1, 0.01)
      .onChange(() => this.UpdateSceneMaterial());
    object_material_folder
      .add(material, "clearcoat", 0, 1, 0.01)
      .onChange(() => this.UpdateSceneMaterial());
    object_material_folder
      .add(material, "clearcoatRoughness", 0, 1, 0.01)
      .onChange(() => this.UpdateSceneMaterial());

    const actions_folder = gui.addFolder("Action");
    actions_folder.open();

    var obj = {
      flip: () => {
        this.scene.FlipModel();
      },
    };
    actions_folder.add(obj, "flip").name("Flip");

    var uiContainer = document.getElementById("ui");
    uiContainer.appendChild(gui.domElement);
  }

  UpdateSceneMaterial() {
    console.log("Update material");
    this.scene.UpdateMaterial();
    //this.RequestFrame();
  }

  SetupOverlay() {
    let aspectRatio = 150 / 150;
    let size = 0.2;
    let near = 0.01;
    let far = 3;

    this.overlayCamera = new THREE.OrthographicCamera(
      (-aspectRatio * size) / 2,
      (aspectRatio * size) / 2,
      size / 2,
      -size / 2,
      near,
      far
    );
    this.overlayCamera.position.set(0, 0, 1);

    this.overlayScene = new THREE.Scene();
    this.overlayScene.background = null;

    const geometry = new THREE.PlaneGeometry(0.1, 0.1, 1);
    const material = new THREE.MeshBasicMaterial({
      // color: 0xffffff,
      // side: THREE.DoubleSide,
      transparent: true,
      map: this.navigationCube.renderTexture.texture,
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.position.set(0, 0.05, 0);
    this.overlayScene.add(plane);
  }

  Start() {
    requestAnimationFrame(this.RenderFrame);
  }

  RequestFrame() {
    //console.log("Requested frame");
    if (this.isRenderingActive) {
      return;
    }

    this.isRenderingActive = true;
    requestAnimationFrame(this.RenderFrame);
  }

  // TODO: Add delta time and smooth framerate
  RenderFrame = () => {
    //console.log("Render frame");
    this.isRenderingActive = false;

    if (this.animationEnabled) {
      const deltaTime = this.clock.getDelta();
      this.scene.animationMixer.update(deltaTime);
    }

    this.renderer.autoClear = false;
    this.renderer.clear();
    this.renderer.setViewport(
      0,
      0,
      this.renderContainer.clientWidth,
      this.renderContainer.clientHeight
    );
    this.renderer.render(this.scene.getScene, this.camera);

    this.navigationCube.SetRotationFromCamera(this.camera);
    this.navigationCube.Render(this.renderer, this.camera);

    this.renderer.setViewport(
      this.uiContainer.clientWidth - 130,
      this.uiContainer.clientHeight - 170,
      160,
      160
    );
    this.renderer.render(this.overlayScene, this.overlayCamera);
  };

  animationEnabled = false;

  EnableAnimationLoop() {
    console.log("Enable animation loop");
    this.animationEnabled = true;
    this.clock.start();
    this.renderer.setAnimationLoop(() => {
      requestAnimationFrame(this.RenderFrame);
    });
  }

  DisableAnimationLoop() {
    console.log("Disable animation loop");
    //this.animationEnabled = false;
    this.clock.stop();
    this.renderer.setAnimationLoop(null);
  }

  PlayAnimation(e) {
    // var index = Array.prototype.indexOf.call(
    //   this.animationTimeline.childNodes,
    //   e.target
    // );

    let index = e.target.getAttribute("animationIndex");
    console.log("Index: " + index);

    if (index < 0) {
      return;
    }

    for (var i = 0; i <= index; i++) this.scene.PlayAnimation(i);
  }
}

var app = new App();
app.Init();
//app.Start();
