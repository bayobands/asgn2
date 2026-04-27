// BlockyAnimal.js – Assignment 2
// Animal: RAT
// Features: global rotation (slider + mouse), renderScene(), tick(),
//   8+ parts, 3-level joint chain, animation on/off, poke animation,
//   non-cube primitive (cylinder tail), performance indicator.

// ─────────────────────────────────────────────────────────────────────
// Vertex Shader
// ─────────────────────────────────────────────────────────────────────
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotation;
  void main() {
    gl_Position = u_GlobalRotation * u_ModelMatrix * a_Position;
  }
`;

// ─────────────────────────────────────────────────────────────────────
// Fragment Shader
// ─────────────────────────────────────────────────────────────────────
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }
`;

// ─────────────────────────────────────────────────────────────────────
// WebGL globals
// ─────────────────────────────────────────────────────────────────────
var canvas, gl;
var a_Position;
var u_FragColor;
var u_ModelMatrix;
var u_GlobalRotation;

// ─────────────────────────────────────────────────────────────────────
// UI / angle globals
// ─────────────────────────────────────────────────────────────────────
var g_globalRotX   = 20;   // degrees – tilt down slightly to see top
var g_globalRotY   = 0;    // degrees – spin left/right

// Joint angles (degrees)
var g_frontUpperAngle = 0;   // front left upper leg
var g_frontLowerAngle = 0;   // front left lower leg (2nd level)
var g_frontFootAngle  = 0;   // front left foot      (3rd level)
var g_backUpperAngle  = 0;   // back left upper leg
var g_backLowerAngle  = 0;   // back left lower leg
var g_backFootAngle   = 0;   // back left foot
var g_frontRUpperAngle = 0;  // front right upper leg
var g_backRUpperAngle  = 0;  // back right upper leg
var g_headAngle        = 0;  // head nod
var g_tailAngle        = 0;  // tail wag

// Animation
var g_animOn      = false;
var g_pokeAnim    = false;
var g_pokeStart   = 0;
var g_time        = 0;
var g_lastTime    = 0;
var g_fps         = 0;

// Mouse rotation
var g_mouseDown   = false;
var g_lastMouseX  = 0;
var g_lastMouseY  = 0;

// ─────────────────────────────────────────────────────────────────────
// main()
// ─────────────────────────────────────────────────────────────────────
function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHTMLUI();
  renderScene();
  requestAnimationFrame(tick);
}

// ─────────────────────────────────────────────────────────────────────
// setupWebGL()
// ─────────────────────────────────────────────────────────────────────
function setupWebGL() {
  canvas = document.getElementById('webgl');
  gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
  if (!gl) { console.log('Failed to get WebGL context'); return; }

  gl.enable(gl.DEPTH_TEST);  // required for 3D
  gl.clearColor(0.15, 0.15, 0.2, 1.0);
}

// ─────────────────────────────────────────────────────────────────────
// connectVariablesToGLSL()
// ─────────────────────────────────────────────────────────────────────
function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to init shaders'); return;
  }

  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  u_FragColor     = gl.getUniformLocation(gl.program, 'u_FragColor');
  u_ModelMatrix   = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  u_GlobalRotation = gl.getUniformLocation(gl.program, 'u_GlobalRotation');
}

