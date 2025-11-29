// image texture shading - pretty boring in the 
/* pass interpolated variables to the fragment */
varying vec2 v_uv;
varying vec3 v_viewPosition;
varying vec3 v_viewNormal;

/* the vertex shader just passes stuff to the fragment shader after doing the
 * appropriate transformations of the vertex information
 */
void main() {
    // Transform the normal into view space
    v_viewNormal = normalize(normalMatrix*normal);

    // Transform the vertex position into view space
    vec4 viewPosition = viewMatrix * modelMatrix * vec4(position, 1.0);
    v_viewPosition = viewPosition.xyz;

    // Pass the texture coordinates to the fragment shader
    v_uv = uv;

    // Standard vertex shader transformations
    gl_Position = projectionMatrix * viewPosition;
}
