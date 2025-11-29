/*jshint esversion: 6 */
// @ts-check

/**
 * Graphics Town Framework - "Main" File
 *
 * This is the main file - it creates the world, populates it with
 * objects and behaviors, and starts things running
 *
 * The initial distributed version has a pretty empty world.
 * There are a few simple objects thrown in as examples.
 *
 * It is the students job to extend this by defining new object types
 * (in other files), then loading those files as modules, and using this
 * file to instantiate those objects in the world.
 */

import { GrWorld } from "../libs/CS559-Framework/GrWorld.js";
import { WorldUI } from "../libs/CS559-Framework/WorldUI.js";

import {
  GrCarouselHorse,
  GrTeacupRide,
  GrFerrisWheel
} from "./parkobjects.js";
import { AdmissionEntrance, CircusTent, CircusTentInside } from "./buildings.js";
import {Flag, HeartPond, WelcomeArch, Kite, CherryBlossomTree} from "./otherObjects.js";
import {GrCart, HotAirBalloon} from "./vehicles.js";

import { OBJLoader } from "../libs/CS559-Three/examples/jsm/loaders/OBJLoader.js";
import * as T from "../libs/CS559-Three/build/three.module.js";
import { OrbitControls } from "../libs/CS559-Three/examples/jsm/controls/OrbitControls.js";

import { CircularPath, HorizontalStraightPath, VerticalStraightPath, CornerPath } from "./paths.js";

// load textures
let textureLoader = new T.TextureLoader();

let balloonTexture = textureLoader.load("./textures/stripesHigherRes.png");
let welcomeTexture = textureLoader.load("./textures/welcome.png");

// set up paths
let pebblyBumpMap = textureLoader.load("./textures/pebblyBumpMap.png");
pebblyBumpMap.wrapS = pebblyBumpMap.wrapT = T.RepeatWrapping;
pebblyBumpMap.repeat.set(4, 1);

let pathColor = "rgb(252, 238, 197)";
let bumpScale = 2;
let widthEntrance = 20;

let pathMat = new T.MeshStandardMaterial({
      color: pathColor,
      metalness: 0.1,
      roughness: 0.8,
      bumpMap: pebblyBumpMap,
      bumpScale: bumpScale,
});

let waterNormalMap = textureLoader.load("./textures/waterNormalMap.jpg");

// load cubemap textures
let cubeTextureLoader = new T.CubeTextureLoader();

// https://www.freepik.com/free-photo/aerial-view-vang-vieng-with-mountains-balloon-sunset_13573490.htm#fromView=keyword&page=1&position=0&uuid=b6491b0f-2360-414f-80c4-71a5f2cae70c&query=Happy+Panorama
// tawatchai07
let cubemap = cubeTextureLoader.load([
    './textures/px(3).png', // positive x
    './textures/nx(3).png', // negative x
    './textures/py(3).png', // positive y
    './textures/ny(3).png', // negative y
    './textures/pz(3).png', // positive z
    './textures/nz(3).png'  // negative z
]);

let div = document.getElementById("div1");

/**
 * The Graphics Town Main -
 * This builds up the world and makes it go...
 */

// make the world
let world = new GrWorld({
    where: div,
    width: 800,
    height: 600,
    groundplanesize: 170, // make the ground plane big enough for a world of stuff
    background: "skyblue",
});

world.scene.background = cubemap;

// shift the ground so the objects are positioned differently relative to it
world.groundplane.objects[0].position.set(70, 0, 0);

///////////////////////////////////////////////////////////////
// because I did not store the objects I want to highlight in variables, I need to look them up by name
// This code is included since it might be useful if you want to highlight your objects here
function highlight(obName) {
    const toHighlight = world.objects.find(ob => ob.name === obName);
    if (toHighlight) {
        toHighlight.highlighted = true;
    } else {
        throw `no object named ${obName} for highlighting!`;
    }
}

let world_default_camera = world.camera;
// explicitly create orbit controls for the camera
let controls = new OrbitControls(world.camera, world.renderer.domElement);
controls.maxDistance = 10000;
controls.minDistance = -1;

document.addEventListener("keyup", (event) => {
  world.active_camera = world_default_camera;
});

world.groundplane.receiveShadow = true;

// create light above
let light = new T.DirectionalLight("white", 1);
light.position.set(0, 100, 0);
light.castShadow = true;
world.scene.add(light);

// create carousel
let carousel = new GrCarouselHorse();
world.add(carousel);

let loader = new OBJLoader();
loader.load("./objects/horse.obj", function(horseObj) {
  carousel.addHorse(horseObj);
  carousel.objects[0].position.set(-35, 0, 56);
  carousel.setScale(2);

  // get camera
  let carouselCam = carousel.getCamera();

  // if user clicks button w, switch to carousel camera
  document.addEventListener("keydown", (event) => {
    if (event.key === "c" || event.key === "C") {
      world.active_camera = carouselCam;
    }
  });
});

