var app = ( function() {
	var kugelModels = [];

	var simulationPaused = false;
	var simulationRunning = false;

	var speed = 50;

	var kugelnCanBecomeImmune;

	// fillstyle
	var wireframe = "wireframe";

	var cSnow = [1., .98, 0.98, 1];

	var cKugelGreen = [0, .784, .318, 1];
	var cKugelRed = [1., .267, .267, 1];
	var cKugelBlue = [.2, .71, .898, 1];
	var cKugelYellow = [1, .733, .2, 1];

	var mBlue = createPhongMaterial({ kd: [.2, .71, .898] });
	var mYellow = createPhongMaterial({ kd: [1, .733, .2] });
	var mGreen = createPhongMaterial({ kd: [0, .784, .318] });
	var mRed = createPhongMaterial({ kd: [1., .267, .267] });
	var mSnow = createPhongMaterial({ kd: [1., .98, 0.98] });

	var gl;

	// The shader program object is also used to
	// store attribute and uniform locations.
	var prog;

	// Array of model objects.
	var models = [];
	var cameraLocked = false;

	let simulationInterval;

	var kugelRadius = .1;

	var sliderAnzahlKugelnN;
	var sliderAnzahlKrankeK;
	var sliderKugelRadiusR;
	var sliderGesundungsZeitschritteZ;
	var sliderSimulationsGeschwindigkeit;
	var valueAnzahlKugelnN;
	var valueAnzahlKrankeK;
	var valueAnzahlGesundeG;
	var valueKugelRadiusR;
	var valueGesundungsZeitschritteZ;
	var valueSimulationsGeschwindigkeit;

	var toggleWireframeOn = true;

	var deltaRotate = Math.PI / 36;
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
		fovy : 60.0 * Math.PI / 180,

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

	// Objekt with light sources characteristics in the scene.
	var illumination = {
		ambientLight : [ 0.5, 0.5, 0.5 ],
		light: [
		{ isOn: true, position: [4.33012701892218, 1., -2.5000000000000218], color: [1., 1., 1.] },
		]
	};

	function start() {
		init();
		render();
	}

	function stop() {

		document.getElementById('stopSimulation').disabled = true;

		if (document.getElementById('startSimulation').textContent == 'Pause Simulation') {
			document.getElementById('startSimulation').textContent = 'Start Simulation';
		}

		document.getElementById("anzahlKugelnN").removeAttribute("disabled");
		document.getElementById("anzahlKugelnN").className = "slider";

		document.getElementById("anzahlKrankeK").removeAttribute("disabled");
		document.getElementById("anzahlKrankeK").className = "slider";

		document.getElementById("gesundungsZeitschritteZ").removeAttribute("disabled");
		document.getElementById("gesundungsZeitschritteZ").className = "slider";

		document.getElementById("kugelRadiusR").removeAttribute("disabled");
		document.getElementById("kugelRadiusR").className = "slider";

		document.getElementById('checkbox').removeAttribute("disabled");
		document.getElementById('checkboxParent').className = "checkboxParent";


		simulationRunning = false;
		simulationPaused = false;
		kugelModels = [];
		models = [];

		clearInterval(simulationInterval);

		initModels();
		render();
	}

	document.getElementById('stopSimulation').onclick = () => {
		stop();
		simulationRunning = false;
	};

	document.getElementById('checkbox').onclick = () => {
		if (document.getElementById('checkbox').checked) {
			kugelnCanBecomeImmune = false;
		} else {
			kugelnCanBecomeImmune = true;
		}
	};

	document.getElementById('startSimulation').onclick = () => {

		simulationRunning = !simulationRunning;

		if (document.getElementById('startSimulation').textContent == 'Start Simulation') {
			startSimulation();
			simulationPaused = false;
			document.getElementById('startSimulation').textContent = 'Pause Simulation';
		} else {
			simulationPaused = true;
			pauseSimulation();
			document.getElementById('startSimulation').textContent = 'Start Simulation';
		}
	};

	function startSimulation() {

		document.getElementById('stopSimulation').disabled = false;

		if (!simulationPaused) {
			kugelModels = [];
		}

		sliderAnzahlKugelnN.disabled = true;
		sliderAnzahlKugelnN.className = "disabledSlider";

		sliderAnzahlKrankeK.disabled = true;
		sliderAnzahlKrankeK.className = "disabledSlider";

		sliderGesundungsZeitschritteZ.disabled = true;
		sliderGesundungsZeitschritteZ.className = "disabledSlider";

		sliderKugelRadiusR.disabled = true;
		sliderKugelRadiusR.className = "disabledSlider";

		document.getElementById('checkbox').setAttribute("disabled", "disabled");
		document.getElementById('checkboxParent').className = "disabledCheckbox";

		if (!simulationPaused) {
			kugelRadius = valueKugelRadiusR.innerHTML * .2;
			var kugelID = 0;
			let kugelMinPunkt = -1 + kugelRadius;
			let kugelMaxPunkt = 1 - kugelRadius;

			for (var j = 0; j < valueAnzahlKrankeK.innerHTML; j++) {
				var kugel = new Kugel(kugelID, kugelRadius, false, kugelMinPunkt, kugelMaxPunkt, valueGesundungsZeitschritteZ.innerHTML, kugelModels, kugelnCanBecomeImmune);

				kugelModels.push(kugel);
				kugelID++;
			}

			for (var j = 0; j < valueAnzahlGesundeG.innerHTML; j++) {
				var kugel = new Kugel(kugelID, kugelRadius, true, kugelMinPunkt, kugelMaxPunkt, valueGesundungsZeitschritteZ.innerHTML, kugelModels, kugelnCanBecomeImmune);

				kugelModels.push(kugel);
				kugelID++;
			}
		}

		simulationInterval = setInterval(() => {
			if (!simulationRunning || simulationPaused) {
				return;
			}

			models = [];
			initModels();
			render();

			kugelModels.forEach((kugel) => {

				kugel.moveKugel();
				kugel.testInfection(kugelModels);

			});
		}, speed);
	}

	function pauseSimulation() {
		clearInterval(simulationInterval);

		simulationPaused = true;
	}

	function init() {
		initWebGL();
		initShaderProgram();
		initUniforms()
		initModels();
		initEventHandler();
		initPipline();
		initSliders();
	}

	function initSliders() {

		sliderAnzahlKugelnN = document.getElementById("anzahlKugelnN");

		sliderAnzahlKrankeK = document.getElementById("anzahlKrankeK");
		sliderAnzahlKrankeK.max = sliderAnzahlKugelnN.value;

		sliderGesundungsZeitschritteZ = document.getElementById("gesundungsZeitschritteZ");
		sliderKugelRadiusR = document.getElementById("kugelRadiusR");

		sliderSimulationsGeschwindigkeit = document.getElementById("simulationsGeschwindigkeit");

		valueAnzahlKugelnN = document.getElementById("valueAnzahlKugelnN");
		valueAnzahlKrankeK = document.getElementById("valueAnzahlKrankeK");
		valueAnzahlGesundeG = document.getElementById("valueAnzahlGesundeG");
		valueGesundungsZeitschritteZ = document.getElementById("valueGesundungsZeitschritteZ");
		valueKugelRadiusR = document.getElementById("valueKugelRadiusR");
		valueSimulationsGeschwindigkeit = document.getElementById("valueSimulationsGeschwindigkeit");

		valueAnzahlKugelnN.innerHTML = sliderAnzahlKugelnN.value;
		valueAnzahlKrankeK.innerHTML = sliderAnzahlKrankeK.value;
		valueAnzahlGesundeG.innerHTML = sliderAnzahlKugelnN.value - sliderAnzahlKrankeK.value;
		valueGesundungsZeitschritteZ.innerHTML = sliderGesundungsZeitschritteZ.value;
		valueKugelRadiusR.innerHTML = Math.round((sliderKugelRadiusR.value * .1) * 100) / 100;

		console.log("html kugel N: " + valueAnzahlKugelnN.innerHTML);
		console.log("html kranke: " + valueAnzahlKrankeK.innerHTML);
		console.log("htlm gesunde: " + valueAnzahlGesundeG.innerHTML);

		console.log("slider kugel N: " + sliderAnzahlKugelnN.value);
		console.log("slider kranke: " + sliderAnzahlKrankeK.value);
		console.log("slider gesunde: " + (sliderAnzahlKugelnN.value - sliderAnzahlKrankeK.value));

		valueSimulationsGeschwindigkeit.innerHTML = sliderSimulationsGeschwindigkeit.value;
		speed = 400 / valueSimulationsGeschwindigkeit.innerHTML;
		console.log("speed " + speed);

		if (document.getElementById('checkbox').checked) {
			console.log("cant become immune");
			kugelnCanBecomeImmune = false;
		} else {
			console.log("can become immune");

			kugelnCanBecomeImmune = true;
		}
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
		camera.eye[1] = 1.91;
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

	// Light.
	prog.ambientLightUniform = gl.getUniformLocation(prog,
		"ambientLight");
	// Array for light sources uniforms.
	prog.lightUniform = [];
	// Loop over light sources.
	for (var j = 0; j < illumination.light.length; j++) {
		var lightNb = "light[" + j + "]";
		// Store one object for every light source.
		var l = {};
		l.isOn = gl.getUniformLocation(prog, lightNb + ".isOn");
		l.position = gl.getUniformLocation(prog, lightNb + ".position");
		l.color = gl.getUniformLocation(prog, lightNb + ".color");
		prog.lightUniform[j] = l;
	}

	// Material.
	prog.materialKaUniform = gl.getUniformLocation(prog, "material.ka");
	prog.materialKdUniform = gl.getUniformLocation(prog, "material.kd");
	prog.materialKsUniform = gl.getUniformLocation(prog, "material.ks");
	prog.materialKeUniform = gl.getUniformLocation(prog, "material.ke");
	}

	function createPhongMaterial(material){
		material = material || {};
		// Set some default values,
		// if not defined in material paramter.
		material.ka = material.ka || [0.3, 0.3, 0.3];
		material.kd = material.kd || [0.6, 0.6, 0.6];
		material.ks = material.ks || [0.8, 0.8, 0.8];
		material.ke = material.ke || 10;
		
		return material;
	}

	function initModels() {
		
		createModel("plane", wireframe, cSnow, [0, -1, 0], [0, 0, 0], [1, 1, 1], mSnow);
		createModel("plane", wireframe, cSnow, [0, 1, 0], [0, 0, 0], [1, 1, 1], mSnow);

		createModel("plane", wireframe, cSnow, [0, -1, 0], [0, Math.PI, 0], [1, 1, 1], mSnow);
		createModel("plane", wireframe, cSnow, [0, 1, 0], [0, Math.PI, 0], [1, 1, 1], mSnow);


		createModel("plane", wireframe, cSnow, [-1, 0, 0], [0, 0, Math.PI * .5], [1, 1, 1], mSnow);
		createModel("plane", wireframe, cSnow, [1, 0, 0], [0, 0, Math.PI * .5], [1, 1, 1], mSnow);


		createModel("plane", wireframe, cSnow, [0, 0, -1], [0, Math.PI * 1.5, Math.PI * .5], [1, 1, 1], mSnow);
		createModel("plane", wireframe, cSnow, [0, 0, -1], [0, Math.PI * .5, Math.PI * .5], [1, 1, 1], mSnow);

		if (simulationRunning) {
			kugelModels.forEach(initKugel);
		}
    }

	function initKugel(k) {
		if (!k.immun) {
			if (k.gesund == false) {
				createModel("sphere", "fill", cKugelRed, k.startPunkt, [0, 0, 0], [k.radius, k.radius, k.radius], mRed);
			} else if (k.gesund) {
				createModel("sphere", "fill", cKugelGreen, k.startPunkt, [0, 0, 0], [k.radius, k.radius, k.radius], mGreen);
			}
		} else {
			if (k.gesund == false) {
				createModel("sphere", "fill", cKugelYellow, k.startPunkt, [0, 0, 0], [k.radius, k.radius, k.radius], mYellow);
			} else if (k.gesund) {
				createModel("sphere", "fill", cKugelBlue, k.startPunkt, [0, 0, 0], [k.radius, k.radius, k.radius], mBlue);
			}

		}
	}

	/**
	 * Create model object, fill it and push it in models array.
	 * 
	 * @parameter geometryname: string with name of geometry.
	 * @parameter fillstyle: wireframe, fill, fillwireframe.
	 */
	 function createModel(geometryname, fillstyle, color, translate, rotate, scale, material) {
		var model = {};
		model.fillstyle = fillstyle;
		model.color = color;
		model.material = material;

		initDataAndBuffers(model, geometryname);
		initTransformations(model, translate, rotate, scale);

		models.push(model);
	}

	/**
	 * Set scale, rotation and transformation for model.
	 */
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
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indicesLines, gl.STATIC_DRAW);
		model.iboLines.numberOfElements = model.indicesLines.length;
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

		// Setup triangle index buffer object.
		model.iboTris = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboTris);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indicesTris, gl.STATIC_DRAW);
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

				case('T'):
					toggleWireframeOn = !toggleWireframeOn;
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

		// Set light uniforms.
		gl.uniform3fv(prog.ambientLightUniform, illumination.ambientLight);
		
		// Loop over light sources.
		for (var j = 0; j < illumination.light.length; j++) {
			// bool is transferred as integer.
			gl.uniform1i(prog.lightUniform[j].isOn, illumination.light[j].isOn);
			// Tranform light postion in eye coordinates.
			// Copy current light position into a new array.
			var lightPos = [].concat(illumination.light[j].position);
			// Add homogenious coordinate for transformation.
			lightPos.push(1.0);
			vec4.transformMat4(lightPos, lightPos, camera.vMatrix);
			// Remove homogenious coordinate.
			lightPos.pop();
			gl.uniform3fv(prog.lightUniform[j].position, lightPos);
			gl.uniform3fv(prog.lightUniform[j].color, illumination.light[j].color);
		}

		// Loop over models.
		for(var i = 0; i < models.length; i++) {
			// Update modelview for model.
			updateTransformations(models[i]);

			// Set uniforms for model.
			gl.uniformMatrix4fv(prog.mvMatrixUniform, false, models[i].mvMatrix);
		
			// Uniform-Variable uColor wird über die Referenz prog.colorUniform mit dem Farbwert aus dem jeweiligen Modell belegt
			gl.uniform4fv(prog.colorUniform, models[i].color);
		
			// innerhalb des Loops wird über die Modelle die Normal-Matrix Uniform-Variable uNMatrix über die Referenz prog.nMatrixUniform gesetzt
			gl.uniformMatrix3fv(prog.nMatrixUniform, false, models[i].nMatrix);
			
			// Material.
			gl.uniform3fv(prog.materialKaUniform, models[i].material.ka);
			gl.uniform3fv(prog.materialKdUniform, models[i].material.kd);
			gl.uniform3fv(prog.materialKsUniform, models[i].material.ks);
			gl.uniform1f(prog.materialKeUniform, models[i].material.ke);

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
			gl.uniform4fv(prog.colorUniform, [0.,0.,0.,1.]);
			gl.disableVertexAttribArray(prog.normalAttrib);
			gl.vertexAttrib3f(prog.normalAttrib, 0, 0, 0);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboLines);
			gl.drawElements(gl.LINES, model.iboLines.numberOfElements, gl.UNSIGNED_SHORT, 0);
		}
	}

	document.getElementById("simulationsGeschwindigkeit").oninput = function () {
		valueSimulationsGeschwindigkeit.innerHTML = this.value;

		pauseSimulation();
		speed = 400 / this.value;
		console.log("speed" + speed);
	}

	document.getElementById("simulationsGeschwindigkeit").onpointerup = function () {

		if (simulationRunning) {
			startSimulation();
		}

		simulationPaused = false;
	}

	document.getElementById("anzahlKugelnN").oninput = function () {

		valueAnzahlKugelnN.innerHTML = this.value;
		document.getElementById("anzahlKrankeK").max = valueAnzahlKugelnN.innerHTML;


		if (document.getElementById("anzahlKrankeK").max < parseFloat(valueAnzahlKrankeK.innerHTML)) {
			sliderAnzahlKrankeK.value = sliderAnzahlKrankeK.max;
			valueAnzahlKrankeK.innerHTML = sliderAnzahlKrankeK.value;
		}

		valueAnzahlGesundeG.innerHTML = this.value - sliderAnzahlKrankeK.value;
	}

	document.getElementById("anzahlKrankeK").oninput = function () {
		valueAnzahlKrankeK.innerHTML = this.value;
		valueAnzahlGesundeG.innerHTML = valueAnzahlKugelnN.innerHTML - this.value;
	}

	document.getElementById("gesundungsZeitschritteZ").oninput = function () {
		valueGesundungsZeitschritteZ.innerHTML = this.value;
	}

	document.getElementById("kugelRadiusR").oninput = function () {
		valueKugelRadiusR.innerHTML = Math.round((this.value * .1) * 100) / 100;
	}

	// App interface.
	return {
		start : start
	}

}());