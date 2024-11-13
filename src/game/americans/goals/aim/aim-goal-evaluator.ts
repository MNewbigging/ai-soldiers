import * as YUKA from "yuka";
import { SoldierUS } from "../../entities/soldier-us";
import { AimGoal } from "./aim-goal";

export class AimGoalEvaluator extends YUKA.GoalEvaluator<SoldierUS> {
  override calculateDesirability(owner: SoldierUS): number {
    const target = getTarget(owner);

    // For now, set a target property on soldier so that other classes can easily access it
    if (target) {
      owner.target = target;
    }

    return target === undefined ? 0 : 1;
  }

  override setGoal(owner: SoldierUS): void {
    const currentGoal = owner.brain.currentSubgoal();

    if (currentGoal instanceof AimGoal) {
      return;
    }

    owner.brain.clearSubgoals();

    owner.brain.addSubgoal(new AimGoal(owner));
  }
}

/**
 * To determine if there is something to aim at:
 *
 * 1 - Check if there are any targets within range
 * 2 - Check if any of those targets are in line of sight
 * 2a - They are within n degrees of forward vector
 * 2b - A raycast to the target is not blocked by something
 * 3 - Sort valid targets by some heuristic (e.g distance)
 * 4 - return the first target in sorted array
 */

function getTarget(searcher: YUKA.GameEntity) {
  // 1 - Check if there are targets within range. YUKA has a neighbourhood check on entity update
  // where it finds nearby entities within a range we can define (see soldier constructor)
  if (!searcher.neighbors.length) {
    return undefined;
  }

  const targets = searcher.neighbors.filter(
    (entity) => entity.name === "target"
  );
  if (!targets.length) {
    return undefined;
  }

  // 2 - TODO Check if any of those targets are in line of sight

  // 3 - TODO Sort valid targets by some heuristic - closest first

  // 4 - return the best target
  return targets[0];
}
