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
	var startAngle = [];

	/**
	 * @type {Array.<number>}
	 */
	var endAngle = [];

	/**
	 * @type {number}
	 */
	var iteration = 1;

	/**
	 * @type {boolean}
	 */
	var done = false;

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
	var minAngle = 0;

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
	var slopesPerCell;

	/**
	 * @type {number}
	 */
	var halfSlopes;

	/**
	 * @type {number}
	 */
	var processedCell;

	/**
	 * @type {number}
	 */
	var min;

	/**
	 * @type {number}
	 */
	var max;

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

	y = data.originY + deltaY;
	if (y < data.minY || y > data.maxY) {
		done = true;
	}
	while (!done) {
		slopesPerCell = 1.0 / iteration;
		halfSlopes = slopesPerCell * 0.5;
		processedCell = parseInt((minAngle + halfSlopes) / slopesPerCell);
		min = Math.max(data.minX, data.originX - iteration);
		max = Math.min(data.maxX, data.originX + iteration);
		done = true;
		for (x = data.originX + (processedCell * deltaX); x >= min && x <= max; x += deltaX) {
			visible = true;
			extended = false;
			centreSlope = processedCell * slopesPerCell;
			startSlope = centreSlope - halfSlopes;
			endSlope = centreSlope + halfSlopes;
			if (obstaclesInLastLine > 0 && !data.isVisible(x, y)) {
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
						if (startAngle[idx] > endSlope || endAngle[idx] < startSlope) {
							++idx;
						} else {
							if (this._isTransparent(x, y)) {
								if (centreSlope > startAngle[idx] && centreSlope < endAngle[idx]) {
									visible = false;
								}
							} else {
								if (startSlope >= startAngle[idx] && endSlope <= endAngle[idx]) {
									visible = false;
								} else {
									startAngle[idx] = Math.min(startAngle[idx], startSlope);
									endAngle[idx] = Math.max(endAngle[idx], endSlope);
									extended = true;
								}
							}
							++idx;
						}
					}
				}
			}
			if (visible) {
				done = false;
				data.setVisible(x, y);
				if (!this._isTransparent(x, y)) {
					if (minAngle >= startSlope) {
						minAngle = endSlope;
						if (processedCell == iteration) {
							done = true;
						}
					} else if (!extended) {
						startAngle[totalObstacles] = startSlope;
						endAngle[totalObstacles++] = endSlope;
					}
				}
			}
			processedCell++;
		}
		if (iteration == data.radius) {
			done = true;
		}
		iteration++;
		obstaclesInLastLine = totalObstacles;
		y += deltaY;
		if (y < data.minY || y > data.maxY) {
			done = true;
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
	var startAngle = [];

	/**
	 * @type {Array.<number>}
	 */
	var endAngle = [];

	/**
	 * @type {number}
	 */
	var iteration = 1;

	/**
	 * @type {boolean}
	 */
	var done = false;

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
	var minAngle = 0;

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
	var slopesPerCell;

	/**
	 * @type {number}
	 */
	var halfSlopes;

	/**
	 * @type {number}
	 */
	var processedCell;

	/**
	 * @type {number}
	 */
	var min;

	/**
	 * @type {number}
	 */
	var max;

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

	x = data.originX + deltaX;
	if (x < data.minX || x > data.maxX) {
		done = true;
	}
	while (!done) {
		slopesPerCell = 1.0 / iteration;
		halfSlopes = slopesPerCell * 0.5;
		processedCell = parseInt((minAngle + halfSlopes) / slopesPerCell);
		min = Math.max(data.minY, data.originY - iteration);
		max = Math.min(data.maxY, data.originY + iteration);
		done = true;
		for (y = data.originY + (processedCell * deltaY); y >= min && y <= max; y+=deltaY) {
			visible = true;
			extended = false;
			centreSlope = processedCell * slopesPerCell;
			startSlope = centreSlope - halfSlopes;
			endSlope = centreSlope + halfSlopes;
			if (obstaclesInLastLine > 0 && !data.isVisible(x, y)) {
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
						if (startAngle[idx] > endSlope || endAngle[idx] < startSlope) {
							++idx;
						} else {
							if (this._isTransparent(x, y)) {
								if (centreSlope > startAngle[idx] && centreSlope < endAngle[idx]) {
									visible = false;
								}
							} else {
								if (startSlope >= startAngle[idx] && endSlope <= endAngle[idx]) {
									visible = false;
								} else {
									startAngle[idx] = Math.min(startAngle[idx], startSlope);
									endAngle[idx] = Math.max(endAngle[idx], endSlope);
									extended = true;
								}
							}
							++idx;
						}
					}
				}
			}
			if (visible) {
				done = false;
				data.setVisible(x, y);
				if (!this._isTransparent(x, y)) {
					if (minAngle >= startSlope) {
						minAngle = endSlope;
						if (processedCell == iteration) {
							done = true;
						}
					} else if (!extended) {
						startAngle[totalObstacles] = startSlope;
						endAngle[totalObstacles++] = endSlope;
					}
				}
			}
			processedCell++;
		}
		if (iteration == data.radius) {
			done = true;
		}
		iteration++;
		obstaclesInLastLine = totalObstacles;
		x += deltaX;
		if (x < data.minX || x > data.maxX) {
			done = true;
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

module.exports = Mrpas;
