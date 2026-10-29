export type IsTransparentFunc = (x: number, y: number) => boolean;
export type IsVisibleFunc = (x: number, y: number) => boolean;
export type SetVisibleFunc = (x: number, y: number) => void;
interface FovData {
	minX: number;
	minY: number;
	maxX: number;
	maxY: number;
	originX: number;
	originY: number;
	isVisible: IsVisibleFunc;
	setVisible: SetVisibleFunc;
	// visibility of the cells within minX..maxX, minY..maxY, if tracked internally instead of using isVisible
	visibility: Uint8Array | null;
	startSlopes: Array<number>;
	endSlopes: Array<number>;
}

// flat, row-major map data of mapWidth * mapHeight values; truthy values denote transparent cells
export type TransparencyData = ArrayLike<unknown>;

export class Mrpas {
	private readonly isTransparent: IsTransparentFunc;

	public constructor(
		private mapWidth: number,
		private mapHeight: number,
		transparency: IsTransparentFunc | TransparencyData
	) {
		this.isTransparent = typeof transparency === "function"
			? transparency
			: (x: number, y: number): boolean => x >= 0 && x < this.mapWidth && y >= 0 && y < this.mapHeight &&
				!!transparency[y * this.mapWidth + x];
	}

	private computeOctantY(deltaX: number, deltaY: number, data: FovData): void {
		const startSlopes: Array<number> = data.startSlopes;
		const endSlopes: Array<number> = data.endSlopes;
		const minX: number = data.minX;
		const maxX: number = data.maxX;
		const minY: number = data.minY;
		const maxY: number = data.maxY;
		const originX: number = data.originX;
		const originY: number = data.originY;
		const isTransparent: IsTransparentFunc = this.isTransparent;
		const isVisible: IsVisibleFunc = data.isVisible;
		const setVisible: SetVisibleFunc = data.setVisible;
		const visibility: Uint8Array | null = data.visibility;
		const width: number = maxX - minX + 1;
		let iteration: number = 1;
		let totalObstacles: number = 0;
		let obstaclesInLastLine: number = 0;
		let minSlope: number = 0;
		let x: number;
		let y: number;
		let halfSlope: number;
		let processedCell: number;
		let visible: boolean;
		let extended: boolean;
		let centreSlope: number;
		let startSlope: number;
		let endSlope: number;
		let previousEndSlope: number;
		let cellTransparent: boolean = false;
		let transparencyChecked: boolean;
		let firstCell: number;
		// whether the cell behind the processed one in the previous line is visible and transparent;
		// for the next processed cell, it's the diagonal one, so it doesn't need to be computed again
		let behindOpen: boolean = false;
		let diagonalOpen: boolean;

		for (
			y = originY + deltaY;
			y >= minY && y <= maxY;
			y += deltaY, obstaclesInLastLine = totalObstacles, ++iteration
		) {
			halfSlope = 0.5 / iteration;
			previousEndSlope = -1;
			for (
				firstCell = processedCell = Math.floor(minSlope * iteration + 0.5), x = originX + (processedCell * deltaX);
				processedCell <= iteration && x >= minX && x <= maxX;
				x += deltaX, ++processedCell, previousEndSlope = endSlope
			) {
				visible = true;
				extended = false;
				centreSlope = processedCell / iteration;
				startSlope = previousEndSlope;
				endSlope = centreSlope + halfSlope;
				transparencyChecked = false;

				if (obstaclesInLastLine > 0) {
					diagonalOpen = behindOpen;
					// the behind cell is always within the bounds, but the diagonal one may lie past minX or maxX
					behindOpen = (visibility === null ? isVisible(x, y - deltaY) : visibility[(y - deltaY - minY) * width + x - minX] === 1) &&
						isTransparent(x, y - deltaY);
					if (
						!behindOpen &&
						!(
							processedCell > firstCell
								? diagonalOpen
								: (visibility === null ? isVisible(x - deltaX, y - deltaY) : x - deltaX >= minX && x - deltaX <= maxX &&
										visibility[(y - deltaY - minY) * width + x - deltaX - minX] === 1) &&
									isTransparent(x - deltaX, y - deltaY)
						)
					) {
						visible = false;
					} else {
						for (var idx = 0; idx < obstaclesInLastLine && visible; ++idx) {
							if (startSlope <= endSlopes[idx] && endSlope >= startSlopes[idx]) {
								if (!transparencyChecked) {
									cellTransparent = isTransparent(x, y);
									transparencyChecked = true;
								}
								if (cellTransparent) {
									if (centreSlope > startSlopes[idx] && centreSlope < endSlopes[idx]) {
										visible = false;
										break;
									}
								} else {
									if (startSlope >= startSlopes[idx] && endSlope <= endSlopes[idx]) {
										visible = false;
										break;
									} else {
										if (startSlope < startSlopes[idx]) {
											startSlopes[idx] = startSlope;
										}
										if (endSlope > endSlopes[idx]) {
											endSlopes[idx] = endSlope;
										}
										extended = true;
									}
								}
							}
						}
					}
				}
				if (visible) {
					setVisible(x, y);
					if (visibility !== null) {
						visibility[(y - minY) * width + x - minX] = 1;
					}
					if (!transparencyChecked) {
						cellTransparent = isTransparent(x, y);
					}
					if (!cellTransparent) {
						if (minSlope >= startSlope) {
							minSlope = endSlope;
						} else if (!extended) {
							startSlopes[totalObstacles] = startSlope;
							endSlopes[totalObstacles++] = endSlope;
						}
					}
				}
			}
			// the whole octant is blocked; no further line contains any cells to process
			if (minSlope > 1) {
				break;
			}
		}
	}

