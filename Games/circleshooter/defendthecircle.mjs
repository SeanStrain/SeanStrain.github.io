import * as draw    from "./Drawable.mjs"
import * as colour  from "./Colour.mjs"
import * as powerUp from "./PowerUps.mjs"

// canvas constants:
const canvasEl  = document.querySelector('canvas')
const scoreEl   = document.getElementById("score")
const startEl   = document.getElementById("startModal")
const finalEl   = document.getElementById("finalScore")
const statsEl   = document.getElementById("stats")
const powerEl   = document.getElementById("powerUp")
const context   = canvasEl.getContext('2d')

canvasEl.width  = innerWidth
canvasEl.height = innerHeight

const midx = canvasEl.width  / 2
const midy = canvasEl.height / 2

// Colours:
const countColour     = new colour.HSLObject(0, 100, 50)
const shadowColourOne = new colour.HSLObject(15, 100, 50)
const shadowColourTwo = new colour.HSLObject(45, 100, 50)
const shootColour     = new colour.HSLObject(0, 100, 50)
const playerColour    = new colour.HSLObject(0, 50, 100)
const powerColour     = new colour.HSLObject(0, 50, 100)
const canvasColour    = new colour.HSLObject(0, 10, 10)

//Shadows:
const scoreShadow = new colour.cssTextShadow(2, 2, 6, shadowColourOne, shadowColourTwo)

// canvas element arrays:
let projectiles   = []
let enemies       = []
let particles     = []
let powerUps      = []
let canvasEffects = []

// movement values:
const smokePoint = 0.5    // speed at which smoke appears from player
var maxSpeed   = 2      // fastest player can go
var friction   = 0.98   // coefficient of friction on movement
var deltaV     = 0.1    // change in value of speed with keypress
const keys     = []
var speedX = 0
var speedY = 0

// others:
const maxEnemies        = 25
const maxPowers         = 20
const powerSize         = 50
const playerStartRadius = 30
const intervalTime      = 50 // how long setInterval for most actions last
var playerScore  = 0
var mouseX = 0
var mouseY = 0

class Canvas
{
  constructor(context, canvas, colour)
  {
    this.ctx        = context
    this.canvas     = canvas
    this.colour     = colour
    this.width      = innerWidth
    this.height     = innerHeight
    this.baseColour = colour
    this.displayedPower = "None"
    this.override = false
    this.normalUpdate()
  }

  normalUpdate()
  {
    if(!this.override)
    {
      this.update = function()
      {
      this.ctx.fillStyle = this.colour.hsl
      this.ctx.fillRect(0, 0, this.width, this.height)
      }
    }
  }

  setMovementValues(maxS, frict, delta)
  {
    if (typeof maxS  !== 'undefined') { maxSpeed = maxS  }
    if (typeof frict !== 'undefined') { friction = frict }
    if (typeof delta !== 'undefined') { deltaV   = delta }
  }

  setDisplayedPower(power, timeFrame)
  {
    this.displayedPower = power.type
    this.powerDesc = power.desc
    this.timer = timeFrame / 1000

    gsap.to(this,
    {
      timer: 0,
      duration: timeFrame / 1000,
      ease: "none"
    })
    setTimeout(() =>
    {
      canvas.resetDisplayedPower()
    }, timeFrame)
  }

  resetDisplayedPower()
  {
    this.displayedPower = "None"
    this.powerDesc = "None"
  }

  rainbow(timeFrame)
  {
    let timer = 0
    let interval = setInterval(() =>
    {
      timer += intervalTime
      this.colour.editHue(8)
      if (timer >= timeFrame)
      {
        this.colour.hue = 0
        this.colour.sat = 10
        this.colour.light = 10
        this.colour.makeHSL()
        clearInterval(interval)
      }
    }, intervalTime)
  }

