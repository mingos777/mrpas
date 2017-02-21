/**
 * Check whether point (x,y) is transparent (i.e. is not an obstacle)
 * @callback isTransparent
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
/**
 * Check whether point (x,y) has previously been marked as visible
 * @callback isVisible
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
/**
 * Mark point (x,y) as visible
 * @callback setVisible
 * @param {number} x
 * @param {number} y
 */
/**
 * A data object passed into the octant methods
 * @typedef {object} fovData
 * @property {number} minX
 * @property {number} minY
 * @property {number} maxX
 * @property {number} maxY
 * @property {number} originX
 * @property {number} originY
 * @property {number} radius
 * @property {isVisible} isVisible
 * @property {setVisible} setVisible
 */

/**
 * @param {number} mapWidth
 * @param {number} mapHeight
 * @param {isTransparent} isTransparent
 * @constructor
 */
var Mrpas = function(mapWidth, mapHeight, isTransparent) {
	/**
	 * @type {number}
	 * @private
	 */
	this._mapWidth = mapWidth;

	/**
	 * @type {number}
	 * @private
	 */
	this._mapHeight = mapHeight;

	/**
	 * @type {isTransparent}
	 * @private
	 */
	this._isTransparent = isTransparent;
};

/**
 * Compute the FOV in an octant adjacent to the Y axis
 * @param {number} deltaX
 * @param {number} deltaY
 * @param {fovData} data
 * @private
 */
Mrpas.prototype._computeOctantY = function(deltaX, deltaY, data) {
	/**
	 * @type {Array.<number>}
	 */
	var startSlopes = [];

	/**
	 * @type {Array.<number>}
	 */
	var endSlopes = [];

	/**
	 * @type {number}
	 */
	var iteration = 1;

	/**
	 * @type {number}
	 */
	var totalObstacles = 0;

	/**
	 * @type {number}
	 */
	var obstaclesInLastLine = 0;

	/**
	 * @type {number}
	 */
	var minSlope = 0;

	/**
	 * @type {number}
	 */
	var x;

	/**
	 * @type {number}
	 */
	var y;

	/**
	 * @type {number}
	 */
	var halfSlope;

	/**
	 * @type {number}
	 */
	var processedCell;

	/**
	 * @type {boolean}
	 */
	var visible;

	/**
	 * @type {boolean}
	 */
	var extended;

	/**
	 * @type {number}
	 */
	var centreSlope;

	/**
	 * @type {number}
	 */
	var startSlope;

	/**
	 * @type {number}
	 */
	var endSlope;

	/**
	 * @type {number}
	 */
	var previousEndSlope;

	for (
		y = data.originY + deltaY;
		y >= data.minY && y <= data.maxY;
		y += deltaY, obstaclesInLastLine = totalObstacles, ++iteration
	) {
		halfSlope = 0.5 / iteration;
		previousEndSlope = -1;
		for (
			processedCell = Math.floor(minSlope * iteration + 0.5), x = data.originX + (processedCell * deltaX);
			processedCell <= iteration && x >= data.minX && x <= data.maxX;
			x += deltaX, ++processedCell, previousEndSlope = endSlope
		) {
			visible = true;
			extended = false;
			centreSlope = processedCell / iteration;
			startSlope = previousEndSlope;
			endSlope = centreSlope + halfSlope;

			if (obstaclesInLastLine > 0) {
				if (
					!(
						data.isVisible(x, y - deltaY) &&
						this._isTransparent(x, y - deltaY)
					) &&
					!(
						data.isVisible(x - deltaX, y - deltaY) &&
						this._isTransparent(x - deltaX, y - deltaY)
					)
				) {
					visible = false;
				} else {
					for (var idx = 0; idx < obstaclesInLastLine && visible; ++idx) {
						if (startSlope <= endSlopes[idx] && endSlope >= startSlopes[idx]) {
							if (this._isTransparent(x, y)) {
								if (centreSlope > startSlopes[idx] && centreSlope < endSlopes[idx]) {
									visible = false;
									break;
								}
							} else {
								if (startSlope >= startSlopes[idx] && endSlope <= endSlopes[idx]) {
									visible = false;
									break;
								} else {
									startSlopes[idx] = Math.min(startSlopes[idx], startSlope);
									endSlopes[idx] = Math.max(endSlopes[idx], endSlope);
									extended = true;
								}
							}
						}
					}
				}
			}
			if (visible) {
				data.setVisible(x, y);
				if (!this._isTransparent(x, y)) {
					if (minSlope >= startSlope) {
						minSlope = endSlope;
					} else if (!extended) {
						startSlopes[totalObstacles] = startSlope;
						endSlopes[totalObstacles++] = endSlope;
					}
				}
			}
		}
	}
};