	private computeOctantX(deltaX: number, deltaY: number, data: FovData): void {
		const startSlopes: Array<number> = data.startSlopes;
		const endSlopes: Array<number> = data.endSlopes;
		const minX: number = data.minX;
		const maxX: number = data.maxX;
		const minY: number = data.minY;
		const maxY: number = data.maxY;
		const originX: number = data.originX;
		const originY: number = data.originY;
		const isTransparent: IsTransparentFunc = this.isTransparent;
		const isVisible: IsVisibleFunc = data.isVisible;
		const setVisible: SetVisibleFunc = data.setVisible;
		const visibility: Uint8Array | null = data.visibility;
		const width: number = maxX - minX + 1;
		let iteration: number = 1;
		let totalObstacles: number = 0;
		let obstaclesInLastLine: number = 0;
		let minSlope: number = 0;
		let x: number;
		let y: number;
		let halfSlope: number;
		let processedCell: number;
		let visible: boolean;
		let extended: boolean;
		let centreSlope: number;
		let startSlope: number;
		let endSlope: number;
		let previousEndSlope: number;
		let cellTransparent: boolean = false;
		let transparencyChecked: boolean;
		let firstCell: number;
		// whether the cell behind the processed one in the previous line is visible and transparent;
		// for the next processed cell, it's the diagonal one, so it doesn't need to be computed again
		let behindOpen: boolean = false;
		let diagonalOpen: boolean;

		for (
			x = originX + deltaX;
			x >= minX && x <= maxX;
			x += deltaX, obstaclesInLastLine = totalObstacles, ++iteration
		) {
			halfSlope = 0.5 / iteration;
			previousEndSlope = -1;
			for (
				firstCell = processedCell = Math.floor(minSlope * iteration + 0.5), y = originY + (processedCell * deltaY);
				processedCell <= iteration && y >= minY && y <= maxY;
				y += deltaY, ++processedCell, previousEndSlope = endSlope
			) {
				visible = true;
				extended = false;
				centreSlope = processedCell / iteration;
				startSlope = previousEndSlope;
				endSlope = centreSlope + halfSlope;
				transparencyChecked = false;

				if (obstaclesInLastLine > 0) {
					diagonalOpen = behindOpen;
					// the behind cell is always within the bounds, but the diagonal one may lie past minY or maxY
					behindOpen = (visibility === null ? isVisible(x - deltaX, y) : visibility[(y - minY) * width + x - deltaX - minX] === 1) &&
						isTransparent(x - deltaX, y);
					if (
						!behindOpen &&
						!(
							processedCell > firstCell
								? diagonalOpen
								: (visibility === null ? isVisible(x - deltaX, y - deltaY) : y - deltaY >= minY && y - deltaY <= maxY &&
										visibility[(y - deltaY - minY) * width + x - deltaX - minX] === 1) &&
									isTransparent(x - deltaX, y - deltaY)
						)
					) {
						visible = false;
					} else {
						for (var idx = 0; idx < obstaclesInLastLine && visible; ++idx) {
							if (startSlope <= endSlopes[idx] && endSlope >= startSlopes[idx]) {
								if (!transparencyChecked) {
									cellTransparent = isTransparent(x, y);
									transparencyChecked = true;
								}
								if (cellTransparent) {
									if (centreSlope > startSlopes[idx] && centreSlope < endSlopes[idx]) {
										visible = false;
										break;
									}
								} else {
									if (startSlope >= startSlopes[idx] && endSlope <= endSlopes[idx]) {
										visible = false;
										break;
									} else {
										if (startSlope < startSlopes[idx]) {
											startSlopes[idx] = startSlope;
										}
										if (endSlope > endSlopes[idx]) {
											endSlopes[idx] = endSlope;
										}
										extended = true;
									}
								}
							}
						}
					}
				}
				if (visible) {
					setVisible(x, y);
					if (visibility !== null) {
						visibility[(y - minY) * width + x - minX] = 1;
					}
					if (!transparencyChecked) {
						cellTransparent = isTransparent(x, y);
					}
					if (!cellTransparent) {
						if (minSlope >= startSlope) {
							minSlope = endSlope;
						} else if (!extended) {
							startSlopes[totalObstacles] = startSlope;
							endSlopes[totalObstacles++] = endSlope;
						}
					}
				}
			}
			if (minSlope > 1) {
				break;
			}
		}
	}