  gradient(sideColour, timeFrame)
  {
    var showColour = new colour.HSLObject(sideColour.hue, sideColour.sat, sideColour.light)
    let timer = 0
    this.override = true
    var length = timeFrame / 2000
    gsap.to(showColour, {
      sat: 80,
      light: 60,
      ease: "none",
      duration: length
    })
    setTimeout(() =>
    {
      gsap.to(showColour, {
        hue: this.colour.hue,
        sat: this.colour.sat,
        light: this.colour.light,
        ease: "none",
        duration: length
      })
    }, length * 1000)
    this.update = function()
    {
      var grd = this.ctx.createRadialGradient(midx, midy, this.width / 2.5, this.width/2, this.height/2, this.width);
      grd.addColorStop(0, this.colour.hsl)
      grd.addColorStop(1, showColour.hsl)
      this.ctx.fillStyle = grd;
      this.ctx.fillRect(0, 0, this.width, this.height)
    }
    let interval = setInterval(() =>
    {
      timer += intervalTime
      showColour.makeHSL()
      if (timer >= timeFrame)
      {
        clearInterval(interval)
        this.override = false
        this.normalUpdate()
      }
    }, intervalTime)
  }

  shoot()
  {
    projectiles.push(player.shoot(mouseX, mouseY))
    const shootAudio = new Audio('sfx/shoot.wav')
    shootAudio.play()
  }
}

const canvas  = new Canvas(context, canvasEl, canvasColour);
var player  = new draw.Player(midx, midy, 30, playerColour, canvas);
var reticle = new draw.Reticle(midx, midy,  5, playerColour, canvas);
var animationId;
var displayedPower;
var clicks;
var kills;

function resetHTML()
{
  finalEl.innerHTML = 0

  scoreEl.innerHTML =
  "<span class=\"countup\">S</span>" +
  "<span class=\"countup\">C</span>" +
  "<span class=\"countup\">O</span>" +
  "<span class=\"countup\">R</span>" +
  "<span class=\"countup\">E</span>" +
  "<span class=\"countup\">:</span>" +
  "<span class=\"countup\"> </span>" +
  "<span class=\"countup\">0</span>"

  statsEl.innerHTML =
  "<span id=\"multi\"       class=\"stat\">SCORE MULTIPLIER: </span>" +
  `<span id=\"multiCount\"  class=\"stat\">x${player.scoreMulti}</span><br>` +
  "<span id=\"kills\"       class=\"stat\">KILLS: </span>" +
  "<span id=\"killCount\"   class=\"stat\">0</span><br>" +
  "<span id=\"clicks\"      class=\"stat\">CLICKS: </span>" +
  "<span id=\"clickCount\"  class=\"stat\">0</span><br>" +
  "<span id=\"radius\"      class=\"stat\">RADIUS: </span>" +
  `<span id=\"radiusCount\" class=\"stat\">${playerStartRadius}</span><br>`

  powerEl.innerHTML =
  `<span id=\"power\"     class=\"power\"></span><br>` +
  `<span id=\"powerDesc\" class=\"power\"></span><br>` +
  `<span id=\"powerTime\" class=\"power\"></span>`
}

function init()
{
  resetHTML()

  playerScore =  0
  clicks      = -1
  kills       =  0

  projectiles   = []
  enemies       = []
  particles     = []
  powerUps      = []
  canvasEffects = []

  displayedPower = "None"
  player  = new draw.Player (midx, midy, playerStartRadius, playerColour, canvas)
  reticle = new draw.Reticle(midx, midy, 5                , playerColour, canvas)
}

function playerDeath()
{
  setTimeout(() => {
    countColour.setLight(100)
    shadowColourOne.setLight(100)
    shadowColourOne.setLight(100)
    scoreShadow.setSize(0)
    scoreShadow.setBlur(0)
    for (let i = 0; i < scoreEl.children.length; i++)
    {
      var element = document.getElementById(i)
      if(element != null) {
        element.style.color = countColour.hsl
        element.style.textShadow = scoreShadow.shadow
      }
    }
    cancelAnimationFrame(animationId)
    finalScore.innerHTML = playerScore
    if (playerScore == 69 || playerScore == 420) { finalScore.innerHTML += " nice" }
    startModal.style.display = 'flex'
  }, 50)
}

