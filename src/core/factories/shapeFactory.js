import Polygon from "./../shapes/polygon.js";
import Bubble from "./../shapes/bubble.js";

export class ShapeFactory {
  constructor() {
    // Register shape types as strings mapping to their constructors
    this.shapeTypes = {
      polygon: Polygon,
      bubble: Bubble,
    };
  }

  createShape(type, json = {}) {
    if (!this.shapeTypes[type]) {
      throw new Error(`Unknown shape type: ${type}`);
    }

    // The shape may be regular which means a polygon with equal sides!

    const isRegTest = Math.floor(Math.random() * 10) + 3;
    let regular = false;
    if (isRegTest > 11) {
      regular = true
    }

    const ShapeClass = this.shapeTypes[type];
    const shape = new ShapeClass().defineSelf(regular);

    // Update the shape's JSON with the provided json (merging with defaults)
    shape.setJson({...shape.getJson(), ...json });
  
   
    return shape;
  }

}
