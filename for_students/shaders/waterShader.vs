/* uniform for time */
uniform float time;

uniform sampler2D tex1;
uniform sampler2D tex2;

// get the position relative to the camera
varying vec3 v_viewPosition;
// normal
varying vec3 v_normal;
// uv
varying vec2 v_uv;

/* the vertex shader just passes stuff to the fragment shader after doing the
 * appropriate transformations of the vertex information
 */
void main() {
    // position relative to the camera
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);

    // Standard vertex shader transformations
    gl_Position = projectionMatrix * viewPosition;

    v_viewPosition = viewPosition.xyz;

    v_uv = uv;

    vec2 noise = vec2(
        fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453),
        fract(sin(dot(uv, vec2(93.9898, 67.345))) * 43758.5453)
    );
    // Add time-based offsets to the UV coordinates to create a shifting effect
    vec2 shiftedUV1 = uv + 0.1 * noise + vec2(0.1 * sin(time), 0.1 * cos(time));
    vec2 shiftedUV2 = uv + 0.1 * noise + vec2(0.1 * cos(time), 0.1 * sin(time));

    // Get texture values
    vec3 tex1_uv = texture2D(tex1, shiftedUV1).rgb;
    vec3 tex2_uv = texture2D(tex2, shiftedUV2).rgb;

    // interpolate between tex1 and tex2
    vec3 interpolatedTex = tex1_uv + tex2_uv;

    // Modify the normal based on the interpolated texture
    vec3 modifiedNormal = normal + vec3(10.0)*interpolatedTex;

    // Pass the modified normal to the fragment shader
    v_normal = normalize(normalMatrix*modifiedNormal);
}
