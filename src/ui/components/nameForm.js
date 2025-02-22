import { NameMeUIBase } from "../../ui/bases/nameMeUIBase.js";

export default class NameForm extends NameMeUIBase {
  constructor() {
    super();
    this._shape = null;
    this.uiInterface = null; // Store it directly
  }

  set uiInterface(value) {
    this._uiInterface = value;
    if (this._shadow) this.render(); // Re-render if already initialized
  }

  get uiInterface() {
    return this._uiInterface;
  }

  set shape(value) {
    this._shape = value;
    this.render();
  }

  adjustLightness(hslString) {
    if (!hslString || hslString === "white") return "white"; // Handle default case

    // Extract HSL values using regex
    const hslMatch = hslString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!hslMatch) return hslString; // Return original if not HSL

    const [_, hue, saturation, lightness] = hslMatch;
    let newLightness = parseInt(lightness) + 10; // Increase by 10%
    newLightness = Math.min(100, newLightness); // Cap at 100%

    return `hsl(${hue}, ${saturation}%, ${newLightness}%)`;
  }

  render() {
    const shapeColor = this.adjustLightness(
      this._shape?.getJson().color || "white"
    );

    this._shadow.innerHTML = `
      <style>
        input {
          font-size: 1.4vw;
          padding: 5px;
          background-color: #333;
          color: white;
          border: 1px solid #ffdead;
          border-radius: 5px;
        }
          .name-preview {
          mix-blend-mode: screen;
          position: absolute;
          top: 40%; 
          font-size: 3.1vw; 
          color: ${shapeColor}; 
          text-align: center;
          width: 100%; 
          pointer-events: none;
        }

         .title-preview {
          mix-blend-mode: screen;
          position: absolute;
          top: 1%; 
          font-size: 2.1vw; 
          color: grey; 
          text-align: center;
          width: 100%; 
          pointer-events: none;
        }

        .desc-preview {
          mix-blend-mode: screen;
          position: absolute;
          top: 8%; 
          opacity: .77;
          font-size: 1.51vw; 
          color: ${shapeColor}; 
          text-align: center;
          width: 100%; 
          pointer-events: none;
        }
      </style>

      <div class="title-preview">What is this shape's name?</div>
      <div class="desc-preview">(Hover cursor over shape to calm it)</div>

<div class="name-preview">${this._shape?.getJson().name || ""}</div>

      <input maxlength="40" type="text" placeholder="Name me?" value="${
        this._shape?.name || ""
      }">
    `;

    const input = this._shadow.querySelector("input");
    const preview = this._shadow.querySelector(".name-preview");

    input.addEventListener("input", (event) => {
      preview.textContent = event.target.value;
    });

    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && this._shape) {
        this.uiInterface.addShape("polygon", {});

        this.uiInterface.setJson({ lastName: input.value });

        this._shape.updateJson({ name: input.value });

        this.render(); // Re-render with new name
        this.refocusInput(); // Refocus after render
      }
    });
    input.focus();
  }

  refocusInput() {
    const newInput = this._shadow.querySelector("input");
    if (newInput) {
      newInput.focus();
    }
  }
}
