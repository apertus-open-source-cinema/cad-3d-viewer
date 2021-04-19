"use strict";

var navigationScene = null;
var navigationCamera = null;
var navigationCube = null;
var navigationWidth = 150;
var navigationHeight = 150;
var navigationOffset = 10;

export class NavigationCube {
  onMouseMove(event) {
    //   event.preventDefault();

    //   // calculate mouse position in normalized device coordinates
    //   // (-1 to +1) for both components

    mouse.x = ((event.clientX - navigationOffset) / navigationWidth) * 2 - 1;
    mouse.y =
      -(
        (event.clientY -
          container.height +
          navigationHeight +
          navigationOffset) /
        navigationHeight
      ) *
        2 +
      1;

    //   //mouse.x = ( event.clientX / container.clientWidth ) * 2 - 1;
    //   //mouse.y = - ( event.clientY / container.clientHeight ) * 2 + 1;
    //   // console.log(mouse);

    requestRenderIfNotRequested();
  }

  init() {
    this.setupCamera();
    this.setupLight();

    navigationScene = new THREE.Scene();
  }

  setupCamera() {
    const size = 0.2;
    const near = 0;
    const far = 2;
    aspectRatio = navigationWidth / navigationHeight;
    navigationCamera = new THREE.OrthographicCamera(
      (-aspectRatio * size) / 2,
      (aspectRatio * size) / 2,
      size / 2,
      -size / 2,
      near,
      far
    );
    // navigationCamera.zoom = 0.2;
    navigationCamera.position.set(0, 0, 1);
    navigationCamera.updateProjectionMatrix();
  }

  setupLight() {
    var hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 3);
    hemiLight.position.set(0, 300, 0);
    navigationScene.add(hemiLight);
  }

  attachToContainer(container) {
    container.addEventListener("mousemove", onMouseMove, false);
  }

  get scene() {
    return navigationScene;
  }
}
