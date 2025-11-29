import * as T from "../libs/CS559-Three/build/three.module.js";
import { GrObject } from "../libs/CS559-Framework/GrObject.js";
import { shaderMaterial } from "../libs/CS559-Framework/shaderHelper.js";

let envMap;

let loader = new T.TextureLoader();
let flagTexture = loader.load("./textures/tentFlag.png");
let heartPondTexture = loader.load("./textures/heartPond.png");
let treeTexture = loader.load("./textures/tree_depth.png");
let trunkTexture = loader.load("./textures/carrot_texture.png");
let pine_trunk = new T.CylinderGeometry(.1, .1, 1, 32);
let fallLeafGeom = new T.SphereGeometry(.5, 32, 32);
let cherry_trunk_mat = new T.MeshStandardMaterial({color: "#612712", bumpMap: trunkTexture, bumpScale: 1});
let cherry_leaves_mat = new T.MeshStandardMaterial({color: "#FE1691", bumpMap: treeTexture, bumpScale: 1});

let cherryBlossomCtr = 0;
export class CherryBlossomTree extends GrObject {

    constructor() {

        let tree = new T.Group();
        let scale_group = new T.Group();

        let trunk = new T.Mesh(pine_trunk, cherry_trunk_mat);
        trunk.position.set(0, 1, 0);
        trunk.scale.set(1, 2, 1);
        trunk.receiveShadow = true;
        trunk.castShadow = true;

        let leafBase = new T.Mesh(fallLeafGeom, cherry_leaves_mat);
        leafBase.position.set(0, 2.5, 0);
        leafBase.scale.set(2.25, 2, 4);
        leafBase.receiveShadow = true;
        leafBase.castShadow = true;
        let leafCrown = new T.Mesh(fallLeafGeom, cherry_leaves_mat);
        leafCrown.position.set(0, 3, 0);
        leafCrown.scale.set(2, 1.75, 3);
        leafCrown.receiveShadow = true;
        leafCrown.castShadow = true;

        let branch = new T.Mesh(pine_trunk, cherry_trunk_mat);
        branch.position.set(0, 1.4, -0.5);
        branch.scale.set(0.95,2,0.95);
        branch.rotateX(-Math.PI/6);
        branch.receiveShadow = true;
        branch.castShadow = true;
        let branch2 = new T.Mesh(pine_trunk, cherry_trunk_mat);
        branch2.position.set(0, 1.87, .75);
        branch2.scale.set(0.9,2,0.9);
        branch2.rotateX(Math.PI/4);
        branch2.receiveShadow = true;
        branch2.castShadow = true;

        scale_group.add(trunk);
        scale_group.add(leafCrown);
        scale_group.add(leafBase);
        scale_group.add(branch);
        scale_group.add(branch2);

        scale_group.scale.set(0.5, 0.5, 0.5);

        tree.add(scale_group);

        super(`Cherry Blossom Tree-${cherryBlossomCtr++}`, tree);

    }

}

let kiteCtr = 0;
class Kite extends GrObject {
    constructor(x, y, z, color1, color2, color3, color4){
        // ********** KITE ***********  
        let kiteStuff = drawKite(color1, color2, color3, color4);
        let kite = kiteStuff[0];
        let tailJoints = kiteStuff[1];
        
        let scale = 5;
        kite.scale.set(scale, scale, scale);
        kite.rotation.x = Math.PI / 2;
        kite.position.set(x, y, z);

        super("Kite-" + (++kiteCtr), kite);
        
        this.nextKitePosition;
        this.oldKitePosition = kite.position; 
        this.kite = kite;
        this.time = 0; 
        this.tailJoints = tailJoints;

        this.x = x;
        this.y = y;
        this.z = z;

        // make kite rideable
        this.rideable = kite;
    }

