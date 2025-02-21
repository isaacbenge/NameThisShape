import ShapeBase from "./shapeBase.js";

export default class Bubble extends ShapeBase {
  constructor(radius) {
    super();
    this.updateJson({
      type: 'bubble',
      radius: radius || 1 // Default radius
    });
  }

  getArea() {
    const radius = this.getJson().radius;
    return Math.PI * Math.pow(radius, 2);
  }
}