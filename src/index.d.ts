export declare class Mrpas {
	private _mapWidth: number;
	private _mapHeight: number;
	private _isTransparent: (x: number, y: number) => boolean;

	constructor(mapWidth: number, mapHeight: number, isTransparent: (x: number, y: number) => boolean);
	private _computeOctantY(deltaX, deltaY, data): void;
	private _computeOctantX(deltaX, deltaY, data): void;
	setMapDimensions(mapWidth: number, mapHeight: number): void;
	compute(originX: number, originY: number, radius: number, isVisible: (x: number, y: number) => boolean,
	        setVisible: (x: number, y: number) => void): void;
}
