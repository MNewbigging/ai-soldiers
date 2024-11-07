import * as YUKA from "yuka";
import { Soldier } from "../../entities/soldier";

export class IdleGoal extends YUKA.Goal<Soldier> {
  constructor(public owner: Soldier) {
    super();
  }

  override activate(): void {
    // Play the idle animation
    this.owner.playAnimation('rifle-idle-1');
  }

  override terminate(): void {
    // We don't stop anims - they get overridden by a newer anim request elsewhere
  }
}