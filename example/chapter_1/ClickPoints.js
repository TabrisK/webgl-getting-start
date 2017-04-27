/**
 * Created by zhangjiawei on 2017/3/13.
 */
var gl, canvas;

function loaded() {
    canvas = document.getElementById("c");
    if (!detect()) return;
    initGL(canvas);
    initShaders();
    var a_Position = gl.getAttribLocation(gl.program, "a_Position");
    a_Position == -1 && console.error("Failed to get a_Position");
    var u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
    u_FragColor == null && console.error("Failed to get u_FragColor");

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    canvas.onmousedown = function (e) {
        click(e, gl, canvas, a_Position, u_FragColor);
    }
}

var g_points = [];
var g_color = [];
function click(e, gl, canvas, a_Position, u_FragColor) {
    var rect = e.target.getBoundingClientRect();
    var cx = (e.clientX - rect.left) / canvas.clientWidth * 2 - 1,
        cy = 1 - (e.clientY - rect.top) / canvas.clientHeight * 2;
    g_points.push([cx, cy]);
    g_color.push(getColor(cx, cy));
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    for (var index = 0; index < g_points.length; index++) {
        gl.vertexAttrib3f(a_Position, g_points[index][0], g_points[index][1], 0.0);
        gl.uniform4f(u_FragColor, g_color[index][0], g_color[index][1], g_color[index][2], g_color[index][3]);
        gl.drawArrays(gl.POINTS, 0, 1);
    }

    function getColor(x, y) {
        var color = [1.0, 1.0, 1.0, 1.0];
        if (x > 0 && y > 0) {
            color = [1.0, 0.0, 0.0, 1.0];
        } else if (x < 0 && y > 0) {
            color = [0.0, 1.0, 0.0, 1.0];
        } else if (x < 0 && y < 0) {
            color = [0.0, 0.0, 1.0, 1.0];
        } else if (x > 0 && y < 0) {
            color = [1.0, 0.0, 1.0, 1.0];
        }
        return color;
    }

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