// GLOBALS:
const info = document.getElementById("attractor-info")
const canvasEl  = document.querySelector('canvas')
const context   = canvasEl.getContext('2d')

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
var colour = function() {}
class Stroke
{
    constructor(begin_point, end_point, z, alpha)
    {
        this.begin_point = {... begin_point};
        this.end_point = {... end_point};
        this.z = z;

        this.alpha = alpha
        this.life = 70
        this.minAlpha = this.alpha / this.life

        const hue = Math.abs(this.begin_point.x * 80 + total_ticks)
        const sat = Math.abs(this.begin_point.y * 80 + total_ticks)
        this.colour = colour(hue, sat, this.z)

        this.new = true
    }

    draw()
    {
        this.new = false;

        this.alpha -= this.minAlpha;
        context.globalAlpha = this.alpha;
    
        let begin_rotated = rotateX(this.begin_point, rotationX);
        begin_rotated = rotateY(begin_rotated, rotationY);
        begin_rotated = rotateZ(begin_rotated, rotationZ);
      
        let end_rotated = rotateX(this.end_point, rotationX);
        end_rotated = rotateY(end_rotated, rotationY);
        end_rotated = rotateZ(end_rotated, rotationZ);
      
        const begin_x = (begin_rotated.x * focalLength) / (begin_rotated.z + focalLength) * size_modifier_x + midx;
        const begin_y = (begin_rotated.y * focalLength) / (begin_rotated.z + focalLength) * size_modifier_y + midy;
      
        const end_x = (end_rotated.x * focalLength) / (end_rotated.z + focalLength) * size_modifier_x + midx;
        const end_y = (end_rotated.y * focalLength) / (end_rotated.z + focalLength) * size_modifier_y + midy;
    
        let { offsetX, offsetY } = getTranslation(innerWidth, innerHeight, scale);
    
        context.beginPath();
        context.moveTo(begin_x * scale + offsetX, begin_y * scale + offsetY);
        context.lineTo(end_x * scale + offsetX, end_y * scale + offsetY);
    
        context.strokeStyle = this.colour;
        context.stroke();
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

        var old_x = this.x
        var old_y = this.y
        var old_z = this.z

        //let axis = { x: 1.0, y: 2.0, z: 3.0 };
        var xyz = this.attractor(this.x, this.y, this.z)
        this.x = xyz["x"]
        this.y = xyz["y"]
        this.z = xyz["z"]
            
        let begin_point = { x: old_x, y: old_y, z: old_z };
        let end_point = { x: this.x, y: this.y, z: this.z };

        var stroke = new Stroke(begin_point, end_point, this.z, 1)
        if (drawing) strokes.push(stroke)
      
        begin_point = rotateX(begin_point, rotationX);
        begin_point = rotateY(begin_point, rotationY);
        begin_point = rotateZ(begin_point, rotationZ);
      
        end_point = rotateX(end_point, rotationX);
        end_point = rotateY(end_point, rotationY);
        end_point = rotateZ(end_point, rotationZ);

        const end_x = (end_point.x * focalLength) / (end_point.z + focalLength) * size_modifier_x + midx;
        const end_y = (end_point.y * focalLength) / (end_point.z + focalLength) * size_modifier_y + midy;
      
        if (show_particles)
        {
            var hue = Math.abs(end_x / 10)
            var sat = Math.abs(end_y / 10)

            let { offsetX, offsetY } = getTranslation(innerWidth, innerHeight, scale);

            context.beginPath()
            context.fillStyle = colour(hue, sat, this.z)
            context.arc(Math.floor(end_x * scale + offsetX), 
                        Math.floor(end_y * scale + offsetY), this.radius, 0, Math.PI * 2);
            context.fill()
        }
    }
}

