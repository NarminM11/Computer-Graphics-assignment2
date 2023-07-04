let gl, program;
let vertexCount = 36;
let modelViewMatrix;

let eye = [0, 0, 3];
let at = [0, 0, 0];
let up = [0, 1, 0];

let left = -1;
let right = 1;
let bottom = -1;
let ytop = 1;
let near = 0.1;
let far = 100;

let fovy = 70; // Field of view in degrees

onload = () => {
  let canvas = document.getElementById("webgl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert('No webgl for you');
    return;
  }

  program = initShaders(gl, 'vertex-shader', 'fragment-shader');
  gl.useProgram(program);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.enable(gl.DEPTH_TEST);

  gl.clearColor(0, 0, 0, 0.5);

  let vertices = [
    -1, -1, 1,
    -1, 1, 1,
    1, 1, 1,
    1, -1, 1,
    -1, -1, -1,
    -1, 1, -1,
    1, 1, -1,
    1, -1, -1,
  ];

  let vertices2 = [
    3, -1, -1,
    3, 1, -1,
    5, 1, -1,
    5, -1, -1,
    3, -1, -3,
    3, 1, -3,
    5, 1, -3,
    5, -1, -3,
  ];

  let indices = [
    0, 3, 1,
    1, 3, 2,
    4, 7, 5,
    5, 7, 6,
    3, 7, 2,
    2, 7, 6,
    4, 0, 5,
    5, 0, 1,
    1, 2, 5,
    5, 2, 6,
    0, 3, 4,
    4, 3, 7,
  ];

  let colors = [
    0, 0, 0,
    0, 0, 1,
    0, 1, 0,
    0, 1, 1,
    1, 0, 0,
    1, 0, 1,
    1, 1, 0,
    1, 1, 1,
  ];

  generateCube(vertices);
  generateCube(vertices2);

  let iBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);

  let cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  let vColor = gl.getAttribLocation(program, 'vColor');
  gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  modelViewMatrix = gl.getUniformLocation(program, 'modelViewMatrix');

  document.addEventListener('keydown', handleKeyDown);

  render();
};

function generateCube(vertices) {
  let vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  let vPosition = gl.getAttribLocation(program, 'vPosition');
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);
}

function handleKeyDown(event) {
  switch (event.key) {
    case 'O':
    case 'o':
      // Switch to orthographic view
      left = -3;
      right = 3;
      bottom = -3;
      ytop = 3;
      break;

    case 'P':
    case 'p':
      // Switch to perspective view
      left = -1;
      right = 1;
      bottom = -1;
      ytop = 1;
      break;
  }

  render();
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  let aspect = gl.canvas.width / gl.canvas.height;

  let projMatrix;
  if (left === -3) {
    // Orthographic projection
    projMatrix = ortho(left, right, bottom, ytop, near, far);
  } else {
    // Perspective projection
    projMatrix = perspective(fovy, aspect, near, far);
  }

  let viewMatrix = lookAt(eye, at, up);

  // Draw the first cube
  let modelMatrix1 = mat4();
  gl.uniformMatrix4fv(modelViewMatrix, false, flatten(mult(viewMatrix, modelMatrix1)));
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_BYTE, 0);

  // Draw the second cube
  let modelMatrix2 = translate(0, 0, -2); // Move the second cube in the z-axis
  gl.uniformMatrix4fv(modelViewMatrix, false, flatten(mult(viewMatrix, modelMatrix2)));
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_BYTE, 0);

  requestAnimationFrame(render);
}
