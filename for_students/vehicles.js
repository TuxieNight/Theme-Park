/*jshint esversion: 6 */
// @ts-check

import * as T from "../libs/CS559-Three/build/three.module.js";
import { GrObject } from "../libs/CS559-Framework/GrObject.js";

let envMap;

let balloonCtr = 0;
export class HotAirBalloon extends GrObject {
  constructor(balloonTexture, environmentMap, y) {
    envMap = environmentMap;

    let width = 20;

    let balloon = new T.Group();

    let balloonMesh = balloonTop(balloonTexture, width);
    let basketMesh = balloonBasket(width/3, width/2);

    balloonMesh.position.set(0, 1.5, 0);
    basketMesh.position.set(0, 0.1, 0);
    
    let basket = new T.Group();
    basket.add(basketMesh);
    basket.position.set(0, -2*width, 0);

    balloon.add(balloonMesh);
    balloon.add(basket);
    balloon.position.set(0, y, 0);

    super("HotAirBalloon-" + (++balloonCtr), balloon);

    this.balloon = balloon;
    this.basket = basketMesh;
    this.time = 0;
    this.rideable = this.basket;
    this.direction = 1;
    this.y = y;
  }

  stepWorld(delta) {
    this.time += delta / 1000;

    let difference = 5;

    // animate the balloon by moving it up and down
    if (this.balloon.position.y > this.y + difference) {
      this.direction = -1;
    } else if (this.balloon.position.y < this.y - difference) {
      this.direction = 1;
    }
    
    this.balloon.position.y += 0.001 * this.direction * delta; 
    this.basket.rotation.x += 0.0001/difference * this.direction * delta; 
  }
}

function balloonTop (balloonTexture, width) {
  let balloonMat = new T.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.8,
    side: T.DoubleSide,
    map: balloonTexture,
  });

  let balloonEndMat = new T.MeshStandardMaterial({
    color: "rgb(99, 0, 0)",
    metalness: 0.3,
    roughness: 0.8,
    side: T.DoubleSide,
  });

  // create main portion
  let balloonGeom = new T.SphereGeometry(width, 32, 32);
  let balloonMesh = new T.Mesh(balloonGeom, balloonMat);

  // create portion that bends
  let bendAmount = 3/4;
  let betweenWidth = (width*bendAmount + width/3)/2;

  let midGeom = new T.CylinderGeometry(width*bendAmount, betweenWidth, width*bendAmount/2, 32, 1, true);
  let midMesh = new T.Mesh(midGeom, balloonMat);
  midMesh.position.set(0, -width*(5/6), 0);
  midMesh.rotation.y = Math.PI * (3/10);

  let endGeom = new T.CylinderGeometry(betweenWidth, width/3, width*bendAmount/2, 32, 1, true);
  let endMesh = new T.Mesh(endGeom, balloonEndMat);
  endMesh.position.set(0, -width*bendAmount/2, 0);

  balloonMesh.add(midMesh);
  midMesh.add(endMesh);

  return balloonMesh;
}

