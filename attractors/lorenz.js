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

/* TODO:

more attractors
fix particles
perspective / cinematic camera
user input for colours

*/

// GLOBALS:
const canvasEl  = document.querySelector('canvas');
const context   = canvasEl.getContext('2d');
const body = document.getElementById("body");
const info_wrapper = document.getElementById("attractor-info");

canvasEl.width  = innerWidth;
canvasEl.height = innerHeight;

var midx = innerWidth  / 2;
var midy = innerHeight / 2;

// COLOUR:
class HSLObject
{
  constructor(hue, sat, light)
  {
    this.hue    = hue;
    this.sat    = sat;
    this.light  = light;
    this.makeHSL();
  }

  makeHSL()
  {
    this.hue   = this.hue   % 361;
    this.sat   = this.sat   % 101;
    this.light = this.light % 101;
    this.hsl = `hsl(${this.hue}, ${this.sat}%, ${this.light}%)`;
  }

  editHue(change)
  {
    this.hue += change;
    this.makeHSL();
  }

  editSat(change)
  {
    this.sat += change;
    this.makeHSL();
  }

  editLight(change)
  {
    this.light += change;
    this.makeHSL();
  }

  setLight(value)
  {
    this.light = value;
    this.makeHSL();
  }
}

class RGBObject
{
  constructor(red, green, blue)
  {
    this.rgbMax = 256;
    this.red   = red;
    this.green = green;
    this.blue  = blue;
    this.makeRGB();
  }

  makeRGB()
  {
    this.red   = this.red   % this.rgbMax;
    this.green = this.green % this.rgbMax;
    this.blue  = this.blue  % this.rgbMax;
    this.rgb = `rgb(${this.red}, ${this.green}, ${this.blue})`;
  }

  editRed(change)
  {
    this.red += change
    this.makeRGB()
  }

  editGreen(change)
  {
    this.green += change
    this.makeRGB()
  }

  editBlue(change)
  {
    this.blue += change
    this.makeRGB()
  }

  editAll(change)
  {
    this.red += change
    this.green += change
    this.blue += change
    this.makeRGB()
  }
}

function randomHSL(hue, sat, light)
{
  if (typeof hue === 'undefined')
  {
    hue = Math.random() * 360
  }

  if (typeof sat === 'undefined')
  {
    sat = Math.random() * 100
  }

  if (typeof light === 'undefined')
  {
    light = Math.random() * 100
  }


  const randomHSLObject = new HSLObject(hue, sat, light)
  return randomHSLObject
}

class Canvas
{
    constructor(canvas, context, colour, id)
    {
      this.context    = context;
      this.canvas     = canvas;
      this.colour     = colour;
      this.baseColour = colour;
      this.id         = id;
      this.update = function()
        {
            if (updateCanvas)
            {
                this.context.fillStyle = this.colour;
                this.context.clearRect(0, 0, innerWidth, innerHeight);
            }
        }
    }

    initialise()
    {
        this.context.fillStyle = this.colour;
        this.context.fillRect(0, 0, innerWidth, innerHeight);
    }
}

var canvasColour = `rbga(${10}, ${10}, ${12}, 0.005)`;
var canvas  = new Canvas(canvasEl, context, canvasColour, '0');

const sizeWeighting = 2;

var colour = function() {}
class Stroke
{
    constructor(begin_point, end_point, z, alpha)
    {
        this.begin_point = {... begin_point};
        this.end_point = {... end_point};
        this.z = z;

        this.alpha = alpha;
        this.life = 70;
        this.minAlpha = this.alpha / this.life;

        const miniTick = total_ticks / 10;
        const percentage = (this.begin_point.x + this.begin_point.y + miniTick) % 200;
        this.colour = getColourAtPercentage(percentage);

        this.size = 0;

        this.new = true;
    }

    draw()
    {
        this.new = false;

        this.alpha -= this.minAlpha;
        context.globalAlpha = this.alpha;

        this.life -= 1;
    
        let begin_rotated = rotateX(this.begin_point, rotationX);
        begin_rotated = rotateY(begin_rotated, rotationY);
        begin_rotated = rotateZ(begin_rotated, rotationZ);
      
        let end_rotated = rotateX(this.end_point, rotationX);
        end_rotated = rotateY(end_rotated, rotationY);
        end_rotated = rotateZ(end_rotated, rotationZ);
      
        const begin_x = (begin_rotated.x * focalLength) / (begin_rotated.z + focalLength) * currentAttractor.size_modifier_x + midx;
        const begin_y = (begin_rotated.y * focalLength) / (begin_rotated.z + focalLength) * currentAttractor.size_modifier_y + midy;
      
        const end_x = (end_rotated.x * focalLength) / (end_rotated.z + focalLength) * currentAttractor.size_modifier_x + midx;
        const end_y = (end_rotated.y * focalLength) / (end_rotated.z + focalLength) * currentAttractor.size_modifier_y + midy;
    
        let { offsetX, offsetY } = getTranslation(innerWidth, innerHeight, scale);

        this.size = (((begin_x * scale + offsetX)  - (end_x * scale + offsetX)) + ((begin_y * scale + offsetY) - (end_y * scale + offsetY))) * 2;
    
        if (show_strokes)
        {
            context.beginPath();
            context.moveTo(begin_x * scale + offsetX, begin_y * scale + offsetY);
            context.lineTo(end_x * scale + offsetX, end_y * scale + offsetY);

            context.strokeStyle = this.colour;
            context.stroke();
        }
    }
    
    update()
    {
        this.draw();
    }
}

class Particle
{
    constructor(x, y, z = 0, type = 0)
    {
        this.x = x;
        this.y = y;
        this.z = z;
        this.type = type;

        this.alpha = 1;
    }

    draw()
    {

        var old_x = this.x;
        var old_y = this.y;
        var old_z = this.z;

        //let axis = { x: 1.0, y: 2.0, z: 3.0 };
        var xyz = currentAttractor.attractor(this.x, this.y, this.z)
        this.x = xyz["x"];
        this.y = xyz["y"];
        this.z = xyz["z"];
            
        let begin_point = { x: old_x, y: old_y, z: old_z };
        let end_point = { x: this.x, y: this.y, z: this.z };

        if (drawing) {
            const stroke = new Stroke(begin_point, end_point, this.z, 1)
            strokes.push(stroke)
        }
      
        begin_point = rotateX(begin_point, rotationX);
        begin_point = rotateY(begin_point, rotationY);
        begin_point = rotateZ(begin_point, rotationZ);
      
        end_point = rotateX(end_point, rotationX);
        end_point = rotateY(end_point, rotationY);
        end_point = rotateZ(end_point, rotationZ);

        const end_x = (end_point.x * focalLength) / (end_point.z + focalLength) * currentAttractor.size_modifier_x + midx;
        const end_y = (end_point.y * focalLength) / (end_point.z + focalLength) * currentAttractor.size_modifier_y + midy;

        const radius = currentAttractor.getParticleRadius();
        const minSize = radius;
        const maxSize = radius * 1.5;
        const depthFactor = 1 - (-end_point.z * 50 - (-focalLength/10)) / (2 * focalLength/10);

        const adjustedSize = Math.max(Math.min(Math.max(lerp(minSize, maxSize, depthFactor), minSize), maxSize) * Math.max((scale - 1) / 4 * depthFactor, 0.5), minSize);
        if (show_particles)
        {
            var hue = Math.abs(end_x / 10)
            var sat = Math.abs(end_y / 10)

            let { offsetX, offsetY } = getTranslation(innerWidth, innerHeight, scale);

            context.beginPath()
            context.fillStyle = currentAttractor.colour(hue, sat, this.z)
            context.arc(
                Math.floor(end_x * scale + offsetX),
                Math.floor(end_y * scale + offsetY),
                adjustedSize,
                0,
                Math.PI * 2
              );
            context.fill()
        }
    }

