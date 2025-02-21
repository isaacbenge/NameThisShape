import BaseClass from './../baseClass.js';

export default class ShapeBase extends BaseClass{

    constructor(){
        super();

        this.updateJson({
            type: 'unknown',
            name: '',
            createdAt: Date.now(),
            sizeMod: 2.9,
        });
    }

    movementTypes = ['pulsing','spinning','jointsMoving']

    defineSelf(){
        //randomSizing
        const minWidth = 50;
        const maxWidth = 80;
        const width = Math.random() * (maxWidth - minWidth) + minWidth;

        //Random non-darkdark color
        const color = this.randomColor();

        //random movement life
        const movement = this.movementTypes[Math.floor(Math.random() * this.movementTypes.length)];
        const moveSpeed = Math.random() * 15 + 1;

        this.updateJson({ width: `${width}vw`, color, movement, moveSpeed});
        return this;
    }

    randomColor() {
        const hue = Math.floor(Math.random() * 360); // 0-359
        const saturation = Math.floor(Math.random() * 30) + 60; // (vibrant)
        const lightness = Math.floor(Math.random() * 20) + 45; // (not too dark)
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      }


      validateShape(vertices) {
        if (vertices.length < 3) throw new Error('Shape must have at least 3 vertices');
        // Simple check: Ensure all points form a convex/concave polygon (basic perimeter check)
        const perimeter = vertices.reduce((sum, vertex, i, arr) => {
          const next = arr[(i + 1) % arr.length];
          return sum + Math.hypot(next.x - vertex.x, next.y - vertex.y);
        }, 0);
        return perimeter > 0; // Basic validation (non-zero perimeter)
      }

     
}