function balloonBasket (width, height) {
  let basketMat = new T.MeshStandardMaterial({
    color: "rgb(139, 108, 64)",
    metalness: 0.3,
    roughness: 0.8,
    side: T.DoubleSide,
  });

  let halfHeight = height / 2;

  // create wall of basket
  let basket_geom = new T.BufferGeometry();
  let basket_pts = [];
  let num_pts = 32;

  let divider = num_pts;

  // create outside circular right side
  for (let i = 0; i < num_pts; i++) {
    let theta = (i * 2 * Math.PI) / (divider);
    let x = width * Math.cos(theta);
    let z = width * Math.sin(theta);
    basket_pts.push(x, halfHeight, z);
  }
  // create outside cicular left side
  for (let i = 0; i < num_pts; i++) {
    let theta = (2 * Math.PI)*(i/(divider));
    let x = width * Math.cos(theta);
    let z = width * Math.sin(theta);
    basket_pts.push(x, -halfHeight, z);
  }

  // create inside circular right side
  for (let i = 0; i < num_pts; i++) {
    let theta = (i * 2 * Math.PI) / (divider);
    let x = (4/5)*width * Math.cos(theta);
    let z = (4/5)*width * Math.sin(theta);
    basket_pts.push(x, halfHeight, z);
  }
  // create inside cicular left side
  for (let i = 0; i < num_pts; i++) {
    let theta = (2 * Math.PI)*(i/(divider));
    let x = (4/5)*width * Math.cos(theta);
    let z = (4/5)*width * Math.sin(theta);
    basket_pts.push(x, -halfHeight, z);
  }

  let basket_indices = [];
  // this runs for half of the points (for the right ones only)
  for (let i = 0; i < num_pts; i++) {
    // triangle contains this point, the point next to it, and the point to the left of it
    basket_indices.push(i, (i + 1) % num_pts, i + num_pts);
    // traingle contains the next point, the point left of the next point, and the point left of this point
    basket_indices.push((i + 1) % num_pts, (i + 1) % num_pts + num_pts, i + num_pts);
  }

  // outside wall
  // this runs for half of the points (for the right ones only)
  for (let i = 0; i < num_pts; i++) {
    let rightNext = i + 1;
    let leftNext = i + num_pts + 1;

    if (i == num_pts - 1) {
      rightNext = 0;
      leftNext = num_pts;
    }

    // triangle contains this point, the point next to it, and the point left of it
    basket_indices.push(i, rightNext, i + num_pts);
    // triangle contains the next point, the point left of the next point, and the point left of this point
    basket_indices.push(rightNext, leftNext, i + num_pts);
  }

  // inside wall
  // this runs for half of the points (for the right ones only)
  for (let i = 2*num_pts; i < 3*num_pts; i++) {
    let rightNext = i + 1;
    let leftNext = i + num_pts + 1;

    if (i == 3*num_pts - 1) {
      rightNext = 2*num_pts;
      leftNext = 3*num_pts;
    }

    // triangle contains this point, the point next to it, and the point left of it
    basket_indices.push(i, rightNext, i + num_pts);
    // triangle contains the next point, the point left of the next point, and the point left of this point
    basket_indices.push(rightNext, leftNext, i + num_pts);
  }

  // create triangles between the right inside and right outside
  for(let i = 0; i < num_pts; i++) {
    let outNext = i + 1;
    let inNext = i + 2*num_pts + 1;

    if (i == num_pts - 1) {
      outNext = 0;
      inNext = 2*num_pts;
    }

    // triangle contains this point, and the point next to it, the point inside of it
    basket_indices.push(i, outNext, i + 2*num_pts);
    // triangle contains the next point, the point inside of the next point, and the point inside of this point
    basket_indices.push(outNext, inNext, i + 2*num_pts);
  }

  // create triangles at left inside and left outside
  for(let i = num_pts; i < 2*num_pts; i++) {
    let outNext = i + 1;
    let inNext = i + 2*num_pts + 1;

    if (i == 2*num_pts - 1) {
      outNext = num_pts;
      inNext = num_pts + 2*num_pts;
    }

    // triangle contains this point, and the point next to it, the point inside of it
    basket_indices.push(i, outNext, i + 2*num_pts);
    // triangle contains the next point, the point inside of the next point, and the point inside of this point
    basket_indices.push(outNext, inNext, i + 2*num_pts);
  }

  basket_geom.setIndex(basket_indices);
  basket_geom.setAttribute(
    "position",
    new T.Float32BufferAttribute(basket_pts, 3)
  );

  // compute normals
  basket_geom.computeVertexNormals();

  let basketMesh = new T.Mesh(basket_geom, basketMat);

  // create bottom of basket
  let basketBottom = new T.CylinderGeometry(width, width, width/5, 32, 1);
  let basketBottomMesh = new T.Mesh(basketBottom, basketMat);
  
  basketMesh.add(basketBottomMesh);
  basketBottomMesh.position.set(0, -width/2, 0);

  // create basket handle
  let handleGeom = new T.CylinderGeometry(width/10, width/10, (3/2)*width, 32, 1);
  let handleMat = new T.MeshStandardMaterial({
    color: "rgb(255, 255, 255)",
    metalness: 0.9,
    roughness: 0.1,
    side: T.DoubleSide,
    envMap: envMap,
  });

  let handleTop = new T.Mesh(handleGeom, handleMat);
  handleTop.position.set(0, (9.05/7)*width, 0);
  handleTop.rotation.x = Math.PI / 2;
  handleTop.scale.set(1, 1.1, 1);

  let handleLeft = new T.Mesh(handleGeom, handleMat);
  handleLeft.position.set(0, (29/30)*width, (9/10)*width);
  handleLeft.scale.set(1, 0.3, 1);
  handleLeft.rotation.y = -Math.PI / 2;

  let cornerGeo = new T.TorusGeometry(width/10, width/10, 50, 50, Math.PI/2);

  let cornerLeftMesh = new T.Mesh(cornerGeo, handleMat);
  handleLeft.add(cornerLeftMesh);
  cornerLeftMesh.position.set(-width/10, ((3/2)*width*0.3) + 3*width/10, 0);
  cornerLeftMesh.scale.set(1, 1/0.3, 1);

  let handleRight = new T.Mesh(handleGeom, handleMat);
  handleRight.position.set(0, (29/30)*width, -(9/10)*width);
  handleRight.scale.set(1, 0.3, 1);
  handleRight.rotation.y = Math.PI / 2;

  let cornerRightMesh = new T.Mesh(cornerGeo, handleMat);
  handleRight.add(cornerRightMesh);
  cornerRightMesh.position.set(-width/10, ((3/2)*width*0.3) + 3*width/10, 0);
  cornerRightMesh.scale.set(1, 1/0.3, 1);

  basketMesh.add(handleTop);
  basketMesh.add(handleLeft);
  basketMesh.add(handleRight);

  // create strings
  
  let ropeMat = new T.MeshStandardMaterial({
    color: "rgb(0, 0, 0)",
    metalness: 0.3,
    roughness: 0.8,
  });

  let ropeLength = 10;

  let ropeGeom = new T.CylinderGeometry(0.1, 0.1, ropeLength, 32);

  // back and tilt right
  let rope1 = new T.Group();
  let ropeMesh = new T.Mesh(ropeGeom, ropeMat);
  rope1.add(ropeMesh);
  rope1.position.set(1.5, -width*(2/3), -ropeLength/2);
  ropeMesh.rotation.x = Math.PI / 2.5;
  rope1.rotation.z = Math.PI/2;
  handleTop.add(rope1);

  // front and tilt right
  let rope2 = new T.Group();
  let ropeMesh2 = new T.Mesh(ropeGeom, ropeMat);
  rope2.add(ropeMesh2);
  rope2.position.set(1.5, width*(2/3), -ropeLength/2);
  ropeMesh2.rotation.x = Math.PI / 2.5;
  rope2.rotation.z = Math.PI/2;
  handleTop.add(rope2);

  // back and tilt left
  let rope3 = new T.Group();
  let ropeMesh3 = new T.Mesh(ropeGeom, ropeMat);
  rope3.add(ropeMesh3);
  rope3.position.set(-1.5, -width*(2/3), -ropeLength/2);
  ropeMesh3.rotation.x = Math.PI / 2.5;
  rope3.rotation.z = -Math.PI/2;
  handleTop.add(rope3);

  // front and tilt left
  let rope4 = new T.Group();
  let ropeMesh4 = new T.Mesh(ropeGeom, ropeMat);
  rope4.add(ropeMesh4);
  rope4.position.set(-1.5, width*(2/3), -ropeLength/2);
  ropeMesh4.rotation.x = Math.PI / 2.5;
  rope4.rotation.z = -Math.PI/2;
  handleTop.add(rope4);

  return basketMesh;
}