    stepWorld(delta) {
        // update time
        this.time += delta / 1000;
    
        // rotate the kite tails
        for(let i = 0; i < 6; i++) {
            let tail = this.tailJoints[i];
            tail.rotation.y = Math.sin(this.time + i) * 0.5;
        } 
    
        // rotate kite
        this.kite.rotation.y = Math.sin(this.time) * 0.1;
    
        // determine kite position
        if (!this.nextKitePosition || this.kite.position.distanceTo(this.nextKitePosition) < 0.1) {
            // create random position that cannot stray too far from initial position but is not too close to the current position
            let minDist = 50; // Define the maximum allowed distance
            let range = 20;
            let newPosition;
            let x = Math.random() * range + this.x;
            let y = Math.random() * range + this.y;
            let z = Math.random() * range + this.z;
            newPosition = new T.Vector3(x, y, z);

            if (this.kite.position.distanceTo(newPosition) < minDist) {
                // if the new position is too far, set it to the old position
                newPosition = new T.Vector3(x + minDist/2, y + minDist/2, z + minDist/2);
            }

            this.nextKitePosition = newPosition;
        }
    
        // gradually move kite to next position
        this.kite.position.lerp(this.nextKitePosition, 0.01);
    
        // make kite gradually look at the direction of movement (with help of CoPilot)
        let direction = new T.Vector3().subVectors(this.nextKitePosition, this.kite.position).normalize(); // direction vector = normalized(targetPosition - currentPosition)
        let targetQuaternion = new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 0, 1), direction); // target quaternion: want forward direction of kite (z axis) to face direction of motion
        this.kite.quaternion.slerp(targetQuaternion, 0.1); // gradually change kite's current rotation to be the target rotation
    
        // keep a horizontal orientation
        this.kite.rotation.x = Math.PI / 2;
    }
}

function drawKite(color1, color2, color3, color4) {
    let kite = new T.Group();

    let red = new T.MeshStandardMaterial({ color: color1, side: T.DoubleSide });
    let blue = new T.MeshStandardMaterial({ color: color2, side: T.DoubleSide });
    let green = new T.MeshStandardMaterial({ color: color3, side: T.DoubleSide });
    let yellow = new T.MeshStandardMaterial({ color: color4, side: T.DoubleSide });

    // create four squares
    let baseGeo = new T.PlaneGeometry(1, 1);
    let square1 = new T.Mesh(baseGeo, red);
    let square2 = new T.Mesh(baseGeo, blue);
    let square3 = new T.Mesh(baseGeo, green);
    let square4 = new T.Mesh(baseGeo, yellow);

    square1.position.set(0, 0.5, 0);
    square2.position.set(0, -0.5, 0);
    square3.position.set(-1, 0.5, 0);
    square4.position.set(-1, -0.5, 0);

    square1.castShadow = true;
    square2.castShadow = true;
    square3.castShadow = true;
    square4.castShadow = true;

    let kiteBase = new T.Group();
    kite.add(kiteBase);

    kiteBase.add(square1);
    kiteBase.add(square2);
    kiteBase.add(square3);
    kiteBase.add(square4);

    // create 6 kite tails
    let tailGeo = new T.PlaneGeometry(0.45, 0.45);
    let tail1 = new T.Mesh(tailGeo, red);
    let tail2 = new T.Mesh(tailGeo, blue);
    let tail3 = new T.Mesh(tailGeo, green);
    let tail4 = new T.Mesh(tailGeo, yellow);
    let tail5 = new T.Mesh(tailGeo, red);
    let tail6 = new T.Mesh(tailGeo, blue);

    tail1.castShadow = true;
    tail2.castShadow = true;
    tail3.castShadow = true;
    tail4.castShadow = true;
    tail5.castShadow = true;
    tail6.castShadow = true;

    let tail1_joint = new T.Group();

    square2.add(tail1_joint);
    tail1_joint.add(tail1);
    tail1_joint.position.set(0.5, -0.5, 0);
    tail1.position.set(0.225, -0.225, 0);

    let tail2_joint = new T.Group();

    tail1_joint.add(tail2_joint);
    tail2_joint.add(tail2);
    tail2_joint.position.set(0.45, -0.45, 0);
    tail2.position.set(0.225, -0.225, 0);

    let tail3_joint = new T.Group();

    tail2_joint.add(tail3_joint);
    tail3_joint.add(tail3);
    tail3_joint.position.set(0.45, -0.45, 0);
    tail3.position.set(0.225, -0.225, 0);

    let tail4_joint = new T.Group();

    tail3_joint.add(tail4_joint);
    tail4_joint.add(tail4);
    tail4_joint.position.set(0.45, -0.45, 0);
    tail4.position.set(0.225, -0.225, 0);

    let tail5_joint = new T.Group();

    tail4_joint.add(tail5_joint);
    tail5_joint.add(tail5);
    tail5_joint.position.set(0.45, -0.45, 0);
    tail5.position.set(0.225, -0.225, 0);

    let tail6_joint = new T.Group();

    tail5_joint.add(tail6_joint);
    tail6_joint.add(tail6);
    tail6_joint.position.set(0.45, -0.45, 0);
    tail6.position.set(0.225, -0.225, 0);

    kite.position.set(1, 3, 0);

    let tailJoints = [tail1_joint, tail2_joint, tail3_joint, tail4_joint, tail5_joint, tail6_joint];

    return [kite, tailJoints];
}

