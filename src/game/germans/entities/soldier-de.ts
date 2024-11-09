import * as YUKA from "yuka";
import * as THREE from "three";
import { AssetManager } from "../../core/asset-manager";
import { IdleGoalEvaluator } from "../goals/idle-goal-evaluator";

export class SoldierDE extends YUKA.Vehicle {
  brain: YUKA.Think<SoldierDE>;

  private mixer: THREE.AnimationMixer;
  private animations = new Map<string, THREE.AnimationAction>();
  private currentAction?: THREE.AnimationAction;

  constructor(
    public renderComponent: THREE.Object3D,
    private assetManager: AssetManager
  ) {
    super();

    // goals

    this.brain = new YUKA.Think(this);
    this.brain.addEvaluator(new IdleGoalEvaluator());

    // animations

    this.mixer = new THREE.AnimationMixer(this.renderComponent);
    this.setupAnimations();
  }

  override update(delta: number): this {
    super.update(delta);

    this.mixer.update(delta);

    // Update current goal
    this.brain.execute();

    // Check for better goals
    this.brain.arbitrate();

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

    nextAction.reset().setEffectiveTimeScale(1).setEffectiveWeight(1);

    this.currentAction
      ? nextAction.crossFadeFrom(this.currentAction, 0.5, false).play()
      : nextAction.play();

    this.currentAction = nextAction;
  }

  private setupAnimations() {
    const { animations } = this.assetManager;

    const rifleIdleClip = animations.get("rifle-idle-1");
    const rifleIdleAction = this.mixer.clipAction(rifleIdleClip);
    this.animations.set(rifleIdleClip.name, rifleIdleAction);
  }
}