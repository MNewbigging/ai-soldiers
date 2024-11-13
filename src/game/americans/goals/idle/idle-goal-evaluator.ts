import * as YUKA from "yuka";
import { SoldierUS } from "../../entities/soldier-us";
import { IdleGoal } from "./idle-goal";

export class IdleGoalEvaluator extends YUKA.GoalEvaluator<SoldierUS> {
  override calculateDesirability(owner: SoldierUS): number {
    // This is low because we generally don't want to idle
    return 0.2;
  }

  override setGoal(owner: SoldierUS): void {
    const currentGoal = owner.brain.currentSubgoal();

    if (currentGoal instanceof IdleGoal) {
      return;
    }

    owner.brain.clearSubgoals();

    owner.brain.addSubgoal(new IdleGoal(owner));
  }
}