    outOfBounds() {
        return this.x > 10000 || this.x < -10000 
            || this.y > 10000 || this.y < -10000 
            || this.z > 10000 || this.z < -10000;
    }
}

// FUNCTIONS:
var currentAttractor; // the current attractor object being used to generate the image
var state; // which attractor to use
var particles = []; // the array of particles that travel through the attractor
var strokes = []; // the array of strokes that are drawn behind the particles
var drawing = true; // whether or not to draw strokes
var generating = false; // whether or not the particles are currently being generated
var first_init = true; // whether or not this is the first time the page has been loaded
var focalLength = 1000; // the focal length of the camera
var info = undefined; // the information string that is displayed when the user selects an attractor
function init()
{
    document.getElementById("menu-button").classList.add("visible")
    var spans = [document.getElementById("menu-1"), document.getElementById("menu-2"), document.getElementById("menu-3")]

    const things = $('#variable-wrapper').children()
    for (i = 2; i < things.length; i++)
    {
        if (things[i].id) // elements with ids are attractor specific variables
        {
            things[i].style.display = "none"
        }
    }

    if (first_init)
    {
        // state starts as a random number between 0 and the number of attractors possible
        const numAttractors = $('#attractor-state').children().filter('option').length
        state = Math.floor(Math.random() * numAttractors)
        document.getElementById("attractor-state").value = state

        const menu1 = document.getElementById("menu-1");
        const height = parseInt(window.getComputedStyle(menu1).getPropertyValue('height'.split("px")[0]));
        spans.forEach((span, index) =>
        {
            setTimeout(() => {
                h = 0
                if (index == 0) h = -height
                if (index == 2) h = height
                target = 10 * index - 10 + h
                gsap.to(span,
                {
                    transform: `translate(0, ${target}px)`,
                    duration: 0.8
                })
            }, 300 * index)
        })
    }

    axis1 = "x"
    document.getElementById(`axis-1`).value = 'x';
    axis2 = "y"
    document.getElementById(`axis-2`).value = 'y';
    axis3 = "z"
    document.getElementById(`axis-3`).value = 'z';

    if (!first_init)
    {
        info.style.display = "none";
        info.style.opacity = 0;
    } 

    switch(state)
    {
        case 0: // Lorenz
            currentAttractor = new LorenzAttractor()
            break   

        case 1: // Lorenz83
            currentAttractor = new Lorenz84Attractor()
            break;

        case 2: // Aizawa
            currentAttractor = new AizawaAttractor()
            break
    
        case 3: // Thomas
            currentAttractor = new ThomasAttractor()
            break

        case 4: // Dadras
            currentAttractor = new DadrasAttractor();
            break

        case 5: // Chen
            currentAttractor = new ChenLeeAttractor();
            break

        case 6: // Rössler
            currentAttractor = new RosslerAttractor();
            break;

        case 7: // Halvorsen
            currentAttractor = new HalvorsenAttractor();
            break;
        
        case 8: // Rabinovich-Fabrikant
            currentAttractor = new RabinovichFabrikantAttractor();
            break;
        
        case 9: // Sprott
            currentAttractor = new SprottAttractor();
            break;
    }

    let axes = ["x", "y", "z"]
    for (let i = 0; i < 3; i++)
    {
        gsap.to(document.getElementById(`${axes[i]}-axis`), {transform: "", duration: 0.5})
    }

    info.style.display = "";
    setTimeout(() => 
    { 
        gsap.to(info_wrapper, {opacity: 1, duration: 2})
        gsap.to(info, { opacity: 1, duration: 2,})
    }, 1500) // Fade in info

    currentAttractor.resize_modifier()
    currentAttractor.generation()

    gradientPresetChange()

    canvas.initialise()
    if (first_init) 
    {
        animate()
        first_init = false
    }
}

var total_ticks = 0
var ticks = 0
var fps = 60
var lastFps = 0
function animate()
{

    if (drawing === false) 
    { 
        total_ticks = 0
        ticks = 0
        fps = 60
        lastFps = 0
        return 
    }

    animationId = requestAnimationFrame(animate)
    canvas.update()

    let magnitude = 0;
    strokes.forEach((stroke, index) =>
    {
        magnitude += Math.abs(stroke.size);
        if (stroke.alpha < stroke.minAlpha)
        {
            strokes.splice(index, 1)
        } else {
            if (stroke.new)
            {
                stroke.draw()
            } else {
                stroke.update() // exists in case I find a way to optimise drawing
            }
        }
    })

    if (playMusic && audioContext && total_ticks % 5 === 0) {
        generateMusic(magnitude / Math.max(strokes.length, 1) / sizeWeighting);
    }

    particles.forEach((particle,index) =>
    {
        if (particle.outOfBounds())
        {
            particles.splice(index, 1)
        }
        particle.draw()
    })

    var now = Date.now()
    if (now - lastFps >= 1000) {
        lastFps = now
        fps = ticks
        ticks = 0
        document.getElementById("framerate").innerHTML = fps
    }

    debugParticles()

    total_ticks += 1;
    ticks += 1;
}

addEventListener("resize", (event) =>
{
    canvasEl.width  = innerWidth
    canvasEl.height = innerHeight

    if (currentAttractor) {
        currentAttractor.resize_modifier()
    }
    midx = canvasEl.width  / 2
    midy = canvasEl.height / 2
})

var play = false
addEventListener("click", (event) =>
{
    if (!play)
    {
        play = true
        
        var audio = new Audio('Jeux.mp3');
        //audio.play();

        gsap.to(document.getElementById("start-wrapper"),
        {
            color: "transparent",
            //transform: `translate(0, -140%)`,
            duration: 0.8
        })

        setTimeout(() =>
        { 
            init()
        }, 800)
    }

})

// Initialize Web Audio API
var audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Function to generate music based on magnitude
function generateMusic(magnitude) {
    magnitude = Math.abs(magnitude);
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    // Scale the magnitude to a reasonable frequency range
    const frequency = Math.min(Math.floor(200 + magnitude * 15), 1000);
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    // Use magnitude to control the volume (gain)
    const volume = Math.min(magnitude / 200, 0.1);

    // Use a low-pass filter for a smoother sound
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, audioContext.currentTime);

    // Connect the nodes
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Apply an envelope to control volume
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5);

    oscillator.type = 'triangle';

    // Start and stop the oscillator
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1.5);
}