/**
 * Compute the FOV in an octant adjacent to the X axis
 * @param {number} deltaX
 * @param {number} deltaY
 * @param {fovData} data
 * @private
 */
Mrpas.prototype._computeOctantX = function(deltaX, deltaY, data) {
	/**
	 * @type {Array.<number>}
	 */
	var startSlopes = [];

	/**
	 * @type {Array.<number>}
	 */
	var endSlopes = [];

	/**
	 * @type {number}
	 */
	var iteration = 1;

	/**
	 * @type {number}
	 */
	var totalObstacles = 0;

	/**
	 * @type {number}
	 */
	var obstaclesInLastLine = 0;

	/**
	 * @type {number}
	 */
	var minSlope = 0;

	/**
	 * @type {number}
	 */
	var x;

	/**
	 * @type {number}
	 */
	var y;

	/**
	 * @type {number}
	 */
	var halfSlope;

	/**
	 * @type {number}
	 */
	var processedCell;

	/**
	 * @type {boolean}
	 */
	var visible;

	/**
	 * @type {boolean}
	 */
	var extended;

	/**
	 * @type {number}
	 */
	var centreSlope;

	/**
	 * @type {number}
	 */
	var startSlope;

	/**
	 * @type {number}
	 */
	var endSlope;

	/**
	 * @type {number}
	 */
	var previousEndSlope;

	for (
		x = data.originX + deltaX;
		x >= data.minX && x <= data.maxX;
		x += deltaX, obstaclesInLastLine = totalObstacles, ++iteration
	) {
		halfSlope = 0.5 / iteration;
		previousEndSlope = -1;
		for (
			processedCell = Math.floor(minSlope * iteration + 0.5), y = data.originY + (processedCell * deltaY);
			processedCell <= iteration && y >= data.minY && y <= data.maxY;
			y += deltaY, ++processedCell, previousEndSlope = endSlope
		) {
			visible = true;
			extended = false;
			centreSlope = processedCell / iteration;
			startSlope = previousEndSlope;
			endSlope = centreSlope + halfSlope;

			if (obstaclesInLastLine > 0) {
				if (
					!(
						data.isVisible(x - deltaX, y) &&
						this._isTransparent(x - deltaX, y)
					) &&
					!(
						data.isVisible(x - deltaX, y - deltaY) &&
						this._isTransparent(x - deltaX, y - deltaY)
					)
				) {
					visible = false;
				} else {
					for (var idx = 0; idx < obstaclesInLastLine && visible; ++idx) {
						if (startSlope <= endSlopes[idx] && endSlope >= startSlopes[idx]) {
							if (this._isTransparent(x, y)) {
								if (centreSlope > startSlopes[idx] && centreSlope < endSlopes[idx]) {
									visible = false;
									break;
								}
							} else {
								if (startSlope >= startSlopes[idx] && endSlope <= endSlopes[idx]) {
									visible = false;
									break;
								} else {
									startSlopes[idx] = Math.min(startSlopes[idx], startSlope);
									endSlopes[idx] = Math.max(endSlopes[idx], endSlope);
									extended = true;
								}
							}
						}
					}
				}
			}
			if (visible) {
				data.setVisible(x, y);
				if (!this._isTransparent(x, y)) {
					if (minSlope >= startSlope) {
						minSlope = endSlope;
					} else if (!extended) {
						startSlopes[totalObstacles] = startSlope;
						endSlopes[totalObstacles++] = endSlope;
					}
				}
			}
		}
	}
};

/**
 * Change the dimensions of the map
 * @param {number} mapWidth
 * @param {number} mapHeight
 */
Mrpas.prototype.setMapDimensions = function(mapWidth, mapHeight) {
	this._mapWidth = mapWidth;
	this._mapHeight = mapHeight;
};

/**
 * @param {number} originX
 * @param {number} originY
 * @param {number} radius
 * @param {isVisible} isVisible
 * @param {setVisible} setVisible
 */
Mrpas.prototype.compute = function(originX, originY, radius, isVisible, setVisible) {
	setVisible(originX, originY);

	/**
	 * @type {fovData}
	 */
	var data = {
		minX: Math.max(0, originX - radius),
		minY: Math.max(0, originY - radius),
		maxX: Math.min(this._mapWidth - 1, originX + radius),
		maxY: Math.min(this._mapHeight - 1, originY + radius),
		originX: originX,
		originY: originY,
		radius: radius,
		isVisible: isVisible,
		setVisible: setVisible
	};

	this._computeOctantY(1, 1, data);
	this._computeOctantX(1, 1, data);
	this._computeOctantY(1, -1, data);
	this._computeOctantX(1, -1, data);
	this._computeOctantY(-1, 1, data);
	this._computeOctantX(-1, 1, data);
	this._computeOctantY(-1, -1, data);
	this._computeOctantX(-1, -1, data);
};

module.exports.Mrpas = Mrpas;
