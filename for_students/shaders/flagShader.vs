// image texture shading - pretty boring in the 
/* pass interpolated variables to the fragment */
varying vec2 v_uv;
varying vec3 v_viewNormal;

/* uniform for time */
uniform float time;

/* the vertex shader just passes stuff to the fragment shader after doing the
 * appropriate transformations of the vertex information
 */
void main() {
    // Transform the normal into view space
    v_viewNormal = normalize(normalMatrix*normal);

    // Apply a sinusoidal wave to the vertex position
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);

    // Scale the wave effect based on the u coordinate
    float waveStrength = uv.x; // u = 0 means no movement, u = 1 means full movement

    // Use a sine function with a phase shift based on the u coordinate
    float frequency = 1.0; // Controls the number of ripples
    float amplitude = 1.0;  // Controls the height of the ripples
    worldPosition.z += sin(worldPosition.x * frequency + time) * amplitude * waveStrength;
    
    // Transform the vertex position into view space
    vec4 viewPosition = viewMatrix * worldPosition;

    // Pass the texture coordinates to the fragment shader
    v_uv = uv;

    // Standard vertex shader transformations
    gl_Position = projectionMatrix * viewPosition;
}
