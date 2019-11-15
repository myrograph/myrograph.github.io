const parentDiv = 'masthead';

const size = { // canvas size in pixels
  x: 800,
  y: 600
}
const margin =  0 // 0-0.5 margin as a percentage of size


// FUNKY VARIABLES TO TWEAK HERE V V V
// ==================================================
const nbColors = 5 // nb of color to shift
const radius = 10 // radius of the shifted colors
const transparency = 1 // 0-100
const weigth = 20 // wheight of light rays

const ampRange = { // amplitude range of vertex wiggle
  min: size.y * 0,
  max: size.y * .2
}
const nVertices = 8 // number of vertices
// ==================================================


// computing variables
let vertices = [] // vertice data
let t = 0 // time

function setup() {
  vertices = []
  size.x = document.getElementById(parentDiv).offsetWidth
  size.y = document.getElementById(parentDiv).offsetHeight

  const cnv = createCanvas(size.x, size.y)
  cnv.parent(parentDiv);
  background('#000')
  colorMode(HSB, 100, 100, 100)
  strokeWeight(weigth)
  //strokeCap(SQUARE)
  
  // init vertices data
  for (let i = 0; i < nVertices; i++) {
    vertices.push({
      orig: {
        x: random(size.x * margin, size.x * (1 - margin)),
        y: random(size.y * margin, size.y * (1 - margin))
      },
      amp: random(ampRange.min, ampRange.max),
      x: 0,
      y: 0,
      seed: random(0, 99999999),
      radius:0
    })
  }
}

function windowResized() {
  setup()
}

// updating vertice data at each frame
function update() {
  t += .01
  for (let v of vertices) {
    // moving vertices around with weird equations
    v.x = v.orig.x + v.amp * (sin(t * 0.7 * cos(v.seed) + v.orig.x) + sin(t * 1.4 * sin(v.seed)) * 0.5)
    v.y = v.orig.y + v.amp * (cos(t * 0.7 * sin(v.seed) - v.orig.y) + sin(t * 1.4 * cos(v.seed)) * 0.5)
    // updating offset radius
    v.radius = radius * sin(t + v.seed)
  }
}

// drawing stuff at each frame
function draw() {
  update()
  blendMode(MULTIPLY)
  background(0,0,0,.1)
  blendMode(ADD)

  for (a = 0; a < nbColors; a++) {
    stroke(a/nbColors*100, 100, transparency)
    for (let i = 0; i < vertices.length; i++) {
      
      const j = (i + 1) % nVertices
      const k = (i + 2) % nVertices
      const u = vertices[i]
      const v = vertices[j]
      const w = vertices[k]
      
      const dxu = sin(a/nbColors*2* PI + t) * u.radius 
      const dyu = cos(a/nbColors*2* PI + t) * u.radius
      const dxv = sin(a/nbColors*2* PI + t) * v.radius 
      const dyv = cos(a/nbColors*2* PI + t) * v.radius
      const dxw = sin(a/nbColors*2* PI + t) * w.radius 
      const dyw = cos(a/nbColors*2* PI + t) * w.radius

      line(u.x+dxu, u.y+dyu, v.x+dxv, v.y+dyv)
      line(u.x+dxu, u.y+dyu, w.x+dxw, w.y+dyw)
    }
  }
}