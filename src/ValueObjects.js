class Estimation {
	constructor(value) {
		this.value = parseFloat(value);
	}
	isCoherent() {
		return !this._isNan();
	}
	_isNan() {
		return this.value !== this.value; // see http://stackoverflow.com/a/16988441
	}
	toString() {
		return `${Math.round(this.value)}h`
	}
}

export class EstimatedTask {
	constructor(label, min, max) {
		this.label = label;
		this.min = new Estimation(min);
		this.max = new Estimation(max);
	}
	isEstimated() {
		return this.label !== "" && this.min.isCoherent() && this.max.isCoherent();
	}
	toString() {
		return this.label;
	}
}