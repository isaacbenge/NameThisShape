
import BaseClass from "../core/baseClass.js";
import elementFactory from "../ui/registerElements.js";
import { DataStore } from "../core/dataStore.js";
import { ShapeFactory } from "../core/factories/shapeFactory.js";
import { ShapeWarehouse } from "../core/warehouses/shapeWarehouse.js";


export class Interface extends BaseClass {
  constructor() {
    super();
    this.dataStore = new DataStore();
    this.ShapeFactory = new ShapeFactory();
    this.warehouse = new ShapeWarehouse(this.dataStore);
    this.appContainer = document.getElementById("app");

    this.addShape=this.addShape.bind(this);
  }

  init() {
    
    const shapeList = elementFactory.createElement("shape-list", this);
    
    this.appContainer.appendChild(shapeList);

    // Subscribe to dataStore updates
    this.dataStore.subscribe((data) => {
      shapeList.updateShapes(data.shapes);
    });

    // Initial render
    shapeList.updateShapes(this.dataStore._data.shapes);

    // Example: Create and store shapes
    this.addShape("polygon", {});
   
  }

  // Method to create and store shapes
  addShape(type, json = {}) {
    const shape = this.ShapeFactory.createShape(type, json);
    this.warehouse.addShape(shape);
  }
}
