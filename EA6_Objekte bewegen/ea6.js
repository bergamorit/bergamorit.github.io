var app = ( function() {
	var gl;

	// The shader program object is also used to
	// store attribute and uniform locations.
	var prog;

	// Array of model objects.
	var models = [];
	var sphereAngle = 0;
	var cameraLocked = false;

	// Model that is target for user input.
	//var interactiveModel;
	// Model that is target for user input.
	var torus;
	var sphere1;
	var sphere2;
	var sphere3;
	var sphere4;

	var toggleWireframeOn = true;

	var deltaRotate = Math.PI / 36;
	var deltaRotateWheel = Math.PI /42;
	var deltaTranslate = 0.05;

	var camera = {
		// Initial position of the camera.
		eye : [0, 1, 4],
		
		// Point to look at.
		center : [0, 0, 0],

		// Roll and pitch of the camera.
		up : [0, 1, 0],

		// Opening angle given in radian.
		// radian = degree*2*PI/360.
		fovy : 20.0 * Math.PI / 180,

		// Camera near plane dimensions:
		// value for left right top bottom in projection.
		lrtb : 2.0,

		// View matrix.
		vMatrix : mat4.create(),

		// Projection matrix.
		pMatrix : mat4.create(),

        // Projection type: perspective.
        projectionType : "perspective",

		// Angle to Z-Axis for camera when orbiting the center
		// given in radian.
		zAngle : 0,

		// Distance in XZ-Plane from center when orbiting.
		distance : 4,
	};

	function start() {
		init();
		render();
	}

	function init() {
		initWebGL();
		initShaderProgram();
		initUniforms()
		initModels();
		initEventHandler();
		initPipline();
	}

	function initWebGL() {
		// Get canvas and WebGL context.
		canvas = document.getElementById('canvas');
		gl = canvas.getContext('experimental-webgl');
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	}

	/**
	 * Init pipeline parameters that will not change again.
	 * If projection or viewport change, their setup must
	 * be in render function.
	 */
	function initPipline() {
		gl.clearColor(0.1, 0.1, 0.1, 1);

		// Backface culling.
		gl.frontFace(gl.CCW);
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);

		// Depth(Z)-Buffer.
		gl.enable(gl.DEPTH_TEST);

		// Polygon offset of rastered Fragments.
		gl.enable(gl.POLYGON_OFFSET_FILL);
		gl.polygonOffset(0.5, 0);

		// Set viewport.
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

		// Init camera.
		// Set projection aspect ratio.
		camera.aspect = gl.viewportWidth / gl.viewportHeight;
	}

	/**
	* Create and init shader from source.
	* 
	* @parameter shaderType: openGL shader type.
	* @parameter SourceTagId: Id of HTML Tag with shader source.
	* @returns shader object.
	*/

	function initShaderProgram() {
		// Init vertex shader.
		var vs = initShader(gl.VERTEX_SHADER, "vertexshader");
		// Init fragment shader.
		var fs = initShader(gl.FRAGMENT_SHADER, "fragmentshader");
		// Link shader into a shader program.
		prog = gl.createProgram();
		gl.attachShader(prog, vs);
		gl.attachShader(prog, fs);
		gl.bindAttribLocation(prog, 0, "aPosition");
		gl.linkProgram(prog);
		gl.useProgram(prog);
	}

	/**
	 * Create and init shader from source.
	 * 
	 * @parameter shaderType: openGL shader type.
	 * @parameter SourceTagId: Id of HTML Tag with shader source.
	 * @returns shader object.
	 */
	function initShader(shaderType, SourceTagId) {
		var shader = gl.createShader(shaderType);
		var shaderSource = document.getElementById(SourceTagId).text;
		gl.shaderSource(shader, shaderSource);
		gl.compileShader(shader);
		if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.log(SourceTagId +": "+gl.getShaderInfoLog(shader));
			return null;
		}
		return shader;
	}

	function initUniforms() {
		// Projection Matrix.
		prog.pMatrixUniform = gl.getUniformLocation(prog, "uPMatrix");

		// Model-View-Matrix.
		prog.mvMatrixUniform = gl.getUniformLocation(prog, "uMVMatrix");

		//Color-Uniform
		prog.colorUniform = gl.getUniformLocation(prog, "uColor");

		// die Uniform-Variable uNMatrix wird durch prog.nMatrixUniform referenziert
		prog.nMatrixUniform = gl.getUniformLocation(prog, "uNMatrix");
	}

	function initModels() {
		// fillstyle
		var fs = "wireframefill";
		
		createModel("torus", fs, [ 0.8, .15, .2, 1], [ 0, 0, 0 ], [ 0, 0, 0 ], [1, 1, 1 ]);
		createModel("sphere", fs, [ 0.1, 0.9, 0.7, 1 ], [2, 0, 0],
			[ Math.PI *.5, 0, 0 ], [ .1, .1, .1 ]);
		createModel("sphere", fs, [ 0.1, 0.4, 0.1, 1 ], [2, 0, 0],
			[ Math.PI *.5, 0, 0 ], [ .1, .1, .1 ]);
		createModel("sphere", fs, [ 0.5, 0.1, 0.7, 1 ], [2, 0, 0],
			[ Math.PI *.5, 0, 0 ], [ .1, .1, .1 ]);
		createModel("sphere", fs, [ 0.1, 0.1, 1, 1 ], [-2, 0, 0],
			[ Math.PI *.5, 0, 0 ], [ .1, .1, .1 ]);
			
        // Select one model that can be manipulated interactively by user.
		[
			torus,
			sphere1,
			sphere2,
			sphere3,
			sphere4
		  ] = models;

		  sphereAngle = (sphereAngle + deltaRotate) % (2 * Math.PI);
				torus.rotate[1] += deltaRotate;
				
				// 0 - 2
				const cosOffset = 1 + (Math.cos(sphereAngle));

				// -1 bis 1
				const sinOffset = Math.sin(sphereAngle);
				sphere1.translate[0] = cosOffset -2 ;
				sphere1.translate[2] = sinOffset ;
				sphere2.translate[0] = 1.3*(cosOffset  -1);
				sphere2.translate[2] = -1.3*(sinOffset -1);
				
				sphere3.translate[0] = (cosOffset -1)*2;
				sphere3.translate[2] = (-sinOffset -1)*2;
	
				sphere4.translate[0] = (-cosOffset)*1.5; 
				sphere4.translate[2] = sinOffset*1.5;	
				console.log("s" + sphereAngle);
    }

	/**
	 * Create model object, fill it and push it in models array.
	 * 
	 * @parameter geometryname: string with name of geometry.
	 * @parameter fillstyle: wireframe, fill, fillwireframe.
	 */
	 function createModel(geometryname, fillstyle, color, translate, rotate, scale) {
		var model = {};
		model.fillstyle = fillstyle;
		model.color = color;
		initDataAndBuffers(model, geometryname);

		// Create and initialize Model-View-Matrix.
		initTransformations(model, translate, rotate, scale);
		models.push(model);
	}

	function initTransformations(model, translate, rotate, scale) {
		// Store transformation vectors.
		model.translate = translate;
		model.rotate = rotate;
		model.scale = scale;
	
		// Create and initialize Model-Matrix.
		model.mMatrix = mat4.create();
	
		// Create and initialize Model-View-Matrix.
		model.mvMatrix = mat4.create();
		model.nMatrix = mat3.create();
	}

	/**
	 * Init data and buffers for model object.
	 * 
	 * @parameter model: a model object to augment with data.
	 * @parameter geometryname: string with name of geometry.
	 */
	function initDataAndBuffers(model, geometryname) {
		// Provide model object with vertex data arrays.
		// Fill data arrays for Vertex-Positions, Normals, Index data:
		// vertices, normals, indicesLines, indicesTris;
		// Pointer this refers to the window.
		this[geometryname]['createVertexData'].apply(model);


		// Setup position vertex buffer object.
		model.vboPos = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, model.vboPos);
		gl.bufferData(gl.ARRAY_BUFFER, model.vertices, gl.STATIC_DRAW);
		// Bind vertex buffer to attribute variable.
		prog.positionAttrib = gl.getAttribLocation(prog, 'aPosition');
		gl.enableVertexAttribArray(prog.positionAttrib);

		// Setup normal vertex buffer object.
		model.vboNormal = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, model.vboNormal);
		gl.bufferData(gl.ARRAY_BUFFER, model.normals, gl.STATIC_DRAW);

		// Bind buffer to attribute variable.
		prog.normalAttrib = gl.getAttribLocation(prog, 'aNormal');
		gl.enableVertexAttribArray(prog.normalAttrib);

		// Setup lines index buffer object.
		model.iboLines = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboLines);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indicesLines,
			gl.STATIC_DRAW);
		model.iboLines.numberOfElements = model.indicesLines.length;
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

		// Setup triangle index buffer object.
		model.iboTris = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboTris);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indicesTris,
			gl.STATIC_DRAW);
		model.iboTris.numberOfElements = model.indicesTris.length;
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	}

	function initEventHandler() {
		//Pfeiltasten
		window.addEventListener("keydown", function(e) {
			if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
				e.preventDefault();
			}
		}, false);

		window.onkeydown = function(evt) {

			// Use shift key to change sign.
            var sign = evt.shiftKey ? -1 : 1;

			var key = evt.which ? evt.which : evt.keyCode;
			var c = String.fromCharCode(key);

			// Change projection of scene.
			switch(c) {
				case('1'):
					document.getElementById("textCanvas").innerHTML = rekursionsSchritt + ". Rekursionsschritt der Kugel";
					models = [];
					initModels();
					render();
				break;

				case('2'):
					document.getElementById('textCanvas').innerHTML = rekursionsSchritt + ". Rekursionsschritt der Kugel";
					models = [];
					initModels();
					render();
				break;

				case('3'):
					document.getElementById("textCanvas").innerHTML = rekursionsSchritt + ". Rekursionsschritt der Kugel";
					models = [];
					initModels();
					render();
				break;

				case('4'):
					document.getElementById('textCanvas').innerHTML = rekursionsSchritt + ". Rekursionsschritt der Kugel";
					models = [];
					initModels();
					render();
				break;

				// Camera move and orbit.
				case('A'):
                    // Orbit camera.
					camera.eye[0] += - 1 * deltaTranslate;
					camera.center[0] += - 1 * deltaTranslate;
                    break;

				case('D'):
					camera.eye[0] += 1 * deltaTranslate;
					camera.center[0] += 1 * deltaTranslate;
                    break;

				case('W'):
					camera.eye[1] += 1 * deltaTranslate;
					camera.center[1] += 1 * deltaTranslate;
                    break;

				case('S'):
				   if (!cameraLocked || camera.center[1] > -.15) { 
					camera.eye[1] += - 1 * deltaTranslate;
					camera.center[1] += - 1 * deltaTranslate;
				   }
				   if (camera.eye[1] < .79 && cameraLocked) {
					camera.eye[1] +=  1 * deltaTranslate;
					}
				   	console.log("center" + camera.center[1]);
				   	console.log("eye"+camera.eye[1]);
                	break;
                  
				case('T'):
                    toggleWireframeOn = !toggleWireframeOn;
                    break;

				//Pfeiltasten
				case ('&'):
					camera.eye[1] += 1 * deltaTranslate;
					break;
		
				case ('%'):
					camera.zAngle += -1 * deltaRotate;
					break;
		
				case ("'"):
					camera.zAngle += 1 * deltaRotate;	
					break;
		
				case ('('):
					if (camera.eye[1] > .84 || !cameraLocked) {
						camera.eye[1] += -1 * deltaTranslate;
					}
					break;

				case('R'):
					if (sign >= 0) {
					camera.distance += -1 * deltaTranslate;
					} else {
						if (camera.distance >1) {
							camera.distance += 1 * deltaTranslate;
						}
					}
					break;
			}
			switch(c) {
                case('K'):
				sphereAngle = (sphereAngle + deltaRotate) % (2 * Math.PI);
				torus.rotate[0] += deltaRotate;
				torus.rotate[1] += deltaRotate;
				torus.rotate[2] += deltaRotateWheel;

				// 0 - 2
				const cosOffset = 1 + (Math.cos(sphereAngle));

				// -1 bis 1
				const sinOffset = Math.sin(sphereAngle);
				
				sphere1.translate[0] = cosOffset -2;
				sphere1.translate[2] = sinOffset;
				sphere2.translate[0] = 1.3*(cosOffset  -1);
				sphere2.translate[2] = -1.3*(sinOffset -1);
				
				sphere3.translate[0] = (cosOffset -1)*2;
				sphere3.translate[2] = (-sinOffset -1)*2;
	
				sphere4.translate[0] = (-cosOffset)*1.5; 
				sphere4.translate[2] = sinOffset*1.5;	
				console.log("s"+sphereAngle);
                break;
            }

			// Render the scene again on any key pressed.
			render();
		};
	}

	/**
	 * Run the rendering pipeline.
	 */
	function render() {
		// Clear framebuffer and depth-/z-buffer.
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		setProjection();
		calculateCameraOrbit();

		// Set view matrix depending on camera.
		mat4.lookAt(camera.vMatrix, camera.eye, camera.center, camera.up);

		// Loop over models.
		for(var i = 0; i < models.length; i++) {
			// Update modelview for model.
			//mat4.copy(models[i].mvMatrix, camera.vMatrix);
			updateTransformations(models[i]);

			// Set uniforms for model.
			gl.uniformMatrix4fv(prog.mvMatrixUniform, false,
			models[i].mvMatrix);
		
		
			// Uniform-Variable uColor wird über die Referenz prog.colorUniform mit dem Farbwert aus dem jeweiligen Modell belegt
			gl.uniform4fv(prog.colorUniform, models[i].color);
		
			// innerhalb des Loops wird über die Modelle die Normal-Matrix Uniform-Variable uNMatrix über die Referenz prog.nMatrixUniform gesetzt
			gl.uniformMatrix3fv(prog.nMatrixUniform, false, models[i].nMatrix);
			draw(models[i]);
		}
	}

	function calculateCameraOrbit() {
        // Calculate x,z position/eye of camera orbiting the center.
        var x = 0, z = 2;
        camera.eye[x] = camera.center[x];
        camera.eye[z] = camera.center[z];
        camera.eye[x] += camera.distance * Math.sin(camera.zAngle);
        camera.eye[z] += camera.distance * Math.cos(camera.zAngle);
    }

	function setProjection() {
		// Set projection Matrix.
		switch(camera.projectionType) {
			case("perspective"):
				mat4.perspective(camera.pMatrix, camera.fovy, 
					camera.aspect, 1, 10);
				break;
		}
		
		// Set projection uniform.
		gl.uniformMatrix4fv(prog.pMatrixUniform, false, camera.pMatrix);
	}

	function updateTransformations(model) {
    
		// Use shortcut variables.
		var mMatrix = model.mMatrix;
		var mvMatrix = model.mvMatrix;
		
		//mat4.copy(mvMatrix, camera.vMatrix);  
		
		// Reset matrices to identity.         
        mat4.identity(mMatrix);
        mat4.identity(mvMatrix);

		// Translate.
        mat4.translate(mMatrix, mMatrix, model.translate);

		// Rotate.
        mat4.rotateX(mMatrix, mMatrix, model.rotate[0]);
        mat4.rotateY(mMatrix, mMatrix, model.rotate[1]);
        mat4.rotateZ(mMatrix, mMatrix, model.rotate[2]);

		// Scale
        mat4.scale(mMatrix, mMatrix, model.scale);

		// Combine view and model matrix
        // by matrix multiplication to mvMatrix.        
        mat4.multiply(mvMatrix, camera.vMatrix, mMatrix);

		// Calculate normal matrix from model-view matrix.
		mat3.normalFromMat4(model.nMatrix, mvMatrix);
	}

	function draw(model) {

		// Setup color vertex buffer object.
		var vboCol = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vboCol);
		gl.bufferData(gl.ARRAY_BUFFER, model.color, gl.STATIC_DRAW);

		// Bind vertex buffer to attribute variable.
		var colAttrib = gl.getAttribLocation(prog, 'col');
		gl.vertexAttribPointer(colAttrib, 4, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(colAttrib);

		// Setup position VBO.
		gl.bindBuffer(gl.ARRAY_BUFFER, model.vboPos);
		gl.vertexAttribPointer(prog.positionAttrib,3,gl.FLOAT,false,0,0);

		// Setup normal VBO.
		gl.bindBuffer(gl.ARRAY_BUFFER, model.vboNormal);
		gl.vertexAttribPointer(prog.normalAttrib,3,gl.FLOAT,false,0,0);

		// Setup rendering tris.
		var fill = (model.fillstyle.search(/fill/) != -1);
		if(fill) {
			gl.enableVertexAttribArray(prog.normalAttrib);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboTris);
			gl.drawElements(gl.TRIANGLES, model.iboTris.numberOfElements, 
				gl.UNSIGNED_SHORT, 0);
		}

		// Setup rendering lines.
		var wireframe = (model.fillstyle.search(/wireframe/) != -1);
		if(wireframe && toggleWireframeOn) {
			gl.disableVertexAttribArray(prog.normalAttrib);
			gl.vertexAttrib3f(prog.normalAttrib, 0, 0, 0);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboLines);
			gl.drawElements(gl.LINES, model.iboLines.numberOfElements, gl.UNSIGNED_SHORT, 0);
		}
	}
	
	// App interface.
	return {
		start : start
	}
}());

$(document).ready(function () {
	$('.modal').modal();
});