function spliceOneClean(array, index)
{
  setTimeout(() => {
    array.splice(index, 1)
  }, 0)
}

function velocity(angle, speed)
{
  this.x = Math.cos(angle) * speed
  this.y = Math.sin(angle) * speed
  this.angle = angle
  this.speed = speed
}

// projectile spawner on clicks:
addEventListener('click', (event) =>
{
  clicks++
  if (clicks > 0) {
    setHTMLAtId("clickCount", clicks)
    projectiles.push(player.shoot(event.clientX, event.clientY))
  }
})

// mousemove:
addEventListener('mousemove', (event) =>
{
  reticle.x = event.clientX
  reticle.y = event.clientY
  mouseX = event.clientX
  mouseY = event.clientY
})

addEventListener('keydown', (event) =>
{
  keys[event.code] = true
})

addEventListener('keyup', (event) =>
{
  keys[event.code] = false
})

function countUp(targetString)
{
  scoreEl.innerHTML = ""
  for (let i = 0; i < targetString.length; i++)
  {
    scoreEl.innerHTML += "<span id=\"" + i + "\">" + targetString[i] + "</span>"
    var element = document.getElementById(i)
    countColour.editHue(i / targetString.length)
    shadowColourOne.editHue(1)
    shadowColourTwo.editHue(1)
    if (scoreShadow.colour1.light > 50)
    {
      shadowColourOne.editLight(-1)
      shadowColourTwo.editLight(-1)
    }
    if (scoreShadow.size1 > -20) { scoreShadow.editSizes(-1)   }
    if (scoreShadow.blur  < 6  ) { scoreShadow.editBlur(0.1)  }
    if (countColour.light > 50 ) { countColour.editLight(-0.5) }

  }
  element.style.color      = countColour.hsl
  element.style.textShadow = scoreShadow.shadow
}

function animateCountUp()
{
  const scoreArray    = scoreEl.children
  const countTo       = playerScore
  const countToString = playerScore.toString()
  const frames        = 10

  let countFrom = ""
  for (let i = 7; i < scoreArray.length; i++)
  {
    countFrom += scoreArray[i].innerHTML
  }

  if (countFrom == playerScore) { return }

  var currentCount = parseInt(countFrom)
  var increment = Math.round((countTo - countFrom) / frames)
  var frame = 0
  const counter = setInterval( () =>
  {
    frame++
    currentCount += increment
    var currentString = currentCount.toString()

    var targetString = "SCORE: " + currentString

    if (currentCount > countFrom) {
      countUp(targetString)
    }

    if (frame == frames || currentCount == playerScore)
    {
      var targetString = "SCORE: " + playerScore
      clearInterval(counter)
      setTimeout((countUp(targetString)), 50)
    }
  }, 50 );

}

function setHTMLAtId(id, value)
{
  var element = document.getElementById(id)
  element.innerHTML = value
}

function setPowerHTML()
{
  if (canvas.displayedPower != "None") { powerEl.style.display = ""     }
  else                                 { powerEl.style.display = "none" }

  powerEl.innerHTML =
  `<span id=\"power\"     class=\"power\">${canvas.displayedPower}</span><br>` +
  `<span id=\"powerDesc\" class=\"powerDesc\">${canvas.powerDesc}</span><br>` +
  `<span id=\"powerTime\" class=\"power\">${canvas.timer}</span>`

  var timeEl = document.getElementById("powerTime")
  timeEl.style.color = powerColour.hsl

  if (canvas.timer < 5 && canvas.timer != 0)
  {
    var timer = setInterval(() =>
    {
      if (powerColour.light > 50) { powerColour.editLight(-0.07) }
      if (canvas.timer == 0)
      {
        clearInterval(timer)
        powerColour.setLight(100)
      }
    }, 50)
  }
}

