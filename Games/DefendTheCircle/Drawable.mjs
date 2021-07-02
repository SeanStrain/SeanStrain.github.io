import * as colour from "./Colour.mjs"

const colourThing = new colour.HSLObject(0, 0, 0)

const canvas = document.querySelector('canvas')
const ctx    = canvas.getContext('2d')

const particleGenRate = 400

function velocity(angle, speed)
{
  this.x = Math.cos(angle) * speed
  this.y = Math.sin(angle) * speed
  this.angle = angle
  this.speed = speed
}

export class Drawable
{
  constructor (x, y, radius, colour, velocity, alpha)
  {
    this.x = x
    this.y = y
    this.radius = radius
    this.colour = colour

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
    ctx.save()
    ctx.globalAlpha = this.alpha
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fillStyle = this.colour.hsl
    ctx.fill()
    ctx.restore()
  }

  move(rateX, rateY)
  {
    this.x += rateX
    this.y += rateY
  }

}

// Placeholder, needs fully implemented
export class Player extends Drawable
{
  constructor (x, y, radius, colour)
  {
    super(x, y, radius, colour)
    this.velocity = new velocity(0 , 0)
  }

  spawnParticle(changeX, changeY)
  {
    if (Math.random() < 0.7)
    {
      const partx = this.x + changeX*10
      const party = this.y + changeY*10
      const partc = new colour.HSLObject(this.colour.hue, this.colour.sat, this.colour.light)
      const partr = this.radius/2
      const particle = new Particle(partx, party, partr, partc, this.velocity, 0.2, particleGenRate/1.5, this, 1)
      return particle
    }
    else return null
  }

}

export class Reticle extends Drawable
{
  constructor (x, y, radius, colour)
  {
    super(x, y, radius, colour)

  }
  draw()
  {
    ctx.save()
    ctx.globalAlpha = this.alpha
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.lineWidth = 3
    ctx.strokeStyle = '#FF0000';
    ctx.stroke()
    ctx.restore()
  }

}

export class Enemy extends Drawable
{
  constructor (x, y, radius, colour, player)
  {
    super(x, y, radius, colour)
    this.speed = Math.random() + 1
    this.particleRadius = this.radius / 2
    this.player = player
    this.timeOffScreen = 0
  }

  update()
  {
    this.draw()
    const angle = Math.atan2(this.player.y - this.y, this.player.x - this.x)
    this.velocity = new velocity(angle, this.speed)
    const particle = this.spawnParticle()
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
    return particle
  }

  hit(projectile)
  {
    const particles = []
    for (let i = 0; i < 5; i++)
    {
      const partx = projectile.x + Math.random() * 10
      const party = projectile.y + Math.random() * 10
      const angle = Math.atan2(party - this.y, partx - this.x)
      const partv = new velocity(this.velocity.angle, 5)
      const partc = new colour.HSLObject(this.colour.hue, this.colour.sat, this.colour.light)
      const partLife = (particleGenRate / 10)
      const particle = new Particle(partx, party, this.particleRadius / 2, partc, partv, 1, partLife, this, 10)
      particles.push(particle)
    }
    return particles
  }

  spawnParticle()
  {
    if (Math.random() < 0.4)
    {
      const partx = this.x - this.velocity.x * this.radius
      const party = this.y - this.velocity.y * this.radius
      const partc = new colour.HSLObject(this.colour.hue, this.colour.sat, this.colour.light)
      const partLife = (particleGenRate / 2.3)
      const particle = new Particle(partx, party, this.particleRadius, partc, this.velocity, 0.1, partLife, this, 1)
      return particle
    }
    else return null
  }
}

export class Projectile extends Drawable
{
  constructor (x, y, radius, colour, velocity)
  {
    super(x, y, radius, colour, velocity)
    this.lifespan = 0
    this.partr = radius - radius / 5
    this.particles = []
  }
  update()
  {
    this.lifespan += 1
    this.draw()
    const particle = this.spawnParticle()
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
    return particle
  }

  spawnParticle()
  {
    if (Math.random() < 0.8 && this.lifespan > 12)
    {
      const partx = this.x - this.velocity.x * 3
      const party = this.y - this.velocity.y * 3
      const partc = new colour.HSLObject(this.colour.hue, this.colour.sat, this.colour.light)
      const particle = new Particle(partx, party, this.partr, partc, this.velocity, 0.2, particleGenRate / 8, this, 1)
      return particle
    }
    else return null
  }

}

export class Particle extends Drawable
{
  constructor (x, y, radius, colour, velocity, alpha, life, parent, spread)
  {
    radius += (Math.random() - 0.5) * 5
    super(x, y, radius, colour, velocity, alpha)
    this.ttl = 0
    this.life = life
    this.minAlpha = alpha / life
    this.parent = parent
    this.sprayx = (Math.random() - 0.5) / 3 * spread
    this.sprayy = (Math.random() - 0.5) / 3 * spread
  }

  update()
  {
    this.ttl += 1
    this.draw()
    this.radius
    if( this.ttl % 5 == 0) { this.colour.editHue(1 + Math.random() * 1.5) }
    if (this.alpha > this.minAlpha) { this.alpha -= this.minAlpha }
    this.x = this.x + this.velocity.x / 3 + this.sprayx
    this.y = this.y + this.velocity.y / 3 + this.sprayy
  }
}
