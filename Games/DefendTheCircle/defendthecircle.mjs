import * as draw   from "./Drawable.mjs"
import * as colour from "./Colour.mjs"

// canvas constants:
const canvas = document.querySelector('canvas')
const ctx    = canvas.getContext('2d')

canvas.width  = innerWidth
canvas.height = innerHeight
const midx   = canvas.width  / 2
const midy   = canvas.height / 2

// canvas element arrays:
const projectiles = []
const enemies     = []
const particles   = []

// movement values:
const maxSpeed   = 2      // fastest player can go
const friction   = 0.98   // coefficient of friction on movement
const deltaV     = 0.1    // change in value of speed with keypress
const smokePoint = 0.5    // speed at which smoke appears from player
const keys     = []
var speedX = 0
var speedY = 0

function velocity(angle, speed)
{
  this.x = Math.cos(angle) * speed
  this.y = Math.sin(angle) * speed
  this.angle = angle
  this.speed = speed
}

const shootColour  = new colour.HSLObject(0, 100, 50)
const playerColour = new colour.HSLObject(0, 0, 100)
const canvasColour = new colour.HSLObject(0, 5, 5)

function spliceOneClean(array, index)
{
  setTimeout(() => {
    array.splice(index, 1)
  }, 0)
}

const player  = new draw.Player(midx, midy, 30, playerColour)
const reticle = new draw.Reticle(midx, midy,  5, playerColour)

// projectile spawner on clicks:
addEventListener('click', (event) =>
{
  const angle = Math.atan2(event.clientY - player.y, event.clientX - player.x)
  const proj  = new draw.Projectile(player.x, player.y, 5, shootColour, new velocity(angle, Math.random()+3))
  projectiles.push(proj)
})

// mousemove:
addEventListener('mousemove', (event) =>
{
  reticle.x = event.clientX
  reticle.y = event.clientY
})

/*
addEventListener('keydown', (event) =>
{
  var changeX = 0
  var changeY = 0
  var valid = false

    enemies.forEach((enemy) =>
    {
      enemy.x += changeX
      enemy.y += changeY
    })
    projectiles.forEach((projectile) =>
    {
      projectile.x += changeX
      projectile.y += changeY
    })
    particles.forEach((particle) =>
    {
      particle.x += changeX
      particle.y += changeY
    })

  if (valid)
  {
    const particle = player.spawnParticle(changeX, changeY)
    if (particle != null ) {
      particles.push(particle)
    }
  }
})
*/

addEventListener('keydown', (event) =>
{
  keys[event.code] = true
})

addEventListener('keyup', (event) =>
{
  keys[event.code] = false
})

let animationId
function animate()
{
  animationId = requestAnimationFrame(animate)

  ctx.fillStyle = canvasColour.hsl
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  player.draw()


  // Player Movement:
  if ((keys["KeyW"] || keys["ArrowUp"]) && speedY < maxSpeed)
  {
    speedY += deltaV
  }

  if ((keys["KeyD"] || keys["ArrowRight"]) && speedX > -maxSpeed)
  {
    speedX -= deltaV
  }

  if ((keys["KeyS"] || keys["ArrowDown"]) && speedY > -maxSpeed)
  {
    speedY -= deltaV
  }

  if ((keys["KeyA"] || keys["ArrowLeft"]) && speedX < maxSpeed)
  {
    speedX += deltaV
  }

  speedX *= friction
  speedY *= friction

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
    enemy.move(speedX, speedY)
    const particle = enemy.update()
    if (particle != null) { particles.push(particle) }

    if (enemy.x + enemy.radius < 0 ||
        enemy.x - enemy.radius > canvas.width ||
        enemy.y + enemy.radius < 0 ||
        enemy.y - enemy.radius > canvas.height)
    {
      enemy.timeOffScreen += 1
      console.log(enemy.timeOffScreen)
    }
    else
    {
      enemy.timeOffScreen = 0
    }
    if (enemy.timeOffScreen > 250)
    {
      spliceOneClean(enemies, indexEnemy)
    }


    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
    // end game:
    if (dist - enemy.radius - player.radius < 0)
    {
      cancelAnimationFrame(animationId)
    }

    // kill enemies:
    projectiles.forEach((projectile, indexProj) =>
    {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

      //Enemy has been hit:
      if (dist - enemy.radius - projectile.radius < 1)
      {
        spliceOneClean(projectiles, indexProj)
        const explodeParticles = enemy.hit(projectile)
        explodeParticles.forEach((explodeParticle) => { particles.push(explodeParticle) });

        if (enemy.radius > 20)
        {
            enemy.radius -= 10
        } else
        {
          spliceOneClean(enemies, indexEnemy)
        }
      }
    })
  })
  reticle.draw()
}

function spawnEnemies()
{
  setInterval(() => {
    const r = Math.random() * (40 - 10) + 10

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

    const hue = Math.random() * 360
    const c = new colour.HSLObject(hue, 50, 50)

    const enemy = new draw.Enemy(x, y, r, c, player)
    enemies.push(enemy)

  }, 1250)
}

/*
function canvasHueChange()
{
  setInterval(() =>
  {
    canvasColour.editHue(1)
    console.log("change")
  }, 500)
}
canvasHueChange()
*/
animate()
spawnEnemies()
