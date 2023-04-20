// GLOBALS:

var canvasEl  = document.querySelector('canvas')
var context   = canvasEl.getContext('2d')

canvasEl.width  = innerWidth
canvasEl.height = innerHeight

var midx = innerWidth  / 2
var midy = innerHeight / 2

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
// CANVAS:
class Canvas
{
    constructor(canvas, context, colour, id)
    {
      this.context    = context
      this.canvas     = canvas
      this.colour     = colour
      this.baseColour = colour
      this.id         = id
      this.update = function()
        {
            this.context.fillStyle = this.colour
            this.context.clearRect(0, 0, innerWidth, innerHeight)
        }
    }

    initialise()
    {
        this.context.fillStyle = this.colour
        this.context.fillRect(0, 0, innerWidth, innerHeight)
    }
}

var canvasColour = `rbga(${0}, ${0}, ${0}, 0.005)`
var canvas  = new Canvas(canvasEl, context, canvasColour, '0')
context.lineWidth = 2

// STROKE:
var speed_modifier = 1 / 2
var colour = function() {}
class Stroke
{
    constructor(begin_x, begin_y, end_x, end_y, z, alpha, context)
    {
        this.begin_x = Math.floor(begin_x * size_modifier_x + midx)
        this.begin_y = Math.floor(begin_y * size_modifier_y + midy)
        this.end_x = Math.floor(end_x * size_modifier_x + midx)
        this.end_y = Math.floor(end_y * size_modifier_y + midy)
        this.z = z

        this.alpha = alpha
        this.life = 70
        this.minAlpha = this.alpha / this.life

        this.context = context

        var hue = Math.abs(this.end_x / 10 + total_ticks)
        var sat = Math.abs(this.end_y / 10)
        this.colour = colour(hue, sat, this.z)

        this.new = true
    }

    draw()
    {
        this.new = false

        this.alpha -= this.minAlpha
        context.globalAlpha = this.alpha

        context.beginPath()
        context.moveTo(this.begin_x, this.begin_y)
        context.lineTo(this.end_x, this.end_y)

        context.strokeStyle = this.colour
        context.stroke()
    }
    update()
    {
        this.draw()
    }
}

// PARTICLE:
class Particle
{
    constructor(x, y, radius, context)
    {
        this.x = x
        this.y = y
        this.z = 0

        this.radius = radius
        this.base_radius = radius

        this.context = context


        this.alpha = 1

        this.attractor = attractor
    }

    draw()
    {
        //context.globalAlpha = this.alpha
        //context.beginPath()

        var old_x = this.x
        var old_y = this.y
        var old_z = this.z

        var xyz = this.attractor(this.x, this.y, this.z)
        this.x = xyz["x"]
        this.y = xyz["y"]
        this.z = xyz["z"]

        var stroke = new Stroke(old_x, old_y, this.x, this.y, this.z, 1, this.context)
        if (drawing) strokes.push(stroke)
        if (show_particles)
        {
            var hue = Math.abs((this.x * size_modifier_x) + midx / 10)
            var sat = Math.abs((this.y * size_modifier_y) + midy / 10)
            context.beginPath()
            context.fillStyle = colour(hue, sat, this.z)
            context.arc(Math.floor((this.x * size_modifier_x) + midx), Math.floor((this.y * size_modifier_y) + midy), this.radius, 0, Math.PI * 2)
            context.fill()
        }
    }
}

