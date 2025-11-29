/*jshint esversion: 6 */
// @ts-check

import * as T from "../libs/CS559-Three/build/three.module.js";
import { GrObject } from "../libs/CS559-Framework/GrObject.js";

let envMap;
let metalColor = "rgb(255, 255, 255)";

let ferrisWheelCtr = 0;
// A Ferris wheel.
/**
 * @typedef FerrisWheelProperties
 * @type {object}
 * @property {number} [x=0]
 * @property {number} [y=0]
 * @property {number} [z=0]
 * @property {number} [size=1]
 */
export class GrFerrisWheel extends GrObject {
  constructor(cubemap) {
    envMap = cubemap;

    let ferrisWheel = new T.Group();

    let base = drawBase();
    ferrisWheel.add(base);

    let wheel1 = drawWheel();
    //wheel1.rotation.y = Math.PI / 2;
    wheel1.position.set(0, 0, 3);
    wheel1.scale.set(1, 1, 0.45);

    let wheel2 = drawWheel();
    //wheel2.rotation.y = Math.PI / 2;
    wheel2.position.set(0, 0, -3);
    wheel2.scale.set(1, 1, 0.45);

    let wheel = new T.Group();
    wheel.add(wheel1);
    wheel.add(wheel2);
    ferrisWheel.add(wheel);
    wheel.rotation.y = Math.PI / 2;
    wheel.position.set(-5, 18, 5);

    let carriages = [];

    // create carriages
    let num_carriages = 8;
    for (let i = 0; i < num_carriages; i++) {
      let carriage = drawCarriage();
      wheel.add(carriage);

      let x = 11.0 * Math.sin((i * 2 * Math.PI) / num_carriages);
      let y = 11.0 * Math.cos((i * 2 * Math.PI) / num_carriages);
      carriage.position.set(x, y, 0);

      carriages.push(carriage);
    }

    super("FerrisWheel-" + (++ferrisWheelCtr), ferrisWheel);

    this.wheel = wheel;
    this.carriages = carriages;

    // create camera
    this.camera = new T.PerspectiveCamera(45, 1, 0.1, 1000);
    carriages[0].add(this.camera);
    this.camera.position.set(0, 5, 0);

    // make the ferris wheel rideable for the UI
    this.rideable = carriages[0];
  }

  getCamera() {
    return this.camera;
  }

  /**
   * StepWorld method
   * @param {*} delta
   * @param {*} timeOfDay
   */
  stepWorld(delta, timeOfDay) {
    this.wheel.rotateZ(0.0005 * delta);

    for (let i = 0; i < this.carriages.length; i++) {
      this.carriages[i].rotateZ(-0.0005 * delta);
    }

    // get world coordinates of camera
    let worldPos = this.camera.getWorldPosition(new T.Vector3());

    this.camera.lookAt(worldPos.x + 5, worldPos.y - 1, worldPos.z + 1);
  }
}

function drawCarriage() {

  let carriage = new T.Group();

  // create carriage shape
  let carriage_geom = new T.BufferGeometry();
  let carrige_pts = [];
  let num_pts = 32;

  // create outside thickness
  // create circular base
  for (let i = 0; i < num_pts; i++) {
    let theta = (i * 2 * Math.PI) / num_pts;
    let x = 4 * Math.cos(theta);
    let z = 4 * Math.sin(theta);
    carrige_pts.push(x, -2, z);
  }
  // create cicular top
  for (let i = 0; i < num_pts; i++) {
    let theta = (2 * Math.PI)*(i/num_pts);
    let x = 6 * Math.cos(theta);
    let z = 6 * Math.sin(theta);
    carrige_pts.push(x, 2, z);
  }

  // create inside thickness
  // circular base
  for (let i = 0; i < num_pts; i++) {
    let theta = (i * 2 * Math.PI) / num_pts;
    let x = 3.5 * Math.cos(theta);
    let z = 3.5 * Math.sin(theta);
    carrige_pts.push(x, -1.9, z);
  }
  // circular top
  for (let i = 0; i < num_pts; i++) {
    let theta = (2 * Math.PI)*(i/num_pts);
    let x = 5.5 * Math.cos(theta);
    let z = 5.5 * Math.sin(theta);
    carrige_pts.push(x, 2, z);
  }

  let carriage_indices = [];

  // outside wall
  // this runs for half of the points (for the bottom ones only)
  for (let i = 0; i < num_pts; i++) {
    let belowNext = i + 1;
    let aboveNext = i + num_pts + 1;

    if (i == num_pts - 1) {
      belowNext = 0;
      aboveNext = num_pts;
    }

    // triangle contains this point, the point next to it, and the point above it
    carriage_indices.push(i, belowNext, i + num_pts);
    // triangle contains the next point, the point above the next point, and the point above this point
    carriage_indices.push(belowNext, aboveNext, i + num_pts);
  }

  // inside wall
  // this runs for half of the points (for the bottom ones only)
  for (let i = 2*num_pts; i < 3*num_pts; i++) {
    let belowNext = i + 1;
    let aboveNext = i + num_pts + 1;

    if (i == 3*num_pts - 1) {
      belowNext = 2*num_pts;
      aboveNext = 3*num_pts;
    }

    // triangle contains this point, the point next to it, and the point above it
    carriage_indices.push(i, belowNext, i + num_pts);
    // triangle contains the next point, the point above the next point, and the point above this point
    carriage_indices.push(belowNext, aboveNext, i + num_pts);
  }

  // create triangles at top
  for(let i = num_pts; i < 2*num_pts; i++) {
    let outNext = i + 1;
    let inNext = i + 2*num_pts + 1;

    if (i == 2*num_pts - 1) {
      outNext = num_pts;
      inNext = num_pts + 2*num_pts;
    }

    // triangle contains this point, and the point next to it, the point inside of it
    carriage_indices.push(i, outNext, i + 2*num_pts);
    // triangle contains the next point, the point inside of the next point, and the point inside of this point
    carriage_indices.push(outNext, inNext, i + 2*num_pts);
  }

  // create cup bottom
  for(let i = 0; i < num_pts; i++) {
    carriage_indices.push(i, 0, (i + 1) % num_pts);
  }

  carriage_geom.setIndex(carriage_indices);
  carriage_geom.setAttribute(
    "position",
    new T.Float32BufferAttribute(carrige_pts, 3)
  );

  // compute normals
  carriage_geom.computeVertexNormals();

  let cup_mat = new T.MeshStandardMaterial({
    color: "rgb(102, 250, 142)",
    metalness: 0.5,
    roughness: 0.5,
    side: T.DoubleSide
  });
  let carriageMesh = new T.Mesh(carriage_geom, cup_mat);

  carriage.add(carriageMesh);

  carriage.scale.set(0.4, 0.4, 0.4);

  carriageMesh.castShadow = true;

  return carriage;
}