let welcomeCtr = 0;
class WelcomeArch extends GrObject {
    constructor(envMap, heartColor1, heartColor2, heartColor3, waterNormalMap, heartTexture) {
        // create arch
        let welcome = new T.Group();

        // create arch out of torus
        let geometry = new T.TorusGeometry(2, 0.25, 16, 100, Math.PI);
        let material = new T.MeshStandardMaterial({
            color: "rgb(255, 255, 255)",
            metalness: 0.1,
            roughness: 0.1,
            envMap: envMap,
        });

        let arch = new T.Mesh(geometry, material);
        let scale = 20;
        arch.scale.set(scale, scale, scale/2); // scale the arch to be flat
        welcome.add(arch);

        let heartSize = 0.5;
        let heartScale = 1.5;

        // add 3 hearts to the arch
        let heartMid = drawHeart(heartSize, heartColor1, heartTexture);
        heartMid.position.set(0, scale*2, scale/8);
        heartMid.rotation.set(-Math.PI/2 + Math.PI, Math.PI/4 + Math.PI, 0);
        heartMid.scale.set(heartScale, 1, heartScale);
        welcome.add(heartMid);

        let heartLeft = drawHeart(heartSize, heartColor2, heartTexture);
        heartLeft.position.set(-scale, scale*1.5, scale/8);
        heartLeft.rotation.set(-Math.PI/2 + Math.PI, 0 + Math.PI, 0);
        heartLeft.scale.set(heartScale, 1, heartScale);
        welcome.add(heartLeft);

        let heartRight = drawHeart(heartSize, heartColor3, heartTexture);
        heartRight.position.set(scale, scale*1.5, scale/8);
        heartRight.rotation.set(-Math.PI/2 + Math.PI, Math.PI/2 + Math.PI, 0);
        heartRight.scale.set(heartScale, 1, heartScale);
        welcome.add(heartRight);

        super("WelcomeArch-" + (++welcomeCtr), welcome);

        this.heartMid = heartMid;
        this.heartLeft = heartLeft;
        this.heartRight = heartRight;
    }
}

let heartPondCtr = 0;
class HeartPond extends GrObject {
    constructor(waterNormalMap, width, height) {
        // create box
        let boxGeo = new T.BoxGeometry(width, height, width, 50, 50, 50);

        let pond_mat = shaderMaterial("./shaders/waterShader2.vs","./shaders/waterShader2.fs", {
            uniforms: {
                tex1: { value: waterNormalMap },
                tex2: { value: waterNormalMap },
                map: { value: heartPondTexture },
                time: { value: 0 },
            },
            transparent: true, // Enable transparency
            blending: T.NormalBlending, // Enable standard blending
            side: T.DoubleSide, // Render both sides of the plane
        });

        let groundMaterial = new T.MeshBasicMaterial({
            color: "rgb(27, 93, 28)", // semi-transparent color
        });

        // set materials of box sides
        let materials = [
            groundMaterial, // right
            groundMaterial, // left
            pond_mat, // top
            groundMaterial, // bottom
            groundMaterial, // front
            groundMaterial, // back
        ];

        // create mesh
        let pond = new T.Mesh(boxGeo, materials);

        super("HeartPond-" + (++heartPondCtr), pond);
    }

