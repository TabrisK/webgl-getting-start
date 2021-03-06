/**
 * Created by zhangjiawei on 2017/4/14.
 */
var gl, canvas;
var ANGLE = 90;

function loaded() {
    canvas = document.getElementById("c");
    if (!detect()) return;
    initGL(canvas);
    initShaders();

    var n = initVertexBuffers(gl);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.LINE_LOOP, 0, n);

}

var g_points = [];
var g_color = [];

function initVertexBuffers(gl) {
    var vertices = new Float32Array([
        0, 0.5, -0.5, -0.5, 0.5, -0.5
    ]);
    var n = 3;
    var vertexBuffer = gl.createBuffer();
    !vertexBuffer && console.error("Failed to create vertexBuffer");
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(gl.program, "a_Position");
    a_Position == -1 && console.error("Failed to get a_Position");

    //旋转角度
    var radian = Math.PI * ANGLE / 180.0;//转为弧度

    var xfromMatrix = new Matrix4();

    //setRotate参数可分为两部分。第一个参数是旋转轴，第二~第四个参数确定旋转轴。此处(0,0,1)表示旋转轴是z轴正方向。
    xfromMatrix.setRotate(ANGLE, 0, 0, 1);


    var u_xformMatrix = gl.getUniformLocation(gl.program, "u_xformMatrix");

    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(u_xformMatrix, false, xfromMatrix.elements);


    gl.enableVertexAttribArray(a_Position);

    return n;
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