function clearup()
{
    audioContext = undefined;
    gsap.to(info_wrapper, {opacity: 0, duration: 1})
    setTimeout(() => { info.style.opacity = "0" }, 1005)
    particles = []
    drawing = true
}

var attractor_state = document.getElementById('attractor-state')
attractor_state.addEventListener("change", function() 
{
    drawing = false;
    state = parseInt(attractor_state.value)
    clearup()
    generating = false
    setTimeout(() =>
    {
        strokes = []
        particles = []
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        init()
    }, 2000)
})


// toggle UI elements
var playMusic = true;
const playMusicEL = document.getElementById('play-music');
playMusicEL.addEventListener("change", function()
{
    playMusic = !playMusic
});

var show_ui = true;
const show_ui_el = document.getElementById('show-ui');
show_ui_el.addEventListener("change", showUI)
function showUI()
{
    show_ui = !show_ui

    show_ui_el.value = show_ui ? "true" : "false"

    const framerate = document.getElementById("framerate");
    const attractor_info = document.getElementById("attractor-info");
    const menu = document.getElementById("menu");
    const menu_button = document.getElementById("menu-button");
    const elements = [framerate, attractor_info, menu, menu_button]

    const opacity = show_ui ? 1 : 0
    elements.forEach(element => 
    {
        gsap.to(element, {opacity: opacity, duration: 0.5})
    })
}

document.addEventListener("keydown", (event) => 
{
    if ((event.key === "Escape" || event.key === "Esc" || event.keyCode === 27) && !show_ui)
    {
        showUI()
    }

    if (event.key === "`")
    {
        debug = !debug
    }
})


// UI menu options
var show_strokes = true;
const show_strokes_state = document.getElementById('show-strokes');
show_strokes_state.addEventListener("change", function()
{
    show_strokes = !show_strokes
});


var show_particles = false;
const show_particles_state = document.getElementById('show-particles');
show_particles_state.addEventListener("change", function()
{
    show_particles = !show_particles
});

var show_framerate = false;
const show_framerate_state = document.getElementById('show-framerate');
show_framerate_state.addEventListener("change", function()
{
    show_framerate = !show_framerate
    if (show_framerate)
    {
        document.getElementById("framerate").style.display = "block"
    } else {
        document.getElementById("framerate").style.display = "none"
    }
});

var updateCanvas = true; // whether to redraw the canvas every frame
const update_canvas_state = document.getElementById('update-canvas');
update_canvas_state.addEventListener("change", function()
{
    updateCanvas = !updateCanvas
});

context.lineWidth = 2;
const lineWidthElement = document.getElementById('line-width');
lineWidthElement.addEventListener("change", function()
{
    context.lineWidth = parseInt(lineWidthElement.value);
});

var num_particles = isMobile() ? 30 : 80;
const numParticlesElement = document.getElementById('particles');
numParticlesElement.value = num_particles;

numParticlesElement.addEventListener("change", function()
{
    let new_particles = parseInt(numParticlesElement.value);
    if (new_particles > num_particles)
    {
        for (let i = 0; i < new_particles - num_particles; i++)
        {
            currentAttractor.spawnNewParticle()
        }
    } else {
        for (let i = 0; i < num_particles - new_particles; i++)
        {
            particles.pop()
        }
    }
    num_particles = parseInt(numParticlesElement.value);
});

const restart = document.getElementById('restart');
restart.addEventListener("click", function() // restart the attractor
{
    clearup()
    generating = false
    setTimeout(() =>
    {
        strokes = []
        particles = []
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        init()
    }, 2000)
});

// mouse movement
var targetScale = 1;
var scale = 1;
var lerpAmount = 0.1; 
document.addEventListener("wheel", function (e) 
{
    const slowDown = 0.0007;
    targetScale -= e.deltaY * slowDown ;
});

function updateScale() 
{
  scale = lerp(scale, targetScale, lerpAmount);
  requestAnimationFrame(updateScale);
}
updateScale();

// drag vars
var offsetX, offsetY
var targetDeltaX = 0;
var targetDeltaY = 0;
var deltaX = 0
var deltaY = 0
var lastMousePosition = { x: 0, y: 0 }
var isDragging = false

// right click vars
var isRightClick = false;
var lastMouseX = 0;
var lastMouseY = 0;
var targetRotationX = 0;
var targetRotationY = 0;
var rotationX = 0;
var rotationY = 0;
var rotationZ = 0;

body.addEventListener("mousedown", function (e) 
{
    if (e.button === 0) 
    {
      isDragging = true;
      lastMousePosition = { x: e.clientX, y: e.clientY };
    }
    if (e.button === 2) 
    {
        isRightClick = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;

        // return to updating canvas as right click
        // will break this function
        updateCanvas = true;
        update_canvas_state.value = "true";
      }
})
  
body.addEventListener("mousemove", function (e) 
{
    if (isDragging) 
    {
      targetDeltaX += e.clientX - lastMousePosition.x;
      targetDeltaY += e.clientY - lastMousePosition.y;
  
      lastMousePosition = { x: e.clientX, y: e.clientY };
    }
    if (isRightClick) 
    {
      const deltaX = e.clientX - lastMouseX;
      const deltaY = e.clientY - lastMouseY;
  
      targetRotationX += deltaY * 0.005;
      targetRotationY += deltaX * 0.005;
  
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    }
});

body.addEventListener("mouseup", function (e) 
{
    if (e.button === 0) {
      isDragging = false;
    }
    if (e.button === 2) {
        isRightClick = false;
    }
});
  
body.addEventListener("mouseleave", function (e) 
{
    isDragging = false;
    isRightClick = false;
})

canvasEl.addEventListener('contextmenu', (e) => 
{
  e.preventDefault();
});

body.addEventListener('contextmenu', (e) => 
{
    e.preventDefault();
});
/* end mouse movement */

/* rotation */
function rotateX(point, angle) 
{
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const y = point.y * cos - point.z * sin;
    const z = point.y * sin + point.z * cos;

    return { x: point.x, y: y, z: z };
}

function rotateY(point, angle) 
{
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const x = point.x * cos + point.z * sin;
    const z = -point.x * sin + point.z * cos;

    return { x: x, y: point.y, z: z };
}
  
function rotateZ(point, angle) 
{
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const x = point.x * cos - point.y * sin;
    const y = point.x * sin + point.y * cos;

    return { x: x, y: y, z: point.z };
}

function updateTranslationAndRotation() {
    deltaX = lerp(deltaX, targetDeltaX, lerpAmount);
    deltaY = lerp(deltaY, targetDeltaY, lerpAmount);
    rotationX = lerp(rotationX, targetRotationX, lerpAmount);
    rotationY = lerp(rotationY, targetRotationY, lerpAmount);
  
    requestAnimationFrame(updateTranslationAndRotation);
}
updateTranslationAndRotation();

function getTranslation(canvasWidth, canvasHeight, scale) 
{
    offsetX = deltaX + (canvasWidth - canvasWidth * scale) / 2
    offsetY = deltaY + (canvasHeight - canvasHeight * scale) / 2
    return { offsetX, offsetY }
}
/* end rotation */

/* utils */
function lerp(start, end, amount) 
{
    return start * (1 - amount) + end * amount;
}