	public setMapDimensions(mapWidth: number, mapHeight: number): void {
		this.mapWidth = mapWidth;
		this.mapHeight = mapHeight;
	}

	public compute(originX: number, originY: number, radius: number, setVisible: SetVisibleFunc): void;
	public compute(
		originX: number,
		originY: number,
		radius: number,
		isVisible: IsVisibleFunc,
		setVisible: SetVisibleFunc
	): void;
	public compute(
		originX: number,
		originY: number,
		radius: number,
		isVisibleOrSetVisible: IsVisibleFunc | SetVisibleFunc,
		setVisibleFunc?: SetVisibleFunc
	): void {
		const minX: number = Math.max(0, originX - radius);
		const minY: number = Math.max(0, originY - radius);
		const maxX: number = Math.min(this.mapWidth - 1, originX + radius);
		const maxY: number = Math.min(this.mapHeight - 1, originY + radius);
		const width: number = maxX - minX + 1;
		// without a visibility callback, the visibility of the processed area is tracked internally, so that the
		// result doesn't depend on any visibility the caller has set before
		const visibility: Uint8Array | null = setVisibleFunc === undefined
			? new Uint8Array(width * (maxY - minY + 1))
			: null;
		const setVisible: SetVisibleFunc = setVisibleFunc ?? isVisibleOrSetVisible as SetVisibleFunc;

		if (visibility !== null) {
			visibility[(originY - minY) * width + originX - minX] = 1;
		}
		setVisible(originX, originY);

		const data: FovData = {
			minX: minX,
			minY: minY,
			maxX: maxX,
			maxY: maxY,
			originX: originX,
			originY: originY,
			// only called when there's no visibility buffer
			isVisible: isVisibleOrSetVisible as IsVisibleFunc,
			setVisible: setVisible,
			visibility: visibility,
			startSlopes: [],
			endSlopes: []
		};

		this.computeOctantY(1, 1, data);
		this.computeOctantX(1, 1, data);
		this.computeOctantY(1, -1, data);
		this.computeOctantX(1, -1, data);
		this.computeOctantY(-1, 1, data);
		this.computeOctantX(-1, 1, data);
		this.computeOctantY(-1, -1, data);
		this.computeOctantX(-1, -1, data);
	}
}
