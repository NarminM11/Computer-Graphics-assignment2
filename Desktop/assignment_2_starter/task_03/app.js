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
// let near = 10.0;
// let far = -10.0;

let fovy = 70; // Field of view in degrees
let near = 0.1; // Near clipping plane
let far = 100; // Far clipping plane


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

    let vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    let vPosition = gl.getAttribLocation(program, 'vPosition');
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

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
function handleKeyDown(event) {
    switch (event.key) {
        // top side view 
        case 't':
        case 'T':
            eye = [0, 3, 0];
            at = [0, 0, 0];
            up = [0, 0, -1];
            break;
        // left side view 
        case 'l':
        case 'L':
            eye = [-3, 0, 0];
            at = [0, 0, 0];
            up = [0, 1, 0];
            break;
        // front side view 
        case 'f':
        case 'F':
            eye = [0, 0, 3];
            at = [0, 0, 0];
            up = [0, 1, 0];
            break;

            break;
        // rotating clockwise by 10 degrees
        case 'd':
        case 'D':
            rotateCamera(10);
            break;
        // counter-clockwise by 10 degrees
        case 'a':
        case 'A':
            rotateCamera(-10);
            break;

        case 'i':
        case 'I':
            eye = [2, 2, 2];
            at = [0, 0, 0];
            up = [0, 1, 0];
            // left = -1.0;
            // right = 1.0;
            // bottom = -1.0;
            // ytop = 1.0;
            break;
        // Camera zoom in
        case 'w':
        case 'W':
            fovy *= 0.95; // Move the near plane further away
            break;

        // Camera zoom out
        case 's':
        case 'S':
            fovy *= 1.05; // Move the near plane closer
            break;
    }

    render();
}
function rotateCamera(theta) {

    //theta to radians
    let radians = theta * Math.PI / 180;

    //create rotation matrix
    let rotationMatrix = mat3(
        Math.cos(radians), -Math.sin(radians), 0,
        Math.sin(radians), Math.cos(radians), 0,
        0, 0, 1
    );

    //rotate 'up' vector by using of rotation matrix
    up = vec3(
        rotationMatrix[0][0] * up[0] + rotationMatrix[0][1] * up[1] + rotationMatrix[0][2] * up[2],
        rotationMatrix[1][0] * up[0] + rotationMatrix[1][1] * up[1] + rotationMatrix[1][2] * up[2],
        rotationMatrix[2][0] * up[0] + rotationMatrix[2][1] * up[1] + rotationMatrix[2][2] * up[2]
    );
}


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (fovy > 180) {
        fovy = 180;
    }
    else {
        fovy = fovy;
    }

    let aspect = gl.canvas.width / gl.canvas.height;

    // Define the orthographic projection matrix
    let projMatrix = perspective(fovy, aspect, near, far);

    // Calculate the model-view matrix by using the 'lookAt' function
    let mvm = lookAt(eye, at, up);
    // Combine the projection and model-view matrices
    let mvpMatrix = mult(projMatrix, mvm);

    gl.uniformMatrix4fv(modelViewMatrix, false, flatten(mvpMatrix));

    gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_BYTE, 0);
}