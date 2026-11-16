"use strict";

const vertexSource = `
  attribute vec3 position;
  attribute vec3 color;
  varying vec3 surfaceColor;
  uniform float aspect;

  void main() {
    // Fixed camera basis pointing toward the board center.
    vec3 right = vec3(0.958, 0.0, -0.287);
    vec3 up = vec3(-0.183, 0.770, -0.614);
    vec3 forward = vec3(-0.221, -0.641, -0.738);
    float depth = 11.0 + dot(position, forward);
    gl_Position = vec4(dot(position, right) * 2.25 / max(aspect, 1.0),
                       dot(position, up) * 2.25 * min(aspect, 1.0),
                       (31.0 * depth - 60.0) / 29.0, depth);
    surfaceColor = color;
  }
`;

const fragmentSource = `
  precision mediump float;
  varying vec3 surfaceColor;
  void main() {
    gl_FragColor = vec4(surfaceColor, 1.0);
  }
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

function appendTriangles(vertices, points, faces, color, x, y, z) {
  faces.forEach((face, index) => {
    const shade = index < 2 ? 1 : 0.68 + 0.06 * (Math.floor(index / 2) % 4);
    for (const vertex of face) {
      const [px, py, pz] = points[vertex];
      vertices.push(x + px, y + py, z + pz, ...color.map(value => value * shade));
    }
  });
}

function appendBox(vertices, x, y, z, halfWidth, height, color) {
  const w = halfWidth;
  const points = [
    [-w, height, -w], [w, height, -w], [w, height, w], [-w, height, w],
    [-w, 0, -w], [w, 0, -w], [w, 0, w], [-w, 0, w],
  ];
  const faces = [
    [0, 1, 2], [0, 2, 3], [0, 4, 5], [0, 5, 1], [1, 5, 6], [1, 6, 2],
    [2, 6, 7], [2, 7, 3], [3, 7, 4], [3, 4, 0], [4, 7, 6], [4, 6, 5],
  ];
  appendTriangles(vertices, points, faces, color, x, y, z);
}

function appendCrystal(vertices, x, z, color) {
  const points = [[0, 1, 0], [.29, .36, 0], [0, .36, .29],
    [-.29, .36, 0], [0, .36, -.29], [0, 0, 0]];
  const faces = [[0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 1],
    [5, 2, 1], [5, 3, 2], [5, 4, 3], [5, 1, 4]];
  appendTriangles(vertices, points, faces, color, x, 0, z);
}

function buildBoardGeometry(game) {
  const vertices = [];
  const centerX = (BOARD_WIDTH - 1) / 2;
  const centerZ = (BOARD_DEPTH - 1) / 2;
  for (let z = 0; z < BOARD_DEPTH; z += 1) {
    for (let x = 0; x < BOARD_WIDTH; x += 1) {
      const color = (x + z) % 2 ? [.29, .38, .45] : [.43, .54, .62];
      appendBox(vertices, x - centerX, -.16, z - centerZ, .47, .16, color);
    }
  }
  const colors = { Red: [.96, .33, .30], Blue: [.27, .64, 1], Neutral: [1, .77, .29] };
  for (const piece of game.pieces) {
    const x = piece.x - centerX;
    const z = piece.z - centerZ;
    const color = colors[piece.team];
    if (piece.kind === "crystal") {
      appendCrystal(vertices, x, z, color);
    } else {
      appendBox(vertices, x, 0, z, .28, .15, color);
      appendBox(vertices, x, .15, z, .20, .35, color);
    }
  }
  return new Float32Array(vertices);
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

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  for (const [name, offset] of [["position", 0], ["color", 12]]) {
    const location = gl.getAttribLocation(program, name);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 24, offset);
  }
  const aspect = gl.getUniformLocation(program, "aspect");
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(.10, .145, .19, 1);

  return function draw(game) {
    const pixelRatio = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.round(canvas.clientWidth * pixelRatio));
    const height = Math.max(1, Math.round(canvas.clientHeight * pixelRatio));
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;

    const vertices = buildBoardGeometry(game);
    gl.viewport(0, 0, width, height);
    gl.uniform1f(aspect, width / height);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 6);
  };
}
