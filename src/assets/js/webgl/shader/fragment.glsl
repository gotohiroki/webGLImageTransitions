precision mediump float;

uniform float uTime;
uniform float uProgress;
uniform float uBorder;
uniform float uIntensity;
uniform float uScaleX;
uniform float uScaleY;
uniform float utTansition;
uniform float uSwipe;
uniform float uWidth;
uniform float uRadius;
uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform sampler2D uDisplacement;
uniform vec4 uResolution;
varying vec2 vUv;

mat2 rotate2d(float angle){
  return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

#define PI 3.14159265359

// 斜め
// float angle1 = PI;
// float angle2 = PI;

// 右から左
// float angle1 = PI * 0.25;
// float angle2 = -PI * 0.75;

// 左から右
float angle1 = -PI * 0.75;
float angle2 = PI * 0.25;

void main() {
  vec2 uv = ( vUv - vec2(0.5) * uResolution.zw + vec2(0.5) );

  // ノイズ画像
  vec4 disp = texture2D(uDisplacement, uv);
  vec2 dispVec = vec2(disp.r, disp.g);

  // 1枚目のテクスチャー
  vec2 distortedPosition1 = uv + rotate2d(angle1) * dispVec * uIntensity * uProgress;
  vec4 t1 = texture2D(uTexture1, distortedPosition1);

  // 2枚目のテクスチャー
  vec2 distortedPosition2 = uv + rotate2d(angle2) * dispVec * uIntensity * (1.0 - uProgress);
  vec4 t2 = texture2D(uTexture2, distortedPosition2);

  gl_FragColor = mix(t1, t2, uProgress);
}