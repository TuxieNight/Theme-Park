import * as T from "../libs/CS559-Three/build/three.module.js";
import { GrObject } from "../libs/CS559-Framework/GrObject.js";

let straightPathCtr = 0;
/**
 * Draws a straight path along the x-axis.
 * @param {number} lengthX - The length of the path.
 * @param {number} height - The height of the path.
 * @param {number} lengthZ - The width of the path.
 */
class HorizontalStraightPath extends GrObject {
  constructor(lengthX, height, lengthZ, pathMat) {

    let pathGeo = new T.BoxGeometry(lengthX, height, lengthZ);

    let path = new T.Mesh(pathGeo, pathMat);

    super("StraightPath-" + (++straightPathCtr), path);
  }
}

/**
 * Draws a straight path along the z-axis.
 * @param {number} lengthX - The length of the path.
 * @param {number} height - The height of the path.
 * @param {number} lengthZ - The width of the path.
 */
class VerticalStraightPath extends HorizontalStraightPath {
  constructor(lengthX, height, lengthZ, texture) {
    let path = super(lengthX, height, lengthZ, texture);
    path.objects[0].rotation.y = Math.PI / 2; // Rotate 90 degrees around y-axis
  }
}

let cornerPathCtr = 0;
/**
 * Draws a corner path consisting of two straight paths.
 * @param {number} lengthXFirst - The length of the first path.
 * @param {number} lengthXSecond - The length of the second path.
 * @param {number} height - The height of the paths.
 * @param {number} lengthZ - The width of the paths.
 */
class CornerPath extends GrObject {
  constructor(lengthXFirst, lengthXSecond, height, lengthZ, pathMat) {
    let path1 = new HorizontalStraightPath(lengthXFirst, height, lengthZ, pathMat);
    let path2 = new VerticalStraightPath(lengthXSecond, height, lengthZ, pathMat);

    path1.objects[0].position.set(-lengthXFirst/2 + lengthZ/2, 0, 0);
    path2.objects[0].position.set(0, 0, lengthXSecond/2 - lengthZ/2);

    let path = new T.Group();
    path.add(path1.objects[0]);
    path.add(path2.objects[0]);

    super("CornerPath-" + (++cornerPathCtr), path);
  }
}

let circularPathCtr = 0;
/**
 * Draws a circular path.
 * @param {number} radius - The radius of the circular path.
 * @param {number} height - The height of the path.
 * @param {number} arc - Determines how much of a circle to draw (default is 2 * PI).
 * */
class CircularPath extends GrObject {
  constructor(radius, height, arc = Math.PI*2, pathMat) {
    let path = drawCircle(radius, height/2, arc, pathMat);

    super("CircularPath-" + (++circularPathCtr), path);
  }
}

