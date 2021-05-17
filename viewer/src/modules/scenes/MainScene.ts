import * as Three from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Emitter } from "mitt";
import "../materials/CustomAluiminium";
import { CustomAluminium } from "../materials/CustomAluiminium";

export class MainScene extends Three.Scene {
	gltfLoader: GLTFLoader;
	lightTargetPosition: Three.Vector3;
	currentModel!: Three.Object3D;
	currentModelCenter!: Three.Vector3;

	material = {
		color: 0xb1b1b1,
		roughness: 0.2,
		metalness: 0.9,
		reflectivity: 0,
		clearcoat: 0.6,
		clearcoatRoughness: 0.6,
	  };
	  
	constructor(eventEmitter: Emitter) {
		super();

		this.gltfLoader = new GLTFLoader();
		this.lightTargetPosition = new Three.Vector3(0.1, 0, -0.1);
		this.currentModelCenter = new Three.Vector3(0,0,0);

		Three.DefaultLoadingManager.onLoad = () => {
			eventEmitter.emit("scene_loaded");
		};

		this.SetupLight();

		this.LoadEnvironment();
	}

	SetupLight(): void {
		// remember the axis are:
		// X right
		// Y up
		// Z back

		// Spotlight 1
		const light1 = new Three.SpotLight(
			0xffffff,
			5,
			2,
			Three.MathUtils.degToRad(13),
			0.3
		);
		light1.position.set(0.4, 0.4, 0.7);

		light1.target.position.copy(this.lightTargetPosition);
		this.add(light1.target);

		//Set up shadow properties for the light
		light1.castShadow = true;
		light1.shadow.mapSize.width = 2048; // default
		light1.shadow.mapSize.height = 2048; // default
		light1.shadow.camera.near = 0.5; // default
		light1.shadow.camera.far = 2; // default
		light1.shadow.radius = 8;

		this.add(light1);
		light1.shadow.bias = -0.001;

		// Spotlight 2
		const light2 = new Three.SpotLight(
			0xffffff,
			10,
			2,
			Three.MathUtils.degToRad(15),
			0.3
		);
		light2.position.set(-0.4, 0.45, -0.2);

		light2.target.position.copy(this.lightTargetPosition);
		this.add(light2.target);

		//Set up shadow properties for the light
		light2.castShadow = true;
		light2.shadow.mapSize.width = 2048; // default
		light2.shadow.mapSize.height = 2048; // default
		light2.shadow.camera.near = 0.5; // default
		light2.shadow.camera.far = 2; // default
		light2.shadow.radius = 8;
		light2.shadow.bias = -0.001;

		this.add(light2);

		// Spotlight 3
		const light3 = new Three.SpotLight(
			0xffffff,
			5,
			3,
			Three.MathUtils.degToRad(5),
			0.5
		);
		light3.position.set(0.8, 0.4, -2);
		light3.target.position.copy(this.lightTargetPosition);
		this.add(light3.target);

		//Set up shadow properties for the light
		light3.castShadow = true;
		light3.shadow.mapSize.width = 2048; // default
		light3.shadow.mapSize.height = 2048; // default
		light3.shadow.camera.near = 0.5; // default
		light3.shadow.camera.far = 2; // default
		light3.shadow.radius = 8;
		light3.shadow.bias = -0.001;

		this.add(light3);
	}

	LoadGLTF(filePath: string, callback: (gltf: GLTF) => void): void {
		this.gltfLoader.load(
			filePath,
			callback,
			function (xhr) {
				console.log(
					filePath + ": " + (xhr.loaded / xhr.total) * 100 + "% loaded"
				);
			},
			function (error) {
				console.error(error);
			}
		);
	}


	LoadEnvironment(): void {
		const filePath = "./assets/models/environment/environment_V02.gltf";

		this.LoadGLTF(filePath, (gltf): void => {
			const gltfScene = gltf.scene;

			gltfScene.traverse(function (child) {
				if (child.isMesh) {
					console.info("Enable shadow cast/receive");
					child.castShadow = true;
					child.receiveShadow = true;

					if (child.material.map) {
						child.material.map.anisotropy = 16;
					}
				}
			});

			this.add(gltfScene);
		});
	}

	LoadModel(fileName: string): void {

		this.remove(this.currentModel);

		const filePath = "assets/models/" + fileName;

		this.LoadGLTF(filePath, (gltf): void => {
			const gltfScene = gltf.scene;

			this.currentModel = gltfScene;
		
			const boundingBox = new Three.Box3().setFromObject(gltfScene);
			const width = Math.abs(boundingBox.min.x);
			const height = Math.abs(boundingBox.min.y);
			const length = Math.abs(boundingBox.max.z);
			gltfScene.position.set(width, height, -length);

			const centerX = (boundingBox.max.x - boundingBox.min.x) / 2;
			const centerY = (boundingBox.max.y - boundingBox.min.y) / 2;
			const centerZ = (boundingBox.min.z - boundingBox.max.z) / 2;

			this.currentModelCenter.set(centerX, centerY, centerZ);

			const origin = new Three.Vector3(centerX, centerY, centerZ);
			const hex = 0xffff00;
			const axes = new Three.ArrowHelper(new Three.Vector3(0,1,0), origin, 0.1, hex);
			// this.add(axes);
			//}

			// Add bounding box visualisation
			const box = new Three.BoxHelper(gltfScene, 0xffff00);
			// this.add(box);

			gltfScene.traverse((child) => {
				if (child.isMesh) {
					child.castShadow = true;
					child.receiveShadow = true;

					// assign metal material to object
					const aluminummaterial = new Three.MeshPhysicalMaterial({
							  color: this.material.color,
					});
					aluminummaterial.roughness = this.material.roughness;
					aluminummaterial.metalness = this.material.metalness;
					aluminummaterial.reflectivity = this.material.reflectivity;
					aluminummaterial.clearcoat = this.material.clearcoat;
					aluminummaterial.clearcoatRoughness = this.material.clearcoatRoughness;
	  	
					child.material = aluminummaterial;
					// child.material = CustomAluminium;
					// child.material.uniforms.time.value = 0.3;
				}
			});

			this.add(gltfScene);
		});
	}
}
