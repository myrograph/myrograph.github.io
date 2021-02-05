// remixed from
// https://glitch.com/~recursive-noise-experiment
// cf https://itp-xstory.github.io/p5js-shaders/#/./docs/why-use-shaders


var detectGpu = require("detect-gpu")
/*detectGpu.getGPUTier()
console.log(detectGpu.getGPUTier())
*/
const parentDiv = document.getElementById('masthead')
let theShader

function isMobile() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

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
  return supported && !isMobile()
}


class Settings
{
  constructor(framerate, pxDensity)
  {
    this.size = {x: 800, y: 600}
    this.hasWebGL = isWebglSupported()
    this.targetFrameRate = 60
    this.pxDensity = 1
    this.previousTime =  performance.now() * .001
    this.smoothDeltaTime = 0
    this.isCanvasInView = true
  }

  update()
  {
    const maximumFrameTime = 1000.0 / this.targetFrameRate
    if  (deltaTime < 1000)
      this.smoothDeltaTime = min(lerp(this.smoothDeltaTime, deltaTime, .1), deltaTime)
    if (this.smoothDeltaTime > maximumFrameTime * 1.3)
    {
      if (this.targetFrameRate > 30)
        this.targetFrameRate = 30
      else if (this.pxDensity > .51)
        this.pxDensity -= .1
      pixelDensity(this.pxDensity)
      frameRate(this.targetFrameRate)
      console.log("Dynamic WebGL performance optimization:\n caping fps at " + this.targetFrameRate +  ", resolution at " + (this.pxDensity * 100) + "%")
    }
  }
}

let settings = new Settings(30, 1)

var canvasObserver = new IntersectionObserver(function(entries)
{
  if(entries[0].isIntersecting === true)
    settings.isCanvasInView = true
  else
    settings.isCanvasInView = false
}, { threshold: [0] })
canvasObserver.observe(parentDiv)

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
    this.smoothSpeed = lerp(this.smoothSpeed, speed, (speed > this.smoothSpeed ? .1 : .02) * 60 / settings.targetFrameRate)
    this.pilotPoint.x = newX
    this.pilotPoint.y = newY

    //this.dropPos[0] = p5.Vector.lerp(this.dropPos[0], this.pilotPoint, .5 * 60 / settings.TargetFrameRate)
    this.dropPos[0] = this.pilotPoint
    const that = this
    for (let i = 1; i < this.dropPos.length; i++)
      setTimeout(function(newPos) 
      { 
        that.dropPos[i] = p5.Vector.lerp(that.dropPos[i], newPos, .2 * 60 / settings.targetFrameRate)
      }, 30, that.dropPos[i - 1])
  }
}

let trail 

// =========

function preload()
{
  if (!settings.hasWebGL)
    return;
  theShader = loadShader('js/p5/shader.vert', 'js/p5/shader.frag')
}

function setup()
{
  if (!settings.hasWebGL)
    return;
  settings.size.x = parentDiv.offsetWidth
  settings.size.y = parentDiv.offsetHeight

  const cnv = createCanvas(settings.size.x, settings.size.y, WEBGL)
  cnv.parent(parentDiv)
  background('#111A21')
  pixelDensity(settings.pxDensity)
  frameRate(settings.targetFrameRate)
  noStroke()

  parentDiv.style["background-image"] = "none"
  mouseX = settings.size.x * .5
  mouseY = settings.size.y * .5
  trail =  new Trail(5, mouseX, mouseY)
}

// todo : stop rendering when scrolled out
function draw()
{
  if (!settings.hasWebGL || !settings.isCanvasInView)
    return;
  shader(theShader)
  settings.update()
  trail.update(mouseX, mouseY)

  theShader.setUniform("iResolution", [width, height])
  theShader.setUniform("iFrame", frameCount)
  theShader.setUniform("iFrameRate", settings.targetFrameRate)
  for (i = 0; i < trail.length; i++)
    theShader.setUniform("iDrop" + i, [trail.dropPos[i].x, (height - trail.dropPos[i].y)])
  theShader.setUniform("iDropDiameter", trail.smoothSpeed)
  theShader.setUniform("iPixelDensity", settings.pxDensity)

  rect(0,0,width, height)
}

function windowResized()
{
  settings.size.x = parentDiv.offsetWidth
  settings.size.y = parentDiv.offsetHeight
  resizeCanvas(settings.size.x, settings.size.y)
}
