import * as YUKA from "yuka";

import { IdleGoal } from "./idle-goal";
import { SoldierDE } from "../entities/soldier-de";

export class IdleGoalEvaluator extends YUKA.GoalEvaluator<SoldierDE> {
  override calculateDesirability(owner: SoldierDE): number {
    return 1;
  }

  override setGoal(owner: SoldierDE): void {
    const currentGoal = owner.brain.currentSubgoal();

    if (currentGoal instanceof IdleGoal) {
      return;
    }

    owner.brain.clearSubgoals();

    owner.brain.addSubgoal(new IdleGoal(owner));
  }
}
