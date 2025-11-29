// declare the varying variable that gets passed to the fragment shader
varying vec2 v_uv;

// get the texture from the program
uniform sampler2D tex;

// get the fragment position relative to the camera
varying vec3 v_viewPosition;

// normal vector of the fragment in view space
varying vec3 v_viewNormal;

vec3 lightDirWorld = vec3(0, 1, 0);
float shininess = 100.0;

void main()
{
    // set distance desired to begin change (opacity is 1.0)
    float begChange = 15.0;
    // set distance desired to end change (opacity is 0.0)
    float endChange = 5.0;

    // distance from camera to the fragment
    float distanceToCamera = length(v_viewPosition);

    // interpolate opacity between begChange and endChange (0.0 if distanceToCamera = endChange, 1.0 if distanceToCamera = begChange)
    float opacity = clamp((distanceToCamera - endChange) / (begChange - endChange), 0.0, 1.0);

    // get the color from the texture
    vec3 baseColor = vec3(texture2D(tex, v_uv));
    // set the alpha value to the opacity calculated above

    // only change the opacity if the color is a dark red
    float red = baseColor.r;
    float green = baseColor.g;
    float blue = baseColor.b;

    // get the view direction in view-space coordinates
    // remember in view space, the camera is the origin
    vec3 viewDir = normalize( - v_viewPosition);

    // convert the lighting direction in view-space coordinates
    vec3 lightDir = normalize((viewMatrix * vec4(lightDirWorld,0.)).xyz);
    // re-normalize the interpolated normal vector
    vec3 normal = normalize(v_viewNormal);
    // get angle of reflection to compute alignment
    // without using `reflect`, alignment can be computed by taking the halfway vetor H and evaluating dot(N,H)
    vec3 reflDir = reflect(-lightDir,normal);
    float alignment = max(dot(viewDir,reflDir),0.);

    // specular highlight color
    vec3 white = vec3(1,1,1);
    vec3 specular = baseColor * pow(alignment,pow(2.0, shininess));

    // diffuse highlight color (color * light)
    vec3 diffuse = baseColor * clamp(dot(normal,lightDir), 0.0, 1.0);

    vec3 ambient = baseColor * 0.7;

    gl_FragColor = vec4(clamp(specular + diffuse + ambient, 0.0, 1.0), 1);

    // color with red > green, red > blue, red < 0.5
    float isRed = step(green, red)*step(blue, red)*step(red, 0.5);
    // if the color is red, set the alpha value to the opacity calculated above
    gl_FragColor.a = mix(gl_FragColor.a, opacity, isRed);
    
}

