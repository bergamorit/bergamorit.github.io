class Kugel {

	constructor(_id, _radius, _gesund, _minPosition, _maxPosition, _zeitZumGesundwerden, _kugelModels, _canBecomeImmune) {

		this.id = _id;
		this.radius = _radius;
		this.startPunkt;
		this.createPosition(_minPosition, _maxPosition, _kugelModels);
		this.richtung = [getRandomArbitrary(0.1, 1), getRandomArbitrary(0.1, 1), getRandomArbitrary(0.1, 1)];

		vec3.normalize(this.richtung, this.richtung);

		this.geschwindigkeit = getRandomArbitrary(1, 10) * .001;
		this.gesund = _gesund;
		this.vergangeneZeitschritte = 0;
		this.zeitZumGesundwerden = _zeitZumGesundwerden;

		this.immun = false;

		this.canBecomeImmune = _canBecomeImmune;
	}

	createPosition(_minPos, _maxPos, _kugelMod) {
		this.startPunkt = [getRandomArbitrary(_minPos, _maxPos), getRandomArbitrary(_minPos, _maxPos), getRandomArbitrary(_minPos, _maxPos)];

		// damit die Startposition immer an anderen Orten wie die der anderen Kugeln ist
		if (_kugelMod.length > 0) {
			_kugelMod.forEach((k) => {
				if (this.intersect(k.startPunkt)) {
					this.createPosition(_minPos, _maxPos, _kugelMod);
				}
			});
		}
	}

	moveKugel() {

		vec3.scaleAndAdd(this.startPunkt, this.startPunkt, this.richtung, this.geschwindigkeit);

		if (this.startPunkt[0] + this.radius > 1 || this.startPunkt[1] + this.radius > 1 || this.startPunkt[2] + this.radius > 1) {
			if (this.startPunkt[0] + this.radius > 1) {
				this.startPunkt[0] = -1 + this.radius;
			} else if (this.startPunkt[1] + this.radius > 1) {
				this.startPunkt[1] = -1 + this.radius;
			} else if (this.startPunkt[2] + this.radius > 1) {
				this.startPunkt[2] = -1 + this.radius;
			}
		} else if (this.startPunkt[0] - this.radius < -1 || this.startPunkt[1] - this.radius < -1 || this.startPunkt[2] - this.radius < -1) {
			if (this.startPunkt[0] - this.radius < -1) {
				this.startPunkt[0] = 1 - this.radius;
			} else if (this.startPunkt[1] - this.radius < -1) {
				this.startPunkt[1] = 1 - this.radius;

			} else if (this.startPunkt[2] - this.radius < -1) {
				this.startPunkt[2] = 1 - this.radius;
			}
		}

		if (this.gesund) {
			return;
		} else if (!this.gesund) {
			this.vergangeneZeitschritte++;
			if (this.vergangeneZeitschritte >= this.zeitZumGesundwerden) {
				this.gesund = true;
				this.vergangeneZeitschritte = 0;
				if (this.canBecomeImmune) {
					this.immun = true;
				}
			}
		} else if (this.immun && !this.gesund) {
			this.vergangeneZeitschritte++;
			if (this.vergangeneZeitschritte >= 10) {
				this.gesund = true;
				this.vergangeneZeitschritte = 0;
			}
		}
	}

	testInfection(otherKugeln) {

		otherKugeln.forEach((k) => {
			if (k.id != this.id && this.intersect(k.startPunkt)) {

				vec3.normalize(k.richtung, vec3.subtract(this.richtung, this.richtung, k.richtung));
				vec3.negate(this.richtung, k.richtung);

				vec3.scaleAndAdd(this.startPunkt, this.startPunkt, this.richtung, this.radius * .1);
				vec3.scaleAndAdd(k.startPunkt, k.startPunkt, k.richtung, k.radius * .1);

				if (this.gesund && !k.gesund) {
					//	console.log("he touched me");
					this.gesund = false;
				}
			}
		});
	}

	intersect(otherKugelPosition) {
		let r = this.radius;
		let d = vec3.distance(otherKugelPosition, this.startPunkt);
		return d <= (r + r);
	}
}

function getRandomArbitrary(min, max) {
	return Math.random() * (max - min) + min;
}

function randomIntFromInterval(min, max) { // min and max included 
	return Math.floor(Math.random() * (max - min + 1) + min)
}