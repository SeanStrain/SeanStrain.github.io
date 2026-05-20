/*
    Copyright (C) 2023 Sean Strain.
    This file is part of seanstrain.github.io.

    seanstrain.github.io is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    seanstrain.github.io is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with seanstrain.github.io. If not, see <http://www.gnu.org/licenses/>.
*/

// --- DOM & Canvas Setup ---
const canvasEl     = document.querySelector('canvas');
const context      = canvasEl.getContext('2d');
const body         = document.getElementById('body');
const info_wrapper = document.getElementById('attractor-info');

canvasEl.width  = innerWidth;
canvasEl.height = innerHeight;

let midx = innerWidth  / 2;
let midy = innerHeight / 2;

// --- Colour Classes ---

class HSLObject {
  constructor(hue, sat, light) {
    this.hue   = hue;
    this.sat   = sat;
    this.light = light;
    this._refresh();
  }

  _refresh() {
    this.hue   = this.hue   % 361;
    this.sat   = this.sat   % 101;
    this.light = this.light % 101;
    this.hsl   = `hsl(${this.hue}, ${this.sat}%, ${this.light}%)`;
  }

  editHue(v)   { this.hue   += v; this._refresh(); }
  editSat(v)   { this.sat   += v; this._refresh(); }
  editLight(v) { this.light += v; this._refresh(); }
  setLight(v)  { this.light  = v; this._refresh(); }
}

class RGBObject {
  constructor(red, green, blue) {
    this.rgbMax = 256;
    this.red    = red;
    this.green  = green;
    this.blue   = blue;
    this._refresh();
  }

  _refresh() {
    this.red   = this.red   % this.rgbMax;
    this.green = this.green % this.rgbMax;
    this.blue  = this.blue  % this.rgbMax;
    this.rgb   = `rgb(${this.red}, ${this.green}, ${this.blue})`;
  }

  editRed(v)   { this.red   += v; this._refresh(); }
  editGreen(v) { this.green += v; this._refresh(); }
  editBlue(v)  { this.blue  += v; this._refresh(); }
  editAll(v)   { this.red += v; this.green += v; this.blue += v; this._refresh(); }
}

function randomHSL(hue = Math.random() * 360, sat = Math.random() * 100, light = Math.random() * 100) {
  return new HSLObject(hue, sat, light);
}

// --- Canvas ---

class Canvas {
  constructor(canvas, context, colour, id) {
    this.canvas     = canvas;
    this.context    = context;
    this.colour     = colour;
    this.baseColour = colour;
    this.id         = id;
  }

  update() {
    if (updateCanvas) {
      this.context.fillStyle = this.colour;
      this.context.clearRect(0, 0, innerWidth, innerHeight);
    }
  }

  initialise() {
    this.context.fillStyle = this.colour;
    this.context.fillRect(0, 0, innerWidth, innerHeight);
  }
}

const canvasColour = `rgba(${10}, ${10}, ${12}, 0.005)`;
const canvas = new Canvas(canvasEl, context, canvasColour, '0');

const sizeWeighting = 2;

// --- Stroke ---

class Stroke {
  constructor(begin_point, end_point, z, alpha) {
    this.begin_point = { ...begin_point };
    this.end_point   = { ...end_point };
    this.z           = z;
    this.alpha       = alpha;
    this.life        = 70;
    this.minAlpha    = this.alpha / this.life;
    this.size        = 0;
    this.new         = true;

    const miniTick = total_ticks / 10;
    const pct      = (this.begin_point.x + this.begin_point.y + miniTick) % 200;
    this.colour    = getColourAtPercentage(pct);
  }

  draw() {
    this.new    = false;
    this.alpha -= this.minAlpha;
    this.life  -= 1;

    context.globalAlpha = this.alpha;

    let bp = rotateX(this.begin_point, rotationX);
    bp = rotateY(bp, rotationY);
    bp = rotateZ(bp, rotationZ);

    let ep = rotateX(this.end_point, rotationX);
    ep = rotateY(ep, rotationY);
    ep = rotateZ(ep, rotationZ);

    const smx = currentAttractor.size_modifier_x;
    const smy = currentAttractor.size_modifier_y;

    const begin_x = (bp.x * focalLength) / (bp.z + focalLength) * smx + midx;
    const begin_y = (bp.y * focalLength) / (bp.z + focalLength) * smy + midy;
    const end_x   = (ep.x * focalLength) / (ep.z + focalLength) * smx + midx;
    const end_y   = (ep.y * focalLength) / (ep.z + focalLength) * smy + midy;

    const { offsetX, offsetY } = getTranslation(innerWidth, innerHeight, scale);

    this.size = (((begin_x * scale + offsetX) - (end_x * scale + offsetX)) +
                 ((begin_y * scale + offsetY) - (end_y * scale + offsetY))) * 2;

    if (show_strokes) {
      context.beginPath();
      context.moveTo(begin_x * scale + offsetX, begin_y * scale + offsetY);
      context.lineTo(end_x   * scale + offsetX, end_y   * scale + offsetY);
      context.strokeStyle = this.colour;
      context.stroke();
    }
  }

  update() { this.draw(); }
}

// --- Particle ---

class Particle {
  constructor(x, y, z = 0, type = 0) {
    this.x    = x;
    this.y    = y;
    this.z    = z;
    this.type = type;
    this.alpha = 1;
  }

