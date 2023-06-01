precision mediump float;

uniform vec3 ambient;
uniform vec3 diffuse;
uniform vec3 specular;
uniform vec3 objectColor;
uniform float shininess;

varying vec3 vFragPos;
varying vec3 vNormal;
varying vec2 vTexCoord;
varying vec3 vLightPosition;

void main(void) {
    vec3 norm = normalize(vNormal);
    vec3 lightDir = normalize(vLightPosition - vFragPos);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = diffuse * diff;

    vec3 viewDir = normalize(-vFragPos);
    vec3 reflectDir = reflect(-lightDir, norm);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = specular * spec;

    vec3 result = (ambient + diffuse + specular) * objectColor;
    gl_FragColor = vec4(result, 1.0);
}