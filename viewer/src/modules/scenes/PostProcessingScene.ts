import * as Three from "three";

export class PostProcessingScene extends Three.Scene {
    camera: Three.OrthographicCamera;
    quad: Three.Mesh;
    
    constructor(width: number, height: number) {
    	super();

    	this.camera = new Three.OrthographicCamera( width / - 2, width / 2,  height / 2, height / - 2, -10000, 10000 );
    	this.camera.position.z = 100;

    	this.add( this.camera );

    	this.quad = new Three.Mesh( new Three.PlaneGeometry( window.innerWidth, window.innerHeight )/*, postprocessing.materialBokeh */);
    	this.quad.position.z = - 500;
    	this.add( this.quad );
    }
}