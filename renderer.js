"use strict";

// Basic lighting: one directional light plus ambient (Lambert diffuse).
// The normal is moved to eye space with the normal matrix, so the light
// direction is given in eye space too. Faces are flat, so per-vertex
// lighting already gives one shade per face; specular comes later.
const vertexSource = `
  attribute vec3 position;
  attribute vec3 normal;
  uniform mat4 modelView;
  uniform mat4 projection;
  uniform mat3 normalMatrix;
  uniform vec3 tint;
  uniform vec3 lightDirection;
  uniform float ambient;
  varying vec3 surfaceColor;

  void main() {
    gl_Position = projection * modelView * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * normal);
    float diffuse = max(dot(n, lightDirection), 0.0);
    surfaceColor = tint * (ambient + (1.0 - ambient) * diffuse);
  }
`;

const fragmentSource = `
  precision mediump float;
  varying vec3 surfaceColor;
  void main() {
    gl_FragColor = vec4(surfaceColor, 1.0);
  }
`;

const TEAM_COLORS = { Red: [.96, .33, .30], Blue: [.27, .64, 1], Neutral: [1, .77, .29] };
const TILE_COLORS = [[.43, .54, .62], [.29, .38, .45]];

// Orbit camera. main.js changes azimuth / elevation (mouse drag) and radius
// (scroll wheel); CAMERA.eye is recomputed from them every frame. The start
// values put the eye where the old fixed camera was, above the front-right corner.
const CAMERA = {
  azimuth: 16, elevation: 40, radius: 8.8,
  minElevation: 15, maxElevation: 85, minRadius: 5, maxRadius: 16,
  eye: [0, 0, 0], at: [0, 0, 0], up: [0, 1, 0], fovy: 48, near: 1, far: 30,
};

// Spherical (azimuth, elevation, radius) around CAMERA.at -> eye position.
function updateCameraEye() {
  const az = CAMERA.azimuth * Math.PI / 180;
  const el = CAMERA.elevation * Math.PI / 180;
  const flat = CAMERA.radius * Math.cos(el);
  CAMERA.eye = [
    CAMERA.at[0] + flat * Math.sin(az),
    CAMERA.at[1] + CAMERA.radius * Math.sin(el),
    CAMERA.at[2] + flat * Math.cos(az),
  ];
}

// World-space direction toward the light. It is fixed to the world, so the
// lit sides of the pieces stay the same while the camera orbits.
const LIGHT = { direction: normalize([.35, 1, .55]), ambient: .35 };

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

// Each vertex is a position plus the face normal (flat shading). The normal is
// the cross product of two edges, flipped if needed so it points away from the
// mesh's center; that way the face winding in the tables below does not matter.
function appendTriangles(vertices, points, faces, x, y, z, center) {
  for (const face of faces) {
    const [a, b, c] = face.map(vertex => points[vertex]);
    let n = normalize(cross(subtract(b, a), subtract(c, a)));
    const middle = [0, 1, 2].map(i => (a[i] + b[i] + c[i]) / 3);
    if (dot(n, subtract(middle, center)) < 0) n = [-n[0], -n[1], -n[2]];
    for (const [px, py, pz] of [a, b, c]) {
      vertices.push(x + px, y + py, z + pz, n[0], n[1], n[2]);
    }
  }
}

function appendBox(vertices, y, halfWidth, height) {
  const w = halfWidth;
  const points = [
    [-w, height, -w], [w, height, -w], [w, height, w], [-w, height, w],
    [-w, 0, -w], [w, 0, -w], [w, 0, w], [-w, 0, w],
  ];
  const faces = [
    [0, 1, 2], [0, 2, 3], [0, 4, 5], [0, 5, 1], [1, 5, 6], [1, 6, 2],
    [2, 6, 7], [2, 7, 3], [3, 7, 4], [3, 4, 0], [4, 7, 6], [4, 6, 5],
  ];
  appendTriangles(vertices, points, faces, 0, y, 0, [0, height / 2, 0]);
}

function appendCrystal(vertices) {
  const points = [[0, 1, 0], [.29, .36, 0], [0, .36, .29],
    [-.29, .36, 0], [0, .36, -.29], [0, 0, 0]];
  const faces = [[0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 1],
    [5, 2, 1], [5, 3, 2], [5, 4, 3], [5, 1, 4]];
  appendTriangles(vertices, points, faces, 0, 0, 0, [0, .36, 0]);
}

