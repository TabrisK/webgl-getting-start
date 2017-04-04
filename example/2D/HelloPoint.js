/**
 * Created by HELEX on 2017/3/13.
 */
var gl, canvas;

function loaded() {
    canvas = document.getElementById("c");
    if (!detect()) return;
    initGL(canvas);
    initShaders();
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, 1);

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