function drawWheel() {
  let wheel = new T.Group();

  let radius = 10;
  let thickness = 1;

  // create plate
  let wheel_geom = new T.BufferGeometry();
  let wheel_pts = [];
  let num_pts = 32;

  let divider = num_pts;

  // create outside circular right side
  for (let i = 0; i < num_pts; i++) {
    let theta = (i * 2 * Math.PI) / (divider);
    let x = radius * Math.cos(theta);
    let y = radius * Math.sin(theta);
    wheel_pts.push(x, y, thickness);
  }
  // create outside cicular left side
  for (let i = 0; i < num_pts; i++) {
    let theta = (2 * Math.PI)*(i/(divider));
    let x = radius * Math.cos(theta);
    let y = radius * Math.sin(theta);
    wheel_pts.push(x, y, -thickness);
  }

  // create inside circular right side
  for (let i = 0; i < num_pts; i++) {
    let theta = (i * 2 * Math.PI) / (divider);
    let x = (4/5)*radius * Math.cos(theta);
    let y = (4/5)*radius * Math.sin(theta);
    wheel_pts.push(x, y, thickness);
  }
  // create inside cicular left side
  for (let i = 0; i < num_pts; i++) {
    let theta = (2 * Math.PI)*(i/(divider));
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
    color: "rgb(252, 114, 236)",
    metalness: 0.5,
    roughness: 0.1,
    side: T.DoubleSide,
    envMap: envMap,
  });

  let wheelMesh = new T.Mesh(wheel_geom, wheel_mat);
  wheel.add(wheelMesh);
  wheelMesh.castShadow = true;

  // create cylinder for center
  let center_geom = new T.CylinderGeometry(1, 1, 2*thickness, 16);
  let center_mat = new T.MeshStandardMaterial({
    color: metalColor,
    metalness: 1.0,
    roughness: 0.0,
    envMap: envMap,
  });
  let center = new T.Mesh(center_geom, center_mat);
  wheel.add(center);
  center.rotation.x = Math.PI / 2;
  center.castShadow = true;

  let spoke_geom = new T.CylinderGeometry(0.3, 0.3, 18, 16);
  let spoke_mat = new T.MeshStandardMaterial({
    color: metalColor,
    metalness: 1.0,
    roughness: 0.0,
    envMap: envMap,
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

function drawBase() {
  let base = new T.Group();

  // draw legs
  let legPair1 = draw2Legs();
  base.add(legPair1);

  let legPair2 = draw2Legs();
  base.add(legPair2);
  legPair2.position.set(-10, 0, 0);

  // draw connecting bar between leg tips
  let bar_geom = new T.CylinderGeometry(0.5, 0.5, 11, 16);
  let bar_mat = new T.MeshStandardMaterial({
    color: metalColor,
    metalness: 1.0,
    roughness: 0.0,
    envMap: envMap,
  });
  let bar = new T.Mesh(bar_geom, bar_mat);
  base.add(bar);
  bar.rotateZ(Math.PI / 2);
  bar.position.set(-5, 18, 5);


  return base;
}

function draw2Legs() {
  let legs = new T.Group();

  let leg1 = drawLeg();
  legs.add(leg1);
  leg1.rotateX(Math.PI / 6);
  leg1.position.set(0, 9, 0);

  let leg2 = drawLeg();
  legs.add(leg2);
  leg2.rotateX(-Math.PI / 6);
  leg2.position.set(0, 9, 10);

  return legs;
}

function drawLeg() {
  // create base with four legs
  let base_geom = new T.CylinderGeometry(0.5, 0.5, 20, 16);
  let base_mat = new T.MeshStandardMaterial({
    color: metalColor,
    metalness: 1.0,
    roughness: 0.0,
    envMap: envMap,
  });
  let leg = new T.Mesh(base_geom, base_mat);

  return leg;
}

let teacupCtr = 0;
// A spinning teacup ride.
/**
 * @typedef TeacupProperties
 * @type {object}
 * @property {number} [x=0]
 * @property {number} [y=0]
 * @property {number} [z=0]
 * @property {number} [size=1]
 */ 
export class GrTeacupRide extends GrObject {
  /**
   * @param {TeacupProperties} params
   */
  constructor(params = {}) {
    let teacupRide = new T.Group();

    // ride base
    let base_geom = new T.CylinderGeometry(10, 10, 0.5);
    let base_mat = new T.MeshStandardMaterial({
      color: "rgb(233, 102, 250)",
      metalness: 0.6,
      roughness: 0.6,
      envMap: envMap,
    });
    let base = new T.Mesh(base_geom, base_mat);
    teacupRide.add(base);

    let center1 = new T.Group();
    center1.position.set(0, 0.3, 0);
    teacupRide.add(center1);

    let teacup1 = drawTeacup();
    center1.add(teacup1);
    teacup1.scale.set(0.4, 0.4, 0.4);
    teacup1.position.set(7, 0, 0);

    let center2 = new T.Group();
    center2.position.set(0, 0.3, 0);
    teacupRide.add(center2);

    let teacup2 = drawTeacup("red");
    center2.add(teacup2);
    teacup2.scale.set(0.4, 0.4, 0.4);
    teacup2.position.set(7, 0, 0);
    center2.rotation.y = Math.PI / 2;

    let center3 = new T.Group();
    center3.position.set(0, 0.3, 0);
    teacupRide.add(center3);

    let teacup3 = drawTeacup("blue");
    center3.add(teacup3);
    teacup3.scale.set(0.4, 0.4, 0.4);
    teacup3.position.set(7, 0, 0);
    center3.rotation.y = Math.PI;

    let center4 = new T.Group();
    center4.position.set(0, 0.3, 0);
    teacupRide.add(center4);

    let teacup4 = drawTeacup("green");
    center4.add(teacup4);
    teacup4.scale.set(0.4, 0.4, 0.4);
    teacup4.position.set(7, 0, 0);
    center4.rotation.y = 3*Math.PI/2;

    super(`Teacup-${++teacupCtr}`, teacupRide);

    this.teacupCenters = [center1, center2, center3, center4];
    this.teacups = [teacup1, teacup2, teacup3, teacup4];

    // add camera
    this.camera = new T.PerspectiveCamera(45, 1, 0.1, 1000);
    teacup3.add(this.camera);
    this.camera.position.set(0, 6, 8);

    // make the teacup rideable for the UI
    this.rideable = teacup3;
  }

  getCamera() {
    return this.camera;
  }

  /**
   * StepWorld method
   * @param {*} delta
   * @param {*} timeOfDay
   */
  stepWorld(delta, timeOfDay) {
    for (let i = 0; i < this.teacupCenters.length; i++) {
      this.teacupCenters[i].rotation.y += delta/1000;
      this.teacups[i].rotation.y -= 0.005 * delta;
    }
  }
}

// Helper function to draw a teacup.
function drawTeacup(color) {

  let teacup = new T.Group();

  if(!color) {
    color = "gold";
  }

  // create plate
  let plate_geom = new T.BufferGeometry();
  let plate_pts = [];
  let numPlate_pts = 32;

  // create circular base
  for (let i = 0; i < numPlate_pts; i++) {
    let theta = (i * 2 * Math.PI) / numPlate_pts;
    let x = 4 * Math.cos(theta);
    let z = 4 * Math.sin(theta);
    plate_pts.push(x, 0, z);
  }
  // create cicular top
  for (let i = 0; i < numPlate_pts; i++) {
    let theta = (2 * Math.PI)*(i/numPlate_pts);
    let x = 6 * Math.cos(theta);
    let z = 6 * Math.sin(theta);
    plate_pts.push(x, 0.5, z);
  }

  let plate_indices = [];
  // this runs for half of the points (for the bottom ones only)
  for (let i = 0; i < numPlate_pts; i++) {
    // triangle contains this point, the point next to it, and the point above it
    plate_indices.push(i, (i + 1) % numPlate_pts, i + numPlate_pts);
    // traingle contains the next point, the point above the next point, and the point above this point
    plate_indices.push((i + 1) % numPlate_pts, (i + 1) % numPlate_pts + numPlate_pts, i + numPlate_pts);
  }

  // create cup bottom
  for(let i = 0; i < numPlate_pts; i++) {
    plate_indices.push(i, 0, (i + 1) % numPlate_pts);
  }

  plate_geom.setIndex(plate_indices);
  plate_geom.setAttribute(
    "position",
    new T.Float32BufferAttribute(plate_pts, 3)
  );

  // compute normals
  plate_geom.computeVertexNormals();

  // helped by GitHub Copilot
  let lighterColor = new T.Color(color).lerp(new T.Color("white"), 0.5);

  let plate_mat = new T.MeshStandardMaterial({
    color: lighterColor,
    metalness: 0.5,
    roughness: 0.5,
    side: T.DoubleSide
  });

  let plate = new T.Mesh(plate_geom, plate_mat);
  teacup.add(plate);

  // create teacup shape
  let cup_geom = new T.BufferGeometry();
  let cup_pts = [];
  let num_pts = 32;

  // create outside thickness
  // create circular base
  for (let i = 0; i < num_pts; i++) {
    let theta = (i * 2 * Math.PI) / num_pts;
    let x = 4 * Math.cos(theta);
    let z = 4 * Math.sin(theta);
    cup_pts.push(x, 0, z);
  }
  // create cicular top
  for (let i = 0; i < num_pts; i++) {
    let theta = (2 * Math.PI)*(i/num_pts);
    let x = 6 * Math.cos(theta);
    let z = 6 * Math.sin(theta);
    cup_pts.push(x, 4, z);
  }

  // create inside thickness
  // circular base
  for (let i = 0; i < num_pts; i++) {
    let theta = (i * 2 * Math.PI) / num_pts;
    let x = 3.5 * Math.cos(theta);
    let z = 3.5 * Math.sin(theta);
    cup_pts.push(x, 0.1, z);
  }
  // circular top
  for (let i = 0; i < num_pts; i++) {
    let theta = (2 * Math.PI)*(i/num_pts);
    let x = 5.5 * Math.cos(theta);
    let z = 5.5 * Math.sin(theta);
    cup_pts.push(x, 4, z);
  }

  let cup_indices = [];

  // outside wall
  // this runs for half of the points (for the bottom ones only)
  for (let i = 0; i < num_pts; i++) {
    let belowNext = i + 1;
    let aboveNext = i + num_pts + 1;

    if (i == num_pts - 1) {
      belowNext = 0;
      aboveNext = num_pts;
    }

    // triangle contains this point, the point next to it, and the point above it
    cup_indices.push(i, belowNext, i + num_pts);
    // triangle contains the next point, the point above the next point, and the point above this point
    cup_indices.push(belowNext, aboveNext, i + num_pts);
  }

  // inside wall
  // this runs for half of the points (for the bottom ones only)
  for (let i = 2*num_pts; i < 3*num_pts; i++) {
    let belowNext = i + 1;
    let aboveNext = i + num_pts + 1;

    if (i == 3*num_pts - 1) {
      belowNext = 2*num_pts;
      aboveNext = 3*num_pts;
    }

    // triangle contains this point, the point next to it, and the point above it
    cup_indices.push(i, belowNext, i + num_pts);
    // triangle contains the next point, the point above the next point, and the point above this point
    cup_indices.push(belowNext, aboveNext, i + num_pts);
  }

  // create triangles at top
  for(let i = num_pts; i < 2*num_pts; i++) {
    let outNext = i + 1;
    let inNext = i + 2*num_pts + 1;

    if (i == 2*num_pts - 1) {
      outNext = num_pts;
      inNext = num_pts + 2*num_pts;
    }

    // triangle contains this point, and the point next to it, the point inside of it
    cup_indices.push(i, outNext, i + 2*num_pts);
    // triangle contains the next point, the point inside of the next point, and the point inside of this point
    cup_indices.push(outNext, inNext, i + 2*num_pts);
  }

  // create cup bottom
  for(let i = 0; i < num_pts; i++) {
    cup_indices.push(i, 0, (i + 1) % num_pts);
  }

  cup_geom.setIndex(cup_indices);
  cup_geom.setAttribute(
    "position",
    new T.Float32BufferAttribute(cup_pts, 3)
  );

  // compute normals
  cup_geom.computeVertexNormals();

  let cup_mat = new T.MeshStandardMaterial({
    color: color,
    metalness: 0.5,
    roughness: 0.5,
    side: T.DoubleSide
  });
  let cup = new T.Mesh(cup_geom, cup_mat);
  teacup.add(cup);

  // add handle
  let handle_geom = new T.TorusGeometry(1.2, 0.4, 16, 100, 10*Math.PI/9); // Partial torus with half-circle
  let handle_mat = new T.MeshStandardMaterial({
    color: color,
    metalness: 0.5,
    roughness: 0.5,
  });
  let handle = new T.Mesh(handle_geom, handle_mat);
  handle.position.set(5, 2, -0.5); // Adjust position to attach to the cup
  handle.rotation.z = -6*Math.PI / 8; // Rotate to align with the cup
  teacup.add(handle);

  return teacup;
}

let simpleRoundaboutObCtr = 0;
// A simple merry-go-round.
/**
 * @typedef SimpleRoundaboutProperties
 * @type {object}
 * @property {number} [x=0]
 * @property {number} [y=0]
 * @property {number} [z=0]
 * @property {number} [size=1]
 */
export class GrSimpleRoundabout extends GrObject {
  /**
   * @param {SimpleRoundaboutProperties} params
   */
  constructor(params = {}) {
    let simpleRoundabout = new T.Group();

    let base_geom = new T.CylinderGeometry(0.5, 1, 0.5, 16);
    let base_mat = new T.MeshStandardMaterial({
      color: "#888888",
      metalness: 0.5,
      roughness: 0.8
    });
    let base = new T.Mesh(base_geom, base_mat);
    base.translateY(0.25);
    simpleRoundabout.add(base);

    let platform_geom = new T.CylinderGeometry(2, 1.8, 0.3, 8, 4);
    let platform_mat = new T.MeshStandardMaterial({
      color: "blue",
      metalness: 0.3,
      roughness: 0.6
    });

    let platform_group = new T.Group();
    base.add(platform_group);
    platform_group.translateY(0.25);
    let platform = new T.Mesh(platform_geom, platform_mat);
    platform_group.add(platform);

    // note that we have to make the Object3D before we can call
    // super and we have to call super before we can use this
    super(`SimpleRoundabout-${simpleRoundaboutObCtr++}`, simpleRoundabout);
    this.whole_ob = simpleRoundabout;
    this.platform = platform_group;

    // put the object in its place
    this.whole_ob.position.x = params.x ? Number(params.x) : 0;
    this.whole_ob.position.y = params.y ? Number(params.y) : 0;
    this.whole_ob.position.z = params.z ? Number(params.z) : 0;
    let scale = params.size ? Number(params.size) : 1;
    simpleRoundabout.scale.set(scale, scale, scale);
  }
  /**
   * StepWorld method
   * @param {*} delta 
   * @param {*} timeOfDay 
   */
  stepWorld(delta, timeOfDay) {
    this.platform.rotateY(0.005 * delta);
  }

}

let roundaboutObCtr = 0;
// A colorful merry-go-round, with handles and differently-colored sections.
/**
 * @typedef ColoredRoundaboutProperties
 * @type {object}
 * @property {number} [x=0]
 * @property {number} [y=0]
 * @property {number} [z=0]
 * @property {number} [size=1]
 */
export class GrColoredRoundabout extends GrObject {
  /**
   * @param {ColoredRoundaboutProperties} params
   */
  constructor(params = {}) {
    let roundabout = new T.Group();

    let base_geom = new T.CylinderGeometry(0.5, 1, 0.5, 16);
    let base_mat = new T.MeshStandardMaterial({
      color: "#888888",
      metalness: 0.5,
      roughness: 0.8
    });
    let base = new T.Mesh(base_geom, base_mat);
    base.translateY(0.25);
    roundabout.add(base);

    let platform_group = new T.Group();
    base.add(platform_group);
    platform_group.translateY(0.25);

    let section_geom = new T.CylinderGeometry(
      2,
      1.8,
      0.3,
      8,
      4,
      false,
      0,
      Math.PI / 2
    );
    let section_mat;
    let section;

    let handle_geom = buildHandle();
    let handle_mat = new T.MeshStandardMaterial({
      color: "#999999",
      metalness: 0.8,
      roughness: 0.2
    });
    let handle;

    // in the loop below, we add four differently-colored sections, with handles,
    // all as part of the platform group.
    let section_colors = ["red", "blue", "yellow", "green"];
    for (let i = 0; i < section_colors.length; i++) {
      section_mat = new T.MeshStandardMaterial({
        color: section_colors[i],
        metalness: 0.3,
        roughness: 0.6
      });
      section = new T.Mesh(section_geom, section_mat);
      handle = new T.Mesh(handle_geom, handle_mat);
      section.add(handle);
      handle.rotation.set(0, Math.PI / 4, 0);
      handle.translateZ(1.5);
      platform_group.add(section);
      section.rotateY((i * Math.PI) / 2);
    }

    // note that we have to make the Object3D before we can call
    // super and we have to call super before we can use this
    super(`Roundabout-${roundaboutObCtr++}`, roundabout);
    this.whole_ob = roundabout;
    this.platform = platform_group;

    // put the object in its place
    this.whole_ob.position.x = params.x ? Number(params.x) : 0;
    this.whole_ob.position.y = params.y ? Number(params.y) : 0;
    this.whole_ob.position.z = params.z ? Number(params.z) : 0;
    let scale = params.size ? Number(params.size) : 1;
    roundabout.scale.set(scale, scale, scale);

    // This helper function defines a curve for the merry-go-round's handles,
    // then extrudes a tube along the curve to make the actual handle geometry.
    function buildHandle() {
      /**@type THREE.CurvePath */
      let handle_curve = new T.CurvePath();
      handle_curve.add(
        new T.LineCurve3(new T.Vector3(-0.5, 0, 0), new T.Vector3(-0.5, 0.8, 0))
      );
      handle_curve.add(
        new T.CubicBezierCurve3(
          new T.Vector3(-0.5, 0.8, 0),
          new T.Vector3(-0.5, 1, 0),
          new T.Vector3(0.5, 1, 0),
          new T.Vector3(0.5, 0.8, 0)
        )
      );
      handle_curve.add(
        new T.LineCurve3(new T.Vector3(0.5, 0.8, 0), new T.Vector3(0.5, 0, 0))
      );
      return new T.TubeGeometry(handle_curve, 64, 0.1, 8);
    }
  }
  /**
   * StepWorld Method
   * @param {*} delta 
   * @param {*} timeOfDay 
   */
  stepWorld(delta, timeOfDay) {
    this.platform.rotateY(0.005 * delta);
  }


}

let simpleSwingObCtr = 0;

// A basic, one-seat swingset.
/**
 * @typedef SimpleSwingProperties
 * @type {object}
 * @property {number} [x=0]
 * @property {number} [y=0]
 * @property {number} [z=0]
 * @property {number} [size=1]
 */
export class GrSimpleSwing extends GrObject {
  /**
   * @param {SimpleSwingProperties} params
   */
  constructor(params = {}) {
    let simpleSwing = new T.Group();
    addPosts(simpleSwing);

    // Here, we create a "hanger" group, which the swing chains will hang from.
    // The "chains" for the simple swing are just a couple thin cylinders.
    let hanger = new T.Group();
    simpleSwing.add(hanger);
    hanger.translateY(1.8);
    let chain_geom = new T.CylinderGeometry(0.05, 0.05, 1.4);
    let chain_mat = new T.MeshStandardMaterial({
      color: "#777777",
      metalness: 0.8,
      roughness: 0.2
    });
    let l_chain = new T.Mesh(chain_geom, chain_mat);
    let r_chain = new T.Mesh(chain_geom, chain_mat);
    hanger.add(l_chain);
    hanger.add(r_chain);
    l_chain.translateY(-0.75);
    l_chain.translateZ(0.4);
    r_chain.translateY(-0.75);
    r_chain.translateZ(-0.4);

    let seat_group = new T.Group();
    let seat_geom = new T.BoxGeometry(0.4, 0.1, 1);
    let seat_mat = new T.MeshStandardMaterial({
      color: "#554433",
      metalness: 0.1,
      roughness: 0.6
    });
    let seat = new T.Mesh(seat_geom, seat_mat);
    seat_group.add(seat);
    seat_group.position.set(0, -1.45, 0);
    hanger.add(seat_group);

    // note that we have to make the Object3D before we can call
    // super and we have to call super before we can use this
    super(`SimpleSwing-${simpleSwingObCtr++}`, simpleSwing);
    this.whole_ob = simpleSwing;
    this.hanger = hanger;
    this.seat = seat_group;

    // put the object in its place
    this.whole_ob.position.x = params.x ? Number(params.x) : 0;
    this.whole_ob.position.y = params.y ? Number(params.y) : 0;
    this.whole_ob.position.z = params.z ? Number(params.z) : 0;
    let scale = params.size ? Number(params.size) : 1;
    simpleSwing.scale.set(scale, scale, scale);

    this.swing_max_rotation = Math.PI / 4;
    this.swing_direction = 1;

    // This helper function creates the 5 posts for a swingset frame,
    // and positions them appropriately.
    function addPosts(group) {
      let post_material = new T.MeshStandardMaterial({
        color: "red",
        metalness: 0.6,
        roughness: 0.5
      });
      let post_geom = new T.CylinderGeometry(0.1, 0.1, 2, 16);
      let flPost = new T.Mesh(post_geom, post_material);
      group.add(flPost);
      flPost.position.set(0.4, 0.9, 0.9);
      flPost.rotateZ(Math.PI / 8);
      let blPost = new T.Mesh(post_geom, post_material);
      group.add(blPost);
      blPost.position.set(-0.4, 0.9, 0.9);
      blPost.rotateZ(-Math.PI / 8);
      let frPost = new T.Mesh(post_geom, post_material);
      group.add(frPost);
      frPost.position.set(0.4, 0.9, -0.9);
      frPost.rotateZ(Math.PI / 8);
      let brPost = new T.Mesh(post_geom, post_material);
      group.add(brPost);
      brPost.position.set(-0.4, 0.9, -0.9);
      brPost.rotateZ(-Math.PI / 8);
      let topPost = new T.Mesh(post_geom, post_material);
      group.add(topPost);
      topPost.position.set(0, 1.8, 0);
      topPost.rotateX(-Math.PI / 2);
    }
  }
  /* stepWorld method - make the swing swing! */
    stepWorld(delta, timeOfDay) {
        // if we swing too far forward or too far backward, switch directions.
        if (this.hanger.rotation.z >= this.swing_max_rotation)
            this.swing_direction = -1;
        else if (this.hanger.rotation.z <= -this.swing_max_rotation)
            this.swing_direction = 1;
        this.hanger.rotation.z += this.swing_direction * 0.003 * delta;
    }

}

let swingObCtr = 0;

// A more complicated, one-seat swingset.
// This one has actual chain links for its chains,
// and uses a nicer animation to give a more physically-plausible motion.
/**
 * @typedef AdvancedSwingProperties
 * @type {object}
 * @property {number} [x=0]
 * @property {number} [y=0]
 * @property {number} [z=0]
 * @property {number} [size=1]
 */
export class GrAdvancedSwing extends GrObject {
  /**
   * @param {AdvancedSwingProperties} params
   */
  constructor(params = {}) {
    let swing = new T.Group();
    addPosts(swing);

    let hanger = new T.Group();
    swing.add(hanger);
    hanger.translateY(1.8);
    let l_chain = new T.Group();
    let r_chain = new T.Group();
    hanger.add(l_chain);
    hanger.add(r_chain);
    // after creating chain groups, call the function to add chain links.
    growChain(l_chain, 20);
    growChain(r_chain, 20);
    l_chain.translateZ(0.4);
    r_chain.translateZ(-0.4);

    let seat_group = new T.Group();
    let seat_geom = new T.BoxGeometry(0.4, 0.1, 1);
    let seat_mat = new T.MeshStandardMaterial({
      color: "#554433",
      metalness: 0.1,
      roughness: 0.6
    });
    let seat = new T.Mesh(seat_geom, seat_mat);
    seat_group.add(seat);
    seat_group.position.set(0, -1.45, 0);
    hanger.add(seat_group);

    // note that we have to make the Object3D before we can call
    // super and we have to call super before we can use this
    super(`Swing-${swingObCtr++}`, swing);
    this.whole_ob = swing;
    this.hanger = hanger;
    this.seat = seat_group;

    // put the object in its place
    this.whole_ob.position.x = params.x ? Number(params.x) : 0;
    this.whole_ob.position.y = params.y ? Number(params.y) : 0;
    this.whole_ob.position.z = params.z ? Number(params.z) : 0;
    let scale = params.size ? Number(params.size) : 1;
    swing.scale.set(scale, scale, scale);

    this.swing_angle = 0;

    // This helper function creates the 5 posts for a swingset frame,
    // and positions them appropriately.
    function addPosts(group) {
      let post_material = new T.MeshStandardMaterial({
        color: "red",
        metalness: 0.6,
        roughness: 0.5
      });
      let post_geom = new T.CylinderGeometry(0.1, 0.1, 2, 16);
      let flPost = new T.Mesh(post_geom, post_material);
      group.add(flPost);
      flPost.position.set(0.4, 0.9, 0.9);
      flPost.rotateZ(Math.PI / 8);
      let blPost = new T.Mesh(post_geom, post_material);
      group.add(blPost);
      blPost.position.set(-0.4, 0.9, 0.9);
      blPost.rotateZ(-Math.PI / 8);
      let frPost = new T.Mesh(post_geom, post_material);
      group.add(frPost);
      frPost.position.set(0.4, 0.9, -0.9);
      frPost.rotateZ(Math.PI / 8);
      let brPost = new T.Mesh(post_geom, post_material);
      group.add(brPost);
      brPost.position.set(-0.4, 0.9, -0.9);
      brPost.rotateZ(-Math.PI / 8);
      let topPost = new T.Mesh(post_geom, post_material);
      group.add(topPost);
      topPost.position.set(0, 1.8, 0);
      topPost.rotateX(-Math.PI / 2);
    }

    // Helper function to add "length" number of links to a chain.
    function growChain(group, length) {
      let chain_geom = new T.TorusGeometry(0.05, 0.015);
      let chain_mat = new T.MeshStandardMaterial({
        color: "#777777",
        metalness: 0.8,
        roughness: 0.2
      });
      let link = new T.Mesh(chain_geom, chain_mat);
      group.add(link);
      for (let i = 0; i < length; i++) {
        let l_next = new T.Mesh(chain_geom, chain_mat);
        l_next.translateY(-0.07);
        link.add(l_next);
        l_next.rotation.set(0, Math.PI / 3, 0);
        link = l_next;
      }
    }
  }
  /**
   * StepWorld method
   * @param {*} delta 
   * @param {*} timeOfDay 
   */
  stepWorld(delta, timeOfDay) {
    // in this animation, use the sine of the accumulated angle to set current rotation.
    // This means the swing moves faster as it reaches the bottom of a swing,
    // and faster at either end of the swing, like a pendulum should.
    this.swing_angle += 0.005 * delta;
    this.hanger.rotation.z = (Math.sin(this.swing_angle) * Math.PI) / 4;
    this.seat.rotation.z = (Math.sin(this.swing_angle) * Math.PI) / 16;
  }

}


let carouselObCtr = 0;
// A Carousel.
/**
 * @typedef CarouselProperties
 * @type {object}
 * @property {number} [x=0]
 * @property {number} [y=0]
 * @property {number} [z=0]
 * @property {number} [size=1]
 */
export class GrCarousel extends GrObject {
  /**
   * @param {CarouselProperties} params
   */
  constructor(params = {}) {
    let width = 3;
    let carousel = new T.Group();

    let base_geom = new T.CylinderGeometry(width, width, 1, 32);
    let base_mat = new T.MeshStandardMaterial({
      color: "lightblue",
      metalness: 0.3,
      roughness: 0.8
    });
    let base = new T.Mesh(base_geom, base_mat);
    base.translateY(0.5);
    carousel.add(base);

    let platform_group = new T.Group();
    base.add(platform_group);
    platform_group.translateY(0.5);

    let platform_geom = new T.CylinderGeometry(
      0.95 * width,
      0.95 * width,
      0.2,
      32
    );
    let platform_mat = new T.MeshStandardMaterial({
      color: "gold",
      metalness: 0.3,
      roughness: 0.8
    });
    let platform = new T.Mesh(platform_geom, platform_mat);
    platform_group.add(platform);

    let cpole_geom = new T.CylinderGeometry(0.3 * width, 0.3 * width, 3, 16);
    let cpole_mat = new T.MeshStandardMaterial({
      color: "gold",
      metalness: 0.8,
      roughness: 0.5
    });
    let cpole = new T.Mesh(cpole_geom, cpole_mat);
    platform_group.add(cpole);
    cpole.translateY(1.5);

    let top_trim = new T.Mesh(platform_geom, platform_mat);
    platform_group.add(top_trim);
    top_trim.translateY(3);

    let opole_geom = new T.CylinderGeometry(0.03 * width, 0.03 * width, 3, 16);
    let opole_mat = new T.MeshStandardMaterial({
      color: "#aaaaaa",
      metalness: 0.8,
      roughness: 0.5
    });
    let opole;
    let num_poles = 10;
    let poles = [];
    let horses = [];
    let directions = [];
    for (let i = 0; i < num_poles; i++) {
      opole = new T.Mesh(opole_geom, opole_mat);
      platform_group.add(opole);
      opole.translateY(1.5);
      opole.rotateY((2 * i * Math.PI) / num_poles);
      opole.translateX(0.8 * width);
      poles.push(opole);

      // create "horse" for the pole with a cube
      let horse_geom = new T.BoxGeometry(0.3, 0.3, 0.4);
      let horse_mat = new T.MeshStandardMaterial({
        color: "red",
        metalness: 0.5,
        roughness: 0.8
      });
      let horse = new T.Mesh(horse_geom, horse_mat);
      opole.add(horse);
      horse.translateY(0.1*i);
      horses.push(horse);
      directions.push(1);
    }

    let roof_geom = new T.ConeGeometry(width, 0.5 * width, 32, 4);
    let roof = new T.Mesh(roof_geom, base_mat);
    carousel.add(roof);
    roof.translateY(4.8);

    // note that we have to make the Object3D before we can call
    // super and we have to call super before we can use this
    super(`Carousel-${carouselObCtr++}`, carousel);
    this.whole_ob = carousel;
    this.platform = platform;
    this.poles = poles;
    this.horses = horses;
    this.directions = directions;

    // create camera
    this.camera = new T.PerspectiveCamera(
      45, // fov
      4/3, // aspect
      1, // near
      100 // far
    );

    // put the object in its place
    this.whole_ob.position.x = params.x ? Number(params.x) : 0;
    this.whole_ob.position.y = params.y ? Number(params.y) : 0;
    this.whole_ob.position.z = params.z ? Number(params.z) : 0;
    let scale = params.size ? Number(params.size) : 1;
    carousel.scale.set(scale, scale, scale);
  }

  getCamera() {
    return this.camera;
  }

  /**
   * StepWorld method
   * @param {*} delta 
   * @param {*} timeOfDay 
   */
  stepWorld(delta, timeOfDay) {
    // make the carousel rotate
    this.whole_ob.rotateY(0.002 * delta);
    // make the horses move up and down
    for (let i = 0; i < this.poles.length; i++) {
      let horse = this.horses[i];
      
      if (horse.position.y > 1) {
        this.directions[i] = -1;
      } else if (horse.position.y < -1) {
        this.directions[i] = 1;
      }
      
      horse.position.y += 0.001 * this.directions[i] * delta;
    }

    // get a horse
    let horse = this.horses[0];
    // get the position of the horse
    let pos = horse.getWorldPosition(new T.Vector3());
    // get the direction the horse is facing
    let dir = horse.getWorldDirection(new T.Vector3()); 

    // set the camera position
    let pos2 = new T.Vector3(pos.x, pos.y + 1, pos.z + 2);
    this.camera.position.copy(pos2);
    this.camera.lookAt(dir);
  }
}

let carouselHorseObCtr = 0;
// A Carousel.
/**
 * @typedef CarouselHorseProperties
 * @type {object}
 * @property {number} [x=0]
 * @property {number} [y=0]
 * @property {number} [z=0]
 * @property {number} [size=1]
 */
export class GrCarouselHorse extends GrObject {
  /**
   * @param {CarouselHorseProperties} params
   */
  constructor(params = {}) {
    let width = 3;
    let carousel = new T.Group();

    let base_geom = new T.CylinderGeometry(width, width, 1, 32);
    let base_mat = new T.MeshStandardMaterial({
      color: "rgb(88, 97, 252)",
      metalness: 0.5,
      roughness: 0.5
    });
    let base = new T.Mesh(base_geom, base_mat);
    base.translateY(0.5);
    carousel.add(base);

    let platform_group = new T.Group();
    base.add(platform_group);
    platform_group.translateY(0.5);

    let platform_geom = new T.CylinderGeometry(
      0.95 * width,
      0.95 * width,
      0.2,
      32
    );
    let platform_mat = new T.MeshStandardMaterial({
      color: "rgb(250, 130, 202)",
      metalness: 0.3,
      roughness: 0.8
    });
    let platform = new T.Mesh(platform_geom, platform_mat);
    platform_group.add(platform);

    let cpole_geom = new T.CylinderGeometry(0.3 * width, 0.3 * width, 3, 16);
    let cpole_mat = new T.MeshStandardMaterial({
      color: "rgb(218, 192, 250)",
      metalness: 0.0,
      roughness: 0.1
    });
    let cpole = new T.Mesh(cpole_geom, cpole_mat);
    platform_group.add(cpole);
    cpole.translateY(1.5);

    let top_trim = new T.Mesh(platform_geom, platform_mat);
    platform_group.add(top_trim);
    top_trim.translateY(3);

    let opole_geom = new T.CylinderGeometry(0.03 * width, 0.03 * width, 3, 16);
    let opole_mat = new T.MeshStandardMaterial({
      color: "rgb(200, 159, 252)",
      metalness: 0.8,
      roughness: 0.1,
      envMap: envMap
    });
    let opole;
    let num_poles = 10;
    let poles = [];
    let parkHorses = [];

    let directions = [];
    for (let i = 0; i < num_poles; i++) {
      opole = new T.Mesh(opole_geom, opole_mat);
      platform_group.add(opole);
      opole.translateY(1.5);
      opole.rotateY((2 * i * Math.PI) / num_poles);
      opole.translateX(0.8 * width);
      poles.push(opole);

      // create "horse" for the pole with a cube
      let horse_geom = new T.BoxGeometry(0.3, 0.3, 0.4);
      let horse_mat = new T.MeshStandardMaterial({
        color: "red",
        metalness: 0.5,
        roughness: 0.8
      });

      let horseGroup = new T.Group();
      let horsePlaceholder = new T.Mesh(horse_geom, horse_mat);
      horseGroup.add(horsePlaceholder);
      opole.add(horseGroup);
      horsePlaceholder.translateY(0.1*i);
      parkHorses.push(horseGroup);

      directions.push(1);
    }

    let roof_geom = new T.ConeGeometry(width, 0.5 * width, 32, 4);
    let roof = new T.Mesh(roof_geom, base_mat);
    carousel.add(roof);
    roof.translateY(4.8);

    // note that we have to make the Object3D before we can call
    // super and we have to call super before we can use this
    super(`CarouselHorse-${++carouselHorseObCtr}`, carousel);
    this.whole_ob = carousel;
    this.platform = platform;
    this.poles = poles;
    this.parkHorses = parkHorses;
    this.directions = directions;

    // create camera
    this.camera = new T.PerspectiveCamera(
      45, // fov
      4/3, // aspect
      0.1, // near
      100 // far
    );
    parkHorses[0].add(this.camera);
    this.camera.position.set(0.35, 1.4, 0.15);

    // put the object in its place
    this.whole_ob.position.x = params.x ? Number(params.x) : 0;
    this.whole_ob.position.y = params.y ? Number(params.y) : 0;
    this.whole_ob.position.z = params.z ? Number(params.z) : 0;
    let scale = params.size ? Number(params.size) : 1;
    carousel.scale.set(scale, scale, scale);

    // make the carousel rideable for the UI
    this.rideable = parkHorses[0];
  }

  getCamera() {
    return this.camera;
  }

  addHorse(horseObj) {
    for (let i = 0; i < this.poles.length; i++) {
      let horseGroup = this.parkHorses[i];
      let horsePlaceholder = horseGroup.children[0];
      let directions = this.directions;
  
      // Clone the horse object for each pole
      let clonedHorse = horseObj.clone();
      clonedHorse.position.set(0, 0, 0);
      clonedHorse.scale.set(1 / 10, 1 / 10, 1 / 10);
      clonedHorse.rotateX(-Math.PI / 2);
      clonedHorse.rotateZ(8 * Math.PI / 7);
  
      let color;
      if (i % 2 == 0) {
        color = "rgb(120, 255, 172)";
        directions[i] = 1;
        horseGroup.position.y = 0;
      } else {
        color = "rgb(136, 215, 252)";
        directions[i] = -1;
        horseGroup.position.y = -1;
      }
  
      // Traverse the cloned horse object and set the material color
      clonedHorse.traverse(function (child) {
        if (child instanceof T.Mesh) {
          child.material = new T.MeshStandardMaterial({
            color: color,
            metalness: 0.5,
            roughness: 0.1
          });
        }
      });
  
      horseGroup.remove(horsePlaceholder);
      horseGroup.add(clonedHorse);
      horseGroup.position.x = -0.2;
      horseGroup.position.z = -1;
    }
  }

  /**
   * StepWorld method
   * @param {*} delta 
   * @param {*} timeOfDay 
   */
  stepWorld(delta, timeOfDay) {
    // make the carousel rotate
    this.whole_ob.rotateY(0.002 * delta);
    // make the horses move up and down
    for (let i = 0; i < this.poles.length; i++) {
      let horse = this.parkHorses[i];
      
      if (horse.position.y > 0) {
        this.directions[i] = -1;
        horse.position.y = 0;
      } else if (horse.position.y < -1) {
        this.directions[i] = 1;
        horse.position.y = -1;
      }
      
      horse.position.y += 0.0008 * this.directions[i] * delta;
    }

    // get a horse
    let horse = this.parkHorses[2];

    // get the horse's world position
    let horseWorldPos = new T.Vector3();
    horse.getWorldPosition(horseWorldPos);

    // look at this horse
    this.camera.lookAt(horseWorldPos);
  }
}

let snowCount = 0;

/**
 * A bouncing snowman
 *
 * Every second, the snowman "jumps" up.
 * Based on simplebounder
 */
export class Snowman extends GrObject {
  /**
   *
   */
  constructor(params = {}) {
    let x = params.x ? Number(params.x) : 0;
    let y = params.y ? Number(params.y) : 0;
    let z = params.z ? Number(params.z) : 0;

    let snowman = drawSnowman(x, y, z, 0.5);
    super(`snowman-${snowCount++}`, snowman);
    this.time = 0;
    this.snowman = snowman;
  }
  /**
   * The jumping behavior.
   *
   * Note how we keep track of time (advancing our internal clock based on the step).
   *
   * Time is used to do something each second (remember step is in milliseconds).
   * First, we wait for 1/10 of a second
   * Then, we jump up with a parabola
   * Then, we wait for 1/10 of a second
   *
   * Note that no matter what the time is, we set the animated variable appropriately
   *
   * The y=.5 minimum is because the cube has size 1, and we want it to sit on the ground
   * at the bottom of the jump
   *
   * @param {Number} step
   * @param {Number} [timeOfDay]
   */
   stepWorld(step, timeOfDay) {
    this.time += step / 1000; // time in seconds
    // set the y position based on the time
    let t = this.time % 1; // where are we in the cycle?

    if (t < 0.1 || t > 0.9) this.snowman.position.y = 0.5;
    else {
      this.snowman.position.y = 0.5 + 10 * (0.16 - (0.5 - t) * (0.5 - t));
    }
  }
}

function drawSnowman(x = 0, y=0, z=0, scale=1) {
  // ******************* SNOWMAN BASE ***********************
  let snowman = new T.Group();

  // sphere geometry and material
  let sphere = new T.SphereGeometry(1, 10, 20);
  let snowMesh = new T.MeshStandardMaterial({ color: "white", roughness: 1 });

  // create the snowman's body parts
  let bottom = new T.Mesh(sphere, snowMesh);

  let middle = new T.Mesh(sphere, snowMesh);
  middle.scale.set(0.7, 0.7, 0.7);

  let top = new T.Mesh(sphere, snowMesh);
  top.scale.set(0.5, 0.5, 0.5);

  // position the snowman's body parts
  bottom.position.set(0, 1, 0);
  middle.position.set(0, 2.2, 0);
  top.position.set(0, 3.2, 0);

  snowman.add(bottom);
  snowman.add(middle);
  snowman.add(top);

  // ******************* SNOWMAN EYES ***********************
  let coal = new T.SphereGeometry(0.15, 10, 10);
  let coalMesh = new T.MeshStandardMaterial({ color: "black" });
  let leftEye = new T.Mesh(coal, coalMesh);
  let rightEye = new T.Mesh(coal, coalMesh);

  top.add(leftEye);
  top.add(rightEye);

  leftEye.translateX(0.4);
  leftEye.translateY(0.4);
  leftEye.translateZ(0.8);

  rightEye.translateX(-0.4);
  rightEye.translateY(0.4);
  rightEye.translateZ(0.8);

  // ******************* SNOWMAN NOSE ***********************
  let cone = new T.ConeGeometry(0.3, 1, 20);
  let noseMesh = new T.MeshStandardMaterial({ color: "orange" });
  let nose = new T.Mesh(cone, noseMesh);

  top.add(nose);
  nose.translateZ(1);
  nose.translateY(0.1);
  nose.rotateX(Math.PI / 2);

  // ******************* SNOWMAN MOUTH ***********************
  let m1 = new T.Mesh(coal, coalMesh);
  let m2 = new T.Mesh(coal, coalMesh);
  let m3 = new T.Mesh(coal, coalMesh);
  let m4 = new T.Mesh(coal, coalMesh);
  let m5 = new T.Mesh(coal, coalMesh);

  top.add(m1);
  top.add(m2);
  top.add(m3);
  top.add(m4);
  top.add(m5);

  m1.translateX(-0.3);
  m1.translateY(-0.1);
  m1.translateZ(0.8);

  m2.translateX(-0.2);
  m2.translateY(-0.2);
  m2.translateZ(0.8);

  m3.translateX(0);
  m3.translateY(-0.3);
  m3.translateZ(0.8);

  m4.translateX(0.2);
  m4.translateY(-0.2);
  m4.translateZ(0.8);

  m5.translateX(0.3);
  m5.translateY(-0.1);
  m5.translateZ(0.8);

  // ******************* SNOWMAN SCARF ***********************
  let scarfGeo = new T.CylinderGeometry(0.5, 1, 1, 20);
  let scarfMesh = new T.MeshStandardMaterial({ color: "red" });
  let scarf = new T.Mesh(scarfGeo, scarfMesh);

  top.add(scarf);
  scarf.translateY(-0.5);

  // position the snowman
  snowman.position.set(x, y, z);
  // scale the snowman
  snowman.scale.set(scale, scale, scale);

  return snowman;
}