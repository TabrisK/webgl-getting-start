/**
 * Created by zhangjiawei on 2017/4/14.
 */
var gl, canvas;
var ANGLE_STRP = 45;
var modelMatrix, u_ModelMatrix;

function loaded() {
    canvas = document.getElementById("c");
    if (!detect()) return;
    initGL(canvas);
    initShaders();

    var n = initVertexBuffers(gl);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    var currentAngle = 0.0;

    var modelMatrix = new Matrix4();
    var tick = function () {
        currentAngle = animate(currentAngle);
        draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix);
        requestAnimationFrame(tick);
    };
    tick();

    //gl.clear(gl.COLOR_BUFFER_BIT);
    //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);

}

var g_points = [];
var g_color = [];

function initVertexBuffers(gl) {
    var vertices = new Float32Array([
        0, 0.25, -0.125*Math.sqrt(3), -0.125, 0.125*Math.sqrt(3), -0.125
    ]);
    var n = 3;
    var vertexBuffer = gl.createBuffer();
    !vertexBuffer && console.error("Failed to create vertexBuffer");
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(gl.program, "a_Position");
    a_Position == -1 && console.error("Failed to get a_Position");

    //旋转角度
    //var radian = Math.PI * ANGLE / 180.0;//转为弧度

    //modelMatrix = new Matrix4();
    //modelMatrix.setRotate(ANGLE, 0, 0, 1);//先平移，后旋转。注意矩阵运算法则


    u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");

    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    //gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    gl.enableVertexAttribArray(a_Position);

    return n;
}

function draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    //画中心三角形
    modelMatrix.setRotate(currentAngle, 0, 0, 1);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);

    //画行星三角形
    modelMatrix.setRotate(currentAngle, 0, 0, 1);
    modelMatrix.translate(.5, 0, 0);
    modelMatrix.rotate(currentAngle, 0, 0, 1);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);

}

var g_last = Date.now();
function animate(angle) {
    //计算距离上次过去多久
    var now = Date.now();

    var elapsed = now - g_last;
    var newAngle = elapsed / 1000 * ANGLE_STRP;
    return newAngle % 360;
}

function detect() {
    if (Detector.webgl) {
        return true;
    } else {
        var warning = Detector.getWebGLErrorMessage();
        document.getElementById('msg').appendChild(warning);
        return false;
    }
}

function initGL(canvas) {
    try {
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
        gl.program = gl.createProgram();
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

function initShaders() {
    var fragmentShader = getShader(gl, 'shader-fs');
    var vertexShader = getShader(gl, 'shader-vs');

    // Create the shader program

    var shaderProgram = gl.program;
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.log('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    }

    gl.useProgram(shaderProgram);

    // var vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    // var fragmentPositionUniform = gl.getUniformLocation(shaderProgram, 'aFragmentPosition');
    // gl.enableVertexAttribArray(vertexPositionAttribute);
    // gl.enable(fragmentPositionUniform);


    function getShader(gl, id, type) {
        var shaderScript, theSource, currentChild, shader;

        shaderScript = document.getElementById(id);

        if (!shaderScript) {
            return null;
        }

        theSource = shaderScript.text;

        if (!type) {
            if (shaderScript.type == 'x-shader/x-fragment') {
                type = gl.FRAGMENT_SHADER;
            } else if (shaderScript.type == 'x-shader/x-vertex') {
                type = gl.VERTEX_SHADER;
            } else {
                // Unknown shader type
                return null;
            }
        }
        shader = gl.createShader(type);

        gl.shaderSource(shader, theSource);

        // Compile the shader program
        gl.compileShader(shader);

        // See if it compiled successfully
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.log('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }
}