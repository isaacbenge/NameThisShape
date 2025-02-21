import { NameMeUIBase } from "../bases/nameMeUIBase.js";

export default class ElementFactory {
  constructor() {
    this._registry = new Map();
    /// I can store element classes
  }

  //Register a custom element class, forcing NameMeUIBase
  registerElement(tagName, ElementClass) {
    if (!(ElementClass.prototype instanceof NameMeUIBase)) {
      throw new Error(`${tagName} must extend NameMeUIBase`);
    }
    this._registry.set(tagName, ElementClass);
    customElements.define(tagName, ElementClass);
    return this; // Chainable
  }

  // Create an instance of a registered element
  createElement(tagName, options = {}) {
    const ElementClass = this._registry.get(tagName);
    if (!ElementClass) {
      throw new Error(`Element ${tagName} not registered`);
    }
    const element = document.createElement(tagName);
    Object.entries(options).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    return element;
  }
}
