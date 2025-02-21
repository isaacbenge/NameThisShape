export class DataStore {
    constructor() {
      this._data = { shapes: [] };
      this._subscribers = [];
    }
  
    addShape(shape) {
      this._data.shapes.push(shape);
      this.notify();
    }
  
    subscribe(callback) {
      this._subscribers.push(callback);
    }
  
    notify() {
      this._subscribers.forEach(cb => cb(this._data));
    }
  }