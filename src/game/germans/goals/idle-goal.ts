import * as YUKA from "yuka";
import { SoldierDE } from "../entities/soldier-de";

export class IdleGoal extends YUKA.Goal<SoldierDE> {
  constructor(public owner: SoldierDE) {
    super();
  }

  override activate(): void {
    // Play the idle animation
    this.owner.playAnimation("rifle-idle");
  }

  override terminate(): void {
    // We don't stop anims - they get overridden by a newer anim request elsewhere
  }
}
