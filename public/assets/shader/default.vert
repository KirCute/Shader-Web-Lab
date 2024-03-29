precision mediump float;

attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexCoord;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uLightPosition;

varying vec3 vFragPos;
varying vec3 vNormal;
varying vec2 vTexCoord;
varying vec3 vLightPosition;

void main(void) {
    vNormal = vec3(uModelMatrix * vec4(aNormal, 0.0));
    vTexCoord = aTexCoord;
    vLightPosition = vec3(uViewMatrix * vec4(uLightPosition, 1.0));
    vFragPos = vec3(uViewMatrix * uModelMatrix * vec4(aPosition, 1.0));
    gl_Position = uProjectionMatrix * vec4(vFragPos, 1.0);
}