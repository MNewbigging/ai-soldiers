import * as YUKA from "yuka";
import { SoldierUS } from "../../entities/soldier-us";

export class AimGoal extends YUKA.Goal<SoldierUS> {
  constructor(owner: SoldierUS) {
    super(owner);
  }

  override activate(): void {
    console.log("aim goal activate");

    // Start aim up anim, leading into aiming idle anim
    this.owner?.queueAnimation("rifle-down-to-aim");
    this.owner?.queueAnimation("rifle-aiming-idle");
  }

  override execute(): void {
    // Turn to face the target, so long as it's in sight/range...
    if (this.owner?.target) {
      // Only want to rotate on the y axis...
      const currentRot = this.owner.rotation.clone();
      const lookDir = this.owner.target.position
        .clone()
        .sub(this.owner.position)
        .normalize();
      currentRot.lookAt(this.owner.forward, lookDir, YUKA.WorldUp);

      // const newFacing = currentRot.toEuler({ x: 0, y: 0, z: 0});
      // this.owner.rotation.
      this.owner?.rotateTo(this.owner.target.position, 0.17, 0.01);
    }
  }

  override terminate(): void {
    console.log("aim goal terminate");

    // Move from aim idle to aim down
    this.owner?.queueAnimation("rifle-aim-to-down");
    this.owner?.queueAnimation("ridle-idle");
  }
}