function isMobile()
{
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};
/* end utils */

/* debugging functions */
var debug = false;
function debugParticles()
{
    const debugStep = 20;
    if (debug)
    {
        for (let i = 0; i < particles.length; i++)
        {
            if (i % debugStep === 0)
            {
                console.log(particles[i].x, particles[i].y, particles[i].z, particles[i].type)
            }
        }
    }
}
/* end debugging functions */


class Attractor
{
    constructor()
    {
        deltaX = 0
        deltaY = 0
    }

    getSpeedModifier() { return parseFloat(document.getElementById("speed").value) }
    getNumParticles() { return parseInt(document.getElementById("particles").value) }
    getParticleRadius() { return parseFloat(document.getElementById("radius").value) }

    defaultGeneration()
    {
        generating = true
        for (var i = 1; i < this.getNumParticles(); i += 1)
        {
            let middle = 1.5
            let particle = new Particle(-middle + i / 25, -middle + i / 25)
            particles.push(particle)
        }
        generating = false
    }

    defaultSpawnNewParticle()
    {
        let middle = 1.5
        let particle = new Particle(-middle, -middle)
        particles.push(particle)
    }
}


class LorenzAttractor extends Attractor
{
    constructor()
    {
        super()

        info = document.getElementById("lorenz-info");
        document.getElementById("lorenz-variables").style.display = "";
    }

    getAlpha() { return parseFloat(document.getElementById("lorenz-alpha").value) }
    getBeta() { return parseFloat(document.getElementById("lorenz-beta").value) }
    getRho() { return parseFloat(document.getElementById("lorenz-rho").value) }

    getSizeModifier() { return this.resize_modifier() }


    resize_modifier()
    {
        this.size_modifier_x = innerWidth / 40
        this.size_modifier_y = innerHeight / 60
        return { "x": this.size_modifier_x, "y": this.size_modifier_y }
    }

    colour(hue, sat, z)
    {
        const hue_ = hue / 10
        const sat_ = sat / 10
        return "hsl(" + hue_ + "," + sat_ + "%," + 50 + "%)"
    }

    generation()
    {
        super.defaultGeneration();
    }
    
    spawnNewParticle()
    {
        super.defaultSpawnNewParticle();
    }

    attractor(x, y, z) 
    {
        let framerate = super.getSpeedModifier() / 4 * 0.017;
    
        let axis = { "x": x, "y": y, "z": z }
        let temp = {}

        temp['x'] = axis['x'] + (axis['y'] - axis['x']) * this.getAlpha();
        temp['y'] = axis['y'] + (axis['x'] * (this.getRho() - axis['z']) - axis['y']);
        temp['z'] = axis['z'] + (axis['x'] * axis['y'] - this.getBeta() * axis['z']);

        axis['x'] += temp['x'] * framerate;
        axis['y'] += temp['y'] * framerate;
        axis['z'] += temp['z'] * framerate;
        return axis;
    }
}


class Lorenz84Attractor extends Attractor
{
    constructor()
    {
        super();

        info = document.getElementById("lorenz84-info");
        document.getElementById("lorenz84-variables").style.display = "";
    }

    getA() { return parseFloat(document.getElementById("lorenz84-a").value) }
    getB() { return parseFloat(document.getElementById("lorenz84-b").value) }
    getF() { return parseFloat(document.getElementById("lorenz84-f").value) }
    getG() { return parseFloat(document.getElementById("lorenz84-g").value) }

    getSizeModifier() { return this.resize_modifier() }

    resize_modifier()
    {
        this.size_modifier_x = 1 / 20 * innerWidth
        this.size_modifier_y = 1 / 20 * innerHeight
        return { "x": this.size_modifier_x, "y": this.size_modifier_y }
    }

    colour(hue, sat, z)
    {
        const hue_ = hue - z * 3
        const sat_ = sat
        return "hsl(" + hue_ + "," + sat_ + "%," + 50 + "%)"
    }

    generation()
    {
        super.defaultGeneration();
    }

    spawnNewParticle()
    {
        super.defaultSpawnNewParticle();
    }

    attractor(x, y, z) 
    {
        let framerate = super.getSpeedModifier() / 10 * 0.017;
    
        let axis = { "x": x, "y": y, "z": z }
        let temp = {}

        temp['x'] = -this.getA() * axis['x'] + (axis['y'] * axis['y']) - (axis['z'] * axis['z']) + (this.getA() * this.getF());
        temp['y'] = -axis['y'] + (axis['x'] * axis['y']) - this.getB() * axis['x'] * axis['z'] + this.getG();
        temp['z'] = -axis['z'] + (this.getB() * axis['x'] * axis['y']) + (axis['x'] * axis['z']);

        axis['x'] += temp['x'] * framerate;
        axis['y'] += temp['y'] * framerate;
        axis['z'] += temp['z'] * framerate;
        return axis;
    }
}


class AizawaAttractor extends Attractor
{
    constructor()
    {
        super()

        deltaX = 0
        deltaY = -100

        info = document.getElementById("aizawa-info");
        document.getElementById("aizawa-variables").style.display = "";
    }

    getAlpha() { return parseFloat(document.getElementById("aizawa-alpha").value) }
    getBeta() { return parseFloat(document.getElementById("aizawa-beta").value) }
    getGamma() { return parseFloat(document.getElementById("aizawa-gamma").value) }
    getDelta() { return parseFloat(document.getElementById("aizawa-delta").value) }
    getEpsilon() { return parseFloat(document.getElementById("aizawa-epsilon").value) }
    getZeta() { return parseFloat(document.getElementById("aizawa-zeta").value) }

    getSizeModifier() { return this.resize_modifier() }

    resize_modifier()
    {
        this.size_modifier_x = 0.25 * innerHeight
        this.size_modifier_y = 0.25 * innerHeight
        return { "x": this.size_modifier_x, "y": this.size_modifier_y }
    }

    colour(hue, sat, z)
    {
        const hue_ = hue
        const sat_ = sat
        return "hsl(" + hue_ + "," + sat_ + "%," + 50 + "%)"
    }

    generation()
    {
        generating = true
        let j = super.getNumParticles()
        let i = - j / 2
        const interval = setInterval(() =>
        {
            var particle = new Particle(1 + i / 50, 0)
            particles.push(particle)
            i += 1
            if (j > 0) { j -= 1 }
            if (j == 0 || generating === false) { 
                particles.pop()
                generating = false
                clearInterval(interval) 
            }
        }, 75)
    }

    spawnNewParticle()
    {
        var particle = new Particle(1, 0)
        particles.push(particle)
    }