  draw() {
    const old_x = this.x;
    const old_y = this.y;
    const old_z = this.z;

    const xyz = currentAttractor.attractor(this.x, this.y, this.z);
    this.x = xyz.x;
    this.y = xyz.y;
    this.z = xyz.z;

    let begin_point = { x: old_x, y: old_y, z: old_z };
    let end_point   = { x: this.x, y: this.y, z: this.z };

    if (drawing) {
      strokes.push(new Stroke(begin_point, end_point, this.z, 1));
    }

    begin_point = rotateX(begin_point, rotationX);
    begin_point = rotateY(begin_point, rotationY);
    begin_point = rotateZ(begin_point, rotationZ);

    end_point = rotateX(end_point, rotationX);
    end_point = rotateY(end_point, rotationY);
    end_point = rotateZ(end_point, rotationZ);

    const smx = currentAttractor.size_modifier_x;
    const smy = currentAttractor.size_modifier_y;

    const end_x = (end_point.x * focalLength) / (end_point.z + focalLength) * smx + midx;
    const end_y = (end_point.y * focalLength) / (end_point.z + focalLength) * smy + midy;

    const radius     = currentAttractor.getParticleRadius();
    const minSize    = radius;
    const maxSize    = radius * 1.5;
    const depthFactor = 1 - (-end_point.z * 50 - (-focalLength / 10)) / (2 * focalLength / 10);
    const adjustedSize = Math.max(
      Math.min(Math.max(lerp(minSize, maxSize, depthFactor), minSize), maxSize) *
      Math.max((scale - 1) / 4 * depthFactor, 0.5),
      minSize
    );

    if (show_particles) {
      const hue = Math.abs(end_x / 10);
      const sat = Math.abs(end_y / 10);
      const { offsetX, offsetY } = getTranslation(innerWidth, innerHeight, scale);

      context.beginPath();
      context.fillStyle = currentAttractor.colour(hue, sat, this.z);
      context.arc(
        Math.floor(end_x * scale + offsetX),
        Math.floor(end_y * scale + offsetY),
        adjustedSize,
        0,
        Math.PI * 2
      );
      context.fill();
    }
  }

  outOfBounds() {
    return Math.abs(this.x) > 10000 || Math.abs(this.y) > 10000 || Math.abs(this.z) > 10000;
  }
}

// --- State ---

let currentAttractor;
let state;
let particles  = [];
let strokes    = [];
let drawing    = true;
let generating = false;
let first_init = true;
let focalLength = 1000;
let info;
let axis1, axis2, axis3;

// --- Init ---

function init() {
  document.getElementById('menu-button').classList.add('visible');
  const spans = [
    document.getElementById('menu-1'),
    document.getElementById('menu-2'),
    document.getElementById('menu-3'),
  ];

  const things = $('#variable-wrapper').children();
  for (let i = 2; i < things.length; i++) {
    if (things[i].id) {
      things[i].style.display = 'none';
    }
  }

  if (first_init) {
    const numAttractors = $('#attractor-state').children().filter('option').length;
    state = Math.floor(Math.random() * numAttractors);
    document.getElementById('attractor-state').value = state;

    const menu1  = document.getElementById('menu-1');
    const height = parseInt(window.getComputedStyle(menu1).getPropertyValue('height').split('px')[0]);
    spans.forEach((span, index) => {
      setTimeout(() => {
        let h = 0;
        if (index === 0) h = -height;
        if (index === 2) h =  height;
        const target = 10 * index - 10 + h;
        gsap.to(span, { transform: `translate(0, ${target}px)`, duration: 0.8 });
      }, 300 * index);
    });
  }

  axis1 = 'x'; document.getElementById('axis-1').value = 'x';
  axis2 = 'y'; document.getElementById('axis-2').value = 'y';
  axis3 = 'z'; document.getElementById('axis-3').value = 'z';

  if (!first_init) {
    info.style.display = 'none';
    info.style.opacity = 0;
  }

  currentAttractor = new ATTRACTOR_REGISTRY[state]();

  ['x', 'y', 'z'].forEach(a => {
    gsap.to(document.getElementById(`${a}-axis`), { transform: '', duration: 0.5 });
  });

  info.style.display = '';
  setTimeout(() => {
    gsap.to(info_wrapper, { opacity: 1, duration: 2 });
    gsap.to(info, { opacity: 1, duration: 2 });
  }, 1500);

  currentAttractor.resize_modifier();
  currentAttractor.generation();
  gradientPresetChange();
  canvas.initialise();

  if (first_init) {
    animate();
    first_init = false;
  }
}

// --- Animation Loop ---

let total_ticks = 0;
let ticks       = 0;
let fps         = 60;
let lastFps     = 0;

function animate() {
  if (!drawing) {
    total_ticks = ticks = 0;
    fps = 60;
    lastFps = 0;
    return;
  }

  animationId = requestAnimationFrame(animate);
  canvas.update();

  let magnitude = 0;
  strokes.forEach((stroke, index) => {
    magnitude += Math.abs(stroke.size);
    if (stroke.alpha < stroke.minAlpha) {
      strokes.splice(index, 1);
    } else if (stroke.new) {
      stroke.draw();
    } else {
      stroke.update();
    }
  });

  if (playMusic && audioContext && total_ticks % 5 === 0) {
    generateMusic(magnitude / Math.max(strokes.length, 1) / sizeWeighting);
  }

  particles.forEach((particle, index) => {
    if (particle.outOfBounds()) {
      particles.splice(index, 1);
    }
    particle.draw();
  });

  const now = Date.now();
  if (now - lastFps >= 1000) {
    lastFps = now;
    fps     = ticks;
    ticks   = 0;
    document.getElementById('framerate').innerHTML = fps;
  }

  debugParticles();
  total_ticks++;
  ticks++;
}

// --- Resize ---

addEventListener('resize', () => {
  canvasEl.width  = innerWidth;
  canvasEl.height = innerHeight;
  if (currentAttractor) currentAttractor.resize_modifier();
  midx = canvasEl.width  / 2;
  midy = canvasEl.height / 2;
});

// --- Click to Start ---

let play = false;
addEventListener('click', () => {
  if (!play) {
    play = true;
    // var audio = new Audio('Jeux.mp3'); audio.play();
    gsap.to(document.getElementById('start-wrapper'), { color: 'transparent', duration: 0.8 });
    setTimeout(init, 800);
  }
});

// --- Audio ---

let audioContext = new (window.AudioContext || window.webkitAudioContext)();