// create teacup ride
let teacup = new GrTeacupRide();
teacup.objects[0].position.set(35, 0.25, -56);
world.add(teacup);

// if user clicks button d, switch to teacup camera
document.addEventListener("keydown", (event) => {
  if (event.key === "t" || event.key === "T") {
    world.active_camera = teacup.getCamera();
  }
});

// create ferris wheel
let wheel = new GrFerrisWheel(cubemap);
wheel.objects[0].position.set(-70, 0, -20);
wheel.objects[0].rotation.set(0, Math.PI / 2, 0);
world.add(wheel);

// if user clicks button a, switch to ferris wheel camera
document.addEventListener("keydown", (event) => {
  if (event.key === "f" || event.key === "F") {
    world.active_camera = wheel.getCamera();
  }
});

// create circus tent
drawCircusTent(6, 0, 5.9, 0);

// create cart
let cart = new GrCart(cubemap);
cart.objects[0].position.set(10, 0, 15);
world.add(cart);

// create paths
drawPaths(30, 50, 0.25);

// create pond
let pond = new HeartPond(waterNormalMap, 30, 0.5);
pond.objects[0].position.set(110, 0.1, 0);
pond.objects[0].rotation.set(0, Math.PI/2, 0);
world.add(pond);

world.renderer.shadowMap.enabled = true;

// create admission entrance
drawAdmissionEntrance();

// create welcome arch
let welcomeArch = new WelcomeArch(cubemap, "blue", "rgb(152, 41, 255)", "rgb(255, 41, 149)", waterNormalMap, welcomeTexture);
welcomeArch.objects[0].position.set(100, 0, 0);
welcomeArch.objects[0].rotation.set(0, Math.PI/2, 0);
world.add(welcomeArch);

// create hot air balloon
let hotAirBalloon = new HotAirBalloon(balloonTexture, cubemap, 80);
hotAirBalloon.objects[0].position.x = 60; 
hotAirBalloon.objects[0].position.z = -100;
hotAirBalloon.objects[0].rotation.set(0, Math.PI/2, 0);
world.add(hotAirBalloon);

// add kite
let kite = new Kite(50, 100, 10, "red", "blue", "green", "yellow");
world.add(kite);

// add cherry trees
trees();

// highlight at least 2 objects made for this assignment
highlight("Flag-1");
highlight("AdmissionEntrance-1");
highlight("HeartPond-1");
highlight("CircularPath-1");
highlight("StraightPath-1");
highlight("WelcomeArch-1");
highlight("HotAirBalloon-1");
// highlight at least 5 objects of different types
highlight("FerrisWheel-1");
highlight("CarouselHorse-1");
highlight("Teacup-1");
highlight("CircusTent-1");
highlight("Cart-1");
highlight("Kite-1");

///////////////////////////////////////////////////////////////
// build and run the UI
// only after all the objects exist can we build the UI
// @ts-ignore       // we're sticking a new thing into the world
world.ui = new WorldUI(world);
// now make it go!
world.go();

function trees() {
  let positionsX = [-30, 50, 90, -70, -60, 80, 100];
  let positionsZ = [-110, 100, -90, -80, 120, 140, -100];

  for (let i = 0; i < 7; i++) {
    // get random number
    let sizeFraction = Math.random();
    let size = 7 + sizeFraction;

    let cherryBlossomTree = new CherryBlossomTree();
    cherryBlossomTree.objects[0].position.set(positionsX[i], 0, positionsZ[i]);
    cherryBlossomTree.objects[0].rotation.set(0, Math.PI/8 * i, 0);
    cherryBlossomTree.setScale(size, size, size);
    world.add(cherryBlossomTree);
  }
}

function drawAdmissionEntrance() {

  let firstColors = ["blue", "rgb(152, 41, 255)", "rgb(255, 41, 149)", "rgb(152, 41, 255)", "blue"];

  for (let i = 0; i < 5; i++) {
    let entrance = new AdmissionEntrance(widthEntrance, 10, firstColors[i], "white", "gold");
    entrance.objects[0].position.set(150, 0, i*widthEntrance*2 - 4*widthEntrance);
    entrance.objects[0].rotateY(Math.PI / 2);
    world.add(entrance);
  }
}