// ─────────────────────────────────────────────────────────────────────
// addActionsForHTMLUI()
// ─────────────────────────────────────────────────────────────────────
function addActionsForHTMLUI() {
  // Global rotation slider (Y axis spin)
  document.getElementById('camSlider').addEventListener('mousemove', function() {
    g_globalRotY = parseFloat(this.value);
    renderScene();
  });

  // Joint sliders
  document.getElementById('frontUpperSlider').addEventListener('mousemove', function() {
    g_frontUpperAngle = parseFloat(this.value); renderScene();
  });
  document.getElementById('frontLowerSlider').addEventListener('mousemove', function() {
    g_frontLowerAngle = parseFloat(this.value); renderScene();
  });
  document.getElementById('frontFootSlider').addEventListener('mousemove', function() {
    g_frontFootAngle = parseFloat(this.value); renderScene();
  });
  document.getElementById('backUpperSlider').addEventListener('mousemove', function() {
    g_backUpperAngle = parseFloat(this.value); renderScene();
  });
  document.getElementById('backLowerSlider').addEventListener('mousemove', function() {
    g_backLowerAngle = parseFloat(this.value); renderScene();
  });
  document.getElementById('backFootSlider').addEventListener('mousemove', function() {
    g_backFootAngle = parseFloat(this.value); renderScene();
  });
  document.getElementById('frontRUpperSlider').addEventListener('mousemove', function() {
    g_frontRUpperAngle = parseFloat(this.value); renderScene();
  });
  document.getElementById('backRUpperSlider').addEventListener('mousemove', function() {
    g_backRUpperAngle = parseFloat(this.value); renderScene();
  });
  document.getElementById('headSlider').addEventListener('mousemove', function() {
    g_headAngle = parseFloat(this.value); renderScene();
  });
  document.getElementById('tailSlider').addEventListener('mousemove', function() {
    g_tailAngle = parseFloat(this.value); renderScene();
  });

  // Animation buttons
  document.getElementById('animOnBtn').onclick  = function() { g_animOn = true; };
  document.getElementById('animOffBtn').onclick = function() { g_animOn = false; };

  // Mouse rotation
  canvas.onmousedown = function(ev) {
    if (ev.shiftKey) {
      // Poke animation on shift-click
      g_pokeAnim  = true;
      g_pokeStart = g_time;
      return;
    }
    g_mouseDown  = true;
    g_lastMouseX = ev.clientX;
    g_lastMouseY = ev.clientY;
  };
  canvas.onmousemove = function(ev) {
    if (!g_mouseDown) return;
    var dx = ev.clientX - g_lastMouseX;
    var dy = ev.clientY - g_lastMouseY;
    g_globalRotY += dx * 0.5;
    g_globalRotX += dy * 0.5;
    g_lastMouseX = ev.clientX;
    g_lastMouseY = ev.clientY;
    renderScene();
  };
  canvas.onmouseup   = function() { g_mouseDown = false; };
  canvas.onmouseleave = function() { g_mouseDown = false; };
}

// ─────────────────────────────────────────────────────────────────────
// tick()
// ─────────────────────────────────────────────────────────────────────
function tick() {
  var now = performance.now();
  g_fps     = Math.round(1000 / (now - g_lastTime));
  g_lastTime = now;
  g_time     = now / 1000.0; // seconds

  updateAnimationAngles();
  renderScene();

  document.getElementById('fps').textContent = 'FPS: ' + g_fps;
  requestAnimationFrame(tick);
}

// ─────────────────────────────────────────────────────────────────────
// updateAnimationAngles()
// All animation logic lives here – NOT in renderScene()
// ─────────────────────────────────────────────────────────────────────
function updateAnimationAngles() {
  if (g_pokeAnim) {
    // Special poke animation: rat rears up and shakes head for 2 seconds
    var elapsed = g_time - g_pokeStart;
    if (elapsed < 2.0) {
      g_globalRotX      = 20 + 30 * Math.sin(elapsed * Math.PI);
      g_headAngle       = 30 * Math.sin(elapsed * 8);
      g_tailAngle       = 45 * Math.sin(elapsed * 6);
      g_frontUpperAngle = -40 * Math.sin(elapsed * Math.PI); // rear up
    } else {
      g_pokeAnim        = false;
      g_globalRotX      = 20;
      g_frontUpperAngle = 0;
      g_headAngle       = 0;
    }
    return;
  }

  if (!g_animOn) return;

  var t = g_time;

  // Walking cycle – front and back legs alternate
  g_frontUpperAngle  =  25 * Math.sin(t * 3);
  g_frontLowerAngle  =  15 * Math.abs(Math.sin(t * 3));   // knee always bends forward
  g_frontFootAngle   =  10 * Math.sin(t * 3);

  g_backUpperAngle   = -25 * Math.sin(t * 3);             // opposite phase
  g_backLowerAngle   =  15 * Math.abs(Math.sin(t * 3 + Math.PI));
  g_backFootAngle    = -10 * Math.sin(t * 3);

  g_frontRUpperAngle = -25 * Math.sin(t * 3);             // right side mirrors
  g_backRUpperAngle  =  25 * Math.sin(t * 3);

  g_headAngle        =   5 * Math.sin(t * 2);             // gentle head bob
  g_tailAngle        =  30 * Math.sin(t * 4);             // tail wagging
}

