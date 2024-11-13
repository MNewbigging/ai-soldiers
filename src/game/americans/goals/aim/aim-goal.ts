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
      // Should only rotate on the y axis, not all...
      this.owner.lookAt(this.owner.target.position);
    }
  }

  override terminate(): void {
    console.log("aim goal terminate");

    // Move from aim idle to aim down
    this.owner?.queueAnimation("rifle-aim-to-down");
    this.owner?.queueAnimation("ridle-idle");
  }
}