function editStatHtmls()
{
  setHTMLAtId("killCount"  , kills                    )
  setHTMLAtId("radiusCount", Math.round(player.radius))
  setHTMLAtId("multiCount" , "x" + player.scoreMulti  )
  setPowerHTML()
}

function hitEnemy(enemy, index, kill, projectile)
{
  if (typeof projectile === 'undefined') { projectile = new draw.Projectile(enemy.x, enemy.y, 1, shootColour, canvas, new velocity(1, 1)) }
  var output = enemy.explode(projectile, kill)
  var explodeParticles = output[0]
  var scoreChange      = output[1]
      kill             = output[2]
  updateScore(scoreChange)
  explodeParticles.forEach((explodeParticle) => { particles.push(explodeParticle) })
  if (kill)
  {
    kills++
    spliceOneClean(enemies, index)
  }
  player.hitEnemy()
  return kill
}

function updateScore(amount)
{
  playerScore += Math.round(amount * player.scoreMulti)
  animateCountUp()
}

function playerMovement()
{
  // Player Movement:
  if ((keys["KeyW"] || keys["ArrowUp"]) && speedY < maxSpeed)
  {
    speedY += deltaV;
  }

  if ((keys["KeyD"] || keys["ArrowRight"]) && speedX > -maxSpeed)
  {
    speedX -= deltaV;
  }

  if ((keys["KeyS"] || keys["ArrowDown"]) && speedY > -maxSpeed)
  {
    speedY -= deltaV;
  }

  if ((keys["KeyA"] || keys["ArrowLeft"]) && speedX < maxSpeed)
  {
    speedX += deltaV;
  }

  speedX *= friction;
  speedY *= friction;

  return speedX, speedY;
}

function updateCanvas()
{
  canvas.update()

  if (countColour.light < 100)
  {
    countColour.editLight(0.5)
  }

  if (scoreShadow.colour1.light < 100)
  {
    shadowColourOne.editLight(0.5)
    shadowColourTwo.editLight(0.5)
  }

  if (scoreShadow.size1 < 0) { scoreShadow.editSizes(0.5) }
  if (scoreShadow.blur  > 0) { scoreShadow.editBlur(-0.1) }
  for (let i = 0; i < scoreEl.children.length; i++)
  {
    var element = document.getElementById(i)
    if(element != null)
    {
      element.style.color = countColour.hsl
      element.style.textShadow = scoreShadow.shadow
    }
  }
}