/**
 * Draw a circus tent in the world scaled by tentSize
 * @param {number} tentSize 
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */
function drawCircusTent(tentSize, x, y, z) {
    let tent = new CircusTent();
    let tentInside = new CircusTentInside(pathMat);

    tent.objects[0].position.set(x, y, z);
    tentInside.objects[0].position.set(x, y, z);
    tent.setScale(tentSize, tentSize, tentSize);
    tentInside.setScale(tentSize, tentSize, tentSize);
    world.add(tent);
    world.add(tentInside);

    // add flag
    let flag = new Flag(cubemap);
    flag.objects[0].position.set(x, -0.1, z);
    world.add(flag);
}

/**
 * Draws all of the paths in the world.
 * @param {*} radius the radius to use for the circular path
 * @param {*} length the length of the larger straight paths
 * @param {*} height the height of all paths
 */
function drawPaths(radius, length, height) {
  // create central path
  let pathAroundTent = new CircularPath(radius, height, Math.PI*2, pathMat);
  pathAroundTent.objects[0].position.set(0, 0.5, 0);
  world.add(pathAroundTent);

  // define distances
  let width = radius/5;
  let straightTentDist = length + width*(2/3);
  let cornerLength1 = length*(3/5);
  let cornerLength2 = length*(2/5);
  let cornerTentDist = radius + cornerLength1 - width*(2/3);

  // create paths out from central path
  let mainPathToFerrisWheel = new HorizontalStraightPath(length, height, width, pathMat);
  mainPathToFerrisWheel.objects[0].position.set(-straightTentDist, 0.5, 0);
  world.add(mainPathToFerrisWheel);

  let mainPathToEntrance = new HorizontalStraightPath(length, height, width, pathMat);
  mainPathToEntrance.objects[0].position.set(straightTentDist, 0.5, 0);
  world.add(mainPathToEntrance);

  let cornerPathToTeacup = new CornerPath(cornerLength1, cornerLength2, height, width, pathMat);
  cornerPathToTeacup.objects[0].position.set(0, 0.5, -cornerTentDist);
  cornerPathToTeacup.objects[0].rotation.y = Math.PI / 2;
  world.add(cornerPathToTeacup);

  let cornerPathToCarousel = new CornerPath(cornerLength1, cornerLength2, height, width, pathMat);
  cornerPathToCarousel.objects[0].position.set(0, 0.5, cornerTentDist);
  cornerPathToCarousel.objects[0].rotation.y = -Math.PI / 2;
  world.add(cornerPathToCarousel);

  // create paths around heart pond
  let heartPathDist = straightTentDist + (9/5)*radius;

  let halfCircleEntrance = new CircularPath(radius, height, Math.PI, pathMat);
  halfCircleEntrance.objects[0].position.set(heartPathDist, 0.5, 0);
  halfCircleEntrance.objects[0].rotation.y = -Math.PI / 2;
  world.add(halfCircleEntrance);

  let leftPathOffCircle = new HorizontalStraightPath(length/2, height, width, pathMat);
  leftPathOffCircle.objects[0].position.set(heartPathDist + length/4, 0.5, radius - radius/10);
  world.add(leftPathOffCircle);

  let rightPathOffCircle = new HorizontalStraightPath(length/2, height, width, pathMat);
  rightPathOffCircle.objects[0].position.set(heartPathDist + length/4, 0.5, -radius + radius/10);
  world.add(rightPathOffCircle);

  // create path connecting the ends of the heart pond straight paths
  let middlePath = new VerticalStraightPath(length*3.32, height, width, pathMat);
  middlePath.objects[0].position.set(heartPathDist + length/2, 0.5, 0);
  world.add(middlePath);

  // create paths between each entrance
  for (let i = 0; i < 5; i++) {  
    let entrancePath = new HorizontalStraightPath(length*2, height, width, pathMat);
    entrancePath.objects[0].position.set(heartPathDist + length*(3/2), 0.5, i*widthEntrance*2 - 4*widthEntrance);
    world.add(entrancePath);

    // add trees at entrance
    let treeScale = 7.5;
    let distBetweenTrees = 15;

    for (let j = 0; j < 5; j++) {
      let cherryBlossomTree1 = new CherryBlossomTree();
      cherryBlossomTree1.objects[0].position.set(heartPathDist + length*(3/2) - 2*width + j*distBetweenTrees, 0.5, i*widthEntrance*2 - 4*widthEntrance + 2*width);
      cherryBlossomTree1.setScale(treeScale, treeScale, treeScale);
      world.add(cherryBlossomTree1);
  
      let cherryBlossomTree2 = new CherryBlossomTree();
      cherryBlossomTree2.objects[0].position.set(heartPathDist + length*(3/2) - 2*width + j*distBetweenTrees, 0.5, i*widthEntrance*2 - 4*widthEntrance - 2*width);
      cherryBlossomTree2.setScale(treeScale, treeScale, treeScale);
      world.add(cherryBlossomTree2);
    }

  }

}
