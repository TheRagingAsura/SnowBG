"use strict";

const canvas = document.getElementById("wallpaper");
const ctx = canvas.getContext("2d");

let width = 0;
let height = 0;
let deviceScale = 1;

let stars = [];
let grassBlades = [];
let plants = [];

let mouseX = 0;
let mouseY = 0;

const settings = {
  starCountPerMillionPixels: 1080,
  grassSpacing: 7,
  plantSpacing: 90,
  moonSizeRatio: 0.075,
  windSpeed: 0.0007,
  windStrength: 0.06
};

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function resizeCanvas() {
  deviceScale = Math.min(window.devicePixelRatio || 1, 2);

  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = Math.floor(width * deviceScale);
  canvas.height = Math.floor(height * deviceScale);

  ctx.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);

  mouseX = width / 2;
  mouseY = height / 2;

  createScene();
}

function createScene() {
  createStars();
  createGrass();
  createPlants();
}

function createStars() {
  stars = [];

  const areaInMillions = (width * height) / 1_000_000;
  const count = Math.floor(
    areaInMillions * settings.starCountPerMillionPixels
  );

  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random(),
      y: random(0.02, 0.72),
      radius: random(0.4, 1.8),
      baseOpacity: random(0.25, 0.95),
      twinkleSpeed: random(0.0007, 0.003),
      twinkleOffset: random(0, Math.PI * 2),
      parallax: random(0.002, 0.012)
    });
  }
}

function createGrass() {
  grassBlades = [];

  const count = Math.ceil(width / settings.grassSpacing) + 10;

  for (let i = 0; i < count; i++) {
    grassBlades.push({
      x: i * settings.grassSpacing + random(-4, 4),
      height: random(height * 0.035, height * 0.11),
      width: random(1, 3),
      lean: random(-0.25, 0.25),
      windOffset: random(0, Math.PI * 2),
      shade: Math.floor(random(0, 3))
    });
  }
}

function createPlants() {
  plants = [];

  const count = Math.ceil(width / settings.plantSpacing);

  for (let i = 0; i < count; i++) {
    plants.push({
      x: i * settings.plantSpacing + random(20, 80),
      height: random(height * 0.08, height * 0.2),
      branches: Math.floor(random(2, 5)),
      windOffset: random(0, Math.PI * 2),
      scale: random(0.7, 1.3)
    });
  }
}