// ─────────────────────────────────────────────────────────────────────
// renderScene()  – ALL drawing happens here
// ─────────────────────────────────────────────────────────────────────
function renderScene() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // ── Global rotation matrix (passed as u_GlobalRotation) ──────────
  var globalMat = new Matrix4();
  globalMat.rotate(g_globalRotX, 1, 0, 0);
  globalMat.rotate(g_globalRotY, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotation, false, globalMat.elements);

  // ── Helper: make and draw a cube with a given matrix ────────────
  var body = new Cube();

  // ════════════════════════════════════════════════════════════════
  // BODY – brownish-grey rat body, wider than tall
  // ════════════════════════════════════════════════════════════════
  body.color = [0.55, 0.50, 0.48, 1.0];
  body.matrix.setIdentity();
  body.matrix.translate(0, 0, 0);
  body.matrix.scale(0.7, 0.4, 1.1);
  body.render();

  // ════════════════════════════════════════════════════════════════
  // HEAD – slightly lighter, forward and up
  // ════════════════════════════════════════════════════════════════
  var head = new Cube();
  head.color = [0.62, 0.57, 0.54, 1.0];
  head.matrix.setIdentity();
  head.matrix.translate(0, 0.12, 0.65);
  head.matrix.rotate(g_headAngle, 1, 0, 0);
  head.matrix.scale(0.42, 0.38, 0.42);
  head.render();

  // Save head matrix BEFORE scale to attach ears/snout
  var headBase = new Matrix4(head.matrix);
  headBase.setIdentity();
  headBase.translate(0, 0.12, 0.65);
  headBase.rotate(g_headAngle, 1, 0, 0);

  // ── Left ear ──
  var earL = new Cube();
  earL.color = [0.85, 0.65, 0.65, 1.0]; // pinkish
  earL.matrix = new Matrix4(headBase);
  earL.matrix.translate(-0.18, 0.22, 0.05);
  earL.matrix.scale(0.13, 0.18, 0.06);
  earL.render();

  // ── Right ear ──
  var earR = new Cube();
  earR.color = [0.85, 0.65, 0.65, 1.0];
  earR.matrix = new Matrix4(headBase);
  earR.matrix.translate(0.18, 0.22, 0.05);
  earR.matrix.scale(0.13, 0.18, 0.06);
  earR.render();

  // ── Snout ──
  var snout = new Cube();
  snout.color = [0.70, 0.62, 0.58, 1.0];
  snout.matrix = new Matrix4(headBase);
  snout.matrix.translate(0, -0.07, 0.22);
  snout.matrix.scale(0.22, 0.18, 0.18);
  snout.render();

  // ════════════════════════════════════════════════════════════════
  // TAIL – cylinder, non-cube primitive  ← satisfies rubric
  // ════════════════════════════════════════════════════════════════
  var tail = new Cylinder();
  tail.color = [0.62, 0.55, 0.52, 1.0];
  tail.matrix.setIdentity();
  tail.matrix.translate(0, -0.05, -0.65);
  tail.matrix.rotate(90 + g_tailAngle, 1, 0, 0); // lay flat then wag
  tail.matrix.scale(0.07, 0.55, 0.07);
  tail.render();

  // ════════════════════════════════════════════════════════════════
  // FRONT LEFT LEG  – 3-level chain (upper → lower → foot)
  // ════════════════════════════════════════════════════════════════

  // ── Upper leg ──
  var flUpper = new Cube();
  flUpper.color = [0.52, 0.47, 0.45, 1.0];
  flUpper.matrix.setIdentity();
  flUpper.matrix.translate(-0.28, -0.18, 0.32);
  flUpper.matrix.rotate(g_frontUpperAngle, 1, 0, 0);
  flUpper.matrix.scale(0.18, 0.28, 0.18);
  flUpper.render();

  // Save coordinate system at the BOTTOM of upper leg (before scale)
  var flUpperCoord = new Matrix4();
  flUpperCoord.setIdentity();
  flUpperCoord.translate(-0.28, -0.18, 0.32);
  flUpperCoord.rotate(g_frontUpperAngle, 1, 0, 0);

  // ── Lower leg ──
  var flLower = new Cube();
  flLower.color = [0.48, 0.43, 0.41, 1.0];
  flLower.matrix = new Matrix4(flUpperCoord);  // start from upper coord
  flLower.matrix.translate(0, -0.30, 0);       // move down to end of upper leg
  flLower.matrix.rotate(g_frontLowerAngle, 1, 0, 0);
  flLower.matrix.scale(0.16, 0.26, 0.16);
  flLower.render();

  // Save coord at bottom of lower leg
  var flLowerCoord = new Matrix4();
  flLowerCoord = new Matrix4(flUpperCoord);
  flLowerCoord.translate(0, -0.30, 0);
  flLowerCoord.rotate(g_frontLowerAngle, 1, 0, 0);

  // ── Foot ──
  var flFoot = new Cube();
  flFoot.color = [0.45, 0.40, 0.38, 1.0];
  flFoot.matrix = new Matrix4(flLowerCoord);   // start from lower coord
  flFoot.matrix.translate(0, -0.28, 0.04);     // move down to end of lower leg
  flFoot.matrix.rotate(g_frontFootAngle, 1, 0, 0);
  flFoot.matrix.scale(0.18, 0.10, 0.22);       // flat foot
  flFoot.render();

  // ════════════════════════════════════════════════════════════════
  // FRONT RIGHT LEG  – mirrors front left
  // ════════════════════════════════════════════════════════════════
  var frUpper = new Cube();
  frUpper.color = [0.52, 0.47, 0.45, 1.0];
  frUpper.matrix.setIdentity();
  frUpper.matrix.translate(0.28, -0.18, 0.32);
  frUpper.matrix.rotate(g_frontRUpperAngle, 1, 0, 0);
  frUpper.matrix.scale(0.18, 0.28, 0.18);
  frUpper.render();

  var frUpperCoord = new Matrix4();
  frUpperCoord.setIdentity();
  frUpperCoord.translate(0.28, -0.18, 0.32);
  frUpperCoord.rotate(g_frontRUpperAngle, 1, 0, 0);

  var frLower = new Cube();
  frLower.color = [0.48, 0.43, 0.41, 1.0];
  frLower.matrix = new Matrix4(frUpperCoord);
  frLower.matrix.translate(0, -0.30, 0);
  frLower.matrix.rotate(g_frontLowerAngle, 1, 0, 0);
  frLower.matrix.scale(0.16, 0.26, 0.16);
  frLower.render();

  var frLowerCoord = new Matrix4(frUpperCoord);
  frLowerCoord.translate(0, -0.30, 0);
  frLowerCoord.rotate(g_frontLowerAngle, 1, 0, 0);

  var frFoot = new Cube();
  frFoot.color = [0.45, 0.40, 0.38, 1.0];
  frFoot.matrix = new Matrix4(frLowerCoord);
  frFoot.matrix.translate(0, -0.28, 0.04);
  frFoot.matrix.rotate(g_frontFootAngle, 1, 0, 0);
  frFoot.matrix.scale(0.18, 0.10, 0.22);
  frFoot.render();

  // ════════════════════════════════════════════════════════════════
  // BACK LEFT LEG  – 3-level chain
  // ════════════════════════════════════════════════════════════════
  var blUpper = new Cube();
  blUpper.color = [0.52, 0.47, 0.45, 1.0];
  blUpper.matrix.setIdentity();
  blUpper.matrix.translate(-0.28, -0.18, -0.32);
  blUpper.matrix.rotate(g_backUpperAngle, 1, 0, 0);
  blUpper.matrix.scale(0.18, 0.28, 0.18);
  blUpper.render();

  var blUpperCoord = new Matrix4();
  blUpperCoord.setIdentity();
  blUpperCoord.translate(-0.28, -0.18, -0.32);
  blUpperCoord.rotate(g_backUpperAngle, 1, 0, 0);

  var blLower = new Cube();
  blLower.color = [0.48, 0.43, 0.41, 1.0];
  blLower.matrix = new Matrix4(blUpperCoord);
  blLower.matrix.translate(0, -0.30, 0);
  blLower.matrix.rotate(g_backLowerAngle, 1, 0, 0);
  blLower.matrix.scale(0.16, 0.26, 0.16);
  blLower.render();

  var blLowerCoord = new Matrix4(blUpperCoord);
  blLowerCoord.translate(0, -0.30, 0);
  blLowerCoord.rotate(g_backLowerAngle, 1, 0, 0);

  var blFoot = new Cube();
  blFoot.color = [0.45, 0.40, 0.38, 1.0];
  blFoot.matrix = new Matrix4(blLowerCoord);
  blFoot.matrix.translate(0, -0.28, -0.04);
  blFoot.matrix.rotate(g_backFootAngle, 1, 0, 0);
  blFoot.matrix.scale(0.18, 0.10, 0.22);
  blFoot.render();

  // ════════════════════════════════════════════════════════════════
  // BACK RIGHT LEG
  // ════════════════════════════════════════════════════════════════
  var brUpper = new Cube();
  brUpper.color = [0.52, 0.47, 0.45, 1.0];
  brUpper.matrix.setIdentity();
  brUpper.matrix.translate(0.28, -0.18, -0.32);
  brUpper.matrix.rotate(g_backRUpperAngle, 1, 0, 0);
  brUpper.matrix.scale(0.18, 0.28, 0.18);
  brUpper.render();

  var brUpperCoord = new Matrix4();
  brUpperCoord.setIdentity();
  brUpperCoord.translate(0.28, -0.18, -0.32);
  brUpperCoord.rotate(g_backRUpperAngle, 1, 0, 0);

  var brLower = new Cube();
  brLower.color = [0.48, 0.43, 0.41, 1.0];
  brLower.matrix = new Matrix4(brUpperCoord);
  brLower.matrix.translate(0, -0.30, 0);
  brLower.matrix.rotate(g_backLowerAngle, 1, 0, 0);
  brLower.matrix.scale(0.16, 0.26, 0.16);
  brLower.render();

  var brLowerCoord = new Matrix4(brUpperCoord);
  brLowerCoord.translate(0, -0.30, 0);
  brLowerCoord.rotate(g_backLowerAngle, 1, 0, 0);

  var brFoot = new Cube();
  brFoot.color = [0.45, 0.40, 0.38, 1.0];
  brFoot.matrix = new Matrix4(brLowerCoord);
  brFoot.matrix.translate(0, -0.28, -0.04);
  brFoot.matrix.rotate(g_backFootAngle, 1, 0, 0);
  brFoot.matrix.scale(0.18, 0.10, 0.22);
  brFoot.render();
}