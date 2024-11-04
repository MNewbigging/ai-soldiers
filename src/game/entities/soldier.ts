import * as YUKA from "yuka";
import * as THREE from "three";
import { AssetManager } from "../asset-manager";

export class Soldier extends YUKA.Vehicle {
  private mixer: THREE.AnimationMixer;
  private animations = new Map<string, THREE.AnimationAction>();
  private currentAction?: THREE.AnimationAction;

  constructor(
    public renderComponent: THREE.Object3D,
    private assetManager: AssetManager
  ) {
    super();

    // animations

    this.mixer = new THREE.AnimationMixer(this.renderComponent);
    this.setupAnimations();

    // For now, play the rifle idle animation by default
    this.playAnimation("rifle-idle");
  }

  override update(delta: number): this {
    super.update(delta);

    this.mixer.update(delta);

    return this;
  }

  playAnimation(name: string) {
    const nextAction = this.animations.get(name);
    if (!nextAction) {
      throw Error(`Could not find animation with name ${name}`);
    }

    if (nextAction.getClip().name === this.currentAction?.getClip().name) {
      return;
    }

    nextAction.reset();

    this.currentAction
      ? nextAction.crossFadeFrom(this.currentAction, 0.5, false).play()
      : nextAction.play();

    this.currentAction = nextAction;
  }

  private setupAnimations() {
    const { animations } = this.assetManager;

    const rifleIdleClip = animations.get("rifle-idle");
    const rifleIdleAction = this.mixer.clipAction(rifleIdleClip);
    this.animations.set(rifleIdleClip.name, rifleIdleAction);
  }
}
