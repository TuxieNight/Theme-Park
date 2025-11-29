/*jshint esversion: 6 */
// @ts-check

import * as T from "../libs/CS559-Three/build/three.module.js";
import { GrObject } from "../libs/CS559-Framework/GrObject.js";
import { shaderMaterial } from "../libs/CS559-Framework/shaderHelper.js";

// load in roof
let loader = new T.TextureLoader();
let tentTexture = loader.load("./textures/tent.png");
let woodGrain = loader.load("./textures/woodGrain2.jpg");

let entranceCtr = 0;

class AdmissionEntrance extends GrObject {
    constructor(width, height, firstColor, secondColor, thirdColor) {
        let depth = width/2;

        let poleRadius = 0.5;
        let coneHeight = height/8;
        let roofHeight = height/10;
        let secondaryRoofHeight = roofHeight*2;
        let thirdRoofHeight = roofHeight/2;
        let poleDisplacement = height/2 + coneHeight/2 + roofHeight/2;
        let roofDisplacement = roofHeight/2 + secondaryRoofHeight/2

        let roofWidth = width*(3/2);
        let roofDepth = depth*(3/2);

        let materialBlue = new T.MeshStandardMaterial({ color: firstColor, bumpMap: woodGrain, bumpScale: 10.0 });
        let materialWhite = new T.MeshStandardMaterial({ color: secondColor, bumpMap: woodGrain, bumpScale: 10.0 });


        // create roof
        let roofGeo = new T.BoxGeometry(roofWidth, roofHeight, roofDepth);
        let roof = new T.Mesh(roofGeo, materialBlue);
        roof.castShadow = true;
        roof.receiveShadow = true;

        // create secondary roof
        let roof2Geo = new T.BoxGeometry(width, secondaryRoofHeight, depth);
        let roof2 = new T.Mesh(roof2Geo, materialWhite);
        roof.add(roof2);
        roof2.position.set(0, roofDisplacement, 0);
        roof2.castShadow = true;
        roof2.receiveShadow = true;

        // create third roof
        let roof3Geo = new T.BoxGeometry(roofWidth*(3/4), thirdRoofHeight, roofDepth*(3/4));
        let roof3 = new T.Mesh(roof3Geo, materialBlue);
        roof2.add(roof3);
        roof3.position.set(0, secondaryRoofHeight/2 + thirdRoofHeight/2, 0);

        // create four legs
        let legGeo = new T.CylinderGeometry(poleRadius, poleRadius, height, 10);
        let leg1 = new T.Mesh(legGeo, materialBlue);
        let leg2 = new T.Mesh(legGeo, materialBlue);
        let leg3 = new T.Mesh(legGeo, materialBlue);
        let leg4 = new T.Mesh(legGeo, materialBlue);

        roof.add(leg1);
        roof.add(leg2);
        roof.add(leg3);
        roof.add(leg4);

        leg1.position.set(-width/2, -poleDisplacement, -depth/2);
        leg2.position.set(width/2, -poleDisplacement, -depth/2);
        leg3.position.set(-width/2, -poleDisplacement, depth/2);
        leg4.position.set(width/2, -poleDisplacement, depth/2);

        leg1.castShadow = true;
        leg2.castShadow = true;
        leg3.castShadow = true;
        leg4.castShadow = true;

        leg1.receiveShadow = true;
        leg2.receiveShadow = true;
        leg3.receiveShadow = true;
        leg4.receiveShadow = true;

        // create cones for the top of each leg
        let coneGeo = new T.CylinderGeometry(2*poleRadius, poleRadius, coneHeight, 10);
        let cone1 = new T.Mesh(coneGeo, materialWhite);
        let cone2 = new T.Mesh(coneGeo, materialWhite);
        let cone3 = new T.Mesh(coneGeo, materialWhite);
        let cone4 = new T.Mesh(coneGeo, materialWhite);

        leg1.add(cone1);
        leg2.add(cone2);
        leg3.add(cone3);
        leg4.add(cone4);

        cone1.position.set(0, height/2, 0);
        cone2.position.set(0, height/2, 0);
        cone3.position.set(0, height/2, 0);
        cone4.position.set(0, height/2, 0);

        // create boxes for the bottom of each leg
        let boxGeo = new T.BoxGeometry(poleRadius*2, poleRadius*2, coneHeight);
        let box1 = new T.Mesh(boxGeo, materialBlue);
        let box2 = new T.Mesh(boxGeo, materialBlue);
        let box3 = new T.Mesh(boxGeo, materialBlue);
        let box4 = new T.Mesh(boxGeo, materialBlue);

        leg1.add(box1);
        leg2.add(box2);
        leg3.add(box3);
        leg4.add(box4);

        box1.position.set(0, -height/2, 0);
        box2.position.set(0, -height/2, 0);
        box3.position.set(0, -height/2, 0);
        box4.position.set(0, -height/2, 0);

        // create decorative triangle edging
        let numTriangles = 20;

        let triangle = new T.Shape();
        triangle.moveTo(0, 0);
        triangle.lineTo(roofWidth/(2*numTriangles), roofWidth/(2*numTriangles));
        triangle.lineTo(roofWidth/numTriangles, 0);
        triangle.lineTo(0, 0);

        let triangleExtrudeSettings = {
            steps: 1,
            depth: 0.1,
            bevelEnabled: false
        };

        let triangleGeo = new T.ExtrudeGeometry(triangle, triangleExtrudeSettings);
        let triangleMat = new T.MeshStandardMaterial({ color: thirdColor });
        let triangleMesh = new T.Mesh(triangleGeo, triangleMat);

        // position and add triangles around the roof      
        for (let i = 0; i < numTriangles; i++) {
            let clone = triangleMesh.clone();
            let clone2 = triangleMesh.clone();

            // along first width
            clone.position.set(roofWidth*(i/numTriangles) - roofWidth/2, roofHeight / 2, roofDepth / 2);
            // along second width
            clone2.position.set(roofWidth*(i/numTriangles) - roofWidth/2, roofHeight / 2, -roofDepth / 2);

            roof.add(clone);
            roof.add(clone2);
        }
        for (let i = 0; i < numTriangles/2; i++) {
            let clone = triangleMesh.clone();
            let clone2 = triangleMesh.clone();

            // along first width
            clone.position.set(roofWidth / 2, roofHeight / 2, roofDepth*(i/(numTriangles/2)) - roofDepth/2 + roofWidth/numTriangles);
            // along second width
            clone2.position.set(-roofWidth / 2, roofHeight / 2, roofDepth*(i/(numTriangles/2)) - roofDepth/2 + roofWidth/numTriangles);

            // rotate
            clone.rotateY(Math.PI / 2);
            clone2.rotateY(Math.PI / 2);

            roof.add(clone);
            roof.add(clone2);
        }

        // create group
        let entrance = new T.Group();
        entrance.add(roof);
        roof.position.set(0, height + coneHeight + coneHeight - roofHeight/2, 0);

        super("AdmissionEntrance-" + ++(entranceCtr), entrance);
    }
}