function generateMusic(magnitude) {
  magnitude = Math.abs(magnitude);
  const oscillator = audioContext.createOscillator();
  const gainNode   = audioContext.createGain();
  const filter     = audioContext.createBiquadFilter();

  oscillator.frequency.setValueAtTime(Math.min(Math.floor(200 + magnitude * 15), 1000), audioContext.currentTime);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1000, audioContext.currentTime);

  oscillator.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioContext.destination);

  const volume = Math.min(magnitude / 200, 0.1);
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.1);
  gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5);

  oscillator.type = 'triangle';
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 1.5);
}

// --- Reset ---

function clearup() {
  audioContext = undefined;
  gsap.to(info_wrapper, { opacity: 0, duration: 1 });
  setTimeout(() => { info.style.opacity = '0'; }, 1005);
  particles = [];
  drawing   = true;
}

function resetAttractor() {
  clearup();
  generating = false;
  setTimeout(() => {
    strokes      = [];
    particles    = [];
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    init();
  }, 2000);
}

// --- Attractor Select ---

const attractor_state = document.getElementById('attractor-state');
attractor_state.addEventListener('change', () => {
  drawing = false;
  state   = parseInt(attractor_state.value);
  resetAttractor();
});

// --- UI Toggles ---

let playMusic = false;
document.getElementById('play-music').addEventListener('change', () => { playMusic = !playMusic; });

let show_ui = true;
const show_ui_el = document.getElementById('show-ui');
show_ui_el.addEventListener('change', showUI);

function showUI() {
  show_ui = !show_ui;
  show_ui_el.value = show_ui ? 'true' : 'false';

  const elements = [
    document.getElementById('framerate'),
    document.getElementById('attractor-info'),
    document.getElementById('menu'),
    document.getElementById('menu-button'),
  ];
  const opacity = show_ui ? 1 : 0;
  elements.forEach(el => gsap.to(el, { opacity, duration: 0.5 }));
}

document.addEventListener('keydown', event => {
  if ((event.key === 'Escape' || event.key === 'Esc' || event.keyCode === 27) && !show_ui) {
    showUI();
  }
  if (event.key === '`') {
    debug = !debug;
  }
});

let show_strokes = true;
document.getElementById('show-strokes').addEventListener('change', () => { show_strokes = !show_strokes; });

let show_particles = false;
document.getElementById('show-particles').addEventListener('change', () => { show_particles = !show_particles; });

let show_framerate = false;
document.getElementById('show-framerate').addEventListener('change', () => {
  show_framerate = !show_framerate;
  document.getElementById('framerate').style.display = show_framerate ? 'block' : 'none';
});

let updateCanvas = true;
document.getElementById('update-canvas').addEventListener('change', () => { updateCanvas = !updateCanvas; });

// --- Line Width ---

context.lineWidth = 2;
const lineWidthElement = document.getElementById('line-width');
lineWidthElement.addEventListener('change', () => {
  context.lineWidth = parseInt(lineWidthElement.value);
});

// --- Particle Count ---

let num_particles = 80;
const numParticlesElement = document.getElementById('particles');
numParticlesElement.value = num_particles;

numParticlesElement.addEventListener('change', () => {
  const new_count = parseInt(numParticlesElement.value);
  const diff      = new_count - num_particles;
  if (diff > 0) {
    for (let i = 0; i < diff;  i++) currentAttractor.spawnNewParticle();
  } else {
    for (let i = 0; i < -diff; i++) particles.pop();
  }
  num_particles = new_count;
});

// --- Restart ---

document.getElementById('restart').addEventListener('click', resetAttractor);

// --- Zoom (Scroll) ---

let targetScale  = 1;
let scale        = 1;
const lerpAmount = 0.1;

document.addEventListener('wheel', e => {
  targetScale -= e.deltaY * 0.0007;
});

function updateScale() {
  scale = lerp(scale, targetScale, lerpAmount);
  requestAnimationFrame(updateScale);
}
updateScale();

// --- Pan & Rotate (Mouse) ---

let offsetX, offsetY;
let targetDeltaX = 0, targetDeltaY = 0;
let deltaX = 0, deltaY = 0;
let lastMousePosition = { x: 0, y: 0 };
let isDragging = false;

let isRightClick = false;
let lastMouseX = 0, lastMouseY = 0;
let targetRotationX = 0, targetRotationY = 0;
let rotationX = 0, rotationY = 0, rotationZ = 0;

body.addEventListener('mousedown', e => {
  if (e.button === 0) {
    isDragging        = true;
    lastMousePosition = { x: e.clientX, y: e.clientY };
  }
  if (e.button === 2) {
    isRightClick  = true;
    lastMouseX    = e.clientX;
    lastMouseY    = e.clientY;
    updateCanvas  = true;
    document.getElementById('update-canvas').value = 'true';
  }
});

body.addEventListener('mousemove', e => {
  if (isDragging) {
    targetDeltaX += e.clientX - lastMousePosition.x;
    targetDeltaY += e.clientY - lastMousePosition.y;
    lastMousePosition = { x: e.clientX, y: e.clientY };
  }
  if (isRightClick) {
    targetRotationX += (e.clientY - lastMouseY) * 0.005;
    targetRotationY += (e.clientX - lastMouseX) * 0.005;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  }
});

body.addEventListener('mouseup', e => {
  if (e.button === 0) isDragging    = false;
  if (e.button === 2) isRightClick  = false;
});

body.addEventListener('mouseleave', () => {
  isDragging   = false;
  isRightClick = false;
});

const preventContext = e => e.preventDefault();
canvasEl.addEventListener('contextmenu', preventContext);
body.addEventListener('contextmenu', preventContext);

// --- Rotation Math ---

function rotateX(point, angle) {
  const cos = Math.cos(angle), sin = Math.sin(angle);
  return { x: point.x, y: point.y * cos - point.z * sin, z: point.y * sin + point.z * cos };
}

