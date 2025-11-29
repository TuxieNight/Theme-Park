// get the texture from the program
uniform sampler2D map;

// get the fragment position relative to the camera
varying vec3 v_viewPosition;

// normal
varying vec3 v_normal;

// uv coordinates of the fragment
varying vec2 v_uv;

vec3 lightDirWorld = vec3(0, 1, 0);
float shininess = 500.0;

void main()
{
    // get the color from the texture
    vec3 baseColor = texture2D(map, v_uv).xyz;

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


    // get the color
    float r = baseColor.r;
    float g = baseColor.g;
    float b = baseColor.b;
    // get the green-ness
    float isGreen = step(b, g);

    // color with lighting
    vec4 lightColor = vec4(clamp(specular + diffuse + ambient, 0.0, 1.0), 1);

    // use the texture's green color directly if it's green
    vec4 finalColor = mix(lightColor, vec4(r, g, b, 1.0), isGreen);

    // set the fragment color
    gl_FragColor = finalColor;
}

