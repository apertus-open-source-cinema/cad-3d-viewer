import * as Three from "three";
import { MainScene } from "./scenes/MainScene";

import { Emitter } from "mitt";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { SSRPass } from "three/examples/jsm/postprocessing/SSRPass.js";
import { PostProcessingScene } from "./scenes/PostProcessingScene";

import anime from "animejs";
import { Pane } from "tweakpane";
import { TpChangeEvent } from "../../node_modules.old/tweakpane/dist/types/blade/common/api/tp-event";

export class Viewer {
	container!: HTMLElement;
	camera!: THREE.PerspectiveCamera;
	scene!: MainScene;
	postprocessingScene!: PostProcessingScene;

	renderer!: Three.WebGLRenderer;
	controls!: OrbitControls;

	clock = new Three.Clock();

	cameraTargetPosition: Three.Vector3;
	startPosition!: Three.Vector3;

	isRenderingActive = false;
	animationEnabled = false;

	currentAnim: any;

	composer!: EffectComposer;
	ssrPass!: SSRPass;
	gui: Pane;

	constructor(container: HTMLElement, eventEmitter: Emitter) {
		this.container = container;

		this.isRenderingActive = false;

		Three.Cache.enabled = true;

		this.SetupRenderer();

		const aspectRatio =
			this.container.clientWidth / this.container.clientHeight;
		this.cameraTargetPosition = new Three.Vector3(0, 0.06, 0);
		this.SetupCamera(aspectRatio);

		this.SetupScene(eventEmitter);
		this.SetupPostProcessingScene();

		this.SetupHDR();

		this.SetupGUI();
	}

	private SetupGUI() {
		this.gui = new Pane();

		// TODO: Add setup, as it is handled in scene_model_loaded handler
	}

	private SetupScene(eventEmitter: Emitter) {
		this.scene = new MainScene(eventEmitter);
		eventEmitter.on("scene_model_loaded", () => {
			console.log("SCENE MODEL LOADED");
			this.ssrPass.selects = this.scene.currentModel.children;
			this.ssrPass.selective = true;

			const materialFolder = this.gui.addFolder({ title: "Material", expanded: true });

			materialFolder.addInput(this.scene.currentModel.children[0].material, "color", { input: "color" }).on("change", (ev: TpChangeEvent) => {
				console.log(this.scene.currentModel.children[0].material);
				const value = ev.value;
				this.scene.currentModel.children[0].material.color.setRGB(value.r / 255.0, value.g / 255.0, value.b / 255.0);
				this.UpdateMaterial();
			});

			materialFolder.addInput(this.scene.currentModel.children[0].material, "roughness", {min: 0.0, max: 1.0}).on("change", (ev: TpChangeEvent) => {
				const value = ev.value;
				this.scene.currentModel.children[0].material.roughness = value;
				this.UpdateMaterial();
			});

			materialFolder.addInput(this.scene.currentModel.children[0].material, "metalness", {min: 0.0, max: 1.0}).on("change", (ev: TpChangeEvent) => {
				const value = ev.value;
				this.scene.currentModel.children[0].material.metalness = value;
				this.UpdateMaterial();
			});

			materialFolder.addInput(this.scene.currentModel.children[0].material, "envMapIntensity", {min: 0.0, max: 3.0}).on("change", (ev: TpChangeEvent) => {
				const value = ev.value;
				this.scene.currentModel.children[0].material.envMapIntensity = value;
				this.UpdateMaterial();
			});

			const postprocessingFolder = this.gui.addFolder({ title: "Post-processing", expanded: true });

			postprocessingFolder.addInput(this.ssrPass, "opacity", {min: 0.0, max: 1.0}).on("change", (ev: TpChangeEvent) => {
				const value = ev.value;
				this.ssrPass.opacity = value;
				this.RequestFrame();
			});

			postprocessingFolder.addInput(this.ssrPass, "maxDistance", {min: 0.0, max: 3.0}).on("change", (ev: TpChangeEvent) => {
				const value = ev.value;
				this.ssrPass.maxDistance = value;
				this.RequestFrame();
			});
		});

		// eventEmitter.on("scene_animation_started", () => {
		// 	this.EnableAnimationLoop();
		// });

		// eventEmitter.on("scene_animation_finished", () => {
		// 	this.DisableAnimationLoop();
		// });

		eventEmitter.on("scene_update_required", () => {
			console.log("SCENE UPDATE");

			this.RequestFrame();
		});
	}