    attractor(x, y, z) 
    {
        let framerate = super.getSpeedModifier() / 30

        let delta = this.getDelta()
        let epsilon = this.getEpsilon()
        let zeta = this.getZeta()
        let alpha = this.getAlpha()
        let beta = this.getBeta()
        let gamma = this.getGamma()

        let axis = { "x": x, "y": y, "z": z }
        let temp = {}
    
        temp['x'] = axis['x']
        temp['y'] = axis['y'] + (axis['y'] < 0 ? -1 : 1) * Math.random() * 0.001
        temp['z'] = axis['z']
    
        temp['z'] += (((axis['y'] - beta) * axis['z']) - (delta * axis['x'])) * framerate
        temp['x'] += ((delta * axis['z']) + (axis['y'] - beta) * axis['x']) * framerate
    
        let z1 = (gamma + (alpha * axis['y']) - Math.pow(axis['y'], 3.0) / 3.0 - (Math.pow(axis['z'], 2.0) + Math.pow(axis['x'], 2.0)))
        let z2 = (1 + epsilon * axis['y']) + (zeta * axis['y'] * Math.pow(axis[axis3], 3.0))
    
        temp['y'] += z1 * z2 * framerate
    
        axis['z'] = temp['z'] + Math.random() * 0.0001
        axis['x'] = temp['x'] + (temp['x'] < 0 ? -1 : 1) * Math.random() * 0.0001
        axis['y'] = temp['y'] + Math.random() * 0.0001            
        return axis
    }
}


class ThomasAttractor extends Attractor
{
    constructor()
    {
        super();

        info = document.getElementById("thomas-info");
        document.getElementById("thomas-variables").style.display = "";
    }

    getBeta() { return parseFloat(document.getElementById("thomas-beta").value) }

    getSizeModifier() { return this.resize_modifier() }

    resize_modifier()
    {
        this.size_modifier_x = 1 / 9 * innerWidth
        this.size_modifier_y = 1 / 9 * innerHeight
        return { "x": this.size_modifier_x, "y": this.size_modifier_y }
    }

    colour(hue, sat, z)
    {
        const hue_ = hue
        const sat_ = sat
        return "hsl(" + hue_ + "," + sat_ + "%," + 50 + "%)"
    }

    generation()
    {
        super.defaultGeneration();
    }

    spawnNewParticle()
    {
        super.defaultSpawnNewParticle();
    }

    attractor(x, y, z)
    {
        let framerate = super.getSpeedModifier() * 2.5 * 0.017;
    
        let axis = { "x": x, "y": y, "z": z }
        let temp = {}

        temp['x'] = Math.sin(axis['y']) - this.getBeta() * axis['x'];
        temp['y'] = Math.sin(axis['z']) - this.getBeta() * axis['y'];
        temp['z'] = Math.sin(axis['x']) - this.getBeta() * axis['z'];

        axis['x'] += temp['x'] * framerate
        axis['y'] += temp['y'] * framerate
        axis['z'] += temp['z'] * framerate
        return axis;
    }

    
}


class DadrasAttractor extends Attractor
{
    constructor()
    {
        super();

        info = document.getElementById("dadras-info");
        document.getElementById("dadras-variables").style.display = "";
    }

    getA() { return parseFloat(document.getElementById("dadras-a").value) }
    getB() { return parseFloat(document.getElementById("dadras-b").value) }
    getC() { return parseFloat(document.getElementById("dadras-c").value) }
    getD() { return parseFloat(document.getElementById("dadras-d").value) }
    getE() { return parseFloat(document.getElementById("dadras-e").value) }

    getSizeModifier() { return this.resize_modifier() }

    resize_modifier()
    {
        this.size_modifier_x = 1 / 20 * innerWidth
        this.size_modifier_y = 1 / 20 * innerHeight
        return { "x": this.size_modifier_x, "y": this.size_modifier_y }
    }

    colour(hue, sat, z)
    {
        const hue_ = hue / 5
        const sat_ = sat / 5
        return "hsl(" + hue_ + "," + sat_ + "%," + 50 + "%)"
    }

    generation()
    {
        super.defaultGeneration();
    }

    spawnNewParticle()
    {
        super.defaultSpawnNewParticle();
    }

    attractor(x, y, z)
    {
        let framerate = super.getSpeedModifier() / 3 * 0.017;
    
        let axis = { "x": x, "y": y, "z": z }
        let temp = {}

        temp['x'] = axis['y'] - (this.getA() * axis['x']) + this.getB() * axis['y'] * axis['z'];
        temp['y'] = this.getC() * axis['y'] - (axis['x'] * axis['z']) + axis['z'];
        temp['z'] = this.getD() * axis['x'] * axis['y'] - this.getE() * axis['z'];

        axis['x'] += temp['x'] * framerate;
        axis['y'] += temp['y'] * framerate;
        axis['z'] += temp['z'] * framerate;
        return axis;
    }
}


class ChenLeeAttractor extends Attractor
{
    constructor()
    {
        super();

        info = document.getElementById("chen-lee-info");
        document.getElementById("chen-lee-variables").style.display = "";
    }

    getAlpha() { return parseFloat(document.getElementById("chen-lee-alpha").value) }
    getBeta() { return parseFloat(document.getElementById("chen-lee-beta").value) }
    getDelta() { return parseFloat(document.getElementById("chen-lee-delta").value) }

    getSizeModifier() { return this.resize_modifier() }

    resize_modifier()
    {
        this.size_modifier_x = 1 / 40 * innerWidth
        this.size_modifier_y = 1 / 40 * innerHeight
        return { "x": this.size_modifier_x, "y": this.size_modifier_y }
    }

    colour(hue, sat, z)
    {
        const hue_ = hue / 5 - z * 3
        const sat_ = sat / 5
        return "hsl(" + hue_ + "," + sat_ + "%," + 50 + "%)"
    }

    generation()
    {
        let x1 = 0;
        let y1 = 0;
        let z1 = -5;

        let x2 = 0;
        let y2 = 0;
        let z2 = 5;

        let iteration1 = Math.floor(super.getNumParticles() / 2);

        generating = true
        for (var i = 1; i < super.getNumParticles(); i += 1)
        {
            let sign = Math.random() > 0.5 ? 1 : -1;
            let rand = sign *  Math.random() * 0.1;
            let particle;
            if (i < iteration1)
            {
                particle = new Particle(x1 + rand, y1 + rand, z1 + rand, 1);
                particles.push(particle)
            } else {
                particle = new Particle(x2 + rand, y2 + rand, z2 + rand, 2);
                particles.push(particle)
            }
            
        }
        generating = false
    }

    spawnNewParticle()
    {
        let one_or_two = Math.random() > 0.5 ? 1 : 2;
        let x = 0;
        let y = 0;
        let z = one_or_two == 1 ? -5 : 5;
        let particle = new Particle(x, y, z);
        particles.push(particle)
    }

    attractor(x, y, z)
    {
        let framerate = super.getSpeedModifier() / 4 * 0.017;
    
        let axis = { "x": x, "y": y, "z": z }
        let temp = {}

        temp['x'] = this.getAlpha() * axis['x'] - axis['y'] * axis['z'];
        temp['y'] = this.getBeta() * axis['y'] + axis['x'] * axis['z'];
        temp['z'] = this.getDelta() * axis['z'] + axis['x'] * axis['y'] / 3;

        axis['x'] += (temp['x'] * framerate);
        axis['y'] += (temp['y'] * framerate);
        axis['z'] += (temp['z'] * framerate);
        return axis;
    }

}


class RosslerAttractor extends Attractor
{
    constructor()
    {
        super();

        info = document.getElementById("rossler-info");
        document.getElementById("rossler-variables").style.display = "";
    }

