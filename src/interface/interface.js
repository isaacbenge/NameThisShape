import elementFactory from "../ui/registerElements.js";
import { DataStore } from "../core/dataStore.js";
import { ShapeFactory } from "../core/factories/shapeFactory.js";
import { ShapeWarehouse } from "../core/warehouses/shapeWarehouse.js"

export class Interface {
  constructor() {
    this.dataStore = new DataStore();
    this.ShapeFactory = new ShapeFactory();
    this.warehouse = new ShapeWarehouse(this.dataStore);
    this.appContainer = document.getElementById("app");
  }

  init() {
    const shapeList = elementFactory.createElement('shape-list');
    this.appContainer.appendChild(shapeList);

    // Subscribe to dataStore updates
    this.dataStore.subscribe((data) => {
      shapeList.updateShapes(data.shapes);
    });

    // Initial render
    shapeList.updateShapes(this.dataStore._data.shapes);

    // Example: Create and store shapes
    this.addShape('polygon', { });
    this.addShape('polygon', { });
    this.addShape('polygon', { });
    this.addShape('polygon', { });
    // this.addShape('bubble', { });
  }

  // Method to create and store shapes
  addShape(type, json = {}) {
    const shape = this.ShapeFactory.createShape(type, json);
    this.warehouse.addShape(shape);
  }
}