    stepWorld(delta) {
        // update the animation time uniform in the shader material of the heart pond
        this.objects[0].material[2].uniforms.time.value += delta / 1000; // Convert to seconds
    }
}

let waterNormalMap;
let pondColor = "rgba(28, 139, 173)"; // semi-transparent color
let coverMaterial;

class HeartPondPrototype extends GrObject {
    constructor(waterMap, groundMaterial) {
        // load the water normal map
        waterNormalMap = waterMap;
        // set the ground color
        coverMaterial = groundMaterial;

        // let heart = drawHeart(0.1);
        // heart.renderOrder = 1; // Set render order to ensure the heart is drawn second

        let water = drawNormalPond();
        water.renderOrder = 0; // Set render order to ensure the normal pond is drawn first
        water.position.set(-1, 0, 1); // Position the normal pond below the heart pond

        let heartCover = heartPondCoverMesh();
        heartCover.position.set(0, 0.02, 0);

        let pond = new T.Group();
        //pond.add(heart);
        pond.add(water);
        pond.add(heartCover);

        
        super("HeartPondPrototype", pond);
    }

    stepWorld(delta) {
        // update the animation time uniform in the shader material of the heart pond
        this.objects[0].children[0].material.uniforms.time.value += delta / 1000; // Convert to seconds
    }
}

function drawNormalPond() {
    let pond_geom = new T.PlaneGeometry(20, 20, 32, 32);
    pond_geom.rotateX(-Math.PI / 2); // Rotate the plane to be horizontal
    pond_geom.rotateY(Math.PI / 4);

    let pond_mat = shaderMaterial("./shaders/waterShader.vs","./shaders/waterShader.fs", {
        uniforms: {
            tex1: { value: waterNormalMap },
            tex2: { value: waterNormalMap },
            color: { value: new T.Color(pondColor) },
            time: { value: 0 },
            opacity: { value: 0.8 }, // Set the opacity for the transparent effect
        },
        transparent: true, // Enable transparency
        blending: T.NormalBlending, // Enable standard blending
        side: T.DoubleSide, // Render both sides of the plane
    });
    
    let pondMesh = new T.Mesh(pond_geom, pond_mat);

    return pondMesh;
}

function drawHeartPond(halfHeight, color, waterNormalMap) {
    let heart_geom = radialHeartGeometry(halfHeight);

    let heart_mat = shaderMaterial("./shaders/waterShader.vs","./shaders/waterShader.fs", {
        uniforms: {
            tex1: { value: waterNormalMap },
            tex2: { value: waterNormalMap },
            color: { value: new T.Color(color) },
            time: { value: 0 },
            opacity: { value: 1.0 }, // Set the opacity for the transparent effect
        },
        transparent: true, // Enable transparency
        blending: T.NormalBlending, // Enable standard blending
        side: T.DoubleSide, // Render both sides of the plane
    });
    
    let heartMesh = new T.Mesh(heart_geom, heart_mat);

    return heartMesh;
}

function drawHeart(halfHeight, color, texture) {
    let heart_geom = radialHeartGeometry(halfHeight);

    let heart_mat = new T.MeshStandardMaterial({
        color: color,
        metalness: 0.1,
        roughness: 0.1,
        map: texture
    });

    let heartMesh = new T.Mesh(heart_geom, heart_mat);

    return heartMesh;
}

let radius = 5;
let diameter = 2*radius;

/**
 *  Heart Geometry with radial uv mapping
 */
