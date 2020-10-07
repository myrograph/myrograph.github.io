// this is a port of "recursive noise experiment" by ompuco
// https://www.shadertoy.com/view/wllGzr
// casey conchinha - @kcconch ( https://github.com/kcconch )
// more p5.js + shader examples: https://itp-xstory.github.io/p5js-shaders/

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 iResolution;
uniform int iFrame;
uniform float iFrameRate;
uniform vec2 iDrop0;
uniform vec2 iDrop1;
uniform vec2 iDrop2;
uniform vec2 iDrop3;
uniform vec2 iDrop4;
uniform float iDropDiameter;
uniform float iPixelDensity;
uniform float iSimplifyAmount;

float hash(float n) 
  {return fract(sin(n) * 43758.5453);}

float noise(vec3 x)
{
  // The noise function returns a value in the range -1.0f -> 1.0f

  vec3 p = floor(x);
  vec3 f = fract(x);

  f = f * f * (3.0 - 2.0 * f);
  float n = p.x + p.y * 57.0 + 113.0 * p.z;

  return mix(mix(mix(hash(n + 0.0), hash(n + 1.0), f.x),
    mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y),
    mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
    mix(hash(n + 170.0), hash(n + 171.0), f.x), f.y), f.z) - .5;
}


float sdSegment(vec2 p, vec2 a, vec2 b)
{
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

void main()
{
  vec3 t = (float(iFrame) * 60.0 / iFrameRate * vec3(1.0, 2.0, 3.0) / 1.0) / 1000.0;
    
  // Normalized pixel coordinates (from 0 to 1)
  vec2 uv = gl_FragCoord.xy / iResolution.yy / vec2(iPixelDensity);

  float d0 = length(uv - iDrop0.xy / iResolution.yy) * 2.0;
  d0 = 1.0 - sqrt(smoothstep(0.0, .5 + .04 * sin(t.x * 10.0), d0));
  float d1 = length(uv - iDrop1.xy / iResolution.yy) * 2.0;
  d1 = .8 - .8 * sqrt(smoothstep(0.0, .45 + .035 * sin(t.y * 10.0), d1));
  float d2 = length(uv - iDrop2.xy / iResolution.yy) * 2.0;
  d2 = .7 - .7 * sqrt(smoothstep(0.0, .4 + .03 * sin(t.z * 10.0), d2));
  float d3 = length(uv - iDrop3.xy / iResolution.yy) * 2.0;
  d3 = .6 - .6 * sqrt(smoothstep(0.0, .35 + .025 * sin(t.x * 10.0), d3));
  float d4 = length(uv - iDrop4.xy / iResolution.yy) * 2.0;
  d4 = .5 - .5 * sqrt(smoothstep(0.0, .3 + .015 * sin(t.x * 10.0), d4));

  float dist = 1.8 - (d0 + d1 + d2 + d3 + d4) / 5.0 * iDropDiameter * .01;

  uv = uv * .12 + vec2(1.0, 2.0); // zoom level

  vec3 col = vec3(.0);
  for (int i = 0; i < 16; i++) 
  {
    float i2 = float(i) * iSimplifyAmount;
    if (i2 > 16.0) break;
    col.r += noise(uv.xyy / dist * (12.0 + i2) + col.rgb + t * sign(sin(i2 / 3.0)));
    col.g += noise(uv.xyx / dist * (12.0 + i2) + col.rgb + t * sign(sin(i2 / 3.0)));
    col.b += noise(uv.yyx / dist * (12.0 + i2) + col.rgb + t * sign(sin(i2 / 3.0)));
  }

  for (int i = 0; i < 16; i++) 
  {
    float i2 = float(i) * iSimplifyAmount;
    if (i2 > 16.0) break;
    col.r += noise(uv.xyy * dist * (32.0) + col.rgb + t * sign(sin(i2 / 3.0)));
    col.g += noise(uv.xyx * dist * (32.0) + col.rgb + t * sign(sin(i2 / 3.0)));
    col.b += noise(uv.yyx * dist * (32.0) + col.rgb + t * sign(sin(i2 / 3.0)));
  }

  col.rgb *= iSimplifyAmount * iSimplifyAmount / 32.0;
  col.rgb = mix(col.rgb, normalize(col.rgb) * 2.0, 1.0);
  col.rgb = mix(col.rgb, vec3(0), dist * 8.0) * 1.0;
  
  const vec3 darkBlue = vec3(0.06666666666, 0.10196078431, 0.1294117647);
  const vec3 lightGrey = vec3(0.42352941176, 0.45882352941, 0.49019607843);

  vec3 c = mix(lightGrey, darkBlue, col.r);
  c = mix(c, vec3(1.0), c.g);
  c = mix(c, lightGrey, col.b * .04);
  c = mix(darkBlue, c, c.b * c.b);
  c = mix(darkBlue, lightGrey, c.g);
  clamp(c, vec3(0.0), vec3(1.0));
  // Output to screen
  gl_FragColor = vec4(c, 1.0);
}