class Building1 extends GrObject {
    constructor(outsideAlphaMap, homeTexture) {
        let geometry = new T.BufferGeometry();

        // create points
        let A = [-2, 1, 2];
        let B = [1, 2, 2];
        let C = [2, 1, 2];
        let D = [-2, -1, 2];
        let E = [2, -1, 2];
        let F = [-2, 1, -2];
        let G = [-2, -1, -2];
        let H = [2, 1, -2];
        let I = [2, -1, -2];
        let J = [1, 2, -2];

        // create vertices
        const vertices = new Float32Array( [
            // front
            ...A,
            ...B,
            ...C,
            ...D,
            ...E,

            // left side
            ...A,
            ...D,
            ...F,
            ...G,

            // right side
            ...C,
            ...E,
            ...H,
            ...I,

            // back
            ...H,
            ...I,
            ...F,
            ...G,
            ...J,

            // roof left
            ...F,
            ...A,
            ...J,
            ...B,

            // roof right
            ...J,
            ...B,
            ...H,
            ...C            
        ]);

        geometry.setAttribute('position', new T.BufferAttribute(vertices, 3));

        // create faces
        geometry.setIndex([
            1, 0, 2,  2, 0, 3,  4, 2, 3,
            6, 5, 7,  7, 8, 6,
            11, 10, 12,  9, 10, 11,
            13, 15, 17,  14, 15, 13,  16, 15, 14,
            21, 20, 18,  21, 18, 19,
            23, 24, 22,  23, 25, 24
        ]);

        // compute normals
        geometry.computeVertexNormals();

        // set uvs
        const uv = new Float32Array([
            // front
            1/4, 1/2,  2/3, 2/3,  3/4, 1/2,  1/4, 0,  3/4, 0,
            // left side
            1/4, 1/2,  1/4, 0,  0, 1/2,  0, 0,
            // right side
            3/4, 1/2,  3/4, 0,  1, 1/2,  1, 0,
            // back
            3/4, 1/2,  3/4, 0,  1/4, 1/2,  1/4, 0,  2/3, 2/3,
            // roof left
            0, 1,  0, 2/3,  2/3, 1,  2/3, 3/4,
            // roof right
            2/3, 1,  2/3, 3/4,  1, 1,  1, 2/3
        ]);

        geometry.setAttribute('uv', new T.BufferAttribute(uv, 2));

        // create material
        let material = new T.MeshStandardMaterial({
            map: homeTexture,
            alphaMap: outsideAlphaMap,
            transparent: true
        });

        // create mesh
        let mesh = new T.Mesh(geometry, material);
        mesh.renderOrder = 2;

        // name and mesh
        super("Building1", mesh);
    }
}