function radialHeartGeometry(halfHeight) {
    let arc = Math.PI; // half of a circle

    // create heart
    let heart_geom = new T.BufferGeometry();
    let heart_pts = [];
    let num_pts = 64;
    let uv_vals = [];
    let totalPts = 0;
    let normals = [];

    // Define bounding box for UV normalization
    let minX = -radius - diameter / 2;
    let maxX = radius + diameter / 2;
    let minZ = -radius - diameter / 2;
    let maxZ = radius + diameter / 2;

    let rangeX = maxX - minX;
    let rangeZ = maxZ - minZ;

    // create center front vertex
    heart_pts.push(0, halfHeight, 0);
    uv_vals.push(1 - (0 - minX) / rangeX, (0 - minZ) / rangeZ); // Center UV coordinate
    totalPts++;

    // Define a starting angle offset for the second circle
    let startAngle = Math.PI / 2; // Start at 90 degrees (positive y-axis)

    // create front circle to left of heart square
    for (let i = 0; i < num_pts; i++) {
        let theta = (arc)*(i/(num_pts - 1)) + startAngle; // divide by num_pts - 1 so the final value gets the full arc
        let x = radius * Math.cos(theta) - diameter/2;
        let z = radius * Math.sin(theta);
        heart_pts.push(x, halfHeight, z);
        totalPts++;

        // Map UV coordinates based on normalized x and z
        let u = 1 - (x - minX) / rangeX; // Normalize x to [0, 1]
        let v = (z - minZ) / rangeZ; // Normalize z to [0, 1]
        uv_vals.push(u, v);
    }

    let numLinePts = 30; // Number of points to create along the line

    // create front square from end of first circle to pointy end of heart
    // from (-diameter/2, halfHeight, -diameter/2) to (diameter/2, halfHeight, -diameter/2)
    for (let i = 0; i <= numLinePts; i++) {
        // skip recreating the first point
        if (i == 0) {
            continue;
        }

        let t = i / numLinePts; // Interpolation factor

         // Interpolate x from -diameter/2 to diameter/2
        let x = (1 - t) * (-diameter / 2) + t * (diameter / 2);
        // z remains constant
        let z = -diameter / 2;

        // add point
        heart_pts.push(x, halfHeight, z);
        totalPts++;

        // Map UV coordinates based on normalized x and z
        let u = 1 - (x - minX) / rangeX; // Normalize x to [0, 1]
        let v = (z - minZ) / rangeZ; // Normalize z to [0, 1]
        uv_vals.push(u, v);
    }

    // from (diameter/2, halfHeight, -diameter/2) to (diameter/2, halfHeight, diameter/2)
    for (let i = 0; i <= numLinePts; i++) {
        // skip recreating the first point
        if (i == 0) {
            continue;
        }

        let t = i / numLinePts; // Interpolation factor

        // x remains constant
        let x = diameter/2;
        // Interpolate z from -diameter/2 to diameter/2
        let z = (1 - t) * (-diameter / 2) + t * (diameter / 2);

        // add point
        heart_pts.push(x, halfHeight, z);
        totalPts++;

        // Map UV coordinates based on normalized x and z
        let u = 1 - (x - minX) / rangeX; // Normalize x to [0, 1]
        let v = (z - minZ) / rangeZ; // Normalize z to [0, 1]
        uv_vals.push(u, v);
    }

    // create front circle above heart square
    for (let i = 0; i < num_pts; i++) {
        // skip recreating last point and first point
        if (i == num_pts - 1 || i == 0) {
            continue;
        }

        let theta = (arc)*(i/(num_pts - 1));
        let x = radius * Math.cos(theta);
        let z = radius * Math.sin(theta) + diameter/2;
        heart_pts.push(x, halfHeight, z);
        totalPts++;

        // Map UV coordinates based on normalized x and z
        let u = 1 - (x - minX) / rangeX; // Normalize x to [0, 1]
        let v = (z - minZ) / rangeZ; // Normalize z to [0, 1]
        uv_vals.push(u, v);
    }

    // Ensure the last front point matches the first front point exactly (remember to skip the center point at the beginning)
    heart_pts[heart_pts.length - 3] = heart_pts[3]; // x-coordinate
    heart_pts[heart_pts.length - 2] = heart_pts[4]; // y-coordinate
    heart_pts[heart_pts.length - 1] = heart_pts[5]; // z-coordinate

    // Ensure the last UV matches the first UV
    uv_vals[uv_vals.length - 2] = uv_vals[2]; // u-coordinate
    uv_vals[uv_vals.length - 1] = uv_vals[3]; // v-coordinate

    // Store the index of the first back point
   let backCenter = totalPts;

    // create center back vertex
    heart_pts.push(0, -halfHeight, 0);
    uv_vals.push(1 - (0 - minX) / rangeX, (0 - minZ) / rangeZ); // Center UV coordinate
    totalPts++;

    // create back circle to left of heart square
    for (let i = 0; i < num_pts; i++) {
        let theta = (arc)*(i/(num_pts - 1)) + startAngle; // divide by num_pts - 1 so the final value gets the full arc
        let x = radius * Math.cos(theta) - diameter/2;
        let z = radius * Math.sin(theta);
        heart_pts.push(x, -halfHeight, z);
        totalPts++;

        // Map UV coordinates based on normalized x and z
        let u = 1 - (x - minX) / rangeX; // Normalize x to [0, 1]
        let v = (z - minZ) / rangeZ; // Invert v for the back side
        uv_vals.push(u, v);
    }

    // create back square from end of first circle to pointy end of heart
    // from (-diameter/2, -halfHeight, -diameter/2) to (diameter/2, -halfHeight, -diameter/2)
    for (let i = 0; i <= numLinePts; i++) {
        // skip recreating the first point
        if (i == 0) {
            continue;
        }

        let t = i / numLinePts; // Interpolation factor

         // Interpolate x from -diameter/2 to diameter/2
        let x = (1 - t) * (-diameter / 2) + t * (diameter / 2);
        // z remains constant
        let z = -diameter / 2;

        // add point
        heart_pts.push(x, -halfHeight, z);
        totalPts++;

        // Map UV coordinates based on normalized x and z
        let u = 1 - (x - minX) / rangeX; // Normalize x to [0, 1]
        let v = (z - minZ) / rangeZ; // Invert v for the back side
        uv_vals.push(u, v);
    }

    // from (diameter/2, -halfHeight, -diameter/2) to (diameter/2, -halfHeight, diameter/2)
    for (let i = 0; i <= numLinePts; i++) {
        // skip recreating the first point
        if (i == 0) {
            continue;
        }

        let t = i / numLinePts; // Interpolation factor

        // x remains constant
        let x = diameter/2;
        // Interpolate z from -diameter/2 to diameter/2
        let z = (1 - t) * (-diameter / 2) + t * (diameter / 2);

        // add point
        heart_pts.push(x, -halfHeight, z);
        totalPts++;

        // Map UV coordinates based on normalized x and z
        let u = 1 - (x - minX) / rangeX; // Normalize x to [0, 1]
        let v = (z - minZ) / rangeZ; // Invert v for the back side
        uv_vals.push(u, v);
    }

    // create back circle above heart square
    for (let i = 0; i < num_pts; i++) {
        // skip recreating last point and first point
        if (i == num_pts - 1 || i == 0) {
            continue;
        }

        let theta = (arc)*(i/(num_pts - 1));
        let x = radius * Math.cos(theta);
        let z = radius * Math.sin(theta) + diameter/2;
        heart_pts.push(x,-halfHeight, z);
        totalPts++;

        // Map UV coordinates based on normalized x and z
        let u = 1 - (x - minX) / rangeX; // Normalize x to [0, 1]
        let v = (z - minZ) / rangeZ; // Invert v for the back side
        uv_vals.push(u, v);
    }

    // Ensure the last back point matches the first back point exactly (remember to skip the center point at the beginning)
    heart_pts[heart_pts.length - 3] = heart_pts[3*backCenter + 3]; // x-coordinate
    heart_pts[heart_pts.length - 2] = heart_pts[3*backCenter + 4]; // y-coordinate
    heart_pts[heart_pts.length - 1] = heart_pts[3*backCenter + 5]; // z-coordinate

    // Ensure the last UV matches the first UV
    uv_vals[uv_vals.length - 2] = uv_vals[backCenter + 2]; // u-coordinate
    uv_vals[uv_vals.length - 1] = uv_vals[backCenter + 3]; // v-coordinate

    let heart_indices = [];

    // create triangles for the front heart
    for (let i = 1; i < backCenter; i++) {
        let next = i + 1;
        if (i == backCenter - 1) {
            next = 1;
        }

        // triangle contains the point next to this point, this point, and the center point
        heart_indices.push(next, i, 0);
    }

    // create triangles for the back heart
    for (let i = backCenter + 1; i < totalPts; i++) {
        let next = i + 1;
        if (i == totalPts - 1) {
            next = backCenter + 1;
        }

        // triangle contains this point, the point next to it, and the center point
        heart_indices.push(i, next, backCenter);
    }

    // create triangles between the front and back (the sides)
    for(let i = 1; i < backCenter; i++) {
        let front = i;
        let back = i + backCenter;

        let frontNext = front + 1;
        let backNext = back + 1;

        if (i == backCenter - 1) {
            frontNext = 1;
            backNext = backCenter + 1;
        }

        // triangle contains this point, and the point next to it, the point behind of it
        heart_indices.push(front, frontNext, back);
        // triangle contains the next point, the point behind of the next point, and the point behind of this point
        heart_indices.push(frontNext, backNext, back);
    }

    heart_geom.setIndex(heart_indices);
    heart_geom.setAttribute(
        "position",
        new T.Float32BufferAttribute(heart_pts, 3)
    );

    heart_geom.setAttribute(
        "uv",
        new T.Float32BufferAttribute(uv_vals, 2)
    );

    // compute normals for each vertex
    for(let i = 0; i < totalPts; i++) {
        normals.push(0, 1, 0);
    }

    heart_geom.setAttribute(
        "normal",
        new T.Float32BufferAttribute(normals, 3)
    );

    return heart_geom;
}