	private UpdateMaterial() {
		this.scene.currentModel.children[0].material.needsUpdate = true;
		this.RequestFrame();
	}

	SetupPostProcessingScene(): void {
		// this.postprocessingScene = new PostProcessingScene(this.container.clientWidth, this.container.clientHeight);

		this.composer = new EffectComposer(this.renderer);
		this.composer.setSize(
			this.container.clientWidth * 2,
			this.container.clientHeight
		);

		this.ssrPass = new SSRPass({
			renderer: this.renderer,
			scene: this.scene,
			camera: this.camera,
			width: innerWidth,
			height: innerHeight,
			encoding: Three.sRGBEncoding,
			isPerspectiveCamera: true,
			groundReflector: null, //params.isGroundReflector ? groundReflector : null,
			isBouncing: false,
			selects: null //[this.scene.currentModel.children]
		});
		this.composer.addPass(this.ssrPass);
	}

	UpdateCameraTarget(): void {
		if (this.currentAnim) {
			this.currentAnim.reset();
		}

		this.currentAnim = anime({
			duration: 1000,
			begin: () => {
				this.startPosition = this.controls.target;
				this.EnableAnimationLoop();
			},
			complete: () => { this.DisableAnimationLoop(); this.currentAnim = null; },
			update: (anime: anime.AnimeParams) => {
				this.startPosition.lerp(this.scene.currentModelCenter, anime.progress / 100.0);
				this.camera.lookAt(this.startPosition);
			}
		});
	}

	private SetupCamera(aspectRatio: number) {
		this.camera = new Three.PerspectiveCamera(75, aspectRatio, 0.01, 1000);
		this.camera.position.set(-0.1, 0.2, 0.2);
		this.camera.lookAt(this.cameraTargetPosition);
		this.camera.setFocalLength(85);
		this.camera.updateProjectionMatrix();

		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.target.copy(this.cameraTargetPosition);
		this.controls.maxPolarAngle = Math.PI / 2;
		this.controls.update();

		this.controls.addEventListener("change", () => {
			this.RequestFrame();
		});
	}

	private SetupRenderer() {
		this.renderer = new Three.WebGLRenderer({ antialias: true });
		this.renderer.setSize(
			this.container.clientWidth,
			this.container.clientHeight
		);

		this.renderer.physicallyCorrectLights = true;
		this.renderer.toneMapping = Three.CineonToneMapping;
		this.renderer.toneMappingExposure = 1;
		this.renderer.outputEncoding = Three.sRGBEncoding;

		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = Three.PCFSoftShadowMap;

		console.log("WebGL2: " + this.renderer.capabilities.isWebGL2);
		this.container.appendChild(this.renderer.domElement);
	}

	// TODO: replace with real HDR
	private SetupHDR() {
		const environmentTexture = new Three.TextureLoader().load(
			"assets/textures/hdri/abstract_room.png"
		);
		environmentTexture.mapping = Three.EquirectangularReflectionMapping;
		environmentTexture.encoding = Three.sRGBEncoding;
		this.scene.environment = environmentTexture;
		// this.scene.background = environmentTexture;
	}

	LoadModel(modelFile: string): void {
		this.scene.LoadModel(modelFile);
		this.UpdateCameraTarget();
	}

	Resize(width: number, height: number): void {
		console.log("RENDERER RESIZE: " + width + " / " + height);
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(width, height);
		this.RequestFrame();
	}

	EnableAnimationLoop(): void {
		console.log("ENABLE ANIM LOOP");
		// this.animationEnabled = true;
		// this.clock.start();
		this.renderer.setAnimationLoop(() => {
			requestAnimationFrame(this.RenderFrame);
		});
	}

	DisableAnimationLoop(): void {
		console.log("DISABLE ANIM LOOP");
		// this.clock.stop();
		this.renderer.setAnimationLoop(null);
	}

	private RequestFrame() {
		//console.log("Requested frame");
		if (this.isRenderingActive) {
			return;
		}

		this.isRenderingActive = true;
		requestAnimationFrame(this.RenderFrame);
	}

	private RenderFrame = () => {
		// console.log("Render");
		this.isRenderingActive = false;


		this.composer.render();
		//this.renderer.render(this.scene, this.camera);
	};
}
