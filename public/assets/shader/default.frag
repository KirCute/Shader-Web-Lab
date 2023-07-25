precision mediump float;

uniform vec3 uAmbient;
uniform vec3 uDiffuse;
uniform vec3 uSpecular;
uniform vec3 uObjectColor;
uniform float uShininess;

varying vec3 vFragPos;
varying vec3 vNormal;
varying vec2 vTexCoord;
varying vec3 vLightPosition;

void main(void) {
    vec3 norm = normalize(vNormal);
    vec3 lightDir = normalize(vLightPosition - vFragPos);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = uDiffuse * diff;

    vec3 viewDir = normalize(-vFragPos);
    vec3 reflectDir = reflect(-lightDir, norm);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), uShininess);
    vec3 specular = uSpecular * spec;

    vec3 result = (uAmbient + diffuse + specular) * uObjectColor;
    gl_FragColor = vec4(result, 1.0);
}