/**
 *  Heart Geometry with radial uv mapping
 */
function heartPondCoverMesh() {
    let arc = Math.PI; // half of a circle
    let halfHeight = 0.5;

    // create heart
    let cover_geom = new T.BufferGeometry();
    let cover_pts = [];
    let num_pts = 64;
    let totalPts = 0;
    let normals = [];

    // Define a starting angle offset for the second circle
    let startAngle = Math.PI / 2; // Start at 90 degrees (positive y-axis)

    // create front circle to left of heart square
    for (let i = 0; i < num_pts; i++) {
        let theta = (arc)*(i/(num_pts - 1)) + startAngle; // divide by num_pts - 1 so the final value gets the full arc
        let x = radius * Math.cos(theta) - diameter/2;
        let z = radius * Math.sin(theta);
        cover_pts.push(x, halfHeight, z);
        totalPts++;
    }

    let numLinePts = 30; // Number of points to create along the line

    // create front square from end of first circle to pointy end of heart
    // from (-diameter/2, halfHeight, -diameter/2) to (diameter/2, halfHeight, -diameter/2)
    for (let i = 0; i <= numLinePts; i++) {
        // skip recreating the first point
        if (i == 0) {
            continue;
        }

        let t = i / numLinePts; // Interpolation factor

         // Interpolate x from -diameter/2 to diameter/2
        let x = (1 - t) * (-diameter / 2) + t * (diameter / 2);
        // z remains constant
        let z = -diameter / 2;

        // add point
        cover_pts.push(x, halfHeight, z);
        totalPts++;
    }

    // from (diameter/2, halfHeight, -diameter/2) to (diameter/2, halfHeight, diameter/2)
    for (let i = 0; i <= numLinePts; i++) {
        // skip recreating the first point
        if (i == 0) {
            continue;
        }

        let t = i / numLinePts; // Interpolation factor

        // x remains constant
        let x = diameter/2;
        // Interpolate z from -diameter/2 to diameter/2
        let z = (1 - t) * (-diameter / 2) + t * (diameter / 2);

        // add point
        cover_pts.push(x, halfHeight, z);
        totalPts++;
    }

    // create front circle above heart square
    for (let i = 0; i < num_pts; i++) {
        // skip recreating last point and first point
        if (i == num_pts - 1 || i == 0) {
            continue;
        }

        let theta = (arc)*(i/(num_pts - 1));
        let x = radius * Math.cos(theta);
        let z = radius * Math.sin(theta) + diameter/2;
        cover_pts.push(x, halfHeight, z);
        totalPts++;
    }

    // Ensure the last front point matches the first front point exactly (remember to skip the center point at the beginning)
    cover_pts[cover_pts.length - 3] = cover_pts[3]; // x-coordinate
    cover_pts[cover_pts.length - 2] = cover_pts[4]; // y-coordinate
    cover_pts[cover_pts.length - 1] = cover_pts[5]; // z-coordinate

    let circleRadius = radius + diameter/2 + 5; // radius of the circle around the heart goes a bit beyond the farthest heart points
    let circleAngleShift = Math.PI / 2; // shift the circle angle to start at the top of the heart

    // create circle around heart, with a circle point for each heart point
    for (let i = 0; i < totalPts; i++) {
        let theta = (2*Math.PI)*(i/(totalPts - 1)) + circleAngleShift; // divide by num_pts - 1 so the final value gets the full arc
       
        let x = circleRadius * Math.cos(theta);
        let z = circleRadius * Math.sin(theta);

        cover_pts.push(x, halfHeight, z);
    }

    let cover_indices = [];

    // create triangles connecting the heart and outer circle
    for (let i = 0; i < totalPts; i++) {
        let thisHeart = i;
        let thisCircle = i + totalPts;

        let nextHeart = thisHeart + 1;
        let nextCircle = thisCircle + 1;

        if (i == totalPts - 1) {
            nextHeart = 0;
            nextCircle = totalPts;
        }

        // triangle contains this heart point, this circle point, and the next circle point
        cover_indices.push(thisCircle, thisHeart, nextCircle);
        // triangle contains this heart point, the next circle point, and the next heart point
        cover_indices.push(nextCircle, thisHeart, nextHeart);
    }

    cover_geom.setIndex(cover_indices);
    cover_geom.setAttribute(
        "position",
        new T.Float32BufferAttribute(cover_pts, 3)
    );

    // compute normals
    cover_geom.computeVertexNormals();

    let coverMesh = new T.Mesh(cover_geom, coverMaterial);

    return coverMesh;
}

