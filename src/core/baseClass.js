import idServices from "./idServices.js";

export default class BaseClass {
  constructor() {
    this.json = { _id: idServices.generateId(), }; // Auto-generate ID
  }


  updateJson(updates) {
    this.json = { ...this.json, ...updates };
  }

  setJson(json) {
    if (typeof json === "object" && json !== null) {
      this.json = { ...json };
    } else {
      throw new Error("setJson requires a valid object");
    }
  }

  getJson() {
    return { ...this.json };
  }
}