class Building1Inside extends GrObject {
    constructor(insideAlphaMap, insideHomeTexture) {
        let geometry = new T.BufferGeometry();

        // create points
        let A = [-2, 1, 2];
        let B = [1, 2, 2];
        let C = [2, 1, 2];
        let D = [-2, -1, 2];
        let E = [2, -1, 2];
        let F = [-2, 1, -2];
        let G = [-2, -1, -2];
        let H = [2, 1, -2];
        let I = [2, -1, -2];
        let J = [1, 2, -2];

        // create vertices
        const vertices = new Float32Array( [
            // front
            ...A,
            ...B,
            ...C,
            ...D,
            ...E,

            // left side
            ...A,
            ...D,
            ...F,
            ...G,

            // right side
            ...C,
            ...E,
            ...H,
            ...I,

            // back
            ...H,
            ...I,
            ...F,
            ...G,
            ...J,

            // roof left
            ...F,
            ...A,
            ...J,
            ...B,

            // roof right
            ...J,
            ...B,
            ...H,
            ...C            
        ]);

        geometry.setAttribute('position', new T.BufferAttribute(vertices, 3));

        // create faces
        geometry.setIndex([
            1, 0, 2,  2, 0, 3,  4, 2, 3,
            6, 5, 7,  7, 8, 6,
            11, 10, 12,  9, 10, 11,
            13, 15, 17,  14, 15, 13,  16, 15, 14,
            21, 20, 18,  21, 18, 19,
            23, 24, 22,  23, 25, 24
        ]);

        // compute normals
        geometry.computeVertexNormals();

        // set uvs
        const uv = new Float32Array([
            // front
            1/4, 1/2,  2/3, 2/3,  3/4, 1/2,  1/4, 0,  3/4, 0,
            // left side
            1/4, 1/2,  1/4, 0,  0, 1/2,  0, 0,
            // right side
            3/4, 1/2,  3/4, 0,  1, 1/2,  1, 0,
            // back
            3/4, 1/2,  3/4, 0,  1/4, 1/2,  1/4, 0,  2/3, 2/3,
            // roof left
            0, 1,  0, 2/3,  2/3, 1,  2/3, 3/4,
            // roof right
            2/3, 1,  2/3, 3/4,  1, 1,  1, 2/3
        ]);

        geometry.setAttribute('uv', new T.BufferAttribute(uv, 2));

        // create material
        let material = new T.MeshStandardMaterial({
            map: insideHomeTexture,
            side: T.BackSide,
            alphaMap: insideAlphaMap,
            transparent: true
        });

        // create mesh
        let mesh = new T.Mesh(geometry, material);
        mesh.renderOrder = 1;

        // create floor
        let floorGeo = new T.PlaneGeometry(4, 4);
        let floorMat = new T.MeshStandardMaterial({map: woodGrain, side: T.BackSide});
        let floor = new T.Mesh(floorGeo, floorMat);
        floor.rotateX(Math.PI / 2);
        floor.position.set(0, -0.99, 0);
        mesh.add(floor);

        floor.receiveShadow = true;

        // name and mesh
        super("Building1", mesh);
    }
}