function animate()
{
  animationId = requestAnimationFrame(animate)

  updateCanvas()

  player.draw()
  speedX, speedY = playerMovement()

  if (Math.abs(speedX) > smokePoint || Math.abs(speedY) > smokePoint)
  {
    const particle = player.spawnParticle(speedX, speedY)
    if (particle != null) particles.push(particle)
  }

  // particle loop:
  particles.forEach((particle, index) =>
  {
    particle.move(speedX, speedY)
    particle.update()
    if (particle.ttl >= particle.life || particle.alpha <= 0)
    {
      spliceOneClean(particles, index)
    }
  })

  // projectile loop:
  projectiles.forEach((projectile, index) =>
  {
    projectile.move(speedX, speedY)
    const particle = projectile.update()

    if (projectile.ttl <= projectile.life || projectile.alpha <= 0)
    {
      spliceOneClean(projectiles, index)
    }

    if (particle != null) { particles.push(particle) }

    if (projectile.x + projectile.radius < 0 ||
        projectile.x - projectile.radius > canvas.width ||
        projectile.y + projectile.radius < 0 ||
        projectile.y - projectile.radius > canvas.height)
    {
      spliceOneClean(projectiles, index)
    }
  })

  // enemy loop:
  enemies.forEach((enemy, indexEnemy) =>
  {
    //if (enemy.radius == 0) { spliceOneClean(enemies, indexEnemy) }
    if (player.killAll)  { hitEnemy(enemy, indexEnemy, true) }

    enemy.move(speedX, speedY)
    const particle = enemy.update()
    if (particle != null) { particles.push(particle) }

    if (enemy.x + enemy.radius < 0 ||
        enemy.x - enemy.radius > canvas.width ||
        enemy.y + enemy.radius < 0 ||
        enemy.y - enemy.radius > canvas.height)
    {
      enemy.timeOffScreen += 1
    }
    else
    {
      enemy.timeOffScreen = 0
    }
    if (enemy.timeOffScreen > 250)
    {
      spliceOneClean(enemies, indexEnemy)
    }

    // end game:
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
    if (dist - enemy.radius - player.radius < 0)
    {
      if   (player.unkillable == true) { hitEnemy(enemy, indexEnemy, true) }
      else                             { playerDeath() }
    }

    // kill enemies:
    projectiles.forEach((projectile, indexProj) =>
    {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

      //Enemy has been hit:
      if (dist - enemy.radius - projectile.radius < 1)
      {
        spliceOneClean(projectiles, indexProj)
        hitEnemy(enemy, indexEnemy, false, projectile)
      }
    })
  })

  // power up loop:
  var pickedUp = false
  powerUps.forEach((power, indexPower) =>
  {
    if (power.x + powerSize < 0 ||
        power.x - powerSize > canvas.width ||
        power.y + powerSize < 0 ||
        power.y - powerSize > canvas.height)
    {
      power.timeOffScreen += 1
    }
    else
    {
      power.timeOffScreen = 0
    }
    if (power.timeOffScreen > 2500)
    {
      spliceOneClean(powerUps, indexPower)
    }

    power.move(speedX, speedY)
    power.update()
    canvas.ctx.save()
    canvas.ctx.translate(power.x, power.y)
    canvas.ctx.rotate(power.rotation);
    canvas.ctx.translate(-power.x, -power.y)
    canvas.ctx.drawImage(power.image, power.x, power.y, power.size, power.size)
    canvas.ctx.restore()

    // pickUp
    const dist = Math.hypot(player.x - power.x, player.y - power.y)
    if (dist - power.size - player.radius < 0)
    {
      power.power.function(player, canvas, power)
      displayedPower = power.power.type
      spliceOneClean(powerUps, indexPower)
      pickedUp = true
    }
  })
  if (pickedUp) {
    powerUps.forEach((power, index) =>
    {
      gsap.to(power, {
        size: 0,
        duration: 1
      })
      setTimeout(spliceOneClean(powerUps, index), 600)
    })
  }
  reticle.draw()
  editStatHtmls()
}

function spawnEnemies()
{
  setInterval(() => {
    if (enemies.length < maxEnemies)
    {
      const r = Math.random() * (60 - 10) + 10

      let x;
      let y;

      if (Math.random() < 0.5) {
        x = Math.random() < 0.5 ? 0 - r : canvas.width  + r
        y = Math.random() * canvas.height
      }
      else {
        x = Math.random() * canvas.width
        y = Math.random() < 0.5 ? 0 - r : canvas.height + r
      }

      const c = colour.randomHSL(undefined, 50, 50)

      const enemy = new draw.Enemy(x, y, r, c, canvas, player)
      enemies.push(enemy)
    }
  }, 1250)
}

function spawnPowers()
{
  setInterval(() => {
    if (powerUps.length < 10 && player.powered == false)
    {
      let r = powerSize

      let x
      let y

      if (Math.random() < 0.5) {
        x = Math.random() < 0.5 ? 0 - r : canvas.width  + r
        y = Math.random() * canvas.height
      }
      else {
        x = Math.random() * canvas.width
        y = Math.random() < 0.5 ? 0 - r : canvas.height + r
      }

      var img = new Image()
      const power = new powerUp.PowerUp(x, y, 80, img)
      powerUps.push(power)
    }
  }, 10000)
}

startBtn.addEventListener('click', () =>
{
  init()
  animate()
  spawnEnemies()
  spawnPowers()
  startEl.style.display = 'none'
})