// load cart textures
let cartTextureLoader = new T.TextureLoader();
let woodTexture = cartTextureLoader.load('./textures/woodGrain2.jpg');

// cart counter
let cartCounter = 0;
let brown = "rgb(139, 108, 64)";

export class GrCart extends GrObject {
    constructor(cubemap) {
        let cart = new T.Group();

        envMap = cubemap;

        let bodyParts = drawCartBody();

        let body = bodyParts[0];
        let planks = bodyParts[1];

        cart.add(body);

        let baseParts = drawBase();
        let base = baseParts[0];
        let metallic = baseParts[1];

        cart.add(base);

        super("Cart-" + (++cartCounter), cart);

        this.planks = planks;
        this.metallic = metallic;
    }

    getTexture(texture) {
        for(let i = 0; i < this.planks.length; i++) {
            this.planks[i].material.envMap = texture;
            this.planks[i].material.needsUpdate = true;
        }

        for (let i = 0; i < this.metallic.length; i++) {
            this.metallic[i].material.envMap = texture;
            this.metallic[i].material.needsUpdate = true;
        }
    }
}

function drawCartBody() {
    let body = new T.Group();

    // create base (the floor of the cart)
    let base_geom = new T.BoxGeometry(6, 0.2, 3);
    let base_mat = new T.MeshStandardMaterial({
        color: brown,
        metalness: 0.3,
        roughness: 0.8,
        map: woodTexture
    });
    
    let base = new T.Mesh(base_geom, base_mat);
    body.add(base);
    base.castShadow = true;

    base.position.set(0, 1.35, 0);

    // create the walls of the cart with planks
    let plank_geom = new T.BoxGeometry(0.1, 0.3, 2.8);
    let plank_mat = new T.MeshStandardMaterial({
        envMap: envMap,
        color: "gray",
        metalness: 0.9,
        roughness: 0.1
    });

    // create back planks
    let back_plank1 = new T.Mesh(plank_geom, plank_mat);
    base.add(back_plank1);
    back_plank1.position.set(2.95, 0.3, 0);
    back_plank1.rotation.z = -Math.PI / 20;
    back_plank1.castShadow = true;

    let back_plank2 = new T.Mesh(plank_geom, plank_mat);
    back_plank1.add(back_plank2);
    back_plank2.position.set(0, 0.35, 0);
    back_plank2.castShadow = true;

    let back_plank3 = new T.Mesh(plank_geom, plank_mat);
    back_plank2.add(back_plank3);
    back_plank3.position.set(0, 0.35, 0);
    back_plank3.castShadow = true;

    // create front planks
    let front_plank1 = new T.Mesh(plank_geom, plank_mat);
    base.add(front_plank1);
    front_plank1.position.set(-2.95, 0.3, 0);
    front_plank1.rotation.z = Math.PI / 20;
    front_plank1.castShadow = true;

    let front_plank2 = new T.Mesh(plank_geom, plank_mat);
    front_plank1.add(front_plank2);
    front_plank2.position.set(0, 0.35, 0);
    front_plank2.castShadow = true;

    let front_plank3 = new T.Mesh(plank_geom, plank_mat);
    front_plank2.add(front_plank3);
    front_plank3.position.set(0, 0.35, 0);
    front_plank3.castShadow = true;

    // create left planks
    let left_plank1 = new T.Mesh(plank_geom, plank_mat);
    base.add(left_plank1);
    left_plank1.position.set(0, 0.3, 1.4);
    left_plank1.rotation.y = Math.PI / 2;
    left_plank1.scale.set(1, 1, 2.1);
    left_plank1.castShadow = true;

    let left_plank2 = new T.Mesh(plank_geom, plank_mat);
    left_plank1.add(left_plank2);
    left_plank2.position.set(0, 0.35, 0);
    left_plank2.castShadow = true;

    let left_plank3 = new T.Mesh(plank_geom, plank_mat);
    left_plank2.add(left_plank3);
    left_plank3.position.set(0, 0.35, 0);
    left_plank3.scale.set(1, 1, 1.01);
    left_plank3.castShadow = true;

    // create right planks
    let right_plank1 = new T.Mesh(plank_geom, plank_mat);
    base.add(right_plank1);
    right_plank1.position.set(0, 0.3, -1.4);
    right_plank1.rotation.y = Math.PI / 2;
    right_plank1.scale.set(1, 1, 2.1);
    right_plank1.castShadow = true;

    let right_plank2 = new T.Mesh(plank_geom, plank_mat);
    right_plank1.add(right_plank2);
    right_plank2.position.set(0, 0.35, 0);
    right_plank2.castShadow = true;

    let right_plank3 = new T.Mesh(plank_geom, plank_mat);
    right_plank2.add(right_plank3);
    right_plank3.position.set(0, 0.35, 0);
    left_plank3.scale.set(1, 1, 1.01);
    right_plank3.castShadow = true;

    // Create upright bars at edges
    let upright_geom = new T.BoxGeometry(0.2, 1.2, 0.2);
    let upright_mat = new T.MeshStandardMaterial({
        color: brown,
        metalness: 0.3,
        roughness: 0.8,
        map: woodTexture
    });

    // create front right upright
    let front_right_upright = new T.Mesh(upright_geom, upright_mat);
    base.add(front_right_upright);
    front_right_upright.position.set(-3, 0.65, -1.4);
    front_right_upright.rotation.z = Math.PI / 20;
    front_right_upright.castShadow = true;

    // create front left upright
    let front_left_upright = new T.Mesh(upright_geom, upright_mat);
    base.add(front_left_upright);
    front_left_upright.position.set(-3, 0.65, 1.4);
    front_left_upright.rotation.z = Math.PI / 20;
    front_left_upright.castShadow = true;

    // create back right upright
    let back_right_upright = new T.Mesh(upright_geom, upright_mat);
    base.add(back_right_upright);
    back_right_upright.position.set(3, 0.65, -1.4);
    back_right_upright.rotation.z = -Math.PI / 20;
    back_right_upright.castShadow = true;

    // create back left upright
    let back_left_upright = new T.Mesh(upright_geom, upright_mat);
    base.add(back_left_upright);
    back_left_upright.position.set(3, 0.65, 1.4);
    back_left_upright.rotation.z = -Math.PI / 20;
    back_left_upright.castShadow = true;

    let planks = [back_plank1, back_plank2, back_plank3, front_plank1, front_plank2, front_plank3, left_plank1, left_plank2, left_plank3, right_plank1, right_plank2, right_plank3];

    return [body, planks];
}

