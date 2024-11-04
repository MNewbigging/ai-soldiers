import * as YUKA from 'yuka';
import * as THREE from 'three';

export class Soldier extends YUKA.Vehicle {
  private mixer: THREE.AnimationMixer;
  private animations = new Map<string, THREE.AnimationAction>();
  private currentAction?: THREE.AnimationAction;

  constructor(public renderComponent: THREE.Object3D) {
    super();

    this.mixer = new THREE.AnimationMixer(this.renderComponent);
  }

}