// FUNCTIONS:
var particles = [];
var strokes = [];
var state;
var size_modifier_x = 1;
var size_modifier_y = 1;
var drawing = true;
var generating = false;
var first_init = true;
var focalLength = 1000;
var resize_modifier = function() {}
var generation = function() {}
var attractor = function(x, y, z) {}
function init()
{

    state = parseFloat(document.getElementById("attractor-state").value)

    var num_particles = 80
    var particle_radius = 4

    isMobile = function() {
        let check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
    };
    if (isMobile())
    {
        num_particles = 30
        particle_radius = 3
    }

    document.getElementById("menu-button").classList.add("visible")
    var spans = [document.getElementById("menu-1"), document.getElementById("menu-2"), document.getElementById("menu-3")]

    const things = $('#variable-wrapper').children()
    for (i = 2; i < things.length; i++)
    {
        things[i].style.display = "none"
    }

    if (first_init)
    {
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

    var axis1, axis2, axis3
    const targetXTransform = {"rotate3D": "(0, 0, 1, 90deg)", "translate": "(22px, -28px)"}
    const targetYTransform = {"rotate3D": "(0, 0, 0, 0deg)", "translate": "(0, 0)"}
    const targetZTransform = {"rotate3D": "(1, 0, 0, 90deg)", "translate": "(0, 0)"}
    const originalTransforms = [targetXTransform, targetYTransform, targetZTransform]
    var targetTransforms = [targetXTransform, targetYTransform, targetZTransform]
    function updateAxis(axisIndex, newValue) 
    {
        let axes = ["x", "y", "z"]

        console.log(axisIndex, newValue);
        let axisValues = [axis1, axis2, axis3];
        let oldValue = axisValues[axisIndex];
      
        if (newValue === oldValue) {
          return;
        }
      
        let duplicateIndex = axisValues.findIndex((value) => value === newValue);
        if (duplicateIndex >= 0) {
            axisValues[duplicateIndex] = oldValue;
            document.getElementById(`axis-${duplicateIndex + 1}`).value = oldValue;

            gsap.to(document.getElementById(`${axes[duplicateIndex]}-axis`), {
            transform: `rotate3d${targetTransforms[axisIndex]['rotate3D']} translate${targetTransforms[axisIndex]['translate']}`,
            duration: 0.5,
            });
            gsap.to(document.getElementById(`${axes[axisIndex]}-axis`), {
            transform: `rotate3d${targetTransforms[duplicateIndex]['rotate3D']} translate${targetTransforms[duplicateIndex]['translate']}`,
            duration: 0.5,
            });

            let temp = targetTransforms[axisIndex]
            targetTransforms[axisIndex] = targetTransforms[duplicateIndex]
            targetTransforms[duplicateIndex] = temp

        }
      
        axisValues[axisIndex] = newValue;
        [axis1, axis2, axis3] = axisValues;
    }

    document.getElementById("axis-1").addEventListener("input", function() {
        let newValue = String(document.getElementById("axis-1").value);
        updateAxis(0, newValue);
      });
      
      document.getElementById("axis-2").addEventListener("input", function() {
        let newValue = String(document.getElementById("axis-2").value);
        updateAxis(1, newValue);
      });
      
      document.getElementById("axis-3").addEventListener("input", function() {
        let newValue = String(document.getElementById("axis-3").value);
        updateAxis(2, newValue);
      });

    axis1 = "x"
    document.getElementById(`axis-1`).value = 'x';
    axis2 = "y"
    document.getElementById(`axis-2`).value = 'y';
    axis3 = "z"
    document.getElementById(`axis-3`).value = 'z';

    var speed_modifier = 1
    document.getElementById("speed").addEventListener("input", function()
    {
        speed_modifier = parseFloat(document.getElementById("speed").value)
    })

    var colourFunction = function(hue, sat, z)
    {
        return "hsl(" + hue + "," + sat + "%," + (Math.abs(z) + 50) + "%)"
    }

    var infoString, start_x, start_y
    switch(state)
    {
        case 0: // Lorenz
            infoString = "Lorenz Attractor<br> &nbsp dx/dt = σ(y - x)<br> &nbsp dy/dt = x(ρ - z) - y<br> &nbsp dz/dt = xy - zβ"

            deltaX = 0
            deltaY = 0

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
                generating = true
                for (var i = 1; i < num_particles; i += 1)
                {
                    let middle = 1.5
                    let particle = new Particle(-middle + i / 25, -middle + i / 25, particle_radius)
                    particles.push(particle)
                }
                generating = false
            }

            attractor = function(x, y, z) {
                framerate = speed_modifier / 2 * 0.017;
            
                let axis = { "x": x, "y": y, "z": z }

                axis[axis1] += (axis[axis1] + (axis[axis2] - axis[axis1]) * alpha) * framerate
                axis[axis2] += (axis[axis1] * (rho - axis[axis3]) - axis[axis2]) * framerate
                axis[axis3] += (axis[axis1] * axis[axis2] - beta * axis[axis3]) * framerate
                return axis;
            }
            break   

        case 1: // Aizawa
            infoString = "Aizawa Attractor<br> &nbsp dx/dt = x(z - β) - δy<br> &nbsp dy/dt = δx - y(z-β)<br> &nbsp dz/dt = γ + αz - z³/3 - (x² + y²)(1 + εz) + ζzx³"

            num_particles = 60

            var alpha = 0.8
            var beta = 0.7
            var gamma = 0.65
            var delta = 3.5
            var epsilon = 0.25
            var zeta = 0.1

            deltaX = 0
            deltaY = -100

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
                generating = true
                j = num_particles
                i = - j / 2
                const interval = setInterval(() =>
                {
                    var particle = new Particle(1 + i / 50, 0, particle_radius, context)
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

            attractor = function(x, y, z)
            {
                framerate = speed_modifier / 30

                let axis = { "x": x, "y": y, "z": z }
                let temp = {}
            
                temp[axis1] = axis[axis1]
                temp[axis2] = axis[axis2] + (axis[axis2] < 0 ? -1 : 1) * Math.random() * 0.001
                temp[axis3] = axis[axis3]
            
                temp[axis3] += (((axis[axis2] - beta) * axis[axis3]) - (delta * axis[axis1])) * framerate
                temp[axis1] += ((delta * axis[axis3]) + (axis[axis2] - beta) * axis[axis1]) * framerate
            
                let z1 = (gamma + (alpha * axis[axis2]) - Math.pow(axis[axis2], 3.0) / 3.0 - (Math.pow(axis[axis3], 2.0) + Math.pow(axis[axis1], 2.0)))
                let z2 = (1 + epsilon * axis[axis2]) + (zeta * axis[axis2] * Math.pow(axis[axis3], 3.0))
            
                temp[axis2] += z1 * z2 * framerate
            
                axis[axis3] = temp[axis3] + Math.random() * 0.0001
                axis[axis1] = temp[axis1] + (temp[axis1] < 0 ? -1 : 1) * Math.random() * 0.0001
                axis[axis2] = temp[axis2] + Math.random() * 0.0001            
                return axis
            }
            break
    
        case 2: // Thomas
            infoString = "Thomas Attractor<br> &nbsp dx/dt = sin(y) - βx<br> &nbsp dy/dt = sin(z) - βy<br> &nbsp dz/dt = sin(x) - βz"

            //num_particles = 80

            var beta = 0.208186
            document.getElementById("thomas-variables").style.display = ""
            document.getElementById("thomas-beta").addEventListener("input", function()
            {
                beta = parseFloat(document.getElementById("thomas-beta").value)
            })

            resize_modifier = function()
            {
                size_modifier_x = 1 / 9 * innerWidth
                size_modifier_y = 1 / 9 * innerHeight
            }
            resize_modifier()

            colour = function(hue, sat, z)
            {
                let axis = { "x": hue, "y": sat, "z": z };
                return "hsl(" + hue + "," + sat + "%," + (Math.max(25, z * 12)) + "%)"
            }

            generation = function()
            {
                generating = true
                for (var i = 1; i < num_particles; i += 1)
                {
                    let middle = 1.5
                    let particle = new Particle(-middle + i / 25, -middle + i / 25, particle_radius)
                    particles.push(particle)
                }
                generating = false
            }

            attractor = function(x, y, z)
            {
                framerate = speed_modifier / 10;
                let axis = { "x": x, "y": y, "z": z };
                axis[axis1] += (Math.sin(axis[axis2]) - (beta * axis[axis1])) * framerate;
                axis[axis2] += (Math.sin(axis[axis3]) - (beta * axis[axis2])) * framerate;
                axis[axis3] += (Math.sin(axis[axis1]) - (beta * axis[axis3])) * framerate;
                return axis;
            }
            break
        case 3: // Dadras
            infoString = "Dadras Attractor<br> &nbsp dx/dt = y - ax + byz<br> &nbsp dy/dt = cy - xz + z<br> &nbsp dz/dt = dxy-ez"

            num_particles = 80

            var a = 3.0
            var b = 2.7
            var c = 1.7
            var d = 2.0
            var e = 9.0

            resize_modifier = function()
            {
                size_modifier_x = 1 / 20 * innerWidth
                size_modifier_y = 1 / 20 * innerHeight
            }
            resize_modifier()

            colour = function(hue, sat, z)
            {
                let axis = { "x": hue, "y": sat, "z": z };
                return "hsl(" + hue + "," + sat + "%," + (Math.max(25, z * 12)) + "%)"
            }

            generation = function()
            {
                generating = true
                for (var i = 1; i < num_particles; i += 1)
                {
                    let middle = 1.5
                    let particle = new Particle(-middle + i / 25, -middle + i / 25, particle_radius)
                    particles.push(particle)
                }
                generating = false
            }

            attractor = function(x, y, z)
            {
                framerate = speed_modifier / 50;
                let axis = { "x": x, "y": y, "z": z };
                axis[axis1] += (axis[axis2] - (a * axis[axis1]) + b * axis[axis2] * axis[axis3]) * framerate;
                axis[axis2] += (c * axis[axis2] - (axis[axis1] * axis[axis3]) + axis[axis3]) * framerate;
                axis[axis3] += (d * axis[axis1] * axis[axis2] - e * axis[axis3]) * framerate;
                return axis;
            }
            break
    }

    let axes = ["x", "y", "z"]
    for (let i = 0; i < 3; i++)
    {
        gsap.to(document.getElementById(`${axes[i]}-axis`), {transform: "", duration: 0.5})
    }

    targetTransforms = originalTransforms

    setTimeout(() => { 
        gsap.to(info, {opacity: 1, duration: 2})
        info.innerHTML = infoString

        gsap.to(document.getElementById("axes"), {opacity: 1, duration: 2})
    }, 1500) // Fade in info

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
        total_ticks = 0
        ticks = 0
        fps = 60
        lastFps = 0
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
    console.log(total_ticks)
    total_ticks += 1;
    ticks += 1;
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
    //drawing = false
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
    gsap.to(info, {opacity: 0, duration: 0.5})
    particles = []
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
        case "2":
            state = 2
            clearup()
            break
        case "3":
            state = 3
            clearup()
            break
    }
    generating = false
    setTimeout(() =>
    {
        strokes = []
        particles = []
        init()
    }, 2000)
})

