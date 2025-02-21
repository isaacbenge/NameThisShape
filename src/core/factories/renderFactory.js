export class RenderFactory {
  static renderPolygon(shape) {
    const baseWidth =
      (parseFloat(shape.width.replace("vw", "")) / 100) *
      window.innerWidth *
      shape.sizeMod;
    const widthPx = baseWidth * shape.sizeMod;
    const outerPoints = shape.vertices.map((v) => `${v.x},${v.y}`).join(" ");

    let pathData = `M ${outerPoints} Z`; // Outer contour, closed
    if (shape.innerVertices && shape.innerVertices.length > 0) {
      const innerPoints = shape.innerVertices
        .map((v) => `${v.x},${v.y}`)
        .join(" ");
      pathData = `M ${outerPoints} Z M ${innerPoints} Z`; // Outer + inner contour, both closed
    }

    const rotation = shape.rotation || 0;

    return `
          <div data-shape-id="${
            shape._id
          }" style="transform: rotate(${rotation}deg); display: inline-block;">
            <div style="font-size:1.1vw; position:absolute; top:9%; left:1%;">${
              shape._id
            }</div>
            <svg class="shape-container"
                 style="fill: ${
                   shape.color
                 }; width: ${widthPx}px; display: block; margin: auto;"
                 viewBox="-${baseWidth / 1.2} -${
      baseWidth / 1.2
    } ${widthPx} ${widthPx}"
                 preserveAspectRatio="xMidYMid meet">
              <path d="${pathData}" fill-rule="evenodd" />
            </svg>
          </div>
        `;
  }

  static renderBubble(shape) {
    const baseWidth =
      (parseFloat(shape.width.replace("vw", "")) / 100) *
      window.innerWidth *
      shape.sizeMod;
    const widthPx = baseWidth * shape.sizeMod;
    const centerX = widthPx / 2;
    const centerY = widthPx / 2;

    return `
          <svg class="shape-container" style="fill: ${shape.color}; width: ${widthPx}px;">
            <circle cx="${centerX}" cy="${centerY}" r="${shape.radius}" />
          </svg>
        `;
  }

  static renderShape(shape) {
    if (!shape?.vertices && !shape?.radius) return "";
    return this[
      `render${shape.type.charAt(0).toUpperCase() + shape.type.slice(1)}`
    ](shape);
  }

  static animations = {
    pulsing(element, shape) {
      let start;
      // 1/5 chance (20%) to also spin
      const shouldSpin = Math.random() < 0.2;
      const direction = Math.random() < 0.5 ? 1 : -1;
      const animate = (timestamp) => {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const scale = 1 + Math.sin(elapsed / 500) * 0.1;
        let transform = `scale(${scale})`;
        if (shouldSpin) {
          const angle =
            ((elapsed / (1000 / shape.moveSpeed)) % 360) * direction;
          transform = `rotate(${angle}deg) scale(${scale})`;
          element.style.transformOrigin = "50% 50%";
        }
        element.style.transform = transform;
        return requestAnimationFrame(animate);
      };
      return requestAnimationFrame(animate);
    },

    spinning(element, shape) {
      let start;
      const direction = Math.random() < 0.5 ? 1 : -1;
      const animate = (timestamp) => {
        if (!start) start = timestamp;
        const angle =
          (((timestamp - start) / (1000 / shape.moveSpeed)) % 360) * direction;
        element.style.transformOrigin = "50% 50%";
        element.style.transform = `rotate(${angle}deg)`;
        return requestAnimationFrame(animate);
      };
      return requestAnimationFrame(animate);
    },

    jointsMoving(element, shape) {
      const pathElement = element.querySelector("path"); // Always a <path> now
      if (!pathElement) return; // Prevent crashes if element isn’t ready

      const originalVertices = shape.vertices.map((v) => ({ x: v.x, y: v.y }));
      const lineLengths = originalVertices.map((v, i) => {
        const nextV = originalVertices[(i + 1) % originalVertices.length];
        return Math.hypot(nextV.x - v.x, nextV.y - v.y);
      });
      const avgLineLength =
        lineLengths.reduce((a, b) => a + b, 0) / lineLengths.length;
      const maxDistance = avgLineLength / 22;

      let start;
      const animate = (timestamp) => {
        if (!start) start = timestamp;
        const elapsed = (timestamp - start) / (1000 / shape.moveSpeed);
        if (elapsed >= 1) {
          start = timestamp;

          // Update only outer vertices
          shape.vertices = originalVertices.map((v, i) => {
            const dx = (Math.random() * 2 - 1) * maxDistance;
            const dy = (Math.random() * 2 - 1) * maxDistance;
            let newX = v.x + dx;
            let newY = v.y + dy;
            const distance = Math.hypot(newX - v.x, newY - v.y);
            if (distance > maxDistance) {
              const angle = Math.atan2(newY - v.y, newX - v.x);
              newX = v.x + Math.cos(angle) * maxDistance;
              newY = v.y + Math.sin(angle) * maxDistance;
            }
            return { x: newX, y: newY };
          });

          // Keep innerVertices static, only update path if they exist
          let pathData = `M ${shape.vertices
            .map((v) => `${v.x},${v.y}`)
            .join(" ")} Z`;
          if (shape.innerVertices && shape.innerVertices.length > 0) {
            const innerPoints = shape.innerVertices
              .map((v) => `${v.x},${v.y}`)
              .join(" ");
            pathData = `M ${pathData} M ${innerPoints} Z`;
          }
          pathElement.setAttribute("d", pathData);
        }
        return requestAnimationFrame(animate);
      };
      return requestAnimationFrame(animate);
    },
  };
}
