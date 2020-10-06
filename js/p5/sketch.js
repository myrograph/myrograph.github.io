// remixed from
// https://glitch.com/~recursive-noise-experiment
// cf https://itp-xstory.github.io/p5js-shaders/#/./docs/why-use-shaders

const parentDiv = 'masthead'

const size = {x: 800, y: 600}

const hasWebGL = isWebglSupported()

let theShader
let pxDensity = 1
let fixedFrameRate = 30

class Trail
{
  constructor(length, initialX, initialY)
  {
    this.pilotPoint = createVector(initialX, initialY)
    this.smoothSpeed = 0;
    this.length = length
    this.dropPos = []
    for (let i = 0; i < this.length; i++) 
      this.dropPos.push(this.pilotPoint)
  }

  update(newX, newY)
  {
    const speed = Math.min(Math.abs(this.pilotPoint.x - mouseX) + Math.abs(this.pilotPoint.y - mouseY), 50)
    this.smoothSpeed = lerp(this.smoothSpeed, speed, (speed > this.smoothSpeed ? .1 : .02) * 60 / fixedFrameRate)
    this.pilotPoint.x = newX
    this.pilotPoint.y = newY

    this.dropPos[0] = p5.Vector.lerp(this.dropPos[0], this.pilotPoint, .5 * 60 / fixedFrameRate)
    const that = this
    for (let i = 1; i < this.dropPos.length; i++)
      setTimeout(function(newPos) 
      { 
        that.dropPos[i] = p5.Vector.lerp(that.dropPos[i], newPos, .2 * 60 / fixedFrameRate)
      }, 30, that.dropPos[i - 1])
  }
}

let trail 

function preload() 
{
  if (!hasWebGL) return;
  theShader = loadShader('js/p5/shader.vert', 'js/p5/shader.frag')
}

function setup() 
{
  size.x = document.getElementById(parentDiv).offsetWidth
  size.y = document.getElementById(parentDiv).offsetHeight

  const cnv = createCanvas(size.x, size.y, WEBGL)
  cnv.parent(parentDiv)
  background('#111A21')
  pixelDensity(pxDensity)
  frameRate(fixedFrameRate)
  noStroke()

  if (!hasWebGL)
    return;

  mouseX = size.x * .5
  mouseY = size.y * .5
  trail =  new Trail(5, mouseX, mouseY)
}

// todo : stop rendering when scrolled out
function draw() 
{
  if (!hasWebGL) return;
  shader(theShader)
  
  trail.update(mouseX, mouseY)

  theShader.setUniform("iResolution", [width, height])
  theShader.setUniform("iFrame", frameCount)
  theShader.setUniform("iFrameRate", fixedFrameRate)
  for (i = 0; i < trail.length; i++)
    theShader.setUniform("iDrop" + i, [trail.dropPos[i].x, (height - trail.dropPos[i].y)])
  theShader.setUniform("iDropDiameter", trail.smoothSpeed)
  theShader.setUniform("iPixelDensity", pxDensity)

  rect(0,0,width, height)
}

function windowResized() 
{
  size.x = document.getElementById(parentDiv).offsetWidth
  size.y = document.getElementById(parentDiv).offsetHeight
  resizeCanvas(size.x, size.y)
}

// =========

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