function rotateY(point, angle) {
  const cos = Math.cos(angle), sin = Math.sin(angle);
  return { x: point.x * cos + point.z * sin, y: point.y, z: -point.x * sin + point.z * cos };
}

function rotateZ(point, angle) {
  const cos = Math.cos(angle), sin = Math.sin(angle);
  return { x: point.x * cos - point.y * sin, y: point.x * sin + point.y * cos, z: point.z };
}

function updateTranslationAndRotation() {
  deltaX     = lerp(deltaX,     targetDeltaX,     lerpAmount);
  deltaY     = lerp(deltaY,     targetDeltaY,     lerpAmount);
  rotationX  = lerp(rotationX,  targetRotationX,  lerpAmount);
  rotationY  = lerp(rotationY,  targetRotationY,  lerpAmount);
  requestAnimationFrame(updateTranslationAndRotation);
}
updateTranslationAndRotation();

function getTranslation(canvasWidth, canvasHeight, scale) {
  offsetX = deltaX + (canvasWidth  - canvasWidth  * scale) / 2;
  offsetY = deltaY + (canvasHeight - canvasHeight * scale) / 2;
  return { offsetX, offsetY };
}

// --- Utils ---

function lerp(start, end, amount) {
  return start * (1 - amount) + end * amount;
}

// --- Debug ---

let debug = false;
function debugParticles() {
  if (!debug) return;
  const step = 20;
  for (let i = 0; i < particles.length; i += step) {
    const p = particles[i];
    console.log(p.x, p.y, p.z, p.type);
  }
}

/*****************************************************************************
 * Attractor Base Class
 *****************************************************************************/

class Attractor {
  constructor() {
    deltaX = 0;
    deltaY = 0;
  }

  getSpeedModifier()  { return parseFloat(document.getElementById('speed').value); }
  getNumParticles()   { return parseInt(document.getElementById('particles').value); }
  getParticleRadius() { return parseFloat(document.getElementById('radius').value); }

  getSizeModifier() { return this.resize_modifier(); }

  // Default colour: hsl(hue/5, sat/5%, 50%)
  colour(hue, sat /*, z */) {
    return `hsl(${hue / 5}, ${sat / 5}%, 50%)`;
  }

  // Default particle generation — subclasses override as needed
  generation() {
    generating = true;
    for (let i = 1; i < this.getNumParticles(); i++) {
      const mid = 1.5;
      particles.push(new Particle(-mid + i / 25, -mid + i / 25));
    }
    generating = false;
  }

  // Default single-particle spawn — subclasses override as needed
  spawnNewParticle() {
    const mid = 1.5;
    particles.push(new Particle(-mid, -mid));
  }
}

/*****************************************************************************
 * Lorenz
 *****************************************************************************/

class LorenzAttractor extends Attractor {
  constructor() {
    super();
    info = document.getElementById('lorenz-info');
    document.getElementById('lorenz-variables').style.display = '';
  }

  getAlpha() { return parseFloat(document.getElementById('lorenz-alpha').value); }
  getBeta()  { return parseFloat(document.getElementById('lorenz-beta').value);  }
  getRho()   { return parseFloat(document.getElementById('lorenz-rho').value);   }

  resize_modifier() {
    this.size_modifier_x = innerWidth  / 40;
    this.size_modifier_y = innerHeight / 60;
    return { x: this.size_modifier_x, y: this.size_modifier_y };
  }

  colour(hue, sat) {
    return `hsl(${hue / 10}, ${sat / 10}%, 50%)`;
  }

  attractor(x, y, z) {
    const dt   = this.getSpeedModifier() / 4 * 0.017;
    const axis = { x, y, z };
    const dx = axis.x + (axis.y - axis.x) * this.getAlpha();
    const dy = axis.y + (axis.x * (this.getRho() - axis.z) - axis.y);
    const dz = axis.z + (axis.x * axis.y  - this.getBeta() * axis.z);
    axis.x += dx * dt;
    axis.y += dy * dt;
    axis.z += dz * dt;
    return axis;
  }
}

/*****************************************************************************
 * Lorenz 84
 *****************************************************************************/

class Lorenz84Attractor extends Attractor {
  constructor() {
    super();
    info = document.getElementById('lorenz84-info');
    document.getElementById('lorenz84-variables').style.display = '';
  }

  getA() { return parseFloat(document.getElementById('lorenz84-a').value); }
  getB() { return parseFloat(document.getElementById('lorenz84-b').value); }
  getF() { return parseFloat(document.getElementById('lorenz84-f').value); }
  getG() { return parseFloat(document.getElementById('lorenz84-g').value); }

  resize_modifier() {
    this.size_modifier_x = innerWidth  / 20;
    this.size_modifier_y = innerHeight / 20;
    return { x: this.size_modifier_x, y: this.size_modifier_y };
  }

  colour(hue, sat, z) {
    return `hsl(${hue - z * 3}, ${sat}%, 50%)`;
  }

  attractor(x, y, z) {
    const dt   = this.getSpeedModifier() / 10 * 0.017;
    const a = this.getA(), b = this.getB(), f = this.getF(), g = this.getG();
    const axis = { x, y, z };
    const dx = -a * axis.x + axis.y * axis.y - axis.z * axis.z + a * f;
    const dy = -axis.y + axis.x * axis.y - b * axis.x * axis.z + g;
    const dz = -axis.z + b * axis.x * axis.y + axis.x * axis.z;
    axis.x += dx * dt;
    axis.y += dy * dt;
    axis.z += dz * dt;
    return axis;
  }
}

/*****************************************************************************
 * Aizawa
 *****************************************************************************/

class AizawaAttractor extends Attractor {
  constructor() {
    super();
    deltaX = 0;
    deltaY = -100;
    info = document.getElementById('aizawa-info');
    document.getElementById('aizawa-variables').style.display = '';
  }

