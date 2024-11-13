import * as YUKA from "yuka";
import * as THREE from "three";
import { AssetManager } from "../../core/asset-manager";
import { IdleGoalEvaluator } from "../goals/idle/idle-goal-evaluator";
import { AimGoalEvaluator } from "../goals/aim/aim-goal-evaluator";
import { Target } from "../../core/target";

export class SoldierUS extends YUKA.Vehicle {
  brain: YUKA.Think<SoldierUS>;
  target?: YUKA.GameEntity;

  private mixer: THREE.AnimationMixer;
  private animations = new Map<string, THREE.AnimationAction>();
  private currentAction?: THREE.AnimationAction;
  private animationQueue: string[] = []; // names of anims to play in order

  constructor(
    public renderComponent: THREE.Object3D,
    private assetManager: AssetManager
  ) {
    super();

    // properties

    this.neighborhoodRadius = 7; // metres around entity which makes up the neighbourhood
    this.updateNeighborhood = true; // tells yuka to find neighbours within radius on update

    // goals

    this.brain = new YUKA.Think(this);
    this.brain.addEvaluator(new IdleGoalEvaluator());
    this.brain.addEvaluator(new AimGoalEvaluator());

    // animations

    this.mixer = new THREE.AnimationMixer(this.renderComponent);
    this.mixer.addEventListener("finished", this.onAnimationEnd);
    //this.mixer.addEventListener("loop", this.onAnimationLoop);
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
      ? nextAction.crossFadeFrom(this.currentAction, 0.25, false).play()
      : nextAction.play();

    this.currentAction = nextAction;
  }

  queueAnimation(name: string) {
    // Add to the queue
    this.animationQueue.push(name);

    // Get the next animation to play
    const nextAnimation = this.animationQueue.shift();
    if (!nextAnimation) {
      return;
    }

    // If nothing is playing right now, start the next animation
    if (!this.currentAction) {
      this.playAnimation(nextAnimation);
    }

    // If the current animation loops forever, override it now
    if (this.currentAction?.loop === THREE.LoopRepeat) {
      this.playAnimation(nextAnimation);
    }
  }

  private setupAnimations() {
    const { animations } = this.assetManager;

    // Once-only anims
    ["rifle-down-to-aim", "rifle-aim-to-down"].forEach((name) => {
      const clip = animations.get(name);
      const action = this.mixer.clipAction(clip);
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
      this.animations.set(name, action);
    });

    // Looping anims
    ["rifle-idle", "rifle-aiming-idle"].forEach((name) => {
      const clip = animations.get(name);
      const action = this.mixer.clipAction(clip);
      this.animations.set(name, action);
    });
  }

  private onAnimationEnd = (e: any) => {
    // Check if there are any further animations to play in the queue
    const name = this.animationQueue.shift();
    if (name) {
      this.playAnimation(name);
    } else {
      // The current anim is over
      this.currentAction = undefined;
    }
  };
}
