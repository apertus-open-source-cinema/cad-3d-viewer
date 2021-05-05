import * as Three from "three";
import alu_vert from "./alu.vert?raw";
import alu_frag from "./alu.frag?raw";

const vertexShader = [
	Three.ShaderChunk[ "common" ],
	Three.ShaderChunk[ "envmap_pars_vertex" ],
	Three.ShaderChunk[ "envmap_vertex" ],

	alu_vert].join("\n");

const fragmentShader = [
	Three.ShaderChunk[ "common" ],
	Three.ShaderChunk["envmap_pars_fragment"],
	Three.ShaderChunk["envmap_fragment"],

	alu_frag].join("\n");

const uniforms = {
	time: { type: "f", value: 1.0 },
	resolution: { type: "v2", value: new Three.Vector2() }
};

uniforms.resolution.value.x = 300;
uniforms.resolution.value.y = 300;

export const CustomAluminium = new Three.ShaderMaterial({
	uniforms: Three.UniformsUtils.merge([ Three.UniformsLib[ "fog" ], uniforms]),
	// vertexShader: vertexShader,
	vertexShader: vertexShader,//Three.ShaderChunk.common + Three.ShaderChunk.fog_pars_vertex + vertexShader, // + vertexShaderSource, 
	//fragmentShader: fragmentShader
	fragmentShader: fragmentShader //Three.ShaderChunk.common + Three.ShaderChunk.fog_pars_vertex + fragmentShader // + fragmentShaderSource 
});