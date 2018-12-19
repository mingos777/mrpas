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
	radius: number;
	isVisible: IsVisibleFunc;
	setVisible: SetVisibleFunc;
}

export class Mrpas {

	public constructor(
		private mapWidth: number,
		private mapHeight: number,
		private readonly isTransparent: IsTransparentFunc
	) {}

	private computeOctantY(deltaX: number, deltaY: number, data: FovData): void {
		const startSlopes: Array<number> = [];
		const endSlopes: Array<number> = [];
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
							this.isTransparent(x, y - deltaY)
						) &&
						!(
							data.isVisible(x - deltaX, y - deltaY) &&
							this.isTransparent(x - deltaX, y - deltaY)
						)
					) {
						visible = false;
					} else {
						for (var idx = 0; idx < obstaclesInLastLine && visible; ++idx) {
							if (startSlope <= endSlopes[idx] && endSlope >= startSlopes[idx]) {
								if (this.isTransparent(x, y)) {
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
					if (!this.isTransparent(x, y)) {
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
	}

	private computeOctantX(deltaX: number, deltaY: number, data: FovData): void {
		const startSlopes: Array<number> = [];
		const endSlopes: Array<number> = [];
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
							this.isTransparent(x - deltaX, y)
						) &&
						!(
							data.isVisible(x - deltaX, y - deltaY) &&
							this.isTransparent(x - deltaX, y - deltaY)
						)
					) {
						visible = false;
					} else {
						for (var idx = 0; idx < obstaclesInLastLine && visible; ++idx) {
							if (startSlope <= endSlopes[idx] && endSlope >= startSlopes[idx]) {
								if (this.isTransparent(x, y)) {
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
					if (!this.isTransparent(x, y)) {
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
			radius: radius,
			isVisible: isVisible,
			setVisible: setVisible
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