    getA() { return parseFloat(document.getElementById("rossler-a").value) }
    getB() { return parseFloat(document.getElementById("rossler-b").value) }
    getC() { return parseFloat(document.getElementById("rossler-c").value) }

    getSizeModifier() { return this.resize_modifier() }

    resize_modifier()
    {
        this.size_modifier_x = 1 / 5 * innerWidth
        this.size_modifier_y = 1 / 5 * innerHeight
        return { "x": this.size_modifier_x, "y": this.size_modifier_y }
    }

    colour(hue, sat, z)
    {
        const hue_ = hue / 5
        const sat_ = sat / 5
        return "hsl(" + hue_ + "," + sat_ + "%," + 50 + "%)"
    }

    generation()
    {
        super.defaultGeneration();
    }
    
    spawnNewParticle()
    {
        super.defaultSpawnNewParticle();
    }

    attractor(x, y, z)
    {
        let framerate = super.getSpeedModifier() * 2 * 0.017;
    
        let axis = { "x": x, "y": y, "z": z }
        let temp = {}

        temp['x'] = -axis['y'] - axis['z'];
        temp['y'] = axis['x'] + this.getA() * axis['y'];
        temp['z'] = this.getB() + axis['z'] * (axis['x'] - this.getC());

        axis['x'] += (temp['x'] * framerate);
        axis['y'] += (temp['y'] * framerate);
        axis['z'] += (temp['z'] * framerate);
        return axis;
    }
}


class HalvorsenAttractor extends Attractor
{
    constructor()
    {
        super();

        deltaX = 300;
        targetDeltaX = 300;

        deltaY = 150;
        targetDeltaY = 150;

        info = document.getElementById("halvorsen-info");
        document.getElementById("halvorsen-variables").style.display = "";
    }

    getA() { return parseFloat(document.getElementById("halvorsen-a").value) }

    getSizeModifier() { return this.resize_modifier() }

    resize_modifier()
    {
        this.size_modifier_x = 1 / 20 * innerWidth
        this.size_modifier_y = 1 / 20 * innerHeight
        return { "x": this.size_modifier_x, "y": this.size_modifier_y }
    }

    colour(hue, sat, z)
    {
        const hue_ = hue / 5
        const sat_ = sat / 5
        return "hsl(" + hue_ + "," + sat_ + "%," + 50 + "%)"
    }

    generation()
    {
        super.defaultGeneration();
    }

    spawnNewParticle()
    {
        super.defaultSpawnNewParticle();
    }

    attractor(x, y, z)
    {
        let framerate = super.getSpeedModifier() / 2 * 0.017;

        let axis = { "x": x, "y": y, "z": z }
        let temp = {}

        temp['x'] = -this.getA() * axis['x'] - 4 * axis['y'] - 4 * axis['z'] - axis['y'] * axis['y'];
        temp['y'] = -this.getA() * axis['y'] - 4 * axis['z'] - 4 * axis['x'] - axis['z'] * axis['z'];
        temp['z'] = -this.getA() * axis['z'] - 4 * axis['x'] - 4 * axis['y'] - axis['x'] * axis['x'];

        axis['x'] += (temp['x'] * framerate);
        axis['y'] += (temp['y'] * framerate);
        axis['z'] += (temp['z'] * framerate);
        return axis;
    }
}


class RabinovichFabrikantAttractor extends Attractor
{
    constructor()
    {
        super();

        info = document.getElementById("rabinovich-fabrikant-info");
        document.getElementById("rabinovich-fabrikant-variables").style.display = "";
    }

    getAlpha() { return parseFloat(document.getElementById("rabinovich-fabrikant-alpha").value) }
    getGamma() { return parseFloat(document.getElementById("rabinovich-fabrikant-gamma").value) }

    getSizeModifier() { return this.resize_modifier() }

    resize_modifier()
    {
        this.size_modifier_x = 1 / 5 * innerWidth
        this.size_modifier_y = 1 / 5 * innerHeight
        return { "x": this.size_modifier_x, "y": this.size_modifier_y }
    }

    colour(hue, sat, z)
    {
        const hue_ = hue / 5
        const sat_ = sat / 5
        return "hsl(" + hue_ + "," + sat_ + "%," + 50 + "%)"
    }

    generation()
    {
        let x1 = 0.5;
        let y1 = 1.5;
        let z1 = 0.5;

        generating = true
        for (var i = 1; i < super.getNumParticles(); i += 1)
        {
            let sign = Math.random() > 0.5 ? 1 : -1;
            let rand = sign *  Math.random() * 0.1;
            let particle = new Particle(x1 + rand, y1 + rand, z1 + rand, 1);
            particles.push(particle)
            
        }
        generating = false
    }

    spawnNewParticle()
    {
        let x1 = 0.5;
        let y1 = 1.5;
        let z1 = 0.5;
        let sign = Math.random() > 0.5 ? 1 : -1;
        let rand = sign *  Math.random() * 0.1;
        let particle = new Particle(x1 + rand, y1 + rand, z1 + rand, 1);
        particles.push(particle)
    }

    attractor(x, y, z)
    {
        let framerate = super.getSpeedModifier() / 2 * 0.017;

        let axis = { "x": x, "y": y, "z": z }
        let temp = {}

        temp['x'] = axis['y'] * (axis['z'] - 1 + axis['x'] * axis['x']) + this.getGamma() * axis['x'];
        temp['y'] = axis['x'] * (3 * axis['z'] + 1 - axis['x'] * axis['x']) + this.getGamma() * axis['y'];
        temp['z'] = -2 * axis['z'] * (this.getAlpha() + axis['x'] * axis['y']);

        axis['x'] += (temp['x'] * framerate);
        axis['y'] += (temp['y'] * framerate);
        axis['z'] += (temp['z'] * framerate);
        return axis;
    }
}

class SprottAttractor extends Attractor
{
    constructor()
    {
        super()

        info = document.getElementById("sprott-info");
        document.getElementById("sprott-variables").style.display = "";
    }

    getA() { return parseFloat(document.getElementById("sprott-a").value) }
    getB() { return parseFloat(document.getElementById("sprott-b").value) }

    getSizeModifier() { return this.resize_modifier() }

    resize_modifier()
    {
        this.size_modifier_x = 1 / 5 * innerWidth
        this.size_modifier_y = 1 / 5 * innerHeight
        return { "x": this.size_modifier_x, "y": this.size_modifier_y }
    }

    colour(hue, sat, z)
    {
        const hue_ = hue / 5
        const sat_ = sat / 5
        return "hsl(" + hue_ + "," + sat_ + "%," + 50 + "%)"
    }

    generation()
    {
        let x1 = 0.51;
        let y1 = -0.34;
        let z1 = 1.4;

        generating = true
        for (var i = 1; i < super.getNumParticles(); i += 1)
        {
            let sign = Math.random() > 0.5 ? 1 : -1;
            let rand = sign *  Math.random() * 0.25;
            let particle = new Particle(x1 + rand, y1 + rand, z1 + rand, 1);
            particles.push(particle)
        }
        generating = false
    }