  getAlpha()   { return parseFloat(document.getElementById('aizawa-alpha').value);   }
  getBeta()    { return parseFloat(document.getElementById('aizawa-beta').value);    }
  getGamma()   { return parseFloat(document.getElementById('aizawa-gamma').value);   }
  getDelta()   { return parseFloat(document.getElementById('aizawa-delta').value);   }
  getEpsilon() { return parseFloat(document.getElementById('aizawa-epsilon').value); }
  getZeta()    { return parseFloat(document.getElementById('aizawa-zeta').value);    }

  resize_modifier() {
    this.size_modifier_x = 0.25 * innerHeight;
    this.size_modifier_y = 0.25 * innerHeight;
    return { x: this.size_modifier_x, y: this.size_modifier_y };
  }

  colour(hue, sat) {
    return `hsl(${hue}, ${sat}%, 50%)`;
  }

  generation() {
    generating = true;
    let j = this.getNumParticles();
    let i = -j / 2;
    const interval = setInterval(() => {
      particles.push(new Particle(1 + i / 50, 0));
      i++;
      if (j > 0) j--;
      if (j === 0 || !generating) {
        particles.pop();
        generating = false;
        clearInterval(interval);
      }
    }, 75);
  }

  spawnNewParticle() {
    particles.push(new Particle(1, 0));
  }

  attractor(x, y, z) {
    const dt      = this.getSpeedModifier() / 30;
    const alpha   = this.getAlpha();
    const beta    = this.getBeta();
    const gamma   = this.getGamma();
    const delta   = this.getDelta();
    const epsilon = this.getEpsilon();
    const zeta    = this.getZeta();

    const axis = { x, y, z };
    let temp   = {
      x: axis.x,
      y: axis.y + (axis.y < 0 ? -1 : 1) * Math.random() * 0.001,
      z: axis.z,
    };

    temp.z += ((axis.y - beta) * axis.z - delta * axis.x) * dt;
    temp.x += (delta * axis.z + (axis.y - beta) * axis.x) * dt;

    const z1 = gamma + alpha * axis.y - Math.pow(axis.y, 3) / 3 -
               (Math.pow(axis.z, 2) + Math.pow(axis.x, 2));
    const z2 = (1 + epsilon * axis.y) + zeta * axis.y * Math.pow(axis[axis3], 3);
    temp.y += z1 * z2 * dt;

    axis.z = temp.z + Math.random() * 0.0001;
    axis.x = temp.x + (temp.x < 0 ? -1 : 1) * Math.random() * 0.0001;
    axis.y = temp.y + Math.random() * 0.0001;
    return axis;
  }
}

/*****************************************************************************
 * Thomas
 *****************************************************************************/

class ThomasAttractor extends Attractor {
  constructor() {
    super();
    info = document.getElementById('thomas-info');
    document.getElementById('thomas-variables').style.display = '';
  }

  getBeta() { return parseFloat(document.getElementById('thomas-beta').value); }

  resize_modifier() {
    this.size_modifier_x = innerWidth  / 9;
    this.size_modifier_y = innerHeight / 9;
    return { x: this.size_modifier_x, y: this.size_modifier_y };
  }

  colour(hue, sat) {
    return `hsl(${hue}, ${sat}%, 50%)`;
  }

  attractor(x, y, z) {
    const dt   = this.getSpeedModifier() * 2.5 * 0.017;
    const b    = this.getBeta();
    const axis = { x, y, z };
    const dx = Math.sin(axis.y) - b * axis.x;
    const dy = Math.sin(axis.z) - b * axis.y;
    const dz = Math.sin(axis.x) - b * axis.z;
    axis.x += dx * dt;
    axis.y += dy * dt;
    axis.z += dz * dt;
    return axis;
  }
}

/*****************************************************************************
 * Dadras
 *****************************************************************************/

class DadrasAttractor extends Attractor {
  constructor() {
    super();
    info = document.getElementById('dadras-info');
    document.getElementById('dadras-variables').style.display = '';
  }

  getA() { return parseFloat(document.getElementById('dadras-a').value); }
  getB() { return parseFloat(document.getElementById('dadras-b').value); }
  getC() { return parseFloat(document.getElementById('dadras-c').value); }
  getD() { return parseFloat(document.getElementById('dadras-d').value); }
  getE() { return parseFloat(document.getElementById('dadras-e').value); }

  resize_modifier() {
    this.size_modifier_x = innerWidth  / 20;
    this.size_modifier_y = innerHeight / 20;
    return { x: this.size_modifier_x, y: this.size_modifier_y };
  }

  attractor(x, y, z) {
    const dt   = this.getSpeedModifier() / 3 * 0.017;
    const axis = { x, y, z };
    const dx = axis.y - this.getA() * axis.x + this.getB() * axis.y * axis.z;
    const dy = this.getC() * axis.y - axis.x * axis.z + axis.z;
    const dz = this.getD() * axis.x * axis.y - this.getE() * axis.z;
    axis.x += dx * dt;
    axis.y += dy * dt;
    axis.z += dz * dt;
    return axis;
  }
}

/*****************************************************************************
 * Chen-Lee
 *****************************************************************************/

class ChenLeeAttractor extends Attractor {
  constructor() {
    super();
    info = document.getElementById('chen-lee-info');
    document.getElementById('chen-lee-variables').style.display = '';
  }

  getAlpha() { return parseFloat(document.getElementById('chen-lee-alpha').value); }
  getBeta()  { return parseFloat(document.getElementById('chen-lee-beta').value);  }
  getDelta() { return parseFloat(document.getElementById('chen-lee-delta').value); }

  resize_modifier() {
    this.size_modifier_x = innerWidth  / 40;
    this.size_modifier_y = innerHeight / 40;
    return { x: this.size_modifier_x, y: this.size_modifier_y };
  }

  colour(hue, sat, z) {
    return `hsl(${hue / 5 - z * 3}, ${sat / 5}%, 50%)`;
  }

