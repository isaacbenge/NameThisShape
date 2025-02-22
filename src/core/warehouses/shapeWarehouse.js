
export class ShapeWarehouse {
  constructor(dataStore) {
    this.dataStore = dataStore;
  }

  addShape(shape) {
    this.dataStore.addShape(shape);
  }
}