    spawnNewParticle()
    {
        let x1 = 0.51;
        let y1 = -0.34;
        let z1 = 1.4;
        let sign = Math.random() > 0.5 ? 1 : -1;
        let rand = sign *  Math.random() * 0.1;
        let particle = new Particle(x1 + rand, y1 + rand, z1 + rand, 1);
        particles.push(particle)
    }

    attractor(x, y, z)
    {
        let framerate = super.getSpeedModifier() * 1.5 * 0.017;

        let axis = { "x": x, "y": y, "z": z }
        let temp = {}

        temp['x'] = axis['y'] + this.getA() * axis['x'] * axis['y'] + axis['x'] * axis['z'];
        temp['y'] = 1 - this.getB() * axis['x'] * axis['x'] + axis['y'] * axis['z'];
        temp['z'] = axis['x'] - axis['x'] * axis['x'] - axis['y'] * axis['y'];    

        axis['x'] += (temp['x'] * framerate);
        axis['y'] += (temp['y'] * framerate);
        axis['z'] += (temp['z'] * framerate);
        return axis;
    }
}

class ThreeScrollUnifiedAttractor extends Attractor
{
    constructor()
    {
        super()

        info = document.getElementById("three-scroll-info");
        document.getElementById("three-scroll-variables").style.display = "";
    }

    // getA() { return parseFloat(document.getElementById("three-scroll-a").value) }
    // getB() { return parseFloat(document.getElementById("three-scroll-b").value) }
    // getC() { return parseFloat(document.getElementById("three-scroll-c").value) }
    // getD() { return parseFloat(document.getElementById("three-scroll-d").value) }
    // getE() { return parseFloat(document.getElementById("three-scroll-e").value) }
    // getF() { return parseFloat(document.getElementById("three-scroll-f").value) }

    getAlpha() { return parseFloat(document.getElementById("three-scroll-alpha").value) }
    getM() { return parseFloat(document.getElementById("three-scroll-m").value) }

    getSizeModifier() { return this.resize_modifier() }

    resize_modifier()
    {
        this.size_modifier_x = 1 / 2000 * innerWidth
        this.size_modifier_y = 1 / 2000 * innerHeight
        return { "x": this.size_modifier_x, "y": this.size_modifier_y }
    }

    colour(hue, sat, z)
    {
        const hue_ = hue / 5
        const sat_ = sat / 5
        return "hsl(" + hue_ + "," + sat_ + "%," + 50 + "%)"
    }

    generation()
    {
        let x1 = 0.1;
        let y1 = 1;
        let z1 = -0.1;

        generating = true
        for (var i = 1; i < super.getNumParticles(); i += 1)
        {
            let sign = Math.random() > 0.5 ? 1 : -1;
            let rand = sign *  Math.random() * 0.1;
            let particle = new Particle(x1 + rand, y1 + rand, z1 + rand, 1);
            particles.push(particle)
            
        }
    }

    spawnNewParticle()
    {
        super.defaultSpawnNewParticle()
    }

    // attractor(x, y, z)
    // {
    //     let framerate = super.getSpeedModifier() / 20 * 0.017;

    //     let axis = { "x": x, "y": y, "z": z }
    //     let temp = {}

    //     temp['x'] = this.getA() * (axis['y'] - axis['x']) + this.getD() * axis['y'] * axis['z'];
    //     temp['y'] = this.getB() * axis['x'] - axis['x'] * axis['z'] + this.getF() * axis['y'];
    //     temp['z'] = this.getC() * axis['z'] + axis['x'] * axis['y'] - this.getE() * axis['x'] * axis['x'];

    //     axis['x'] += (temp['x'] * framerate);
    //     axis['y'] += (temp['y'] * framerate);
    //     axis['z'] += (temp['z'] * framerate);
    //     return axis;
    // }

    attractor(x, y, z)
    {
        let framerate = super.getSpeedModifier() / 10 * 0.017;

        let axis = { "x": x, "y": y, "z": z }
        let temp = {}

        let alpha = this.getAlpha();

        temp['x'] = (20 * alpha + 40) * (axis['y'] - axis['x']) + ((6 * alpha + 4) / 25) * axis['x'] * axis['z'];
        temp['y'] = (55 - 90 * alpha) * axis['x'] + (5 * alpha + 20) * axis['y'] - axis['x'] * axis['z'];
        temp['z'] = -13/20 * axis['x'] * axis['x'] + axis['x'] * axis['y'] +  (11 - 6 * alpha) / 6 * axis['z'] + this.getM();

        axis['x'] += (temp['x'] * framerate);
        axis['y'] += (temp['y'] * framerate);
        axis['z'] += (temp['z'] * framerate);
        return axis;
    }
}

// TODO:
class GeneralisedChuaCircuit extends Attractor
{
    constructor()
    {
        super();

        info = document.getElementById("chua-info");
        document.getElementById("chua-variables").style.display = "";
    }

    getAlpha()  { return parseFloat(document.getElementById("chua-alpha").value) }
    getBeta()   { return parseFloat(document.getElementById("chua-beta").value) }
    getGamma()  { return parseFloat(document.getElementById("chua-gamma").value) }
    getMZero()  { return parseFloat(document.getElementById("chua-m-zero").value) }
    getMOne()   { return parseFloat(document.getElementById("chua-m-one").value) }
    getMTwo()   { return parseFloat(document.getElementById("chua-m-two").value) }
    getMThree() { return parseFloat(document.getElementById("chua-m-three").value) }
    getMFour()  { return parseFloat(document.getElementById("chua-m-four").value) }
    getBOne()   { return parseFloat(document.getElementById("chua-b-one").value) }
    getBTwo()   { return parseFloat(document.getElementById("chua-b-two").value) }
    getBThree() { return parseFloat(document.getElementById("chua-b-three").value) }
    getBFour()  { return parseFloat(document.getElementById("chua-b-four").value) }
    getBFive()  { return parseFloat(document.getElementById("chua-b-five").value) }

    getSizeModifier() { return this.resize_modifier() }

    resize_modifier()
    {
        this.size_modifier_x = 1 * innerWidth
        this.size_modifier_y = 1 * innerHeight
        return { "x": this.size_modifier_x, "y": this.size_modifier_y }
    }

    colour(hue, sat, z)
    {
        const hue_ = hue / 5
        const sat_ = sat / 5
        return "hsl(" + hue_ + "," + sat_ + "%," + 50 + "%)"
    }

    generation()
    {
        generating = true
        for (var i = 1; i < super.getNumParticles(); i += 1)
        {
            let middle = 0
            let particle = new Particle(-middle + i / 500, -middle + i / 500)
            particles.push(particle)
        }
        generating = false
    }

    attractor(x, y, z)
    {

        let framerate = super.getSpeedModifier() / 50 * 0.017;
    
        let axis = { "x": x, "y": y, "z": z }
        let temp = {};

        temp['x'] = (axis['x'] + this.getAlpha() * (axis['y'] - this.h(axis['x']))) * framerate;
        temp['y'] = (axis['x'] - axis['y'] + axis['z']) * framerate;
        temp['z'] = ((-this.getBeta() * axis['y'] - this.getGamma() * axis['z'])) * framerate;

        axis['x'] += temp['x'];
        axis['y'] += temp['y'];
        axis['z'] += temp['z'];
        
        return axis;
    }

