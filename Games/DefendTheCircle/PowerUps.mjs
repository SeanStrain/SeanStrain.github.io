import * as colour from "./Colour.mjs"
import * as draw   from "./Drawable.mjs"

const green       = new colour.HSLObject(130, 80, 60)
const orange      = new colour.HSLObject( 40, 80, 60)
const red         = new colour.HSLObject(  0, 80, 60)
const frozen_blue = new colour.HSLObject(185, 95, 60)
const grey        = new colour.HSLObject(  0,  0, 60)


export const powerUpTypes = []

function power(type, source, desc)
{
  this.type     = type
  this.source   = source
  this.desc     = desc
  this.function = null
  let timeFrame
  switch (type)
  {
    case "None":
      break;
    case "Big Dick Energy":
      timeFrame = 15000
      this.function = function(player, canvas)
      {
        player.powered = true
        // PLAYER EFFECTS:
        player.unkillable = true
        player.rainbow(timeFrame)
        var beforeR = player.radius
        var beforeC = player.colour
        gsap.to(player,
        {
          radius: player.radius * 1.5
        })
        setTimeout(() =>
        {
          player.powered = false
          player.unkillable = false
          gsap.to(player,
          {
            radius: beforeR
          })
        }, timeFrame)

        // CANVAS EFFECTS
        canvas.setDisplayedPower(this, timeFrame)
        canvas.rainbow(timeFrame)
      }
        break;

    case "Cash Money":
      timeFrame = 10000
      this.function = function(player, canvas)
      {
        player.powered = true
        player.setParticleColour(green)
        player.scoreMulti = 2
        setTimeout(() =>
        {
          player.powered = false
          player.scoreMulti = 1
          player.resetParticleColour()
        }, timeFrame)
        canvas.setDisplayedPower(this, timeFrame)
        canvas.gradient(green, timeFrame)
      }
      break;

    case "explodingFace":
      timeFrame = 1000
      this.function = function(player, canvas)
      {
        player.killAll = true
        setTimeout(() =>
        {
          player.powered = false
          player.killAll = false
        }, timeFrame)
        canvas.gradient(orange, timeFrame)
      }
      break;

     case "The Big Freeze":
        timeFrame = 10000
        this.function = function(player, canvas)
        {
          player.powered = true
          player.setParticleColour(frozen_blue)
          draw.setFriction(0.25)
          setTimeout(() =>
          {
            player.powered = false
            player.resetParticleColour()
            draw.setFriction(1)
          }, timeFrame)
          canvas.setDisplayedPower(this, timeFrame)
          canvas.gradient(frozen_blue, timeFrame)
        }
        break;

      case "Head in the Clouds":
         timeFrame = 10000
         this.function = function(player, canvas)
         {
           player.powered = true
           draw.setEnemyDirection(-1)
           setTimeout(() =>
           {
             player.powered = false
             draw.setEnemyDirection(1)
           }, timeFrame)
           canvas.setDisplayedPower(this, timeFrame)
           canvas.gradient(grey, timeFrame)
         }
         break;

       case "pinch":
          timeFrame = 1
          this.function = function(player, canvas)
          {
            gsap.to(player, {
              radius: player.radius * 0.9
            })
          }
          break;

        case "Machine Gun":
           timeFrame = 20000
           this.function = function(player, canvas)
           {
             player.powered = true
             setTimeout(() =>
             {
               player.powered = false
             }, timeFrame)
             player.machineGun(timeFrame, canvas)
             canvas.setDisplayedPower(this, timeFrame)
             canvas.gradient(red, timeFrame)
           }
           break;
  }
  powerUpTypes.push(this)
}

const eggplant        = new power("Big Dick Energy"   , "images/OpenMoji/eggplant.png"          , "Get 50% more swole. Smack enemies to death on contact.")
const moneyEyes       = new power("Cash Money"        , "images/OpenMoji/money_eyes.png"        , "DOUBLE SCORE.")
const explodingFace   = new power("explodingFace"     , "images/OpenMoji/exploding_face.png"    , null)
const frozenFace      = new power("The Big Freeze"    , "images/OpenMoji/frozen_face.png"       , "You're as cold as ice.")
const headInTheClouds = new power("Head in the Clouds", "images/OpenMoji/head_in_the_clouds.png", "Enemies turn into cowards.")
const pinch           = new power("pinch"             , "images/OpenMoji/pinch.png"             , null)
//const smilingDevil    = new power("Machine Gun"       , "images/OpenMoji/smiling_devil.png"     , "BrrrRRrrRRrrRRRR")

//const moneyWings = "images/OpenMoji/smiling_devil.png"

function selectRandomType()
{
  return powerUpTypes[Math.floor(Math.random()*powerUpTypes.length)]
}

export class PowerUp
{
  constructor (x, y, size, imageEl, power)
  {
    this.x = x         // position on x co-ord
    this.y = y         // position on y co-ord
    this.size = size   // size of image
    this.rotation = 0  // rotation of image
    this.timeOffScreen = 0

    // identify random type:
    if (typeof power === 'undefined')
    {
      this.power = selectRandomType()
      //this.power = powerUpTypes[2]
    } else
    {
      this.power = type
    }

    // create image element for canvas:
    this.image = imageEl
    this.image.src = this.power.source
  }

  update()
  {
    this.rotation = (this.rotation + 0.01) % (Math.PI * 2)
  }

  move(rateX, rateY)
  {
    this.x += rateX
    this.y += rateY
  }

}
