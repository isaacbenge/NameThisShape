import { RenderFactory } from "../../core/factories/renderFactory.js";
import { NameMeUIBase } from "../../ui/bases/nameMeUIBase.js";

export default class ShapeList extends NameMeUIBase {
  constructor() {
    super();
    this._shapes = [];
    this._animations = []; // Store animation frame IDs
    this.shapesOg = [];
  }

  updateShapes(shapes) {
    this._shapes = shapes.sort((a, b) => b.createdAt - a.createdAt).slice(0, 3);
    this.render();
    this.shapesOg = shapes;
  }

  render() {
    const listItems = this._shapes.length
      ? this._shapes
          .map(
            (shape) => `
            <li style="position: relative; height: 30vh; display: flex; align-items: center; justify-content: center;">
              ${RenderFactory.renderShape(shape)}
            </li>
          `
          )
          .join("")
      : "<li>No shapes yet</li>";

    this._shadow.innerHTML = `
      <style>
        :host {
          display: flex;
          width: 100vw;
          height: 100vh;
          background-color: black;
          color: white;
        }
        ul {
          list-style: none;
          padding: 0;
          margin: 0;
          width: 30%;
          height: 100%;
          background-color: #1a1a1a;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
        }
        li {
          height: 33.333vh;
          padding: 5px;
          border: 1px solid #ffdead22;
          margin: 2px 0;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .main-shape {
          width: 70%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .shape-container {
          max-width: 80%;
          max-height: 80%;
        }
      </style>
      <div class="main-shape">
        ${
          this.shapesOg.length > 3
            ? RenderFactory.renderShape(this.shapesOg[3])
            : "<p>No shape selected</p>"
        }
      </div>
      <ul>${listItems}</ul>
    `;

    // Ensure DOM is updated before starting animations
    requestAnimationFrame(() => {
      this.shapesOg.forEach((shape) => this.animateShape(shape));
    });
  }

  animateShape(shape) {
    const shapeElement = this._shadow.querySelector(
      `[data-shape-id="${shape._id}"] .shape-container`
    ); // Target the SVG element
    if (!shapeElement) {
      console.error(`No shape element found for ID: ${shape._id}`);
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

  disconnectedCallback() {
    super.disconnectedCallback();
    this._animations.forEach(cancelAnimationFrame);
    this._animations = [];
  }
}
