import * as YUKA from 'yuka';
import { Soldier } from '../../entities/soldier';
import { IdleGoal } from './idle-goal';

export class IdleGoalEvaluator extends YUKA.GoalEvaluator<Soldier> {
  override calculateDesirability(owner: Soldier): number {
    return 1;
  }

  override setGoal(owner: Soldier): void {
    const currentGoal = owner.brain.currentSubgoal();

    if (currentGoal instanceof IdleGoal) {
      return;
    }

    owner.brain.clearSubgoals();

    owner.brain.addSubgoal(new IdleGoal(owner));
  }
}