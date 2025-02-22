import { RenderFactory } from "./../../core/factories/renderFactory.js";
import { NameMeUIBase } from "./../../ui/bases/nameMeUIBase.js";

export default class MainShape extends NameMeUIBase {
  constructor() {
    super();
    this._shapesOg = []; // Use _shapesOg as the internal storage
    this._animations = [];
    this.uiInterface = null; // Store it directly
  }

  set uiInterface(value) {
    this._uiInterface = value;
    if (this._shadow) this.render(); // Re-render if already initialized
  }

  get uiInterface() {
    return this._uiInterface;
  }

  set shapesOg(value) {
    this._shapesOg = value; // Assign directly to _shapesOg, no recursion
    this.setState({ shapesOg: value });
  }

  get shapesOg() {
    return this._shapesOg; // Return the internal _shapesOg
  }

  render() {

    const lastShape = this._shapesOg.length > 0 ? this._shapesOg[this._shapesOg.length -1] : null;
    this._shadow.innerHTML = `
          <style>
                :host {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 100%;                   
                    max-width: 100%; 
                    max-height: 100%; 
                    padding: 10px; 
                }
                   
                .shape-display {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    max-height: 100%;
                    overflow: hidden;
                    }
                name-form {
                    width: 80%; 
                    max-height: 30%; 
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 5px; 
                    min-height: 0;
                }
                </style>
          <div 
          title="keep cursor on to calm"
          class="shape-display">
            ${
              lastShape
                ? RenderFactory.renderShape(lastShape.getJson(), true)
                : "<p>No shape selected</p>"
            }
          </div>
         
          <name-form></name-form>
        `;

    requestAnimationFrame(() => {
      this.animateShape(lastShape?.getJson());
    });

    const nameForm = this._shadow.querySelector("name-form");
    nameForm.shape = lastShape;
    nameForm.uiInterface = this.uiInterface;
  }

  animateShape(shape) {
    const shapeElement = this._shadow.querySelector(
      `[data-shape-id="${shape?._id}"] .shape-container`
    ); // Target the SVG element
    if (!shapeElement) {
      return;
    }

    if (shape.movement && RenderFactory.animations[shape.movement]) {
      const animationFunc = RenderFactory.animations[shape.movement];
      const animationId = animationFunc(shapeElement, shape);
      this._animations.push(animationId);
    } else {
      console.warn(
        ` Animation "${shape.movement}" not found for shape ${shape._id}`
      );
    }
  }
}
