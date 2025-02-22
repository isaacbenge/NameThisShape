import MainShape from "./components/mainShape.js";
import NameForm from "./components/nameForm.js";
import ShapeList from "./components/shapeList.js";
import ElementFactory from "./uiFactories/elementFactory.js";

// Whenever you make a component (list, container, form) register it here

const elementFactory = new ElementFactory();

//use tag names to register
elementFactory
.registerElement('shape-list', ShapeList)
.registerElement("main-shape", MainShape)
  .registerElement("name-form", NameForm)

export default elementFactory;