export class cssTextShadow
{
  constructor(size1, size2, blur, colour1, colour2)
  {
    this.size1  = size1;
    this.size2  = size2;
    this.blur   = blur;
    this.colour1 = colour1;
    this.colour2 = colour2;
    this.makeShadow();
  }

  makeShadow()
  {
    this.shadow = `${this.size1}px   ${this.size2}px   ${this.blur}px ${this.colour1.hsl},` +
                  `${this.size1*2}px ${this.size2*2}px ${this.blur}px ${this.colour2.hsl}`;
  }

  setSize(size)
  {
    this.size1 = size;
    this.size2 = size;
    this.makeShadow();
  }

  setBlur(blur)
  {
    this.blur = blur;
    this.makeShadow();
  }

  editSizes(change)
  {
    this.size1 += change;
    this.size2 += change;
    this.makeShadow();
  }

  editBlur(change)
  {
    this.blur += change;
    this.makeShadow();
  }
}

export class HSLObject
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

export class RGBObject
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
    this.red += change;
    this.makeRGB();
  }

  editGreen(change)
  {
    this.green += change;
    this.makeRGB();
  }

  editBlue(change)
  {
    this.blue += change;
    this.makeRGB();
  }

  editAll(change)
  {
    this.red += change;
    this.green += change;
    this.blue += change;
    this.makeRGB();
  }
}

export function randomHSL(hue, sat, light)
{
  if (typeof hue === 'undefined')
  {
    hue = Math.random() * 360;
  }

  if (typeof sat === 'undefined')
  {
    sat = Math.random() * 100;
  }

  if (typeof light === 'undefined')
  {
    light = Math.random() * 100;
  }

  const randomHSLObject = new HSLObject(hue, sat, light);
  return randomHSLObject;
}