  generation() {
    const half = Math.floor(this.getNumParticles() / 2);
    generating = true;
    for (let i = 1; i < this.getNumParticles(); i++) {
      const sign = Math.random() > 0.5 ? 1 : -1;
      const rand = sign * Math.random() * 0.1;
      const z0   = i < half ? -5 : 5;
      const type = i < half ? 1  : 2;
      particles.push(new Particle(rand, rand, z0 + rand, type));
    }
    generating = false;
  }

  spawnNewParticle() {
    const type = Math.random() > 0.5 ? 1 : 2;
    const z0   = type === 1 ? -5 : 5;
    particles.push(new Particle(0, 0, z0));
  }

  attractor(x, y, z) {
    const dt   = this.getSpeedModifier() / 4 * 0.017;
    const axis = { x, y, z };
    const dx = this.getAlpha() * axis.x - axis.y * axis.z;
    const dy = this.getBeta()  * axis.y + axis.x * axis.z;
    const dz = this.getDelta() * axis.z + axis.x * axis.y / 3;
    axis.x += dx * dt;
    axis.y += dy * dt;
    axis.z += dz * dt;
    return axis;
  }
}

/*****************************************************************************
 * Rössler
 *****************************************************************************/

class RosslerAttractor extends Attractor {
  constructor() {
    super();
    info = document.getElementById('rossler-info');
    document.getElementById('rossler-variables').style.display = '';
  }

  getA() { return parseFloat(document.getElementById('rossler-a').value); }
  getB() { return parseFloat(document.getElementById('rossler-b').value); }
  getC() { return parseFloat(document.getElementById('rossler-c').value); }

  resize_modifier() {
    this.size_modifier_x = innerWidth  / 5;
    this.size_modifier_y = innerHeight / 5;
    return { x: this.size_modifier_x, y: this.size_modifier_y };
  }

  attractor(x, y, z) {
    const dt   = this.getSpeedModifier() * 2 * 0.017;
    const axis = { x, y, z };
    const dx = -axis.y - axis.z;
    const dy =  axis.x + this.getA() * axis.y;
    const dz =  this.getB() + axis.z * (axis.x - this.getC());
    axis.x += dx * dt;
    axis.y += dy * dt;
    axis.z += dz * dt;
    return axis;
  }
}

/*****************************************************************************
 * Halvorsen
 *****************************************************************************/

class HalvorsenAttractor extends Attractor {
  constructor() {
    super();
    deltaX = targetDeltaX = 300;
    deltaY = targetDeltaY = 150;
    info = document.getElementById('halvorsen-info');
    document.getElementById('halvorsen-variables').style.display = '';
  }

  getA() { return parseFloat(document.getElementById('halvorsen-a').value); }

  resize_modifier() {
    this.size_modifier_x = innerWidth  / 20;
    this.size_modifier_y = innerHeight / 20;
    return { x: this.size_modifier_x, y: this.size_modifier_y };
  }

  attractor(x, y, z) {
    const dt   = this.getSpeedModifier() / 2 * 0.017;
    const a    = this.getA();
    const axis = { x, y, z };
    const dx = -a * axis.x - 4 * axis.y - 4 * axis.z - axis.y * axis.y;
    const dy = -a * axis.y - 4 * axis.z - 4 * axis.x - axis.z * axis.z;
    const dz = -a * axis.z - 4 * axis.x - 4 * axis.y - axis.x * axis.x;
    axis.x += dx * dt;
    axis.y += dy * dt;
    axis.z += dz * dt;
    return axis;
  }
}

/*****************************************************************************
 * Rabinovich-Fabrikant
 *****************************************************************************/

class RabinovichFabrikantAttractor extends Attractor {
  constructor() {
    super();
    info = document.getElementById('rabinovich-fabrikant-info');
    document.getElementById('rabinovich-fabrikant-variables').style.display = '';
  }

  getAlpha() { return parseFloat(document.getElementById('rabinovich-fabrikant-alpha').value); }
  getGamma() { return parseFloat(document.getElementById('rabinovich-fabrikant-gamma').value); }

  resize_modifier() {
    this.size_modifier_x = innerWidth  / 5;
    this.size_modifier_y = innerHeight / 5;
    return { x: this.size_modifier_x, y: this.size_modifier_y };
  }

  generation() {
    const origin = { x: 0.5, y: 1.5, z: 0.5 };
    generating = true;
    for (let i = 1; i < this.getNumParticles(); i++) {
      const rand = (Math.random() > 0.5 ? 1 : -1) * Math.random() * 0.1;
      particles.push(new Particle(origin.x + rand, origin.y + rand, origin.z + rand, 1));
    }
    generating = false;
  }

  spawnNewParticle() {
    const rand = (Math.random() > 0.5 ? 1 : -1) * Math.random() * 0.1;
    particles.push(new Particle(0.5 + rand, 1.5 + rand, 0.5 + rand, 1));
  }

  attractor(x, y, z) {
    const dt    = this.getSpeedModifier() / 2 * 0.017;
    const alpha = this.getAlpha();
    const gamma = this.getGamma();
    const axis  = { x, y, z };
    const dx = axis.y * (axis.z - 1 + axis.x * axis.x) + gamma * axis.x;
    const dy = axis.x * (3 * axis.z + 1 - axis.x * axis.x) + gamma * axis.y;
    const dz = -2 * axis.z * (alpha + axis.x * axis.y);
    axis.x += dx * dt;
    axis.y += dy * dt;
    axis.z += dz * dt;
    return axis;
  }
}

/*****************************************************************************
 * Sprott
 *****************************************************************************/

class SprottAttractor extends Attractor {
  constructor() {
    super();
    info = document.getElementById('sprott-info');
    document.getElementById('sprott-variables').style.display = '';
  }

  getA() { return parseFloat(document.getElementById('sprott-a').value); }
  getB() { return parseFloat(document.getElementById('sprott-b').value); }

