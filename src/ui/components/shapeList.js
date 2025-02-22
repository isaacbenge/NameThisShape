import { RenderFactory } from "../../core/factories/renderFactory.js";
import { NameMeUIBase } from "../../ui/bases/nameMeUIBase.js";

export default class ShapeList extends NameMeUIBase {
  constructor(uiInterface) {
    super();
    this._shapes = [];
    this._animations = []; // Store animation frame IDs
    this.shapesOg = [];

    this.uiInterface = uiInterface;
  }

  async updateShapes(shapes) {
    this.shapesOg = await shapes;

    const sortedShapes = [...shapes].sort((a, b) => b.createdAt - a.createdAt);
    const originalLastShape = shapes[shapes.length - 1];
    const renderCount = Math.min(3, sortedShapes.length - 1); // Exclude newest
    if (renderCount < 0) {
      this._shapes = []; // No shapes if only 1 exists
    } else {
      // Take the last 'renderCount' shapes from sorted, excluding the newest
      this._shapes = sortedShapes.slice(-renderCount - 1, -1); // -1 excludes last

      // If originalLastShape isn’t in _shapes and there’s room, adjust
      if (
        renderCount > 0 &&
        !this._shapes.some((s) => s._id === originalLastShape._id) &&
        this._shapes.length < 3
      ) {
        this._shapes.push(originalLastShape);
      } else if (
        renderCount > 0 &&
        !this._shapes.some((s) => s._id === originalLastShape._id)
      ) {
        // Replace oldest in rendered list if full
        this._shapes.shift();
        this._shapes.push(originalLastShape);
      }
    }

    const shapeNames = this._shapes.map(
      (s) => s.getJson().name
    );
    console.log("shapeNames array:", shapeNames);

    this.render();
  }

  render() {
    const listItems = this._shapes.length
      ? this._shapes
          .map(
            (shape) => `
            <li title="keep cursor on to calm" style="position: relative; height: 32vh; display: flex; align-items: center; justify-content: center; flex-direction:column;">
        <div class="name-it" style="color:${shape.getJson().color};">
          ${shape.getJson().name || "NoName "+shape.getJson()?._id.slice(0,2)+shape.getJson()?.sides+" Side"}
        </div>
              ${RenderFactory.renderShape(shape.getJson())}
             
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

        .name-it {
          color: #ffdead;
          mix-blend-mode: screen;
          font-weight: 600;
          z-index: 2002;
          margin-top:6px;
          font-size: 1.48vw;
        }
          
        main-shape {
          width: 70%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          max-width: 70vw; 
          max-height: 100vh;
        }
        .shape-container {
          max-width: 88%;
          max-height: 88%;
            transform-origin: center center;
            transform-box: fill-box;
        }

      </style>
      
      <li style="position: relative; height: 100vh; width: 70vw; display: flex; align-items: center; justify-content: center;">
     <main-shape></main-shape>
     </li>
      <ul>${listItems}</ul>
      
    `;

    //I can pass shapesOg to main-shape and start their animations too
    const mainShape = this._shadow.querySelector("main-shape");
    mainShape.shapesOg = this.shapesOg;
    mainShape.uiInterface = this.uiInterface;

    // Ensure DOM is updated before starting animations
    requestAnimationFrame(() => {
      this._shapes.forEach((shape) => this.animateShape(shape.getJson()));
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
