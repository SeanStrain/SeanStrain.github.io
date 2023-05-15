// GLOBALS:
const canvasEl  = document.querySelector('canvas')
const context   = canvasEl.getContext('2d', { alpha: false })

canvasEl.width  = innerWidth
canvasEl.height = innerHeight

var midx = canvasEl.width  / 2
var midy = canvasEl.height / 2

// COLOUR
class HSLObject
{
  constructor(hue, sat, light)
  {
    this.hue    = hue
    this.sat    = sat
    this.light  = light
    this.makeHSL()
  }

  makeHSL()
  {
    this.hue   = this.hue   % 361
    this.sat   = this.sat   % 101
    this.light = this.light % 101
    this.hsl = `hsl(${this.hue}, ${this.sat}%, ${this.light}%)`
  }

  editHue(change)
  {
    this.hue += change
    this.makeHSL()
  }

  editSat(change)
  {
    this.sat += change
    this.makeHSL()
  }

  editLight(change)
  {
    this.light += change
    this.makeHSL()
  }

  setLight(value)
  {
    this.light = value
    this.makeHSL()
  }
}

class RGBObject
{
  constructor(red, green, blue)
  {
    this.rgbMax = 256
    this.red   = red
    this.green = green
    this.blue  = blue
    this.makeRGB()
  }

  makeRGB()
  {
    this.red   = this.red   % this.rgbMax
    this.green = this.green % this.rgbMax
    this.blue  = this.blue  % this.rgbMax
    this.rgb = `rgb(${this.red}, ${this.green}, ${this.blue})`
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

// MAIN:

class Canvas
{
    constructor(context, canvas, colour)
    {
      this.context    = context
      this.canvas     = canvas
      this.colour     = colour
      this.baseColour = colour
      this.update = function()
        {
            this.context.fillStyle = this.colour.hsl
            this.context.clearRect(0, 0, innerWidth, innerHeight)
        }
    }

    initialise()
    {
        this.context.fillStyle = this.colour.hsl
        this.context.fillRect(0, 0, innerWidth, innerHeight)
    }
}

var canvasColour = new HSLObject(0, 10, 10)
let canvas  = new Canvas(context, canvasEl, canvasColour)
context.lineWidth = 2

let speed_modifier = 1 / 2
let size_modifier = 30
let size_modifier_x = 50
let size_modifier_y = 28

class Stroke
{
    constructor(begin_x, begin_y, end_x, end_y, z, colour, alpha)
    {
        this.begin_x = begin_x * size_modifier_x + midx
        this.begin_y = begin_y * size_modifier_y + midy
        this.end_x = end_x * size_modifier_x + midx
        this.end_y = end_y * size_modifier_y + midy
        this.z = z
        this.colour = colour

        this.alpha = alpha
        this.life = 80
        this.minAlpha = this.alpha / this.life
    }

    draw()
    {
        if (this.alpha > this.minAlpha) { this.alpha -= this.minAlpha }
        context.globalAlpha = this.alpha
        context.beginPath()
        context.moveTo(this.begin_x, this.begin_y)
        context.lineTo(this.end_x, this.end_y)

        let hue = Math.abs(this.end_x / 10 + total_ticks)
        let sat = Math.abs(this.end_y / 10)
        context.strokeStyle = "hsl(" + hue + "," + sat + "%," + Math.abs(this.z) + 50 + "%)"
        context.stroke()
    }
}


class Particle
{
    constructor(x, y, radius, colour, velocity)
    {
        this.x = x
        this.y = y
        this.z = 0.1
        this.alpha = 1
        this.radius = radius
        this.base_radius = radius
        this.colour = colour
        this.velocity = velocity
    }

    draw()
    {
        let old_x = this.x
        let old_y = this.y
        let old_z = this.z

        let framerate = speed_modifier *  1 / Math.max(60, fps)
        this.x += (old_x + (old_y - old_x) * 10) * framerate
        this.y += (old_x * (28 - old_z) - old_y) * framerate
        this.z += (old_x * old_y - (8 / 3) * old_z) * framerate
        this.radius = 0
        strokes.push(new Stroke(old_x, old_y, this.x, this.y, this.z, this.colour, 1))
    }
}

let num_particles = 30
let particle_radius = 2
let particles = []
let strokes = []
function init()
{
    for (var i = 1; i < num_particles; i += 1)
    {
        let middle = 1.5
        let particle = new Particle(-middle + i / 25, -middle + i / 25, particle_radius, randomHSL(), {x: 0.5, y: 0.5})
        particles.push(particle)
    }
    canvas.initialise()
    animate()
}

function animate()
{
    animationId = requestAnimationFrame(animate)

    canvas.update()
    particles.forEach(particle =>
    {
        particle.draw()
    })

    strokes.forEach((stroke, index) =>
    {
        if (stroke.alpha < stroke.minAlpha)
        {
            strokes.splice(index, 1)
        } else {
            stroke.draw()
        }
    })
}

addEventListener("resize", (event) =>
{
    canvasEl.width  = innerWidth
    canvasEl.height = innerHeight

    midx = canvasEl.width  / 2
    midy = canvasEl.height / 2
})

let play = false
addEventListener("click", (event) =>
{
    if (!play)
    {
        play = true

        var audio = new Audio('Jeux.mp3');
        audio.play();

        gsap.to(document.getElementById("start"),
        {
            transform: `translate(0, -140%)`,
            duration: 0.8
        })

        setTimeout(() =>
        { 
            init()
        }, 800)
    }

})