function drawBase() {
    let base = new T.Group();

    // get wheels
    let wheel1 = drawWheel();
    wheel1.position.set(2, 1, 2);
    wheel1.scale.set(0.1, 0.1, 0.1);
    base.add(wheel1);

    let wheel2 = drawWheel();
    wheel2.position.set(-2, 1, 2);
    wheel2.scale.set(0.1, 0.1, 0.1);
    base.add(wheel2);

    let wheel3 = drawWheel();
    wheel3.position.set(2, 1, -2);
    wheel3.scale.set(0.1, 0.1, 0.1);
    base.add(wheel3);

    let wheel4 = drawWheel();
    wheel4.position.set(-2, 1, -2);
    wheel4.scale.set(0.1, 0.1, 0.1);
    base.add(wheel4);

    // draw poles between wheels
    let pole_geom = new T.CylinderGeometry(0.1, 0.1, 4, 16);
    let pole_mat = new T.MeshStandardMaterial({
        envMap: envMap,
        color: "gray",
        metalness: 0.9,
        roughness: 0.1
    });

    let pole1 = new T.Mesh(pole_geom, pole_mat);
    pole1.position.set(2, 1, 0);
    pole1.rotation.x = Math.PI / 2;
    base.add(pole1);

    let pole2 = new T.Mesh(pole_geom, pole_mat);
    pole2.position.set(-2, 1, 0);
    pole2.rotation.x = Math.PI / 2;
    base.add(pole2);

    // draw box the poles go through
    let box_geom = new T.BoxGeometry(5, 0.5, 2);
    let box_mat = new T.MeshStandardMaterial({
        envMap: envMap,
        color: "gray",
        metalness: 0.9,
        roughness: 0.1
    });

    let box = new T.Mesh(box_geom, box_mat);
    box.position.set(0, 1, 0);
    base.add(box);

    let metallic = [pole1, pole2, box];

    // return base
    return [base, metallic];
}

