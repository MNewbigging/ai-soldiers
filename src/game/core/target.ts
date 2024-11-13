import * as YUKA from "yuka";

export class Target extends YUKA.Vehicle {
  private elapsed = 0;

  constructor() {
    super();

    this.name = "target";
  }

  override update(delta: number): this {
    super.update(delta);

    // Move in a circle
    this.elapsed += delta;
    this.position.x += Math.sin(this.elapsed) * 0.05;
    this.position.z -= Math.cos(this.elapsed) * 0.05;

    return this;
  }
}