let tentCtr = 0;

class CircusTent extends GrObject {
    constructor() {
        let geometry = new T.BufferGeometry();

        // create points
        let A = [-2, 1, 2];
        let B = [0, 2, 0];
        let C = [2, 1, 2];
        let D = [-2, -1, 2];
        let E = [2, -1, 2];
        let F = [-2, 1, -2];
        let G = [-2, -1, -2];
        let H = [2, 1, -2];
        let I = [2, -1, -2];

        // create vertices
        const vertices = new Float32Array( [
            // front
            ...A,
            ...B,
            ...C,
            ...D,
            ...E,

            // left side
            ...A,
            ...D,
            ...F,
            ...G,
            ...B,

            // right side
            ...C,
            ...E,
            ...H,
            ...I,
            ...B,

            // back
            ...H,
            ...I,
            ...F,
            ...G,
            ...B
        ]);

        geometry.setAttribute('position', new T.BufferAttribute(vertices, 3));

        // create faces
        geometry.setIndex([
            1, 0, 2,  2, 0, 3,  4, 2, 3,
            6, 5, 7,  7, 8, 6,  7, 5, 9,
            10, 11, 12,  12, 11, 13,  14, 10, 12,
            15, 16, 17, 17, 16, 18,  19, 15, 17,
        ]);

        // compute normals
        geometry.computeVertexNormals();

        // set uvs
        const uv = new Float32Array([
            // front
            0, 2/3,  1/2, 1,  1, 2/3,  0, 0,  1, 0,
            // left side
            1, 2/3,  1, 0,  0, 2/3,  0, 0,  1/2, 1,
            // right side
            0, 2/3,  0, 0,  1, 2/3,  1, 0,  1/2, 1,
            // back
            0, 2/3,  0,0,  1, 2/3,  1, 0,  1/2, 1
        ]);

        geometry.setAttribute('uv', new T.BufferAttribute(uv, 2));

        let shaderMat = shaderMaterial("./shaders/tentShader.vs", "./shaders/tentShader.fs", {
            //side: T.DoubleSide,
            uniforms: {
                tex: { value: tentTexture },
            },
            transparent: true, // Enable transparency
            blending: T.NormalBlending, // Enable standard blending
        });

        // create material
        //let material = new T.MeshStandardMaterial({map: tentTexture, side: T.DoubleSide});

        // create mesh
        let mesh = new T.Mesh(geometry, shaderMat);
        mesh.renderOrder = 2;

        // name and mesh
        super("CircusTent-"+ (++tentCtr), mesh);
    }
}


