// get the texture from the program
uniform vec3 color;
uniform float opacity;

// get the fragment position relative to the camera
varying vec3 v_viewPosition;

// normal
varying vec3 v_normal;

// uv coordinates of the fragment
varying vec2 v_uv;

vec3 lightDirWorld = vec3(0, 1, 0);
float shininess = 1.0;

void main()
{
    // get the color from the texture
    vec3 baseColor = color;

    // get the view direction in view-space coordinates
    // remember in view space, the camera is the origin
    vec3 viewDir = normalize( - v_viewPosition);

    // convert the lighting direction in view-space coordinates
    vec3 lightDir = normalize((viewMatrix * vec4(lightDirWorld,0.)).xyz);
    // re-normalize the interpolated normal vector
    vec3 normal = normalize(v_normal);
    // get angle of reflection to compute alignment
    // without using `reflect`, alignment can be computed by taking the halfway vetor H and evaluating dot(N,H)
    vec3 reflDir = reflect(-lightDir,normal);
    float alignment = max(dot(viewDir,reflDir),0.);

    // specular highlight color
    vec3 white = vec3(1,1,1);
    vec3 specular = white * pow(alignment,pow(2.0, shininess));

    // diffuse highlight color (color * light)
    vec3 diffuse = baseColor * clamp(dot(normal,lightDir), 0.0, 1.0);

    vec3 ambient = baseColor * 0.7;

    gl_FragColor = vec4(clamp(specular + diffuse + ambient, 0.0, 1.0), 1);
    gl_FragColor.a = opacity;

    //gl_FragColor = vec4(v_uv, 0.0, 1.0);
}