  resize_modifier() {
    this.size_modifier_x = innerWidth  / 5;
    this.size_modifier_y = innerHeight / 5;
    return { x: this.size_modifier_x, y: this.size_modifier_y };
  }

  generation() {
    const origin = { x: 0.51, y: -0.34, z: 1.4 };
    generating = true;
    for (let i = 1; i < this.getNumParticles(); i++) {
      const rand = (Math.random() > 0.5 ? 1 : -1) * Math.random() * 0.25;
      particles.push(new Particle(origin.x + rand, origin.y + rand, origin.z + rand, 1));
    }
    generating = false;
  }

  spawnNewParticle() {
    const rand = (Math.random() > 0.5 ? 1 : -1) * Math.random() * 0.1;
    particles.push(new Particle(0.51 + rand, -0.34 + rand, 1.4 + rand, 1));
  }

  attractor(x, y, z) {
    const dt   = this.getSpeedModifier() * 1.5 * 0.017;
    const a    = this.getA(), b = this.getB();
    const axis = { x, y, z };
    const dx = axis.y + a * axis.x * axis.y + axis.x * axis.z;
    const dy = 1 - b * axis.x * axis.x + axis.y * axis.z;
    const dz = axis.x - axis.x * axis.x - axis.y * axis.y;
    axis.x += dx * dt;
    axis.y += dy * dt;
    axis.z += dz * dt;
    return axis;
  }
}

/*****************************************************************************
 * Three-Scroll Unified
 *****************************************************************************/

class ThreeScrollUnifiedAttractor extends Attractor {
  constructor() {
    super();
    info = document.getElementById('three-scroll-info');
    document.getElementById('three-scroll-variables').style.display = '';
  }

  getAlpha() { return parseFloat(document.getElementById('three-scroll-alpha').value); }
  getM()     { return parseFloat(document.getElementById('three-scroll-m').value);     }

  resize_modifier() {
    this.size_modifier_x = innerWidth  / 2000;
    this.size_modifier_y = innerHeight / 2000;
    return { x: this.size_modifier_x, y: this.size_modifier_y };
  }

  generation() {
    const origin = { x: 0.1, y: 1, z: -0.1 };
    generating = true;
    for (let i = 1; i < this.getNumParticles(); i++) {
      const rand = (Math.random() > 0.5 ? 1 : -1) * Math.random() * 0.1;
      particles.push(new Particle(origin.x + rand, origin.y + rand, origin.z + rand, 1));
    }
    // note: generating flag intentionally not set false here (matches original)
  }

  attractor(x, y, z) {
    const dt    = this.getSpeedModifier() / 10 * 0.017;
    const alpha = this.getAlpha();
    const axis  = { x, y, z };
    const dx = (20 * alpha + 40) * (axis.y - axis.x) + ((6 * alpha + 4) / 25) * axis.x * axis.z;
    const dy = (55 - 90 * alpha) * axis.x + (5 * alpha + 20) * axis.y - axis.x * axis.z;
    const dz = -13 / 20 * axis.x * axis.x + axis.x * axis.y + (11 - 6 * alpha) / 6 * axis.z + this.getM();
    axis.x += dx * dt;
    axis.y += dy * dt;
    axis.z += dz * dt;
    return axis;
  }
}

/*****************************************************************************
 * Generalised Chua Circuit (TODO)
 *****************************************************************************/

class GeneralisedChuaCircuit extends Attractor {
  constructor() {
    super();
    info = document.getElementById('chua-info');
    document.getElementById('chua-variables').style.display = '';
  }

  getAlpha()  { return parseFloat(document.getElementById('chua-alpha').value);   }
  getBeta()   { return parseFloat(document.getElementById('chua-beta').value);    }
  getGamma()  { return parseFloat(document.getElementById('chua-gamma').value);   }
  getMZero()  { return parseFloat(document.getElementById('chua-m-zero').value);  }
  getMOne()   { return parseFloat(document.getElementById('chua-m-one').value);   }
  getMTwo()   { return parseFloat(document.getElementById('chua-m-two').value);   }
  getMThree() { return parseFloat(document.getElementById('chua-m-three').value); }
  getMFour()  { return parseFloat(document.getElementById('chua-m-four').value);  }
  getBOne()   { return parseFloat(document.getElementById('chua-b-one').value);   }
  getBTwo()   { return parseFloat(document.getElementById('chua-b-two').value);   }
  getBThree() { return parseFloat(document.getElementById('chua-b-three').value); }
  getBFour()  { return parseFloat(document.getElementById('chua-b-four').value);  }
  getBFive()  { return parseFloat(document.getElementById('chua-b-five').value);  }

  resize_modifier() {
    this.size_modifier_x = innerWidth;
    this.size_modifier_y = innerHeight;
    return { x: this.size_modifier_x, y: this.size_modifier_y };
  }

  generation() {
    generating = true;
    for (let i = 1; i < this.getNumParticles(); i++) {
      particles.push(new Particle(i / 500, i / 500));
    }
    generating = false;
  }

  attractor(x, y, z) {
    const dt   = this.getSpeedModifier() / 50 * 0.017;
    const axis = { x, y, z };
    const dx = (axis.x + this.getAlpha() * (axis.y - this._h(axis.x))) * dt;
    const dy = (axis.x - axis.y + axis.z) * dt;
    const dz = (-this.getBeta() * axis.y - this.getGamma() * axis.z) * dt;
    axis.x += dx;
    axis.y += dy;
    axis.z += dz;
    return axis;
  }

  _h(x) {
    const ms = [this.getMOne(), this.getMTwo(), this.getMThree(), this.getMFour()];
    const bs = [this.getBOne(), this.getBTwo(), this.getBThree(), this.getBFour(), this.getBFive()];
    let expr = this.getMFour() * x;
    for (let i = 1; i < 4; i++) {
      expr += 0.5 * (ms[i - 1] - ms[i]) * (Math.abs(x + bs[i - 1]) - Math.abs(x - bs[i - 1]));
    }
    return expr;
  }
}