function drawWheel() {
  let wheel = new T.Group();

  let radius = 10;
  let thickness = 1;

  // create plate
  let wheel_geom = new T.BufferGeometry();
  let wheel_pts = [];
  let num_pts = 32;

  // create outside circular right side
  for (let i = 0; i < num_pts; i++) {
    let theta = (i * 2 * Math.PI) / (num_pts - 1);
    let x = radius * Math.cos(theta);
    let y = radius * Math.sin(theta);
    wheel_pts.push(x, y, thickness);
  }
  // create outside cicular left side
  for (let i = 0; i < num_pts; i++) {
    let theta = (2 * Math.PI)*(i/(num_pts - 1));
    let x = radius * Math.cos(theta);
    let y = radius * Math.sin(theta);
    wheel_pts.push(x, y, -thickness);
  }

  // create inside circular right side
  for (let i = 0; i < num_pts; i++) {
    let theta = (i * 2 * Math.PI) / (num_pts - 1);
    let x = (4/5)*radius * Math.cos(theta);
    let y = (4/5)*radius * Math.sin(theta);
    wheel_pts.push(x, y, thickness);
  }
  // create inside cicular left side
  for (let i = 0; i < num_pts; i++) {
    let theta = (2 * Math.PI)*(i/(num_pts - 1));
    let x = (4/5)*radius * Math.cos(theta);
    let y = (4/5)*radius * Math.sin(theta);
    wheel_pts.push(x, y, -thickness);
  }

  let wheel_indices = [];
  // this runs for half of the points (for the right ones only)
  for (let i = 0; i < num_pts; i++) {
    // triangle contains this point, the point next to it, and the point to the left of it
    wheel_indices.push(i, (i + 1) % num_pts, i + num_pts);
    // traingle contains the next point, the point left of the next point, and the point left of this point
    wheel_indices.push((i + 1) % num_pts, (i + 1) % num_pts + num_pts, i + num_pts);
  }

  // outside wall
  // this runs for half of the points (for the right ones only)
  for (let i = 0; i < num_pts; i++) {
    let rightNext = i + 1;
    let leftNext = i + num_pts + 1;

    if (i == num_pts - 1) {
      rightNext = 0;
      leftNext = num_pts;
    }

    // triangle contains this point, the point next to it, and the point left of it
    wheel_indices.push(i, rightNext, i + num_pts);
    // triangle contains the next point, the point left of the next point, and the point left of this point
    wheel_indices.push(rightNext, leftNext, i + num_pts);
  }

  // inside wall
  // this runs for half of the points (for the right ones only)
  for (let i = 2*num_pts; i < 3*num_pts; i++) {
    let rightNext = i + 1;
    let leftNext = i + num_pts + 1;

    if (i == 3*num_pts - 1) {
      rightNext = 2*num_pts;
      leftNext = 3*num_pts;
    }

    // triangle contains this point, the point next to it, and the point left of it
    wheel_indices.push(i, rightNext, i + num_pts);
    // triangle contains the next point, the point left of the next point, and the point left of this point
    wheel_indices.push(rightNext, leftNext, i + num_pts);
  }

  // create triangles between the right inside and right outside
  for(let i = 0; i < num_pts; i++) {
    let outNext = i + 1;
    let inNext = i + 2*num_pts + 1;

    if (i == num_pts - 1) {
      outNext = 0;
      inNext = 2*num_pts;
    }

    // triangle contains this point, and the point next to it, the point inside of it
    wheel_indices.push(i, outNext, i + 2*num_pts);
    // triangle contains the next point, the point inside of the next point, and the point inside of this point
    wheel_indices.push(outNext, inNext, i + 2*num_pts);
  }

  // create triangles at left inside and left outside
  for(let i = num_pts; i < 2*num_pts; i++) {
    let outNext = i + 1;
    let inNext = i + 2*num_pts + 1;

    if (i == 2*num_pts - 1) {
      outNext = num_pts;
      inNext = num_pts + 2*num_pts;
    }

    // triangle contains this point, and the point next to it, the point inside of it
    wheel_indices.push(i, outNext, i + 2*num_pts);
    // triangle contains the next point, the point inside of the next point, and the point inside of this point
    wheel_indices.push(outNext, inNext, i + 2*num_pts);
  }

  wheel_geom.setIndex(wheel_indices);
  wheel_geom.setAttribute(
    "position",
    new T.Float32BufferAttribute(wheel_pts, 3)
  );

  // compute normals
  wheel_geom.computeVertexNormals();

  let wheel_mat = new T.MeshStandardMaterial({
    color: brown,
    metalness: 0.3,
    roughness: 0.8,
    map: woodTexture,
    side: T.DoubleSide
  });

  let wheelMesh = new T.Mesh(wheel_geom, wheel_mat);
  wheel.add(wheelMesh);
  wheelMesh.castShadow = true;

  // create cylinder for center
  let center_geom = new T.CylinderGeometry(1, 1, 2*thickness, 16);
  let center_mat = new T.MeshStandardMaterial({
    envMap: envMap,
    color: "gray",
    metalness: 0.9,
    roughness: 0.1
  });
  let center = new T.Mesh(center_geom, center_mat);
  wheel.add(center);
  center.rotation.x = Math.PI / 2;
  center.castShadow = true;

  let spoke_geom = new T.CylinderGeometry(0.3, 0.3, 18, 16);
  let spoke_mat = new T.MeshStandardMaterial({
    color: brown,
    metalness: 0.3,
    roughness: 0.8,
    map: woodTexture
  });

  // create spokes
  let num_spokes = 8;
  for (let i = 0; i < num_spokes; i++) {
    let spoke = new T.Mesh(spoke_geom, spoke_mat);
    wheel.add(spoke);
    spoke.rotateZ((i * 2 * Math.PI) / num_spokes);
    spoke.position.set(0, 0, 0);
    spoke.castShadow = true;
  }

  return wheel;
}