function drawSky() {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);

  gradient.addColorStop(0, "#030511");
  gradient.addColorStop(0.45, "#0c1531");
  gradient.addColorStop(0.75, "#172746");
  gradient.addColorStop(1, "#283450");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawStars(time) {
  const mouseOffsetX = mouseX - width / 2;
  const mouseOffsetY = mouseY - height / 2;

  for (const star of stars) {
    const twinkle =
      Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.25;

    const opacity = Math.max(
      0.1,
      Math.min(1, star.baseOpacity + twinkle)
    );

    const x =
      star.x * width -
      mouseOffsetX * star.parallax;

    const y =
      star.y * height -
      mouseOffsetY * star.parallax;

    ctx.beginPath();
    ctx.arc(x, y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(235, 242, 255, ${opacity})`;
    ctx.fill();

    if (star.radius > 1.45) {
      ctx.beginPath();
      ctx.moveTo(x - star.radius * 2.5, y);
      ctx.lineTo(x + star.radius * 2.5, y);
      ctx.moveTo(x, y - star.radius * 2.5);
      ctx.lineTo(x, y + star.radius * 2.5);

      ctx.strokeStyle = `rgba(220, 235, 255, ${opacity * 0.35})`;
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }
  }
}

function drawMoon() {
  const radius = Math.min(width, height) * settings.moonSizeRatio;

  const parallaxX = (mouseX - width / 2) * 0.012;
  const parallaxY = (mouseY - height / 2) * 0.012;

  const moonX = width * 0.76 - parallaxX;
  const moonY = height * 0.21 - parallaxY;

  const glow = ctx.createRadialGradient(
    moonX,
    moonY,
    radius * 0.4,
    moonX,
    moonY,
    radius * 3
  );

  glow.addColorStop(0, "rgba(230, 240, 255, 0.32)");
  glow.addColorStop(0.4, "rgba(170, 200, 255, 0.12)");
  glow.addColorStop(1, "rgba(120, 160, 255, 0)");

  ctx.fillStyle = glow;
  ctx.fillRect(
    moonX - radius * 3,
    moonY - radius * 3,
    radius * 6,
    radius * 6
  );

  const moonGradient = ctx.createRadialGradient(
    moonX - radius * 0.3,
    moonY - radius * 0.35,
    radius * 0.1,
    moonX,
    moonY,
    radius
  );

  moonGradient.addColorStop(0, "#ffffff");
  moonGradient.addColorStop(0.6, "#e9efff");
  moonGradient.addColorStop(1, "#b9c6e6");

  ctx.beginPath();
  ctx.arc(moonX, moonY, radius, 0, Math.PI * 2);
  ctx.fillStyle = moonGradient;
  ctx.fill();

  drawMoonCrater(
    moonX - radius * 0.32,
    moonY - radius * 0.2,
    radius * 0.16
  );

  drawMoonCrater(
    moonX + radius * 0.24,
    moonY + radius * 0.25,
    radius * 0.22
  );

  drawMoonCrater(
    moonX + radius * 0.18,
    moonY - radius * 0.34,
    radius * 0.11
  );
}

function drawMoonCrater(x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(90, 110, 150, 0.13)";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(
    x - radius * 0.2,
    y - radius * 0.2,
    radius * 0.72,
    0,
    Math.PI * 2
  );

  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.fill();
}

function drawShootingStar(time) {
  const cycle = 14000;
  const localTime = time % cycle;

  if (localTime > 1300) {
    return;
  }

  const progress = localTime / 1300;

  const startX = width * 0.2;
  const startY = height * 0.13;

  const x = startX + width * 0.35 * progress;
  const y = startY + height * 0.18 * progress;

  const opacity = Math.sin(progress * Math.PI);

  const gradient = ctx.createLinearGradient(
    x,
    y,
    x - 130,
    y - 65
  );

  gradient.addColorStop(0, `rgba(255,255,255,${opacity})`);
  gradient.addColorStop(1, "rgba(255,255,255,0)");

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - 130, y - 65);
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 1.7;
  ctx.stroke();
}

function drawDistantHills() {
  ctx.beginPath();
  ctx.moveTo(0, height);

  ctx.lineTo(0, height * 0.79);
  ctx.quadraticCurveTo(
    width * 0.16,
    height * 0.69,
    width * 0.35,
    height * 0.79
  );

  ctx.quadraticCurveTo(
    width * 0.54,
    height * 0.64,
    width * 0.72,
    height * 0.78
  );

  ctx.quadraticCurveTo(
    width * 0.88,
    height * 0.69,
    width,
    height * 0.76
  );

  ctx.lineTo(width, height);
  ctx.closePath();

  ctx.fillStyle = "#101827";
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(0, height * 0.86);

  ctx.quadraticCurveTo(
    width * 0.2,
    height * 0.76,
    width * 0.42,
    height * 0.86
  );

  ctx.quadraticCurveTo(
    width * 0.66,
    height * 0.73,
    width,
    height * 0.85
  );

  ctx.lineTo(width, height);
  ctx.closePath();

  ctx.fillStyle = "#08100f";
  ctx.fill();
}

function drawGrass(time) {
  const groundY = height;

  for (const blade of grassBlades) {
    const wind =
      Math.sin(
        time * settings.windSpeed +
        blade.windOffset +
        blade.x * 0.015
      ) * blade.height * settings.windStrength;

    const tipX =
      blade.x +
      blade.height * blade.lean +
      wind;

    const tipY = groundY - blade.height;

    const controlX =
      blade.x +
      blade.height * blade.lean * 0.4 +
      wind * 0.45;

    const controlY =
      groundY - blade.height * 0.55;

    const shades = [
      "#07130d",
      "#0a1c12",
      "#0d2416"
    ];

    ctx.beginPath();
    ctx.moveTo(blade.x, groundY);
    ctx.quadraticCurveTo(
      controlX,
      controlY,
      tipX,
      tipY
    );

    ctx.strokeStyle = shades[blade.shade];
    ctx.lineWidth = blade.width;
    ctx.stroke();
  }
}

function drawPlants(time) {
  for (const plant of plants) {
    const baseX = plant.x;
    const baseY = height;

    const sway =
      Math.sin(
        time * settings.windSpeed +
        plant.windOffset
      ) * plant.height * 0.045;

    const tipX = baseX + sway;
    const tipY = baseY - plant.height;

    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.quadraticCurveTo(
      baseX + sway * 0.3,
      baseY - plant.height * 0.55,
      tipX,
      tipY
    );

    ctx.strokeStyle = "#06110b";
    ctx.lineWidth = 3 * plant.scale;
    ctx.stroke();

    for (let i = 1; i <= plant.branches; i++) {
      const branchPosition =
        i / (plant.branches + 1);

      const branchY =
        baseY - plant.height * branchPosition;

      const centerX =
        baseX + sway * branchPosition;

      const side = i % 2 === 0 ? 1 : -1;

      drawLeaf(
        centerX,
        branchY,
        side,
        plant.scale,
        sway
      );
    }
  }
}

function drawLeaf(x, y, side, scale, sway) {
  const leafLength = 18 * scale;
  const leafHeight = 6 * scale;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(
    side * -0.45 +
    sway * 0.002
  );

  ctx.beginPath();
  ctx.moveTo(0, 0);

  ctx.quadraticCurveTo(
    side * leafLength * 0.55,
    -leafHeight,
    side * leafLength,
    0
  );

  ctx.quadraticCurveTo(
    side * leafLength * 0.55,
    leafHeight,
    0,
    0
  );

  ctx.fillStyle = "#091a10";
  ctx.fill();

  ctx.restore();
}

function drawGround() {
  const gradient = ctx.createLinearGradient(
    0,
    height * 0.89,
    0,
    height
  );

  gradient.addColorStop(0, "#07110b");
  gradient.addColorStop(1, "#020604");

  ctx.fillStyle = gradient;
  ctx.fillRect(
    0,
    height * 0.9,
    width,
    height * 0.1
  );
}

function animate(time) {
  ctx.clearRect(0, 0, width, height);

  drawSky();
  drawStars(time);
  drawShootingStar(time);
  drawMoon();
  drawDistantHills();
  drawGround();
  drawPlants(time);
  drawGrass(time);

  requestAnimationFrame(animate);
}

window.addEventListener("resize", resizeCanvas);

window.addEventListener("pointermove", event => {
  mouseX = event.clientX;
  mouseY = event.clientY;
});

window.addEventListener("pointerleave", () => {
  mouseX = width / 2;
  mouseY = height / 2;
});

resizeCanvas();
requestAnimationFrame(animate);
