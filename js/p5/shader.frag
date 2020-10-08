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

// noise from https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

float noise(vec3 p){
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);

    vec4 b = a.xxyy + vec4(.0, 1.0, 0.0, 1.0);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);

    vec4 c = k2 + a.zzzz;
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0);

    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));

    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

    return (o4.y * d.y + o4.x * (1.0 - d.y))*2.0-1.0;
}

vec2 rotate(vec2 v, float a) {
  float s = sin(a);
  float c = cos(a);
  mat2 m = mat2(c, -s, s, c);
  return m * v;
}

void main()
{
  vec3 t = .5 * (float(iFrame+2000) * 60.0 / iFrameRate * vec3(1.0, 2.0, 3.0) / 1.0) / 1000.0;
  
  // Normalized pixel coordinates (from 0 to 1)
  vec2 uv = gl_FragCoord.xy / iResolution.yy / vec2(iPixelDensity);

  float d0 = length(uv - iDrop0.xy / iResolution.yy) * 2.0;
  d0 = 1.0 - sqrt(smoothstep(.0, .5 + .04 * sin(t.x * 10.0), d0));
  float d1 = length(uv - iDrop1.xy / iResolution.yy) * 2.0;
  d1 = .8 - .8 * sqrt(smoothstep(.0, .45 + .035 * sin(t.y * 10.0), d1));
  float d2 = length(uv - iDrop2.xy / iResolution.yy) * 2.0;
  d2 = .7 - .7 * sqrt(smoothstep(.0, .4 + .03 * sin(t.z * 10.0), d2));
  float d3 = length(uv - iDrop3.xy / iResolution.yy) * 2.0;
  d3 = .6 - .6 * sqrt(smoothstep(.0, .35 + .025 * sin(t.x * 10.0), d3));
  float d4 = length(uv - iDrop4.xy / iResolution.yy) * 2.0;
  d4 = .5 - .5 * sqrt(smoothstep(.0, .3 + .015 * sin(t.x * 10.0), d4));

  float dist = 1.8 - (d0 + d1 + d2 + d3 + d4) * iDropDiameter * .002;

  uv = uv * .1; // zoom level
  uv += vec2(-1.0, 2.0) + vec2(.02, .01) * sin(t.xy * 5.0);

  vec3 col = vec3(.0);
  for (int i = 0; i < 6; i++) 
  {
    float i2 = float(i)*3.0;
    col.r += noise(uv.xyy / dist * (12.0 + i2) + col + t * sign(sin(i2 / 3.0)));
    col.g += noise(uv.xyx / dist * (12.0 + i2) + col + t * sign(sin(i2 / 3.0)));
    col.b += noise(uv.yyx / dist * (12.0 + i2) + col + t * sign(sin(i2 / 3.0)));
  }

  for (int i = 0; i < 6; i++) 
  {
    float i2 = float(i)*3.0;
    col.r += noise(uv.xyy * dist * 32.0 + col + t * sign(sin(i2 / 3.0)));
    col.g += noise(uv.xyx * dist * 32.0 + col + t * sign(sin(i2 / 3.0)));
    col.b += noise(uv.yyx * dist * 32.0 + col + t * sign(sin(i2 / 3.0)));
  }

  col = mix(normalize(col), vec3(0), dist * 8.0);
  
  const vec3 darkBlue = vec3(.06666666666, 0.10196078431, 0.1294117647);
  const vec3 lightGrey = vec3(0.42352941176, 0.45882352941, 0.49019607843);

  vec3 c = mix(lightGrey, darkBlue, col.r);
  c = mix(c, vec3(1.0), .5 + c.g);
  c = mix(c, lightGrey, col.b * .04);
  c = mix(darkBlue, c, c.b * c.b);
  c = mix(darkBlue, lightGrey, c.g);
  //c = clamp(c, vec3(.0), vec3(1.0));
  // Output to screen
  gl_FragColor = vec4(c, 1.0);
}