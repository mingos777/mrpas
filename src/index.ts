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
	startSlopes: Array<number>;
	endSlopes: Array<number>;
}

export class Mrpas {

	public constructor(
		private mapWidth: number,
		private mapHeight: number,
		private readonly isTransparent: IsTransparentFunc
	) {}

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
					behindOpen = isVisible(x, y - deltaY) && isTransparent(x, y - deltaY);
					if (
						!behindOpen &&
						!(
							processedCell > firstCell
								? diagonalOpen
								: isVisible(x - deltaX, y - deltaY) && isTransparent(x - deltaX, y - deltaY)
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
					behindOpen = isVisible(x - deltaX, y) && isTransparent(x - deltaX, y);
					if (
						!behindOpen &&
						!(
							processedCell > firstCell
								? diagonalOpen
								: isVisible(x - deltaX, y - deltaY) && isTransparent(x - deltaX, y - deltaY)
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

	public compute(
		originX: number,
		originY: number,
		radius: number,
		isVisible: IsVisibleFunc,
		setVisible: SetVisibleFunc
	) {
		setVisible(originX, originY);

		const data: FovData = {
			minX: Math.max(0, originX - radius),
			minY: Math.max(0, originY - radius),
			maxX: Math.min(this.mapWidth - 1, originX + radius),
			maxY: Math.min(this.mapHeight - 1, originY + radius),
			originX: originX,
			originY: originY,
			isVisible: isVisible,
			setVisible: setVisible,
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
