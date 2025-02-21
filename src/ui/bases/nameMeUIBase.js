export class NameMeUIBase extends HTMLElement {
  constructor() {
    super();
    //Encapsulate an open Shadow DOM
    this._shadow = this.attachShadow({ mode: "open" });
    this._state = {};
  }

  //Run when added to DOM
  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  //Run when removed from DOM
  disconnectedCallback() {
    this.teardownEventListeners();
  }

  //Override this in subclasses, it is really just a placeholder
  render() {
    this._shadow.innerHTML = "<p>Override this! Your base is showing!</p>";
  }

  //Setup shared listenrs (you can override or extend)
  setupEventListeners() {
    this._shadow.addEventListener("click", () =>
      console.log(`${this.tagName} was clicked`)
    );
  }

  //clean up even listeners (you can override or extend)
  teardownEventListeners() {
    //@todo Implement teardown
  }

  setState(newState){
    this._state = {...this._state, ...newState,};
    this.render();
  }
}
