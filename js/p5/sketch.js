// remixed from
// https://glitch.com/~recursive-noise-experiment
// cf https://itp-xstory.github.io/p5js-shaders/#/./docs/why-use-shaders

const parentDiv = 'masthead'
let theShader

function isWebglSupported()
{
  var supported
  var canvas = document.createElement('canvas')
  try
    {supported = !! window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))} 
  catch(e) 
    {supported = false}

  try // let is not required, but will help rule out old browserswith potentially buggy implementations: http://caniuse.com/#feat=let
    {eval('let foo = 123')} 
  catch (e) 
    {supported = false}

  if (supported === false)
      console.log("WebGL is not supported")
  canvas = undefined
  return supported
}

class Settings
{
  constructor(framerate, pxDensity)
  {
    this.size = {x: 800, y: 600}
    this.hasWebGL = isWebglSupported()
    this.frameRate = 60
    this.pxDensity = 1
    this.previousTime = performance.now()
    this.smoothElapsedTime = 1
  }

  update()
  {
    const t = performance.now()
    const maximumFrameTime = 1000 / this.frameRate
    const elapsed = t - this.previousTime
    if  (elapsed < 1000) this.smoothElapsedTime = min(lerp(this.smoothElapsedTime, elapsed, .01), elapsed)
    this.previousTime = t
    if (this.smoothElapsedTime > maximumFrameTime * 1.1)
    {
      if (this.frameRate > 30) this.frameRate = 30
      else 
        {
          this.pxDensity *= .9
          this.frameRate = 60
        }
      this.smoothElapsedTime = 1
      frameRate(this.frameRate)
      pixelDensity(this.pxDensity)
      console.log("optim " + this.frameRate +  " " + this.pxDensity)

    }
  }
}

let settings = new Settings(30, 1)

class Trail
{
  constructor(length, initialX, initialY)
  {
    this.pilotPoint = createVector(initialX, initialY)
    this.smoothSpeed = 0;
    this.length = length
    // todo : make pretty setter
    this.dropPos = []
    for (let i = 0; i < this.length; i++) 
      this.dropPos.push(this.pilotPoint)
  }

  update(newX, newY)
  {
    const speed = Math.min(Math.abs(this.pilotPoint.x - mouseX) + Math.abs(this.pilotPoint.y - mouseY), 50)
    this.smoothSpeed = lerp(this.smoothSpeed, speed, (speed > this.smoothSpeed ? .1 : .02) * 60 / settings.frameRate)
    this.pilotPoint.x = newX
    this.pilotPoint.y = newY

    //this.dropPos[0] = p5.Vector.lerp(this.dropPos[0], this.pilotPoint, .5 * 60 / settings.frameRate)
    this.dropPos[0] = this.pilotPoint
    const that = this
    for (let i = 1; i < this.dropPos.length; i++)
      setTimeout(function(newPos) 
      { 
        that.dropPos[i] = p5.Vector.lerp(that.dropPos[i], newPos, .2 * 60 / settings.frameRate)
      }, 30, that.dropPos[i - 1])
  }
}

let trail 

// =========

function preload()
{
  if (!settings.hasWebGL) return;
  theShader = loadShader('js/p5/shader.vert', 'js/p5/shader.frag')
}

function setup()
{
  settings.size.x = document.getElementById(parentDiv).offsetWidth
  settings.size.y = document.getElementById(parentDiv).offsetHeight

  const cnv = createCanvas(settings.size.x, settings.size.y, WEBGL)
  cnv.parent(parentDiv)
  background('#111A21')
  pixelDensity(settings.pxDensity)
  frameRate(settings.frameRate)
  noStroke()

  if (!settings.hasWebGL)
    return;

  mouseX = settings.size.x * .5
  mouseY = settings.size.y * .5
  trail =  new Trail(5, mouseX, mouseY)
}

// todo : stop rendering when scrolled out
function draw()
{
  if (!settings.hasWebGL) return;
  shader(theShader)
  
  settings.update()

  trail.update(mouseX, mouseY)

  theShader.setUniform("iResolution", [width, height])
  theShader.setUniform("iFrame", frameCount)
  theShader.setUniform("iFrameRate", settings.frameRate)
  for (i = 0; i < trail.length; i++)
    theShader.setUniform("iDrop" + i, [trail.dropPos[i].x, (height - trail.dropPos[i].y)])
  theShader.setUniform("iDropDiameter", trail.smoothSpeed)
  theShader.setUniform("iPixelDensity", settings.pxDensity)

  rect(0,0,width, height)
}

function windowResized()
{
  settings.size.x = document.getElementById(parentDiv).offsetWidth
  settings.size.y = document.getElementById(parentDiv).offsetHeight
  resizeCanvas(settings.size.x, settings.size.y)
}
