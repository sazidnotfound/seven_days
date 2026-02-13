const canvas = document.getElementById("heartCanvas");
const ctx = canvas.getContext("2d");

// Set canvas size
canvas.width = 400;
canvas.height = 360;

const particles = [];
const filledHeart = []; // Store filled positions
const heartPoints = [];
const maxParticles = 400;
let particleSpawnTimer = 0;

function heartFunction(t) {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y =
    13 * Math.cos(t) -
    5 * Math.cos(2 * t) -
    2 * Math.cos(3 * t) -
    Math.cos(4 * t);
  return { x, y };
}

// Generate heart shape points (more dense for filling)
for (let t = 0; t < Math.PI * 2; t += 0.01) {
  const point = heartFunction(t);
  heartPoints.push({
    x: canvas.width / 2 + point.x * 12,
    y: canvas.height / 2 - point.y * 12
  });
}

// Check if point is inside heart shape
function isPointInHeart(x, y) {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const relX = (x - centerX) / 12;
  const relY = (centerY - y) / 12;
  
  // Heart equation check
  const t = Math.atan2(relY, relX);
  const heartX = 16 * Math.pow(Math.sin(t), 3);
  const heartY = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  
  const dist = Math.sqrt(Math.pow(relX - heartX, 2) + Math.pow(relY - heartY, 2));
  return dist < 1.5;
}

// Draw a small heart shape at (x, y) with given size and color
function drawHeartShape(x, y, size, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  // Simple bezier heart built around (x, y)
  ctx.moveTo(x, y - size);
  ctx.bezierCurveTo(
    x - size, y - size * 2,
    x - size * 3, y,
    x, y + size * 1.6
  );
  ctx.bezierCurveTo(
    x + size * 3, y,
    x + size, y - size * 2,
    x, y - size
  );
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// Create particle starting from outside
function createParticle() {
  const angle = Math.random() * Math.PI * 2;
  const distance = 180 + Math.random() * 80;
  const startX = canvas.width / 2 + Math.cos(angle) * distance;
  const startY = canvas.height / 2 + Math.sin(angle) * distance;
  
  // Pick random target inside heart
  const targetIndex = Math.floor(Math.random() * heartPoints.length);
  const target = heartPoints[targetIndex];
  
  return {
    x: startX,
    y: startY,
    targetX: target.x + (Math.random() - 0.5) * 8,
    targetY: target.y + (Math.random() - 0.5) * 8,
    size: Math.random() * 2.5 + 1.2,
    speed: Math.random() * 0.4 + 0.25,
    life: 0,
    maxLife: 300,
    opacity: 0,
    reached: false
  };
}

// Initialize particles
for (let i = 0; i < 60; i++) {
  particles.push(createParticle());
}

let animationTime = 0;

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  animationTime += 0.015;
  particleSpawnTimer++;

  // Spawn new particles continuously
  if (particles.length < maxParticles && particleSpawnTimer % 2 === 0) {
    particles.push(createParticle());
  }

  // Draw filled heart (accumulated particles)
  if (filledHeart.length > 0) {
    ctx.shadowBlur = 20;
    ctx.shadowColor = "rgba(220, 20, 60, 0.3)";
    filledHeart.forEach(point => {
      drawHeartShape(
        point.x,
        point.y,
        point.size * 1.5,
        `rgba(220, 20, 60, ${point.opacity})`,
        point.opacity
      );
    });
    ctx.shadowBlur = 0;
  }

  // Draw heart outline (static)
  ctx.strokeStyle = "rgba(255, 77, 141, 0.6)";
  ctx.lineWidth = 2;
  ctx.shadowBlur = 10;
  ctx.shadowColor = "rgba(255, 77, 141, 0.4)";
  ctx.beginPath();
  heartPoints.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
  ctx.closePath();
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Update and draw moving particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    
    if (!p.reached) {
      // Calculate direction to target
      const dx = p.targetX - p.x;
      const dy = p.targetY - p.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Move particle toward target
      if (distance > 1) {
        p.x += (dx / distance) * p.speed;
        p.y += (dy / distance) * p.speed;
      }
      
      // Check if particle reached heart and is inside
      if (distance < 2 && isPointInHeart(p.x, p.y)) {
        p.reached = true;
        // Add to filled heart
        filledHeart.push({
          x: p.x,
          y: p.y,
          size: p.size,
          opacity: 0.8
        });
        // Create new particle
        particles[i] = createParticle();
        continue;
      }
    }
    
    // Update opacity
    p.life++;
    if (p.life < 20) {
      p.opacity = p.life / 20;
    } else {
      p.opacity = 1;
    }
    
    // Draw moving particle
    if (!p.reached) {
      ctx.shadowBlur = 15;
      ctx.shadowColor = "rgba(255, 182, 193, 0.6)";

      drawHeartShape(
        p.x,
        p.y,
        p.size,
        `rgba(255, 182, 193, ${p.opacity})`,
        p.opacity
      );

      ctx.shadowBlur = 0;
    }
    
    // Remove old particles that didn't reach
    if (p.life > p.maxLife && !p.reached) {
      particles.splice(i, 1);
    }
  }
  
  // Gradually increase opacity of filled heart particles for red effect
  filledHeart.forEach(point => {
    if (point.opacity < 1) {
      point.opacity = Math.min(point.opacity + 0.01, 1);
    }
  });

  requestAnimationFrame(animate);
}

// Handle window resize
function resizeCanvas() {
  canvas.width = 400;
  canvas.height = 360;
  
  // Regenerate heart points
  heartPoints.length = 0;
  for (let t = 0; t < Math.PI * 2; t += 0.01) {
    const point = heartFunction(t);
    heartPoints.push({
      x: canvas.width / 2 + point.x * 12,
      y: canvas.height / 2 - point.y * 12
    });
  }
  
  // Reset particles and filled heart
  particles.length = 0;
  filledHeart.length = 0;
  for (let i = 0; i < 60; i++) {
    particles.push(createParticle());
  }
}

window.addEventListener("resize", resizeCanvas);

// Start animation
animate();