/*****************************************************************************
 * Clifford
 *****************************************************************************/

class CliffordAttractor extends Attractor {
  constructor() {
    super();
    info = document.getElementById('clifford-info');
    document.getElementById('clifford-variables').style.display = '';
  }

  getA() { return parseFloat(document.getElementById('clifford-a').value); }
  getB() { return parseFloat(document.getElementById('clifford-b').value); }
  getC() { return parseFloat(document.getElementById('clifford-c').value); }
  getD() { return parseFloat(document.getElementById('clifford-d').value); }

  resize_modifier() {
    this.size_modifier_x = innerWidth;
    this.size_modifier_y = innerHeight;
    return { x: this.size_modifier_x, y: this.size_modifier_y };
  }

  generation() {
    generating = true;
    for (let i = 1; i < this.getNumParticles(); i++) {
      const mid = 1.5;
      particles.push(new Particle(-mid + i / 25, -mid + i / 25));
    }
    generating = false;
  }

  attractor(x, y, z) {
    const framerate = this.getSpeedModifier();
    const dt        = 0.1;
    const a = this.getA(), b = this.getB(), c = this.getC(), d = this.getD();
    const axis = { x, y, z };
    const nx = Math.sin(a * axis.y) + c * Math.cos(a * axis.x) + Math.random() * 0.001;
    const ny = Math.sin(b * axis.x) + d * Math.cos(b * axis.y) + Math.random() * 0.001;
    axis.x = (x + nx * dt) * framerate;
    axis.y = (y + ny * dt) * framerate;
    axis.z = 1;
    return axis;
  }
}

/*****************************************************************************
 * Attractor Registry — maps selector values to classes
 *****************************************************************************/

const ATTRACTOR_REGISTRY = [
  LorenzAttractor,             // 0
  Lorenz84Attractor,           // 1
  AizawaAttractor,             // 2
  ThomasAttractor,             // 3
  DadrasAttractor,             // 4
  ChenLeeAttractor,            // 5
  RosslerAttractor,            // 6
  HalvorsenAttractor,          // 7
  RabinovichFabrikantAttractor,// 8
  SprottAttractor,             // 9
];

/*****************************************************************************
 * Colour Utilities
 *****************************************************************************/

function interpolate(start, end, factor) {
  return start + (end - start) * factor;
}

/**
 * Returns an RGB CSS string for a position in the gradient (0–200, mirrored).
 */
function getColourAtPercentage(percentage) {
  if (percentage > 100) percentage = 200 - percentage;

  const stops = Array.from(document.querySelectorAll('.gradientStop')).map(div => ({
    colour:   div.querySelector('.stopColour').value,
    stop: parseFloat(div.querySelector('.stopPosition').value),
  })).sort((a, b) => a.stop - b.stop);

  let lowerStop = stops[0];
  let upperStop = stops[stops.length - 1];
  for (let i = 1; i < stops.length; i++) {
    upperStop = stops[i];
    if (upperStop.stop >= percentage) break;
    lowerStop = upperStop;
  }

  const range    = upperStop.stop - lowerStop.stop;
  const position = (percentage - lowerStop.stop) / range;

  const lower = hexToRGB(lowerStop.colour);
  const upper = hexToRGB(upperStop.colour);
  return colourToCSS({
    r: interpolate(lower.r, upper.r, position),
    g: interpolate(lower.g, upper.g, position),
    b: interpolate(lower.b, upper.b, position),
  });
}

function colourToCSS(colour) {
  return colour.a !== undefined
    ? `rgba(${colour.r}, ${colour.g}, ${colour.b}, ${colour.a})`
    : `rgb(${colour.r}, ${colour.g}, ${colour.b})`;
}

function hexToRGB(hex) {
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  const a = hex.length > 7 ? parseInt(hex.substring(7, 9), 16) : 1;
  return { r, g, b, a };
}

/*****************************************************************************
 * Gradient UI
 *****************************************************************************/

function addGradientStop(color, position) {
  const stopDiv = document.createElement('div');
  stopDiv.classList.add('gradientStop');

  const stopColour = Object.assign(document.createElement('input'), {
    type: 'color', value: color,
  });
  stopColour.classList.add('stopColour');

  const stopPosition = Object.assign(document.createElement('input'), {
    type: 'number', min: '0', max: '100', value: position,
  });
  stopPosition.classList.add('stopPosition');

  stopDiv.appendChild(stopColour);
  stopDiv.appendChild(stopPosition);
  document.getElementById('stops').appendChild(stopDiv);
}

document.getElementById('addStop').addEventListener('click', () => addGradientStop('#000000', 50));

const GRADIENT_PRESETS = {
  0: [['#ff0000', 0], ['#00ff00', 50], ['#0000ff', 100]],                                                         // Red-Green-Blue
  1: [['#40e0d0', 0], ['#ff8c00', 50], ['#ff0080', 100]],                                                         // Wedding Cake
  2: [['#ffff00', 0], ['#ff8000', 50], ['#a80000', 100]],                                                         // Sunset
  3: [['#ee0979', 0], ['#ff6a00', 100]],                                                                           // Spanish Sunset
  4: [['#21C4E7', 0], ['#21C4E7', 45], ['#fc741e', 50], ['#fc741e', 95], ['#21C4E7', 100]],                       // Tron
  5: [['#ff0000', 0], ['#ff8000', 20], ['#ffff00', 40], ['#00ff00', 60], ['#0000ff', 80], ['#ff00ff', 100]],      // Spectrum
};

function gradientPresetChange() {
  const preset = parseInt(document.getElementById('presets').value);
  document.getElementById('stops').innerHTML = '';
  (GRADIENT_PRESETS[preset] || []).forEach(([color, pos]) => addGradientStop(color, pos));
}

document.getElementById('presets').addEventListener('input', gradientPresetChange);