let flagCtr = 0;
class Flag extends GrObject {
    constructor(cubemap) {
        // set the cubemap for the flag shader
        envMap = cubemap;

        // flag pole
        let pole = drawPole();
        pole.position.set(0, poleHeight/2, 0);

        // flag fabric
        let fabric = drawFabric();

        fabric.position.set(5, poleHeight - fabricHeight/2, 0);

        // group the pole and fabric together
        let flag = new T.Group();
        flag.add(pole);
        flag.add(fabric);

        // name and mesh
        super("Flag-" + (++flagCtr), flag);
    }

    stepWorld(delta) {
        // update the animation time uniform in the shader material of the fabric
        this.objects[0].children[1].material.uniforms.time.value += delta / 1000; // Convert to seconds
    }
}

let poleWidth = 0.3;
let poleHeight = 25;

function drawPole() {
    // create a cylinder geometry for the pole
    let geometry = new T.CylinderGeometry(poleWidth, poleWidth, poleHeight, 32);
    
    let material = new T.MeshStandardMaterial({
        side: T.DoubleSide,
        roughness: 0.1,
        metalness: 1.0,
        envMap: envMap,
    });

    let mesh = new T.Mesh(geometry, material);

    return mesh;
}

let fabricWidth = 10;
let fabricHeight = 5;

function drawFabric() {
    // create a plane geometry for the flag
    let geometry = new T.PlaneGeometry(fabricWidth, fabricHeight, 100, 100);
    
    let material = new T.MeshStandardMaterial({
        color: "red",
        side: T.DoubleSide,
    });

    let shaderMat = shaderMaterial("./shaders/flagShader.vs", "./shaders/flagShader.fs", {
        side: T.DoubleSide,
        uniforms: {
            tex: { value: flagTexture },
            time: { value: 0 }, // Animation time uniform
        },
        transparent: true, // Enable transparency
        blending: T.NormalBlending, // Enable standard blending
    });

    let mesh = new T.Mesh(geometry, shaderMat);

    return mesh;
}

export { Flag, HeartPondPrototype, HeartPond, WelcomeArch, Kite };