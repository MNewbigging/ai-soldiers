import * as THREE from "three";
import GUI from "lil-gui";

export function addGui(object: THREE.Object3D, name = "") {
  const gui = new GUI();

  const curX = object.position.x;
  const curY = object.position.y;
  const curZ = object.position.z;
  const range = 10;
  const step = 0.1;

  gui.add(object.position, "x").name(name + " pos x").min(curX - range).max(curX + range).step(step);
  gui.add(object.position, "y").name(name + " pos y").min(curY - range).max(curY + range).step(step);
  gui.add(object.position, "z").name(name + " pos z").min(curZ - range).max(curZ + range).step(step);

  gui
    .add(object.rotation, "x")
    .name(name + " rot x")
    .min(-Math.PI)
    .max(Math.PI)
    .step(0.001);


  gui
    .add(object.rotation, "y")
    .name(name + " rot y")
    .min(-Math.PI)
    .max(Math.PI)
    .step(0.001);

  gui
    .add(object.rotation, "z")
    .name(name + " rot z")
    .min(-Math.PI)
    .max(Math.PI)
    .step(0.001);

  gui.add(object.scale, "x").name(name + " scale x");
}