// FUNCTIONS:
var particles = []
var strokes = []
var state = 1
var show_particles = false
var stroke_life = 70
var size_modifier_x = 1
var size_modifier_y = 1
var drawing = true
var first_init = true
var resize_modifier = function() {}
var generation = function() {}
var attractor = function(x, y, z) {}
function init()
{

    var num_particles = 90
    var particle_radius = 2

    isMobile = function() {
        let check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
      };
    mobile = isMobile()
    if (mobile)
    {
        num_particles = 30
        particle_radius = 3
    }

    document.getElementById("menu-button").classList.add("visible")
    var spans = [document.getElementById("menu-1"), document.getElementById("menu-2"), document.getElementById("menu-3")]

    const things = $('#variable-wrapper').children()
    for (i = 1; i < things.length; i++)
    {
        things[i].style.display = "none"
    }

    if (first_init)
    {
        spans.forEach((span, index) =>
        {
            setTimeout(() => {
                target = 10 * index - 10
                gsap.to(span,
                {
                    transform: `translate(0, ${target}px)`,
                    duration: 0.8
                })
            }, 300 * index)
        })
    }

    var start_x = 0
    var start_y = 0
    switch(state)
    {
        case 0: // Lorenz
            
            var alpha, beta, rho

            document.getElementById("lorenz-variables").style.display = ""
            document.getElementById("lorenz-alpha").addEventListener("input", function()
            {
                alpha = parseFloat(document.getElementById("lorenz-alpha").value)
            })
            document.getElementById("lorenz-beta").addEventListener("input", function()
            {
                beta = parseFloat(document.getElementById("lorenz-beta").value)
            })
            document.getElementById("lorenz-rho").addEventListener("input", function()
            {
                rho = parseFloat(document.getElementById("lorenz-rho").value)
            })

            alpha = 10
            beta = 2.7
            rho = 28

            start_x = 0
            start_y = 0

            speed_modifier = 1 / 2

            resize_modifier = function()
            {
                size_modifier_x = innerWidth / 45
                size_modifier_y = innerHeight / 60
            }
            resize_modifier()

            colour = function(hue, sat, z)
            {
                return "hsl(" + hue + "," + sat + "%," + (Math.abs(z) + 50) + "%)"
            }

            generation = function()
            {
                for (var i = 1; i < num_particles; i += 1)
                {
                    let middle = 1.5
                    let particle = new Particle(-middle + i / 25, -middle + i / 25, particle_radius)
                    particles.push(particle)
                }
            }

            var min_x = 0
            var max_x = 0
            var min_y = 0
            var max_y = 0
            var min_z = 0
            var max_z = 0
            attractor = function(x, y, z)
            {
                framerate = speed_modifier * 0.017
                x += (x + (y - x) * alpha) * framerate
                y += (x * (rho - z) - y) * framerate
                z += (x * y - beta * z) * framerate
                
                if (x < min_x) { min_x = x }
                if (x > max_x) { max_x = x }
                if (y < min_y) { min_y = y }
                if (y > max_y) { max_y = y }
                if (z < min_z) { min_z = z }
                if (z > max_z) { max_z = z }

                //console.log(min_x, max_x, min_y, max_y, min_z, max_z)

                return {"x": x, "y": y, "z": z}
            }

            break   

        case 1: // Aizawa

            var alpha = 0.8
            var beta = 0.7
            var gamma = 0.65
            var delta = 3.5
            var epsilon = 0.25
            var zeta = 0.1

            document.getElementById("aizawa-variables").style.display = ""
            document.getElementById("aizawa-alpha").addEventListener("input", function()
            {
                alpha = parseFloat(document.getElementById("aizawa-alpha").value)
            })
            document.getElementById("aizawa-beta").addEventListener("input", function()
            {
                beta = parseFloat(document.getElementById("aizawa-beta").value)
            })
            document.getElementById("aizawa-gamma").addEventListener("input", function()
            {
                gamma = parseFloat(document.getElementById("aizawa-gamma").value)
            })
            document.getElementById("aizawa-delta").addEventListener("input", function()
            {
                delta = parseFloat(document.getElementById("aizawa-delta").value)
            })
            document.getElementById("aizawa-epsilon").addEventListener("input", function()
            {
                epsilon = parseFloat(document.getElementById("aizawa-epsilon").value)
            })
            document.getElementById("aizawa-zeta").addEventListener("input", function()
            {
                zeta = parseFloat(document.getElementById("aizawa-zeta").value)
            })
    
            start_x = 0
            start_y = midy

            speed_modifier = 2 / 60

            resize_modifier = function()
            {
                size_modifier_x = 0.25 * innerHeight
                size_modifier_y = 0.25 * innerHeight
            }
            resize_modifier()

            colour = function(hue, sat, z)
            {
                return "hsl(" + hue + "," + sat + "%," + (z * 20 + 50) + "%)"
            }

            generation = function()
            {
                j = num_particles
                i = - j / 2
                const interval = setInterval(() =>
                {
                    var particle = new Particle(1 + i / 50, 0, particle_radius, context)
                    particles.push(particle)
                    i += 1
                    if (j > 0) { j -= 1 }
                    if (j == 0) { clearInterval(interval) }
                }, 75)
            }

            attractor = function(x, y, z)
            {
                framerate = speed_modifier// *  1 / Math.max(60, fps)

                var temp_x = x

                var sign = 1
                if (y < 0)
                {
                    sign = -1
                }
                var temp_y = y + Math.random() * 0.001 * sign
                var temp_z = z

                temp_x += (((z - beta) * x) - (delta * y)) * framerate
                temp_y += ((delta * x) + (z - beta) * y) * framerate

                var z1 = (gamma + (alpha * z) - Math.pow(z, 3.0) / 3.0 - (Math.pow(x, 2.0) + Math.pow(y, 2.0)))
                var z2 = (1 + epsilon * z) + (zeta * z * Math.pow(x, 3.0))

                temp_z += z1 * z2 * framerate

                x = temp_x + Math.random() * 0.0001
                y = temp_y + Math.random() * 0.0001 * sign
                z = temp_z + Math.random() * 0.0001
                return {"x": x, "y": y, "z": z}
            }
            break
    }

    generation()

    canvas.initialise()
    if (first_init) {
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
    if (drawing === false) { 
        var total_ticks = 0
        var ticks = 0
        var fps = 60
        var lastFps = 0
        return 
    }

    animationId = requestAnimationFrame(animate)
    canvas.update()

    strokes.forEach((stroke, index) =>
    {
        if (stroke.alpha < stroke.minAlpha)
        {
            strokes.splice(index, 1)
        } else {
            if (stroke.new)
            {
                stroke.draw()
            }
            else
            {
                stroke.update() // exists in case I find a way to optimise drawing
            }
        }
    })

    particles.forEach(particle =>
    {
        particle.draw()
    })

    var now = Date.now()
    if (now - lastFps >= 1000) {
        lastFps = now
        fps = ticks
        ticks = 0
        document.getElementById("framerate").innerHTML = fps
    }
    total_ticks++
    ticks++
}

addEventListener("resize", (event) =>
{
    canvasEl.width  = innerWidth
    canvasEl.height = innerHeight

    resize_modifier()

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

        gsap.to(document.getElementById("start"),
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

function clearup()
{
    drawing = false
    // while (strokes.length != 0)
    // {
    //     strokes.forEach((stroke, index) =>
    //     {
    //         stroke.draw()
    //         if (stroke.alpha < stroke.minAlpha)
    //         {
    //             strokes.splice(index, 1)
    //         }
    //     })
    // }
    particles = []
    strokes = []
    drawing = true
}

var attractor_state = document.getElementById('attractor-state')
attractor_state.addEventListener("change", function() 
{
    console.log(attractor_state.value)
    switch (attractor_state.value)
    {
        case "0":
            state = 0
            clearup()
            break
        case "1":
            state = 1
            clearup()
            break
    }
    init()
})