var show_particles = false
var show_particles_state = document.getElementById('show-particles')
show_particles_state.addEventListener("change", function()
{
    show_particles = !show_particles
})

var show_framerate = false
var show_framerate_state = document.getElementById('show-framerate')
show_framerate_state.addEventListener("change", function()
{
    show_framerate = !show_framerate
    if (show_framerate)
    {
        document.getElementById("framerate").style.display = "block"
    }
    else
    {
        document.getElementById("framerate").style.display = "none"
    }
})

/* mouse movement */
var scale = 1
document.addEventListener("wheel", function(e)
{
    scale -= e.deltaY / 2500
})

// drag vars
var offsetX, offsetY
var deltaX = 0
var deltaY = 0
var lastMousePosition = { x: 0, y: 0 }
var isDragging = false

// right click vars
let isRightClick = false;
let lastMouseX = 0;
let lastMouseY = 0;
let rotationX = 0;
let rotationY = 0;
let rotationZ = 0;

function getTranslation(canvasWidth, canvasHeight, scale) {
    offsetX = deltaX + (canvasWidth - canvasWidth * scale) / 2
    offsetY = deltaY + (canvasHeight - canvasHeight * scale) / 2
    return { offsetX, offsetY }
}

const body = document.getElementById("body")
body.addEventListener("mousedown", function (e) 
{
    if (e.button === 0) {
      isDragging = true;
      lastMousePosition = { x: e.clientX, y: e.clientY };
    }
    if (e.button === 2) {
        isRightClick = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
      }
})
  