// Meshes are built once in their own local (model) coordinates, centered on the origin.
function createMesh(gl, build) {
  const vertices = [];
  build(vertices);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  return { buffer, count: vertices.length / 6 };
}

function createRenderer(canvas) {
  const gl = canvas.getContext("webgl");
  if (!gl) throw new Error("WebGL is unavailable in this browser.");
  const program = gl.createProgram();
  gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fragmentSource));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
  }
  gl.useProgram(program);

  const attributes = [["position", 0], ["normal", 12]].map(([name, offset]) => {
    const location = gl.getAttribLocation(program, name);
    gl.enableVertexAttribArray(location);
    return { location, offset };
  });
  const uniforms = {
    modelView: gl.getUniformLocation(program, "modelView"),
    projection: gl.getUniformLocation(program, "projection"),
    normalMatrix: gl.getUniformLocation(program, "normalMatrix"),
    tint: gl.getUniformLocation(program, "tint"),
    lightDirection: gl.getUniformLocation(program, "lightDirection"),
    ambient: gl.getUniformLocation(program, "ambient"),
  };

  const meshes = {
    tile: createMesh(gl, v => appendBox(v, -.16, .47, .16)),
    pawn: createMesh(gl, v => { appendBox(v, 0, .28, .15); appendBox(v, .15, .20, .35); }),
    crystal: createMesh(gl, appendCrystal),
  };

  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(.10, .145, .19, 1);

  function drawMesh(mesh, modelView, color) {
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffer);
    for (const { location, offset } of attributes) {
      gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 24, offset);
    }
    gl.uniformMatrix4fv(uniforms.modelView, false, modelView);
    // Inverse transpose keeps normals correct under the pawns' non-uniform scale.
    gl.uniformMatrix3fv(uniforms.normalMatrix, false, normalMatrix(modelView));
    gl.uniform3fv(uniforms.tint, color);
    gl.drawArrays(gl.TRIANGLES, 0, mesh.count);
  }

  // time is in seconds; it drives the crystal spin and the active team's hover.
  return function draw(game, time) {
    const pixelRatio = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.round(canvas.clientWidth * pixelRatio));
    const height = Math.max(1, Math.round(canvas.clientHeight * pixelRatio));
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    gl.viewport(0, 0, width, height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const projection = perspective(CAMERA.fovy, width / height, CAMERA.near, CAMERA.far);
    updateCameraEye();
    const view = lookAt(CAMERA.eye, CAMERA.at, CAMERA.up);
    gl.uniformMatrix4fv(uniforms.projection, false, projection);
    // The light is set in world space, so move it into eye space with the view.
    gl.uniform3fv(uniforms.lightDirection, normalize(transformDirection(view, LIGHT.direction)));
    gl.uniform1f(uniforms.ambient, LIGHT.ambient);

    const centerX = (BOARD_WIDTH - 1) / 2;
    const centerZ = (BOARD_DEPTH - 1) / 2;
    for (let z = 0; z < BOARD_DEPTH; z += 1) {
      for (let x = 0; x < BOARD_WIDTH; x += 1) {
        const model = translate(x - centerX, 0, z - centerZ);
        drawMesh(meshes.tile, mult(view, model), TILE_COLORS[(x + z) % 2]);
      }
    }

    for (const piece of game.pieces) {
      const x = piece.x - centerX;
      const z = piece.z - centerZ;
      const color = TEAM_COLORS[piece.team];
      let model;
      if (piece.kind === "crystal") {
        // Crystals bob and spin: translate · rotateY.
        const bob = .08 + .06 * Math.sin(time * 2 + piece.x + piece.z);
        model = mult(translate(x, bob, z), rotateY(time * 45));
        drawMesh(meshes.crystal, mult(view, model), color);
      } else {
        // Pawns of the team to play hover; higher levels are drawn taller.
        const hover = piece.team === game.player ? .06 + .06 * Math.sin(time * 4 + piece.z) : 0;
        const height = 1 + .25 * ((piece.level || 1) - 1);
        model = mult(translate(x, hover, z), scale(1, height, 1));
        drawMesh(meshes.pawn, mult(view, model), color);
      }
    }
  };
}