function drawCircle(radius, halfHeight, arc, material) {
  // create circle
  let path_geom = new T.BufferGeometry();
  let wheel_pts = [];
  let num_pts = 64;
  let uv_vals = [];

  const textureRepeats = 4; // Number of times the texture repeats around the circle

  let divider = num_pts - 1;

  // create outside circular right side
  for (let i = 0; i < num_pts; i++) {
    let theta = (arc)*(i/(divider)); // divide by num_pts - 1 so the final value gets the full arc
    let x = radius * Math.cos(theta);
    let z = radius * Math.sin(theta);
    wheel_pts.push(x, halfHeight, z);

    // Map UV coordinates based on angle and radius
    let u = (theta / (2 * Math.PI)) * textureRepeats;

    uv_vals.push(u, 0);
  }

  // create outside cicular left side
  for (let i = 0; i < num_pts; i++) {
    let theta = (arc)*(i/(divider));
    let x = radius * Math.cos(theta);
    let z = radius * Math.sin(theta);
    wheel_pts.push(x,-halfHeight, z);

    // Map UV coordinates based on angle and radius
    let u = (theta / (2 * Math.PI)) * textureRepeats;
    uv_vals.push(u, 0);
  }

  // create inside circular right side
  for (let i = 0; i < num_pts; i++) {
    let theta = (arc)*(i/(divider));
    let x = (4/5)*radius * Math.cos(theta);
    let z = (4/5)*radius * Math.sin(theta);
    wheel_pts.push(x, halfHeight, z);

    // Map UV coordinates based on angle and radius
    let u = (theta / (2 * Math.PI)) * textureRepeats;

    uv_vals.push(u, 1);
  }
  // create inside cicular left side
  for (let i = 0; i < num_pts; i++) {
    let theta = (arc)*(i/(divider));
    let x = (4/5)*radius * Math.cos(theta);
    let z = (4/5)*radius * Math.sin(theta);
    wheel_pts.push(x, -halfHeight, z);

    // Map UV coordinates based on angle and radius
    let u = (theta / (2 * Math.PI)) * textureRepeats;
    uv_vals.push(u, 1);
  }

  let path_indices = [];

  // this runs for half of the points (for the right ones only)
  for (let i = 0; i < num_pts; i++) {
    if (i == num_pts - 1) {
      if (arc != Math.PI*2) {
        // don't connect the ends if not a full circle
        break;
      }
    }

    // triangle contains this point, the point next to it, and the point to the left of it
    path_indices.push(i, (i + 1) % num_pts, i + num_pts);
    // traingle contains the next point, the point left of the next point, and the point left of this point
    path_indices.push((i + 1) % num_pts, (i + 1) % num_pts + num_pts, i + num_pts);
  }

  // outside wall
  // this runs for half of the points (for the right ones only)
  for (let i = 0; i < num_pts; i++) {
    let rightNext = i + 1;
    let leftNext = i + num_pts + 1;

    if (i == num_pts - 1) {
      if (arc != Math.PI*2) {
        // don't connect the ends if not a full circle
        break;
      }
      rightNext = 0;
      leftNext = num_pts;
    }

    // triangle contains this point, the point next to it, and the point left of it
    path_indices.push(i, rightNext, i + num_pts);
    // triangle contains the next point, the point left of the next point, and the point left of this point
    path_indices.push(rightNext, leftNext, i + num_pts);
  }

  // inside wall
  // this runs for half of the points (for the right ones only)
  for (let i = 2*num_pts; i < 3*num_pts; i++) {
    let rightNext = i + 1;
    let leftNext = i + num_pts + 1;

    if (i == 3*num_pts - 1) {
      if (arc != Math.PI*2) {
        // don't connect the ends if not a full circle
        break;
      }
      rightNext = 2*num_pts;
      leftNext = 3*num_pts;
    }

    // triangle contains this point, the point next to it, and the point left of it
    path_indices.push(rightNext, i, i + num_pts);
    // triangle contains the next point, the point left of the next point, and the point left of this point
    path_indices.push(leftNext, rightNext, i + num_pts);
  }

  // create triangles between the right inside and right outside
  for(let i = 0; i < num_pts; i++) {
    let outNext = i + 1;
    let inNext = i + 2*num_pts + 1;

    if (i == num_pts - 1) {
      if (arc != Math.PI*2) {
        // don't connect the ends if not a full circle
        break;
      }
      outNext = 0;
      inNext = 2*num_pts;
    }

    // triangle contains this point, and the point next to it, the point inside of it
    path_indices.push(outNext, i, i + 2*num_pts);
    // triangle contains the next point, the point inside of the next point, and the point inside of this point
    path_indices.push(inNext, outNext, i + 2*num_pts);
  }

  // create triangles at left inside and left outside
  for(let i = num_pts; i < 2*num_pts; i++) {
    let outNext = i + 1;
    let inNext = i + 2*num_pts + 1;

    if (i == 2*num_pts - 1) {
      if (arc != Math.PI*2) {
        // don't connect the ends if not a full circle
        break;
      }
      inNext = num_pts + 2*num_pts;
    }

    // triangle contains this point, and the point next to it, the point inside of it
    path_indices.push(i, outNext, i + 2*num_pts);
    // triangle contains the next point, the point inside of the next point, and the point inside of this point
    path_indices.push(outNext, inNext, i + 2*num_pts);
  }

  // cover ends if not full circle
  if (arc != Math.PI*2) {
    // FIRST END
    // triangle with right outer, left outer, right inner
    path_indices.push(0, num_pts, 2*num_pts);
    // triangle with left outer, left inner, right inner
    path_indices.push(num_pts, 3*num_pts, 2*num_pts);

    // SECOND END
    // triangle with right outer, left outer, right inner
    path_indices.push(num_pts - 1, 2*num_pts - 1, 3*num_pts - 1);
    // triangle with left outer, left inner, right inner
    path_indices.push(2*num_pts - 1, 4*num_pts - 1, 3*num_pts - 1);

  }

  path_geom.setIndex(path_indices);
  path_geom.setAttribute(
    "position",
    new T.Float32BufferAttribute(wheel_pts, 3)
  );

  path_geom.setAttribute(
    "uv",
    new T.Float32BufferAttribute(uv_vals, 2)
  );

  // compute normals
  path_geom.computeVertexNormals();

  let pathMesh = new T.Mesh(path_geom, material);

  return pathMesh;
}

export { CircularPath, HorizontalStraightPath, VerticalStraightPath, CornerPath };