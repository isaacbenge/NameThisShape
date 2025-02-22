import ShapeBase from "./shapeBase.js";

export default class Polygon extends ShapeBase {
  constructor(sides) {
    super();
    this.updateJson({
      type: "polygon",
      sides: sides || 3, // Default to triangle
    });
  }

  defineSelf(isRegular) {
    super.defineSelf();

    let pulsePattern;
    if (this.getJson().movement == "pulsing") {
      const pulsePatterns = [
        "continuous",
        "periodic",
        "pulseWait",
        "randomBurst",
        "breathing",
        "pulseVertices",
      ];
      const selectedPattern =
        pulsePatterns[Math.floor(Math.random() * pulsePatterns.length)];
      pulsePattern = selectedPattern;
    }

    let isRound = Math.random() > 0.87;
    let roundness = isRound ? Math.floor(Math.random() * 118) + 3 : 10;
    // Determine a random number of sides (between 3 and roundness)
    const sides = Math.floor(Math.random() * roundness) + 3;

    // Decide if it has a hole (25% chance)
    const hasHole = Math.random() < 0.25;

    // Get the base width from the shape's width property (in vw) and apply sizeMod
    const widthStr = this.getJson().width;
    const baseWidth =
      (parseFloat(widthStr.replace("vw", "")) / 100) * window.innerWidth;
    const scaledWidth = baseWidth * this.getJson().sizeMod;

    // Define the center of the shape
    const center = { x: scaledWidth / 2, y: scaledWidth / 2 };

    let isScaleR = Math.random() > 0.88;

    let scaleR = isScaleR ? 0.6 : 0.42;
    let roundnessRadius = isRound ? [0.4, scaleR] : [0.1, 0.9];
    // Outer vertices (jagged or regular)
    const minRadius = scaledWidth * roundnessRadius[0];
    const maxRadius = scaledWidth * roundnessRadius[1];
    const angleStep = (2 * Math.PI) / sides;
    const startAngle = Math.random() * angleStep;
    const outerVertices = [];

    for (let i = 0; i < sides; i++) {
      const angle = startAngle + i * angleStep;
      const radius = isRegular
        ? (minRadius + maxRadius) / 2
        : Math.random() * (maxRadius - minRadius) + minRadius;
      const x = center.x + radius * Math.cos(angle);
      const y = center.y + radius * Math.sin(angle);
      outerVertices.push({ x, y });
    }

    let innerVertices = [];
    if (hasHole) {
      // Randomly choose hole type: square, circle, or oval
      const holeType = Math.random();
      const randomValue = Math.random() - 0.6;
      let holeSize = scaledWidth * Math.max(randomValue, 0.2);
      // Base size for the hole up to 40% of scaledWidth

      if (holeType < 0.33) {
        // Square hole
        const halfHole = holeSize / 2;
        innerVertices = [
          { x: center.x - halfHole, y: center.y - halfHole }, // Top-left
          { x: center.x + halfHole, y: center.y - halfHole }, // Top-right
          { x: center.x + halfHole, y: center.y + halfHole }, // Bottom-right
          { x: center.x - halfHole, y: center.y + halfHole }, // Bottom-left
        ];
      } else if (holeType < 0.66) {
        // other hole
        const innerSides = Math.floor(Math.random() * 20) + 3;
        const innerRadius = holeSize / 2;
        for (let i = 0; i < innerSides; i++) {
          const angle = ((2 * Math.PI) / innerSides) * i;
          const x = center.x + innerRadius * Math.cos(angle);
          const y = center.y + innerRadius * Math.sin(angle);
          innerVertices.push({ x, y });
        }
      } else {
        // Oval hole (elliptical, wider than tall)
        const innerSides = Math.floor(Math.random() * 20) + 3;
        const widthRadius = holeSize / 1.5; // Wider horizontally
        const heightRadius = holeSize / 3; // Shorter vertically
        for (let i = 0; i < innerSides; i++) {
          const angle = ((2 * Math.PI) / innerSides) * i;
          const x = center.x + widthRadius * Math.cos(angle);
          const y = center.y + heightRadius * Math.sin(angle);
          innerVertices.push({ x, y });
        }
      }
    }

    if (!this.validateShape(outerVertices)) {
      throw new Error("Invalid outer polygon vertices");
    }
    if (hasHole && !this.validateShape(innerVertices)) {
      throw new Error("Invalid inner polygon vertices");
    }

    let noJitter = Math.random() > 0.5;
    let moveType;
    if (noJitter) {
      moveType = "spinning";
    } else {
      moveType = "pulsing";
    }
    // Store both outer and inner vertices
    this.updateJson({
      sides,
      vertices: outerVertices,
      innerVertices: hasHole ? innerVertices : null,
      movement: hasHole ? moveType : this.getJson().movement,
      pattern: pulsePattern,
    });

    return this;
  }
}
