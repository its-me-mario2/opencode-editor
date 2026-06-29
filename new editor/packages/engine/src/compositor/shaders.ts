export const VERTEX_SHADER_SOURCE = `#version 300 es
in vec2 a_position;
in vec2 a_texCoord;
out vec2 v_texCoord;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_texCoord = a_texCoord;
}
`;

export function getBlendFragmentShader(blendMode: string): string {
  return `#version 300 es
precision highp float;

in vec2 v_texCoord;
uniform sampler2D u_baseTex;
uniform sampler2D u_blendTex;
uniform float u_opacity;

out vec4 fragColor;

vec3 blend(vec3 base, vec3 blend, float opacity) {
  ${getBlendFunction(blendMode)}
  return mix(base, result, opacity);
}

void main() {
  vec4 base = texture(u_baseTex, v_texCoord);
  vec4 blend = texture(u_blendTex, v_texCoord);
  vec3 color = blend(base.rgb, blend.rgb, blend.a * u_opacity);
  fragColor = vec4(color, max(base.a, blend.a * u_opacity));
}
`;
}

export const COMPOSITE_FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 v_texCoord;
uniform sampler2D u_textures[16];
uniform float u_opacities[16];
uniform int u_count;

out vec4 fragColor;

void main() {
  vec4 color = vec4(0.0);
  for (int i = 0; i < 16; i++) {
    if (i >= u_count) break;
    vec4 layer = texture(u_textures[i], v_texCoord);
    color = mix(color, layer, layer.a * u_opacities[i]);
  }
  fragColor = color;
}
`;

export const TRANSFORM_VERTEX_SHADER = `#version 300 es
in vec2 a_position;
in vec2 a_texCoord;
uniform vec2 u_translate;
uniform vec2 u_scale;
uniform float u_rotation;
uniform vec2 u_anchor;

out vec2 v_texCoord;

void main() {
  vec2 origin = a_position - u_anchor;
  float cosA = cos(u_rotation);
  float sinA = sin(u_rotation);
  vec2 rotated = vec2(
    origin.x * cosA - origin.y * sinA,
    origin.x * sinA + origin.y * cosA
  );
  vec2 pos = rotated * u_scale + u_anchor + u_translate;
  gl_Position = vec4(pos, 0.0, 1.0);
  v_texCoord = a_texCoord;
}
`;

export const CROP_FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 v_texCoord;
uniform sampler2D u_texture;
uniform vec4 u_crop; // left, top, right, bottom
uniform vec2 u_canvasSize;

out vec4 fragColor;

void main() {
  vec2 crop = u_crop.xy + (u_crop.zw * v_texCoord);
  vec2 uv = clamp(crop, vec2(0.0), vec2(1.0));
  vec4 color = texture(u_texture, uv);
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) discard;
  fragColor = color;
}
`;

export const MASK_FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 v_texCoord;
uniform sampler2D u_texture;
uniform int u_maskType;
uniform float u_feather;
uniform vec2 u_center;
uniform float u_radius;

out vec4 fragColor;

void main() {
  vec4 color = texture(u_texture, v_texCoord);
  float dist = 1.0;

  if (u_maskType == 0) { // linear
    dist = 1.0 - v_texCoord.y;
  } else if (u_maskType == 1) { // mirror
    dist = 1.0 - abs(v_texCoord.y - 0.5) * 2.0;
  } else if (u_maskType == 2) { // radial
    dist = 1.0 - distance(v_texCoord, u_center);
  } else if (u_maskType == 3) { // rectangle
    vec2 d = abs(v_texCoord - u_center);
    dist = 1.0 - max(d.x, d.y) * 2.0;
  } else if (u_maskType == 4) { // heart
    vec2 p = v_texCoord - u_center;
    p *= 2.5;
    float a = p.x * p.x + p.y * p.y - 1.0;
    dist = 1.0 - (a * a * a - p.x * p.x * p.y * p.y * p.y) * 3.0;
  }

  float alpha = smoothstep(0.0, u_feather, dist);
  fragColor = vec4(color.rgb, color.a * alpha);
}
`;

function getBlendFunction(mode: string): string {
  switch (mode) {
    case 'normal':
      return 'vec3 result = blend.rgb;';
    case 'darken':
      return 'vec3 result = min(base, blend);';
    case 'multiply':
      return 'vec3 result = base * blend;';
    case 'colorBurn':
      return `vec3 result = 1.0 - (1.0 - base) / max(blend, 0.001);`;
    case 'linearBurn':
      return 'vec3 result = base + blend - 1.0;';
    case 'lighten':
      return 'vec3 result = max(base, blend);';
    case 'screen':
      return 'vec3 result = 1.0 - (1.0 - base) * (1.0 - blend);';
    case 'colorDodge':
      return `vec3 result = base / max(1.0 - blend, 0.001);`;
    case 'linearDodge':
      return 'vec3 result = base + blend;';
    case 'overlay':
      return `vec3 result = vec3(
        base.r < 0.5 ? 2.0 * base.r * blend.r : 1.0 - 2.0 * (1.0 - base.r) * (1.0 - blend.r),
        base.g < 0.5 ? 2.0 * base.g * blend.g : 1.0 - 2.0 * (1.0 - base.g) * (1.0 - blend.g),
        base.b < 0.5 ? 2.0 * base.b * blend.b : 1.0 - 2.0 * (1.0 - base.b) * (1.0 - blend.b)
      );`;
    case 'softLight':
      return `vec3 result = vec3(
        base.r < 0.5 ? base.r * (1.0 + (2.0 * blend.r - 1.0) * (1.0 - base.r)) : base.r + (2.0 * blend.r - 1.0) * (sqrt(base.r) - base.r),
        base.g < 0.5 ? base.g * (1.0 + (2.0 * blend.g - 1.0) * (1.0 - base.g)) : base.g + (2.0 * blend.g - 1.0) * (sqrt(base.g) - base.g),
        base.b < 0.5 ? base.b * (1.0 + (2.0 * blend.b - 1.0) * (1.0 - base.b)) : base.b + (2.0 * blend.b - 1.0) * (sqrt(base.b) - base.b)
      );`;
    case 'hardLight':
      return `vec3 result = vec3(
        blend.r < 0.5 ? 2.0 * base.r * blend.r : 1.0 - 2.0 * (1.0 - base.r) * (1.0 - blend.r),
        blend.g < 0.5 ? 2.0 * base.g * blend.g : 1.0 - 2.0 * (1.0 - base.g) * (1.0 - blend.g),
        blend.b < 0.5 ? 2.0 * base.b * blend.b : 1.0 - 2.0 * (1.0 - base.b) * (1.0 - blend.b)
      );`;
    case 'difference':
      return 'vec3 result = abs(base - blend);';
    case 'exclusion':
      return 'vec3 result = base + blend - 2.0 * base * blend;';
    case 'hue':
      return 'vec3 result = setLuminosity(setSaturation(blend, getSaturation(base)), getLuminosity(base));';
    case 'saturation':
      return 'vec3 result = setLuminosity(setSaturation(base, getSaturation(blend)), getLuminosity(base));';
    case 'color':
      return 'vec3 result = setLuminosity(blend, getLuminosity(base));';
    case 'luminosity':
      return 'vec3 result = setLuminosity(base, getLuminosity(blend));';
    default:
      return 'vec3 result = blend.rgb;';
  }
}
