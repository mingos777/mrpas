export type IsTransparentFunc = (x: number, y: number) => boolean;
export type IsVisibleFunc = (x: number, y: number) => boolean;
export type SetVisibleFunc = (x: number, y: number) => void;
export type TransparencyData = ArrayLike<unknown>;
export declare class Mrpas {
    private mapWidth;
    private mapHeight;
    private readonly isTransparent;
    constructor(mapWidth: number, mapHeight: number, transparency: IsTransparentFunc | TransparencyData);
    private computeOctantY;
    private computeOctantX;
    setMapDimensions(mapWidth: number, mapHeight: number): void;
    compute(originX: number, originY: number, radius: number, setVisible: SetVisibleFunc): void;
    compute(originX: number, originY: number, radius: number, isVisible: IsVisibleFunc, setVisible: SetVisibleFunc): void;
}
