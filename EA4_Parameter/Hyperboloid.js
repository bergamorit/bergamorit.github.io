var linesActivated = false;
var vertices, indicesLines, indicesTris;

start2();
function start2 () {
    linesActivated = !linesActivated;

    // Get the WebGL context.
    var canvas = document.getElementById('canvas2');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    var gl = canvas.getContext('experimental-webgl');

    // Pipeline setup.
    gl.clearColor(0, 0, 0, 0.93);

    // Backface culling.
    gl.frontFace(gl.CCW);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    // Depth(Z)-Buffer.
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);    

    // Polygon offset of rastered Fragments.
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1.0, 1.0);        

    // Compile vertex shader. 
    var vsSource = '' + 
        'attribute vec3 pos;' + 
        'attribute vec4 col;' + 
        'varying vec4 color;' + 
        'void main(){' + 'color = col;' + 
        'gl_Position = vec4(pos * 0.3, 1);' +
        '}';
    var vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vsSource);
    gl.compileShader(vs);

    // Compile fragment shader.
    fsSouce = 'precision mediump float;' + 
        'varying vec4 color;' + 
        'void main() {' + 
        'gl_FragColor = color;' + 
        '}';
    var fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fsSouce);
    gl.compileShader(fs);

    // Link shader together into a program.
    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.bindAttribLocation(prog, 0, "pos");
    gl.linkProgram(prog);
    gl.useProgram(prog);

    // Vertex data.
    // Positions, Index data.
    // Fill the data arrays.
    createVertexDataHyperboloid();

    // Setup position vertex buffer object.
    var vboPos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboPos);
    gl.bufferData(gl.ARRAY_BUFFER,
        vertices, gl.STATIC_DRAW);
    // Bind vertex buffer to attribute variable.
    var posAttrib = gl.getAttribLocation(prog, 'pos');
    gl.vertexAttribPointer(posAttrib, 3, gl.FLOAT,
        false, 0, 0);
    gl.enableVertexAttribArray(posAttrib);

    // Setup constant color.
    var colAttrib = gl.getAttribLocation(prog, 'col');

    // Setup lines index buffer object.
    var iboLines = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboLines);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        indicesLines, gl.STATIC_DRAW);
    iboLines.numberOfElements = indicesLines.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    // Setup tris index buffer object.
    var iboTris = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboTris);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        indicesTris, gl.STATIC_DRAW);
    iboTris.numberOfElements = indicesTris.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    // Clear framebuffer and render primitives.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Setup rendering tris.
    gl.vertexAttrib4f(colAttrib, 0.7, 0.3, 0, 1);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboTris);
    gl.drawElements(gl.TRIANGLES,
        iboTris.numberOfElements, gl.UNSIGNED_SHORT, 0);

        if (linesActivated) {
    // Setup rendering lines.
    gl.vertexAttrib4f(colAttrib, 0.9, 0.9, 0.9, 1);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboLines);
    gl.drawElements(gl.LINES,
        iboLines.numberOfElements, gl.UNSIGNED_SHORT, 0);
    }
}

function createVertexDataHyperboloid(){
    var n = 32;
    var m = 32;

// Positions.
vertices = new Float32Array(3 * (n+1) * (m+1));

// Index data.
indicesLines = new Uint16Array(2 * 2 * n * m);
indicesTris  = new Uint16Array(3 * 2 * n * m);

const rangeU = { min: (-Math.PI), max: (Math.PI) };
const rangeV = { min: (-2), max: (2) };
    
var du = (rangeU.max - rangeU.min) / n;
var dv = (rangeV.max - rangeV.min) / m;
var c = 0.6;
var a=0.8;
var b=1.2;

// Counter for entries in index array.
var iLines = 0;
var iTris = 0;

// Loop angle u.
for(var i=0, u=rangeU.min; i <= n; i++, u += du) {
    // Loop height v.
    for(var j=0, v=rangeV.min; j <= m; j++, v += dv) {
            var iVertex = i*(m+1) + j;

            var x = c * (a*Math.cosh(v)*Math.cos(u));
            var z = c * (a*Math.cosh(v)*Math.sin(u));
            var y = c * (b*Math.sinh(v));
                                                    
            // Set vertex positions.
            vertices[iVertex * 3] = x;
            vertices[iVertex * 3 + 1] = y;
            vertices[iVertex * 3 + 2] = z;
            
            // Set index.
            // Line on beam.
            if(j>0 && i>0){
                indicesLines[iLines++] = iVertex - 1;
                indicesLines[iLines++] = iVertex;
             }
            // Line on ring.
            if(j>0 && i>0){
                indicesLines[iLines++] = iVertex - (m+1);                            
                indicesLines[iLines++] = iVertex;
            }                   

            // Set index.
            // Two Triangles.
            if(j>0 && i>0){
                indicesTris[iTris++] = iVertex;
                indicesTris[iTris++] = iVertex - 1;
                indicesTris[iTris++] = iVertex - (m+1);
                //                            
                indicesTris[iTris++] = iVertex - 1;
                indicesTris[iTris++] = iVertex - (m+1) - 1;                            
                indicesTris[iTris++] = iVertex - (m+1);                            
            }
        }
    }
}