    h(x)
    {
        let exprOne = this.getMFour() * x;
        let exprTwo = 0;

        let ms = [this.getMOne(), this.getMTwo(), this.getMThree(), this.getMFour()];
        let bs = [this.getBOne(), this.getBTwo(), this.getBThree(), this.getBFour(), this.getBFive()];

        for (var i = 1; i < 4; i++)
        {
            exprTwo += (ms[i-1] - ms[i]) * (Math.abs(x + bs[i-1]) - Math.abs(x - bs[i-1]));
        }
        
        return exprOne + 0.5 * exprTwo;
    }

}


class CliffordAttractor extends Attractor
{
    constructor()
    {
        super();

        info = document.getElementById("clifford-info");
        document.getElementById("clifford-variables").style.display = "";
    }

    getA() { return parseFloat(document.getElementById("clifford-a").value) }
    getB() { return parseFloat(document.getElementById("clifford-b").value) }
    getC() { return parseFloat(document.getElementById("clifford-c").value) }
    getD() { return parseFloat(document.getElementById("clifford-d").value) }

    getSizeModifier() { return this.resize_modifier() }

    resize_modifier()
    {
        this.size_modifier_x = 1 * innerWidth
        this.size_modifier_y = 1 * innerHeight
        return { "x": this.size_modifier_x, "y": this.size_modifier_y }
    }

    colour(hue, sat, z)
    {
        const hue_ = hue / 5
        const sat_ = sat / 5
        return "hsl(" + hue_ + "," + sat_ + "%," + 50 + "%)"
    }

    generation()
    {
        generating = true
        for (var i = 1; i < super.getNumParticles(); i += 1)
        {
            let middle = 1.5
            let particle = new Particle(-middle + i / 25, -middle + i / 25)
            particles.push(particle)
        }
        generating = false
    }

    attractor(x, y, z)
    {
        let framerate = super.getSpeedModifier();

        let delta_t = 0.1;
    
        let axis = { "x": x, "y": y, "z": z }
        let temp = {}

        let x_plus_one = (Math.sin(this.getA() * axis['y']) + this.getC() * Math.cos(this.getA() * axis['x'])) + (Math.random() * 0.001);
        let y_plus_one = (Math.sin(this.getB() * axis['x']) + this.getD() * Math.cos(this.getB() * axis['y'])) + (Math.random() * 0.001);

        axis['x'] = (x + (x_plus_one * delta_t)) * framerate;
        axis['y'] = (y + (y_plus_one * delta_t)) * framerate;
        axis['z'] = 1
        return axis;
    }
}
/********************************************************/
/* COLOURS */
/********************************************************/
function interpolate(start, end, factor) { return start + (end - start) * factor; }

/********************************************************/
/* getColourAtPercentage() => RGB Colour String.
/* Given a percentage, calculates the colour at that point.
/* Technically goes up to 200, as the gradient is mirrored.
/********************************************************/
function getColourAtPercentage(percentage) {
    // Adjust percentage for the mirrored range (100-200)
    if (percentage > 100) {
        percentage = 200 - percentage;
    }

    let stopDivs = document.querySelectorAll(".gradientStop");
    let stops = [];
    for (let div of stopDivs) {
        let colour = div.querySelector(".stopColour").value;
        let position = div.querySelector(".stopPosition").value;
        stops.push({ colour: colour, stop: position });
    }
    stops.sort((a, b) => a.stop - b.stop);

    let lowerStop = stops[0];
    let upperStop;
    for (let i = 1; i < stops.length; i++) {
        upperStop = stops[i];
        if (upperStop.stop >= percentage) {
            break;
        }
        lowerStop = upperStop;
    }

    let range = upperStop.stop - lowerStop.stop;
    let position = (percentage - lowerStop.stop) / range;

    let lowerColour = hexToRGB(lowerStop.colour);
    let upperColour = hexToRGB(upperStop.colour);
    let currentColour = {
        r: interpolate(lowerColour.r, upperColour.r, position),
        g: interpolate(lowerColour.g, upperColour.g, position),
        b: interpolate(lowerColour.b, upperColour.b, position),
    };

    return colourToCSS(currentColour);
}

function colourToCSS(colour) 
{
    if (colour.a !== undefined) 
    {
        return `rgba(${colour.r}, ${colour.g}, ${colour.b}, ${colour.a})`;
    }
    return `rgb(${colour.r}, ${colour.g}, ${colour.b})`;
}

function hexToRGB(hexColour)
{
    let r = parseInt(hexColour.substring(1, 3), 16);
    let g = parseInt(hexColour.substring(3, 5), 16);
    let b = parseInt(hexColour.substring(5, 7), 16);
    let a = 1;

    if (hexColour.length > 7)
    {
        a = parseInt(hexColour.substring(7, 9), 16);
    }

    return { r, g, b, a };
}

function addGradientStop(color, position)
{
    let stopDiv = document.createElement("div");
    stopDiv.classList.add("gradientStop");
    
    let stopColour = document.createElement("input");
    stopColour.type = "color";
    stopColour.value = color;
    stopColour.classList.add("stopColour");
    
    let stopPosition = document.createElement("input");
    stopPosition.type = "number";
    stopPosition.min = "0";
    stopPosition.value = position;
    stopPosition.max = "100";
    stopPosition.classList.add("stopPosition");
    
    stopDiv.appendChild(stopColour);
    stopDiv.appendChild(stopPosition);
    
    document.getElementById("stops").appendChild(stopDiv);
}
document.getElementById("addStop").addEventListener("click", function() { addGradientStop("#000000", 50); });

function gradientPresetChange()
{
    preset = parseInt(document.getElementById("presets").value);
    stops = document.getElementById("stops");
    stops.innerHTML = "";
    switch (preset)
    {
        case 0: // red-green-blue
            addGradientStop("#ff0000", 0);
            addGradientStop("#00ff00", 50);
            addGradientStop("#0000ff", 100);
            break;
        case 1: // Wedding cake
            addGradientStop("#40e0d0", 0);
            addGradientStop("#ff8c00", 50);
            addGradientStop("#ff0080", 100);
            break;
        case 2: // Sunset
            addGradientStop("#ffff00", 0);
            addGradientStop("#ff8000", 50);
            addGradientStop("#a80000", 100);
            break;
        case 3: // Spanish sunset
            addGradientStop("#ee0979", 0);
            addGradientStop("#ff6a00", 100);
            break;
        case 4: // Tron:
            addGradientStop("#21C4E7", 0);
            addGradientStop("#21C4E7", 45);
            addGradientStop("#fc741e", 50);
            addGradientStop("#fc741e", 95);
            addGradientStop("#21C4E7", 100);
            break;
        case 5: // Spectrum
            addGradientStop("#ff0000", 0);
            addGradientStop("#ff8000", 20);
            addGradientStop("#ffff00", 40);
            addGradientStop("#00ff00", 60);
            addGradientStop("#0000ff", 80);
            addGradientStop("#ff00ff", 100);
            break;
    }
}
document.getElementById("presets").addEventListener("input", (gradientPresetChange));