body.addEventListener("mousemove", function (e) 
{
    if (isDragging) 
    {
      deltaX += e.clientX - lastMousePosition.x;
      deltaY += e.clientY - lastMousePosition.y;
  
      lastMousePosition = { x: e.clientX, y: e.clientY };
    }
    if (isRightClick) 
    {
        const deltaX = e.clientX - lastMouseX;
        const deltaY = e.clientY - lastMouseY;
    
        rotationX += deltaY * 0.005; // Adjust the multiplier to change rotation sensitivity
        rotationY += deltaX * 0.005; // Adjust the multiplier to change rotation sensitivity
    
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;

        // Redraw the canvas if required
      }
})

body.addEventListener("mouseup", function (e) {
    if (e.button === 0) {
      isDragging = false;
    }
    if (e.button === 2) {
        isRightClick = false;
    }
});
  
body.addEventListener("mouseleave", function (e) {
    isDragging = false;
})

canvasEl.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

body.addEventListener('contextmenu', (e) => {
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
/* end rotation */

/* utils */
function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

function lerpAxis(axisStart, axisEnd, t) {
    let axis = {};
    Object.keys(axisStart).forEach(key => {
        axis[key] = lerp(axisStart[key], axisEnd[key], t);
    });
    return axis;
}

let transition = function() 
{
    let elapsedTime = Date.now() - startTime;
    let t = Math.min(1, elapsedTime / duration);
    let axis = lerpAxis(axisStart, axisEnd, t);

    let result = attractor(axis, x,y,z);

    if (t < 1) {
        requestAnimationFrame(transition);
    } else {
        console.log("Transition complete");
    }
}