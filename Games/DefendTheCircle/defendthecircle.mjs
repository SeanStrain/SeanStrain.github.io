import * as colour from "./Colour.mjs"

const particleGenRate = 400
const shootColour     = new colour.HSLObject(0, 100, 50)

var friction  = 1 // modifies enemy speed
var direction = 1 // modifies enemy direction

export function setFriction(value)
{
  friction = value
}

export function setEnemyDirection(value)
{
  direction = value
}

function velocity(angle, speed)
{
  this.x = Math.cos(angle) * speed
  this.y = Math.sin(angle) * speed
  this.angle = angle
  this.speed = speed
}

export class Drawable
{
  constructor (x, y, radius, colour, canvas, type, velocity, alpha)
  {
    this.x = x
    this.y = y
    this.radius = radius
    this.colour = colour
    this.type = type
    this.canvas = canvas

    if (typeof alpha === 'undefined')
    {
      this.alpha = 1;
    } else {
      this.alpha = alpha
    }

    if (typeof velocity === 'undefined')
    {
      this.velocity = 0;
    } else {
      this.velocity = velocity
    }
  }

  draw()
  {
    this.canvas.ctx.save()
    this.canvas.ctx.globalAlpha = this.alpha
    this.canvas.ctx.beginPath()
    this.canvas.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    this.canvas.ctx.fillStyle = this.colour.hsl
    this.canvas.ctx.fill()
    this.canvas.ctx.restore()
  }

  move(rateX, rateY)
  {
    this.x += rateX
    this.y += rateY
  }

}

export class Player extends Drawable
{
  constructor (x, y, radius, colour, canvas)
  {
    super(x, y, radius, colour, canvas, "player")
    this.velocity   = new velocity(0 , 0)
    this.powered    = false
    this.unkillable = false
    this.scoreMulti = 1
    this.killAll    = false
    this.maxSpeed   = 2
    this.spread     = 0.1
    this.baseColour = colour
    this.particleColour = colour
  }

  spawnParticle(changeX, changeY)
  {
    if (Math.random() < 0.7)
    {
      const partx = this.x + changeX*10
      const party = this.y + changeY*10
      const partr = this.radius/2
      const partc = new colour.HSLObject(this.particleColour.hue, this.particleColour.sat, this.particleColour.light)
      const particle = new Particle(partx, party, partr, partc, this.canvas, this.velocity, 0.2, particleGenRate/1.5, this, 1)
      return particle
    }
    else return null
  }

  machineGun(timeFrame, canvas)
  {
    let timer = 0
    let interval = setInterval(() =>
    {
      timer += 150
      canvas.shoot()
      if( timer >= timeFrame) { clearInterval(interval) }
    }, 150)

  }

  shoot(x, y)
  {
    var rand = (Math.random() - 0.5) * this.spread
    var angle = Math.atan2(y - this.y, x - this.x)
    var proj  = new Projectile(this.x, this.y, 5, shootColour, this.canvas, new velocity(angle + rand, Math.random()+4))
    return proj
  }

  setParticleColour(c)
  {
    var c = new colour.HSLObject(c.hue, c.sat, c.light)
    this.particleColour = c
  }

  resetParticleColour()
  {
    var c = new colour.HSLObject(this.baseColour.hue, this.baseColour.sat, this.baseColour.light)
    this.setParticleColour(c)
  }

  hitEnemy()
  {
    this.radius += 0.1
  }

  setFriction(value)
  {
    this.friction = value
  }

  update()
  {

  }

  rainbow(timeFrame)
  {
    let timer   = 0
    let intTime = 50
    let interval = setInterval(() =>
    {
      timer += intTime
      if (timer >= timeFrame)
      {
        clearInterval(interval)
        while(this.colour.light < 100) { this.colour.editLight(0.25) }
      }

      this.colour.editHue(8)
      if (this.colour.light > 50) { this.colour.editLight(-2) }
      this.setParticleColour(this.colour)
    }, intTime)
  }
}

export class Reticle extends Drawable
{
  constructor (x, y, radius, colour, canvas)
  {
    super(x, y, radius, colour, canvas, "reticle")
  }
  draw()
  {
    this.canvas.ctx.save()
    this.canvas.ctx.globalAlpha = this.alpha
    this.canvas.ctx.beginPath()
    this.canvas.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    this.canvas.ctx.lineWidth = 3
    this.canvas.ctx.strokeStyle = '#FF0000';
    this.canvas.ctx.stroke()
    this.canvas.ctx.restore()
  }

}

