export class RenderFactory {
  static hoverStates = new Map(); // Map<shapeId, { isHovered: boolean, speedMultiplier: number }>
  static animationFrames = new Map(); // Map<shapeId, animationFrameId>

  // Handle hover start
  static onHoverStart(shapeId) {
    RenderFactory.hoverStates.set(shapeId, {
      isHovered: true,
      speedMultiplier: 1,
    });
  }

  // Handle hover end
  static onHoverEnd(shapeId) {
    RenderFactory.hoverStates.set(shapeId, {
      isHovered: false,
      speedMultiplier: 1,
    });
  }

  static getBoundingBox(vertices) {
    const box = vertices.reduce(
      (acc, v) => {
        acc.minX = Math.min(acc.minX, v.x);
        acc.maxX = Math.max(acc.maxX, v.x);
        acc.minY = Math.min(acc.minY, v.y);
        acc.maxY = Math.max(acc.maxY, v.y);
        return acc;
      },
      {
        minX: Infinity,
        maxX: -Infinity,
        minY: Infinity,
        maxY: -Infinity,
      }
    );
    return box;
  }

  static renderPolygon(shape, isMain) {
    // Build path data from outer + inner vertices
    const outerPoints = shape.vertices.map((v) => `${v.x},${v.y}`).join(" ");
    let pathData = `M ${outerPoints} Z`;

    if (shape.innerVertices && shape.innerVertices.length > 0) {
      const innerPoints = shape.innerVertices
        .map((v) => `${v.x},${v.y}`)
        .join(" ");
      pathData += ` M ${innerPoints} Z`;
    }

    // For main shape, compute bounding box and create a "fitting" viewBox
    let viewBox = `0 0 100 100`; // Fallback if not main
    let svgStyle = `width: 100px;`; // Fallback for small list shapes

    // if (isMain) {
    // 1) Get bounding box of outer vertices
    const box = RenderFactory.getBoundingBox(shape.vertices);
    const shapeWidth = box.maxX - box.minX;
    const shapeHeight = box.maxY - box.minY;

    // 2) Add some margin so the shape doesn’t touch the edges
    const margin = Math.max(shapeWidth, shapeHeight) * 0.15;

    // 3) Build a viewBox that exactly fits the shape + margin
    const minX = box.minX - margin;
    const minY = box.minY - margin;
    const vbWidth = shapeWidth + margin * 2;
    const vbHeight = shapeHeight + margin * 2;

    const hasOffset =
      shape.movement != "jointsMoving" ? Math.random() * 0.4 + 0.8 : 1;
    viewBox = `${minX * hasOffset} ${minY * hasOffset} ${vbWidth} ${vbHeight}`;

    // 4) Let CSS do the scaling so it fits inside the white box
    svgStyle = `
        width: 100%;
        height: 80vh;
        display: block;
        margin: auto;
      `;
    // }

    // For shapes in the list, you can still do a simpler approach (px-based)
    // or just rely on the same bounding-box approach. For now, we’ll keep a
    // small 100×100 fallback for the list shapes:
    const rotation = shape.rotation || 0;
    const shapeId =
      shape._id || `shape-${Math.random().toString(36).substr(2, 9)}`;

    return `
      <div data-shape-id="${shapeId}"
           style="height:100%;
                  display: inline-block;
                  text-align: center;"
                  >
        
        <svg 
        
        class="shape-container"
             style="
             cursor: help;
             fill: ${
               shape.color
             }; ${svgStyle}; transform: rotate(${rotation}deg);"
             viewBox="${viewBox}"
             preserveAspectRatio="xMidYMid meet">
          <path 
          onmouseover="RenderFactory.onHoverStart('${shapeId}')"
         onmouseout="RenderFactory.onHoverEnd('${shapeId}')"
          d="${pathData}" fill-rule="evenodd" />
        </svg>
      </div>
    `;
  }

  //   static renderBubble(shape) {
  //     const baseWidth =
  //       (parseFloat(shape.width.replace("vw", "")) / 100) *
  //       window.innerWidth *
  //       shape.sizeMod;
  //     const widthPx = baseWidth * shape.sizeMod;
  //     const centerX = widthPx / 2;
  //     const centerY = widthPx / 2;

  //     return `
  //           <svg class="shape-container" style="fill: ${shape.color}; width: ${widthPx}px;">
  //             <circle cx="${centerX}" cy="${centerY}" r="${shape.radius}" />
  //           </svg>
  //         `;
  //   }

  static renderShape(shape, isMain) {
    if (!shape?.vertices && !shape?.radius) return "";
    return this[
      `render${shape.type.charAt(0).toUpperCase() + shape.type.slice(1)}`
    ](shape, isMain);
  }

