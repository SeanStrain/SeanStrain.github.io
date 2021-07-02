export class HSLObject
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
    this.hsl = `hsl(${this.hue}, ${this.sat}%, ${this.light}%)`
  }

  editHue(change)
  {
    this.hue += change
    this.makeHSL()
  }

  editSat(change)
  {
    this.hue += change
    this.makeHSL()
  }

  editLight(change)
  {
    this.light += change
    this.makeHSL()
  }
}

export class RGBObject
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
    this.hsl = `hsl(${this.hue}, ${this.sat}%, ${this.light}%)`
  }

  editHue(change)
  {
    this.hue += change
    this.makeHSL()
  }

  editSat(change)
  {
    this.hue += change
    this.makeHSL()
  }

  editLight(change)
  {
    this.light += change
    this.makeHSL()
  }
}