export class Enemy extends Drawable
{
  constructor (x, y, radius, colour, canvas, player)
  {
    super(x, y, radius, colour, canvas, "enemy")
    this.speed = Math.random() + 1.5
    this.particleRadius = this.radius / 2
    this.player = player
    this.timeOffScreen = 0
  }

  update()
  {
    this.draw()
    const angle = Math.atan2(this.player.y - this.y, this.player.x - this.x)
    this.velocity = new velocity(angle, this.speed * friction)
    const particle = this.spawnParticle()
    this.x = this.x + (this.velocity.x * direction)
    this.y = this.y + (this.velocity.y * direction)
    return particle
  }

  explode(projectile, kill)
  {
    var particles = []
    let amount
    let x
    let y
    let scoreChange = 0

    if (typeof kill === 'undefined') { kill = false }
    if (typeof projectile === 'undefined')
    {
      x = this.x
      y = this.y
    }
    else
    {
      x = projectile.x
      y = projectile.y
    }

    if (this.radius > 20)
    {
      gsap.to(this, {
        radius: this.radius - 10
      })
      scoreChange += 10
    }
    else
    {
      kill = true
      gsap.to(this, {
        radius: 0
      })
      scoreChange += this.radius
    }

    if (kill) { amount = 2 }
    else      { amount = 1 }

    for (let i = 0; i < Math.round(this.radius / 2); i++)
    {
      let angle
      const partx = x + Math.random() * 10
      const party = y + Math.random() * 10
      if (kill)   { angle = Math.random() * Math.PI * 2 }
      else        { angle = Math.atan2(party - this.y, partx - this.x) }
      const partv = new velocity(angle, amount * (Math.random() * amount * 5))
      const partc = new colour.HSLObject(this.colour.hue, this.colour.sat, this.colour.light)
      const partLife = (particleGenRate / 10)
      const particle = new Particle(partx, party, this.particleRadius / 2, partc, this.canvas, partv, 1, partLife, this, 10)
      particles.push(particle)
    }
  return [particles, scoreChange, kill]
  }

  spawnParticle()
  {
    if (Math.random() < 0.4)
    {
      const partx = this.x - this.velocity.x * this.radius
      const party = this.y - this.velocity.y * this.radius
      const partc = new colour.HSLObject(this.colour.hue, this.colour.sat, this.colour.light)
      const partLife = (particleGenRate / 2.3)
      const particle = new Particle(partx, party, this.particleRadius, partc, this.canvas, this.velocity, 0.1, partLife, this, 1)
      return particle
    }
    else return null
  }
}

export class Projectile extends Drawable
{
  constructor (x, y, radius, colour, canvas, velocity)
  {
    super(x, y, radius, colour, canvas, "projectile", velocity)
    this.life = 0
    this.partr = radius - radius / 5
    this.particles = []
    this.ttl = 600
    this.alpha = 1
    this.minAlpha = this.alpha / this.ttl
  }
  update()
  {
    if (this.life > 100)
    {
      this.velocity.x *= 1 - (this.life/100000)
      this.velocity.y *= 1 - (this.life/100000)
    }
    this.life += 1
    this.draw()
    if (this.alpha > this.minAlpha) { this.alpha -= this.minAlpha }
    const particle = this.spawnParticle()
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
    return particle
  }

  spawnParticle()
  {
    if (Math.random() < 0.8*this.alpha && this.life > 12)
    {
      const partx = this.x - this.velocity.x * 3
      const party = this.y - this.velocity.y * 3
      const partc = new colour.HSLObject(this.colour.hue, this.colour.sat, this.colour.light)
      const particle = new Particle(partx, party, this.partr, partc, this.canvas, this.velocity, 0.2*this.alpha, particleGenRate / 8, this, 1)
      return particle
    }
    else return null
  }

}

export class Particle extends Drawable
{
  constructor (x, y, radius, colour, canvas, velocity, alpha, life, parent, spread)
  {
    radius += (Math.random() - 0.5) * 5
    super(x, y, radius, colour, canvas, "particle", velocity, alpha)
    this.ttl = 0
    this.life = life
    this.minAlpha = alpha / life
    this.parent = parent
    this.sprayx = (Math.random() - 0.5) / 3 * spread
    this.sprayy = (Math.random() - 0.5) / 3 * spread
  }

  update()
  {
    this.velocity.speed
    this.ttl += 1
    this.draw()
    this.radius
    if( this.ttl % 5 == 0) { this.colour.editHue(1 + Math.random() * 1.5) }
    if (this.alpha > this.minAlpha) { this.alpha -= this.minAlpha }
    this.x = this.x + this.velocity.x / 3 + this.sprayx
    this.y = this.y + this.velocity.y / 3 + this.sprayy
  }
}
