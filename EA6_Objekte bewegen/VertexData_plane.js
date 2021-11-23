var plane = ( function() {

	function createVertexData() {
        var n = 100;
        var m = 100;

        // Positions.
		this.vertices = new Float32Array(3 * (n + 1) * (m + 1));
		var vertices = this.vertices;

		// Normals.
		this.normals = new Float32Array(3 * (n + 1) * (m + 1));
		var normals = this.normals;

		// Index data.
		this.indicesLines = new Uint16Array(2 * 2 * n * m);
		var indicesLines = this.indicesLines;
		this.indicesTris = new Uint16Array(3 * 2 * n * m);
		var indicesTris = this.indicesTris;

		var du = 20 / n;
        var dv = 20 / m;

		var r = 0.3;
		var R = 0.5;

		// Counter for entries in index array.
		var iLines = 0;
		var iTris = 0;

		// colors
		this.color = new Float32Array(vertices.length*3);
		var color = this.color;

        // Loop u.
        for(var i = 0, u = -10; i <= n; i++, u += du) {
            // Loop v.
            for(var j = 0, v = -10; j <= m; j++, v += dv) {

                var iVertex = i * (m + 1) + j;

                var x = u;
                var y = 0;
                var z = v;

                // Set vertex positions.
                vertices[iVertex * 3] = x;
                vertices[iVertex * 3 + 1] = y;
                vertices[iVertex * 3 + 2] = z;

                // Calc and set normals.
                normals[iVertex * 3] = .80;
                normals[iVertex * 3 + 1] = .80;
                normals[iVertex * 3 + 2] = 1;

				// Set index.
				// Line on beam.
				if(j > 0 && i > 0) {
					indicesLines[iLines++] = iVertex - 1;
					indicesLines[iLines++] = iVertex;
				}
				// Line on ring.
				if(j > 0 && i > 0) {
					indicesLines[iLines++] = iVertex - (m + 1);
					indicesLines[iLines++] = iVertex;
				}

				// Set index.
				// Two Triangles.
				if(j > 0 && i > 0) {
					indicesTris[iTris++] = iVertex;
					indicesTris[iTris++] = iVertex - 1;
					indicesTris[iTris++] = iVertex - (m + 1);
					//
					indicesTris[iTris++] = iVertex - 1;
					indicesTris[iTris++] = iVertex - (m + 1) - 1;
					indicesTris[iTris++] = iVertex - (m + 1);
				}
			}
		}
		for (var i = 0; i < vertices.length*3; i +=4*1) {
			color[i] = 0.1;
			color[i+1] = 0.1;
			color[i+2] = 0.1;
			color[i+3] = 1;
		}
	}

	return {
		createVertexData : createVertexData
	}

}());
