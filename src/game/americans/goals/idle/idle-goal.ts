import * as YUKA from "yuka";
import { SoldierUS } from "../../entities/soldier-us";

export class IdleGoal extends YUKA.Goal<SoldierUS> {
  constructor(public owner: SoldierUS) {
    super();
  }

  override activate(): void {
    console.log("idle goal activate");

    // Play the idle animation
    this.owner.playAnimation("rifle-idle");
  }

  override terminate(): void {
    // We don't stop anims - they get overridden by a newer anim request elsewhere
    console.log("idle goal terminate");
  }
}
