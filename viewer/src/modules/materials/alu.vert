uniform float time;
uniform vec2 resolution;

void main(){
    gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
}