  static animations = {
    pulsing(element, shape) {
        let start;
        let lastTime = null; // Track the last frame's timestamp
      const shapeId = element.parentElement.getAttribute("data-shape-id");

      
      const shouldSpin = Math.random() < 0.2;
      const direction = Math.random() < 0.5 ? 1 : -1;
      let lastAngle = 0; // For spinning within pulsing

      // Pre-calculate random scale variations to avoid frame-by-frame jitter
      const continuousRandom = Math.random() * 0.04;
      const pulseWaitRandom = Math.random() * 0.04;
      const periodicStrength = (0.2 + Math.random() * 0.1) * 0.8;
      const burstStrength = Math.random() * 0.24;

      const pathElement = element.querySelector("path");
      const originalVertices = shape.vertices.map((v) => ({ x: v.x, y: v.y }));
      let originalInnerVertices = null;
      if (shape.innerVertices && shape.innerVertices.length > 0) {
        originalInnerVertices = shape.innerVertices.map((v) => ({
          x: v.x,
          y: v.y,
        }));
      }
      const selectedPattern = shape.pattern;

      const animate = (timestamp) => {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;

        const hoverState = RenderFactory.hoverStates.get(shapeId) || {
          isHovered: false,
          speedMultiplier: 1,
        };
        let { isHovered, speedMultiplier } = hoverState;

        if (isHovered) {
          speedMultiplier = Math.max(0, speedMultiplier - 0.016);
          RenderFactory.hoverStates.set(shapeId, {
            isHovered: true,
            speedMultiplier,
          });
        } else if (speedMultiplier < 1) {
          speedMultiplier = Math.min(1, speedMultiplier + 0.016);
          RenderFactory.hoverStates.set(shapeId, {
            isHovered: false,
            speedMultiplier,
          });
        }

        const adjustedElapsed = elapsed * speedMultiplier;

        let scale = 1;
        let transform = "";
        

        switch (selectedPattern) {
          case "continuous":
            scale =
              1 +
              Math.sin(adjustedElapsed / (2000 / shape.moveSpeed)) *
                (0.08 + continuousRandom);
            break;

          case "periodic":
            const period = 2000;
            scale =
              1 +
              (Math.sin((adjustedElapsed / period) * 2 * Math.PI) *
                periodicStrength) /
                2;
            break;

          case "pulseWait":
            const cycle = (adjustedElapsed % 4000) / 2000;
            if (cycle < 0.5) {
              scale =
                1 + Math.sin(cycle * 2 * Math.PI) * (0.12 + pulseWaitRandom);
            } else {
              scale = 1;
            }
            break;

          case "randomBurst":
            const burstInterval = 1000 + Math.random() * 2000; // Still random per instance
            if (adjustedElapsed % burstInterval < 300) {
              scale = 1 + burstStrength;
            } else {
              scale = 1;
            }
            break;

          case "breathing":
            scale =
              1 + Math.sin(adjustedElapsed / (4000 / shape.moveSpeed)) * 0.08;
            break;

          case "pulseVertices":
            if (!pathElement) break;

            const cycleTime = 3000 / shape.moveSpeed;
            const phase = (adjustedElapsed % cycleTime) / cycleTime;

            const box = RenderFactory.getBoundingBox(shape.vertices);
            const centerX = (box.maxX + box.minX) / 2;
            const centerY = (box.maxY + box.minY) / 2;
            const maxDistance =
              Math.max(box.maxX - box.minX, box.maxY - box.minY) * 0.03;

            shape.vertices = originalVertices.map((v) => {
              const dx = v.x - centerX;
              const dy = v.y - centerY;
              const distance = Math.hypot(dx, dy);
              if (distance === 0) return { x: v.x, y: v.y };

              let pulseFactor;
              if (phase < 0.33) {
                pulseFactor = Math.sin(phase * 3 * Math.PI) * maxDistance;
              } else if (phase < 0.66) {
                pulseFactor =
                  -Math.sin((phase - 0.33) * 3 * Math.PI) * maxDistance * 0.5;
              } else {
                pulseFactor = 0;
              }

              const angle = Math.atan2(dy, dx);
              return {
                x: v.x + Math.cos(angle) * pulseFactor,
                y: v.y + Math.sin(angle) * pulseFactor,
              };
            });

            if (originalInnerVertices) {
              shape.innerVertices = originalInnerVertices.map((v) => {
                const dx = v.x - centerX;
                const dy = v.y - centerY;
                const distance = Math.hypot(dx, dy);
                if (distance === 0) return { x: v.x, y: v.y };

                let pulseFactor;
                if (phase < 0.33) {
                  pulseFactor = Math.sin(phase * 3 * Math.PI) * maxDistance;
                } else if (phase < 0.66) {
                  pulseFactor =
                    -Math.sin((phase - 0.33) * 3 * Math.PI) * maxDistance * 0.5;
                } else {
                  pulseFactor = 0;
                }

                const angle = Math.atan2(dy, dx);
                return {
                  x: v.x + Math.cos(angle) * pulseFactor,
                  y: v.y + Math.sin(angle) * pulseFactor,
                };
              });
            }

            let pathData = `M ${shape.vertices
              .map((v) => `${v.x},${v.y}`)
              .join(" ")} Z`;
            if (shape.innerVertices && shape.innerVertices.length > 0) {
              const innerPoints = shape.innerVertices
                .map((v) => `${v.x},${v.y}`)
                .join(" ");
              pathData += ` M ${innerPoints} Z`;
            }
            pathElement.setAttribute("d", pathData);
            break;
        }

        if (selectedPattern !== "pulseVertices") {
          let start;
          if (!start) start = timestamp;
          if (!lastTime) lastTime = timestamp;

          const deltaTime = timestamp - lastTime;
          lastTime = timestamp;

          if (shouldSpin) {
            const angleIncrement =
              (shape.moveSpeed *
              (deltaTime / 1000) *
              direction) *
              speedMultiplier * 1.1;
            lastAngle = (lastAngle + angleIncrement) % 360;
            if (lastAngle < 0) lastAngle += 360;
            transform = `rotate(${lastAngle}deg) scale(${scale})`;
          } else {
            transform = `scale(${scale})`;
          }
          element.style.transform = transform;
        }
        element.style.transformOrigin = "50% 50%";

        const frameId = requestAnimationFrame(animate);
        RenderFactory.animationFrames.set(shapeId, frameId);
        return frameId;
      };

      return requestAnimationFrame(animate);
    },

    spinning(element, shape) {
      let start;
      let lastTime = null; // Track the last frame's timestamp
      let lastAngle = 0; // Track the cumulative angle
      const shapeId = element.parentElement.getAttribute("data-shape-id");
      const direction = Math.random() < 0.5 ? 1 : -1;

      const animate = (timestamp) => {
        if (!start) start = timestamp;
        if (!lastTime) lastTime = timestamp;

        const deltaTime = timestamp - lastTime; // Time difference between frames (in ms)
        lastTime = timestamp; // Update lastTime for the next frame

        const hoverState = RenderFactory.hoverStates.get(shapeId) || {
          isHovered: false,
          speedMultiplier: 1,
        };
        let { isHovered, speedMultiplier } = hoverState;

        // Adjust speed multiplier
        if (isHovered) {
          speedMultiplier = Math.max(0, speedMultiplier - 0.016); // Slow down over ~1s
          RenderFactory.hoverStates.set(shapeId, {
            isHovered: true,
            speedMultiplier,
          });
        } else if (speedMultiplier < 1) {
          speedMultiplier = Math.min(1, speedMultiplier + 0.016); // Speed up over ~1s
          RenderFactory.hoverStates.set(shapeId, {
            isHovered: false,
            speedMultiplier,
          });
        }

        // Calculate angular speed (degrees per millisecond), capped at shape.moveSpeed
        const baseSpeed = shape.moveSpeed / 2000; // Degrees per millisecond at max speed
        const angleIncrement =
          baseSpeed * deltaTime * direction * speedMultiplier;
        lastAngle = (lastAngle + angleIncrement) % 360; // Cumulative angle
        if (lastAngle < 0) lastAngle += 360; // Keep angle positive

        element.style.transformOrigin = "50% 50%";
        element.style.transform = `rotate(${lastAngle}deg)`;

        const frameId = requestAnimationFrame(animate);
        RenderFactory.animationFrames.set(shapeId, frameId);
        return frameId;
      };
      return requestAnimationFrame(animate);
    },

    jointsMoving(element, shape) {
      const shapeId = element.parentElement.getAttribute("data-shape-id");
      const pathElement = element.querySelector("path");
      if (!pathElement) return;

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
        const elapsed = (timestamp - start) / (2000 / shape.moveSpeed);

        const hoverState = RenderFactory.hoverStates.get(shapeId) || {
          isHovered: false,
          speedMultiplier: 1,
        };
        let { isHovered, speedMultiplier } = hoverState;

        if (isHovered) {
          speedMultiplier = Math.max(0, speedMultiplier - 0.0016);
          RenderFactory.hoverStates.set(shapeId, {
            isHovered: true,
            speedMultiplier,
          });
        } else if (speedMultiplier < 1) {
          speedMultiplier = Math.min(1, speedMultiplier + 0.0016);
          RenderFactory.hoverStates.set(shapeId, {
            isHovered: false,
            speedMultiplier,
          });
        }

        if (elapsed * speedMultiplier >= 1) {
          start = timestamp;

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

        const frameId = requestAnimationFrame(animate);
        RenderFactory.animationFrames.set(shapeId, frameId);
        return frameId;
      };
      return requestAnimationFrame(animate);
    },
  };
}

window.RenderFactory = RenderFactory;
