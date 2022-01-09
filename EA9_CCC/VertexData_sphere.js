var sphere = ( function() {
	var initialized = false;
	var   translateX = 0;
	var   translateY = 0;
	var   translateZ = 0;

	function createVertexData() {
		var recursionLevel = 1;
	 
	 var vertices = [];
	  var normals = [];
	  var indicesLines = [];
	  var indicesTris = [];

	  initialized = false;
  
	  // create 12 vertices of a icosahedron
	  var t = ((1.0 + Math.sqrt(5.0)) / 2.0);
	  var minusOne = -1 ;
	  var plusOne = 1 ;
	  var zero = 0;
	  var plusT = t;
	  var minusT = -t;
  
	  addVertex({ x: minusOne , y: (plusT + translateY), z: zero + translateZ});
	  addVertex({ x: plusOne , y: (plusT + translateY), z: zero  + translateZ});
	  addVertex({ x: minusOne , y: (minusT + translateY), z: zero  + translateZ});
	  addVertex({ x: plusOne , y: (minusT + translateY), z: zero  + translateZ});
  
	  addVertex({ x: zero , y: minusOne + translateY, z: plusT  + translateZ});
	  addVertex({ x: zero , y: plusOne + translateY, z: plusT  + translateZ});
	  addVertex({ x: zero , y: minusOne + translateY, z: minusT  + translateZ});
	  addVertex({ x: zero , y: plusOne + translateY, z: minusT  + translateZ});
  
	  addVertex({ x: plusT , y: zero + translateY, z: minusOne  + translateZ});
	  addVertex({ x: plusT , y: zero + translateY, z: plusOne  + translateZ});
	  addVertex({ x: minusT , y: zero + translateY, z: minusOne  + translateZ});
	  addVertex({ x: minusT , y: zero + translateY, z: plusOne  + translateZ});
	 // initialized = true;
  
	  // 5 faces around point 0
	  addIndex(indicesTris, indicesLines, { x: 0, y: 11, z: 5 });
	  addIndex(indicesTris, indicesLines, { x: 0, y: 5, z: 1 });
	  addIndex(indicesTris, indicesLines, { x: 0, y: 1, z: 7 });
	  addIndex(indicesTris, indicesLines, { x: 0, y: 7, z: 10 });
	  addIndex(indicesTris, indicesLines, { x: 0, y: 10, z: 11 });
  
	  // 5 adjacent faces
	  addIndex(indicesTris, indicesLines, { x: 1, y: 5, z: 9 });
	  addIndex(indicesTris, indicesLines, { x: 5, y: 11, z: 4 });
	  addIndex(indicesTris, indicesLines, { x: 11, y: 10, z: 2 });
	  addIndex(indicesTris, indicesLines, { x: 10, y: 7, z: 6 });
	  addIndex(indicesTris, indicesLines, { x: 7, y: 1, z: 8 });
  
	  // 5 faces around point 3
	  addIndex(indicesTris, indicesLines, { x: 3, y: 9, z: 4 });
	  addIndex(indicesTris, indicesLines, { x: 3, y: 4, z: 2 });
	  addIndex(indicesTris, indicesLines, { x: 3, y: 2, z: 6 });
	  addIndex(indicesTris, indicesLines, { x: 3, y: 6, z: 8 });
	  addIndex(indicesTris, indicesLines, { x: 3, y: 8, z: 9 });
  
	  // 5 adjacent faces
	  addIndex(indicesTris, indicesLines, { x: 4, y: 9, z: 5 });
	  addIndex(indicesTris, indicesLines, { x: 2, y: 4, z: 11 });
	  addIndex(indicesTris, indicesLines, { x: 6, y: 2, z: 10 });
	  addIndex(indicesTris, indicesLines, { x: 8, y: 6, z: 7 });
	  addIndex(indicesTris, indicesLines, { x: 9, y: 8, z: 1 });
	  initialized = true;
  
	  // refine triangles
	  for (var i = 0; i < recursionLevel; i++) {
		var tris = [];
		var lines = [];
  
		for (var j = 0; j < indicesTris.length; j += 3) {
		  var m1 = getMiddleVertex(indicesTris[j], indicesTris[j + 1]);
		  var m2 = getMiddleVertex(indicesTris[j + 1], indicesTris[j + 2]);
		  var m3 = getMiddleVertex(indicesTris[j + 2], indicesTris[j]);
  
		  addIndex(tris, lines, { x: indicesTris[j], y: m1, z: m3 });
		  addIndex(tris, lines, { x: indicesTris[j + 1], y: m2, z: m1 });
		  addIndex(tris, lines, { x: indicesTris[j + 2], y: m3, z: m2 });
		  addIndex(tris, lines, { x: m1, y: m2, z: m3 });
		}
  
		indicesTris = tris;
		indicesLines = lines;
	  }
  
	  this.vertices = new Float32Array(vertices);
	  this.normals = new Float32Array(normals);
	  this.indicesLines = new Uint16Array(indicesLines);
	  this.indicesTris = new Uint16Array(indicesTris);
  
	  // add vertex to mesh, fix position to be on unit sphere, return index
	  function addVertex(v) {

		var vLength = Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2) ;
		var normX = (v.x) / vLength  ;
		var normY = v.y / vLength;
		var normZ = v.z / vLength;	
		//var transX = normX - 1;
		//normX = normX-1;
	//	if (!initialized) {
			 
		vertices.push(normX , normY, normZ);
	//	} else {
	//		vertices.push(normX , normY, normZ);
	//	}
		normals.push(normX, normY, normZ);
  
		return (vertices.length / 3) - 1;
	  }
  
	  function addVertex2(v) {

		var vLength = Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2) ;
		var normX = v.x / vLength  ;
		var normY = v.y / vLength;
		var normZ = v.z / vLength;	
		//var transX = normX - 1;
		//normX = normX-1;
	//	if (!initialized) {
			 
		vertices.push(normX , normY, normZ);
	//	} else {
	//		vertices.push(normX , normY, normZ);
	//	}
		normals.push(normX, normY, normZ);
  
		return (vertices.length / 3) - 1;
	  }

	  // return index of point in the middle of p1 and p2
	  function getMiddleVertex(indexVertex1, indexVertex2) {
		  
		var v1 = getVertexFromArray(indexVertex1);
		var v2 = getVertexFromArray(indexVertex2);
  
		var m = getMiddle(v1, v2);
		
		// first check if we have it already
		for (var i = 0; i < vertices.length; i += 3) {
		  if ((vertices[i] === m.x) && (vertices[i + 1] === m.y) && (vertices[i + 2] === m.z)) {
			return i / 3;
		  }
		}

		// not in cache, calculate it
		// add vertex makes sure point is on unit sphere
		// return index
		return addVertex(m);
	  }
  
	  function getMiddle(v1, v2) {
		  
		return {
		  x: (v1.x + v2.x) / 2.0 ,
		  y: (v1.y + v2.y) / 2.0,
		  z: (v1.z + v2.z) / 2.0,
		};
	  }
  
	  function getVertexFromArray(index) {
		return {
		  x: (vertices[3 * index] ),
		  y: vertices[3 * index + 1],
		  z: vertices[3 * index + 2],
		};
	  }
  
	  function addIndex(tris, lines, vertex) {
		tris.push(vertex.x, vertex.y, vertex.z);
		lines.push(vertex.x, vertex.y, vertex.y, vertex.z, vertex.z, vertex.x);
	  }
	}

	return {
		createVertexData : createVertexData
	}

}());