let tentInsideCtr = 0;
class CircusTentInside extends GrObject {
    constructor(floorMaterial) {
        let wallsGeom = new T.BufferGeometry();

        // create points
        let A = [-2, 1, 2];
        let B = [0, 2, 0];
        let C = [2, 1, 2];
        let D = [-2, -1, 2];
        let E = [2, -1, 2];
        let F = [-2, 1, -2];
        let G = [-2, -1, -2];
        let H = [2, 1, -2];
        let I = [2, -1, -2];

        // create vertices
        const vertices = new Float32Array( [
            // front
            ...A,
            ...B,
            ...C,
            ...D,
            ...E,

            // left side
            ...A,
            ...D,
            ...F,
            ...G,
            ...B,

            // right side
            ...C,
            ...E,
            ...H,
            ...I,
            ...B,

            // back
            ...H,
            ...I,
            ...F,
            ...G,
            ...B
        ]);

        wallsGeom.setAttribute('position', new T.BufferAttribute(vertices, 3));

        // create faces
        wallsGeom.setIndex([
            1, 0, 2,  2, 0, 3,  4, 2, 3,
            6, 5, 7,  7, 8, 6,  7, 5, 9,
            10, 11, 12,  12, 11, 13,  14, 10, 12,
            15, 16, 17, 17, 16, 18,  19, 15, 17,
        ]);

        // compute normals
        wallsGeom.computeVertexNormals();

        // set uvs
        const uv = new Float32Array([
            // front
            0, 2/3,  1/2, 1,  1, 2/3,  0, 0,  1, 0,
            // left side
            1, 2/3,  1, 0,  0, 2/3,  0, 0,  1/2, 1,
            // right side
            0, 2/3,  0, 0,  1, 2/3,  1, 0,  1/2, 1,
            // back
            0, 2/3,  0,0,  1, 2/3,  1, 0,  1/2, 1
        ]);

        wallsGeom.setAttribute('uv', new T.BufferAttribute(uv, 2));

        let shaderMat = shaderMaterial("./shaders/tentShader.vs", "./shaders/tentShader.fs", {
            side: T.BackSide,
            uniforms: {
                tex: { value: tentTexture },
            },
            transparent: true, // Enable transparency
            blending: T.NormalBlending, // Enable standard blending
        });

        // create mesh
        let wallsMesh = new T.Mesh(wallsGeom, shaderMat);
        wallsMesh.renderOrder = 1;

        // create floor slightly smaller than 4x4 walls
        let floorGeo = new T.BoxGeometry(3.99, 0.1, 3.99);
        let floor = new T.Mesh(floorGeo, floorMaterial);
        floor.rotateY(Math.PI);
        floor.position.set(0, -0.98, 0);

        // group
        let inside = new T.Group();
        inside.add(wallsMesh);
        inside.add(floor);

        // name and mesh
        super("CircusTentInside-"+(++tentInsideCtr), inside);
    }
}

class Tree extends GrObject {
    constructor() {
        // create geometry for trunk and leaves
        let trunkGeometry = new T.CylinderGeometry(0.5, 0.5, 2);
        let leavesGeometry = new T.ConeGeometry(1.5, 3, 8);

        // create materials
        let trunkMaterial = new T.MeshStandardMaterial({ color: 0x8B4513 });
        let leavesMaterial = new T.MeshStandardMaterial({ color: 0x228B22 });

        // create meshes
        let trunkMesh = new T.Mesh(trunkGeometry, trunkMaterial);
        let leavesMesh = new T.Mesh(leavesGeometry, leavesMaterial);

        // position the leaves on top of the trunk
        leavesMesh.position.y = 2;

        // create a group to hold the trunk and leaves
        let treeGroup = new T.Group();
        treeGroup.add(trunkMesh);
        treeGroup.add(leavesMesh);

        // create the final mesh
        let mesh = treeGroup;

        super("Tree", mesh);
    }
}

export { Building1, CircusTent, Building1Inside, CircusTentInside, Tree, AdmissionEntrance };

