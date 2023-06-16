precision mediump float;

attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexCoord;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 lightPosition;

uniform mat4 xRotMatrix;
uniform mat4 yRotMatrix;
uniform mat4 zRotMatrix;

varying vec3 vFragPos;
varying vec3 vNormal;
varying vec2 vTexCoord;
varying vec3 vLightPosition;

void main(void) {
    mat4 viewMatrix = uViewMatrix;
    mat4 modelMatrix = xRotMatrix * zRotMatrix * zRotMatrix * uModelMatrix;
    vNormal = vec3(modelMatrix * vec4(aNormal, 0.0));
    vTexCoord = aTexCoord;
    vLightPosition = vec3(viewMatrix * vec4(lightPosition, 1.0));
    vFragPos = vec3(viewMatrix * modelMatrix * vec4(aPosition, 1.0));
    gl_Position = uProjectionMatrix * vec4(vFragPos, 1.0);
}