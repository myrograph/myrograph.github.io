// remixed from
// https://glitch.com/~recursive-noise-experiment
// cf https://itp-xstory.github.io/p5js-shaders/#/./docs/why-use-shaders

const parentDiv = 'masthead'

const size = {x: 800, y: 600}

const hasWebGL = isWebglSupported()

let pilotPoint
let dropPos = []
let speed = 0
let smoothSpeed = 0
let timeSinceLastMouseMove = 0;

let theShader
let pxDensity = 1
let fixedFrameRate = 60

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

  if (!hasWebGL) return;

  mouseX = size.x * .5
  mouseY = size.y * .5
  pilotPoint = createVector(mouseX, mouseY)
  dropPos = []
  for (i=0; i<5; i++) 
    dropPos.push(pilotPoint)
}

function draw() 
{
  if (!hasWebGL) return;
  shader(theShader)
  
  let currPilotPoint = createVector(mouseX, mouseY)

  speed = Math.min(Math.abs(pilotPoint.x - mouseX) + Math.abs(pilotPoint.y - mouseY), 50)
  if (speed > smoothSpeed) smoothSpeed = lerp(smoothSpeed, speed, .1)
  else smoothSpeed = lerp(smoothSpeed, speed, .02)
  pilotPoint.x = mouseX
  pilotPoint.y = mouseY

  dropPos[0] = p5.Vector.lerp(dropPos[0], pilotPoint, .5)
  for (let i=1; i<dropPos.length; i++) 
    setTimeout(function(newPos) 
    { 
      dropPos[i] = p5.Vector.lerp(dropPos[i], newPos, .2) 
    }, 30, dropPos[i-1])
  theShader.setUniform("iResolution", [width, height])
  theShader.setUniform("iFrame", frameCount)
    for (i=0; i<5; i++)
    theShader.setUniform("iDrop"+i, [dropPos[i].x, (height - dropPos[i].y)])
  theShader.setUniform("iDropDiameter", smoothSpeed)
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