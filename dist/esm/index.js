export class Mrpas {
    mapWidth;
    mapHeight;
    isTransparent;
    constructor(mapWidth, mapHeight, transparency) {
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        this.isTransparent = typeof transparency === "function"
            ? transparency
            : (x, y) => x >= 0 && x < this.mapWidth && y >= 0 && y < this.mapHeight &&
                !!transparency[y * this.mapWidth + x];
    }
    computeOctantY(deltaX, deltaY, data) {
        const startSlopes = data.startSlopes;
        const endSlopes = data.endSlopes;
        const minX = data.minX;
        const maxX = data.maxX;
        const minY = data.minY;
        const maxY = data.maxY;
        const originX = data.originX;
        const originY = data.originY;
        const isTransparent = this.isTransparent;
        const isVisible = data.isVisible;
        const setVisible = data.setVisible;
        const visibility = data.visibility;
        const width = maxX - minX + 1;
        let iteration = 1;
        let totalObstacles = 0;
        let obstaclesInLastLine = 0;
        let minSlope = 0;
        let x;
        let y;
        let halfSlope;
        let processedCell;
        let visible;
        let extended;
        let centreSlope;
        let startSlope;
        let endSlope;
        let previousEndSlope;
        let cellTransparent = false;
        let transparencyChecked;
        let firstCell;
        let behindOpen = false;
        let diagonalOpen;
        for (y = originY + deltaY; y >= minY && y <= maxY; y += deltaY, obstaclesInLastLine = totalObstacles, ++iteration) {
            halfSlope = 0.5 / iteration;
            previousEndSlope = -1;
            for (firstCell = processedCell = Math.floor(minSlope * iteration + 0.5), x = originX + (processedCell * deltaX); processedCell <= iteration && x >= minX && x <= maxX; x += deltaX, ++processedCell, previousEndSlope = endSlope) {
                visible = true;
                extended = false;
                centreSlope = processedCell / iteration;
                startSlope = previousEndSlope;
                endSlope = centreSlope + halfSlope;
                transparencyChecked = false;
                if (obstaclesInLastLine > 0) {
                    diagonalOpen = behindOpen;
                    behindOpen = (visibility === null ? isVisible(x, y - deltaY) : visibility[(y - deltaY - minY) * width + x - minX] === 1) &&
                        isTransparent(x, y - deltaY);
                    if (!behindOpen &&
                        !(processedCell > firstCell
                            ? diagonalOpen
                            : (visibility === null ? isVisible(x - deltaX, y - deltaY) : x - deltaX >= minX && x - deltaX <= maxX &&
                                visibility[(y - deltaY - minY) * width + x - deltaX - minX] === 1) &&
                                isTransparent(x - deltaX, y - deltaY))) {
                        visible = false;
                    }
                    else {
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
                                }
                                else {
                                    if (startSlope >= startSlopes[idx] && endSlope <= endSlopes[idx]) {
                                        visible = false;
                                        break;
                                    }
                                    else {
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
                        }
                        else if (!extended) {
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
    computeOctantX(deltaX, deltaY, data) {
        const startSlopes = data.startSlopes;
        const endSlopes = data.endSlopes;
        const minX = data.minX;
        const maxX = data.maxX;
        const minY = data.minY;
        const maxY = data.maxY;
        const originX = data.originX;
        const originY = data.originY;
        const isTransparent = this.isTransparent;
        const isVisible = data.isVisible;
        const setVisible = data.setVisible;
        const visibility = data.visibility;
        const width = maxX - minX + 1;
        let iteration = 1;
        let totalObstacles = 0;
        let obstaclesInLastLine = 0;
        let minSlope = 0;
        let x;
        let y;
        let halfSlope;
        let processedCell;
        let visible;
        let extended;
        let centreSlope;
        let startSlope;
        let endSlope;
        let previousEndSlope;
        let cellTransparent = false;
        let transparencyChecked;
        let firstCell;
        let behindOpen = false;
        let diagonalOpen;
        for (x = originX + deltaX; x >= minX && x <= maxX; x += deltaX, obstaclesInLastLine = totalObstacles, ++iteration) {
            halfSlope = 0.5 / iteration;
            previousEndSlope = -1;
            for (firstCell = processedCell = Math.floor(minSlope * iteration + 0.5), y = originY + (processedCell * deltaY); processedCell <= iteration && y >= minY && y <= maxY; y += deltaY, ++processedCell, previousEndSlope = endSlope) {
                visible = true;
                extended = false;
                centreSlope = processedCell / iteration;
                startSlope = previousEndSlope;
                endSlope = centreSlope + halfSlope;
                transparencyChecked = false;
                if (obstaclesInLastLine > 0) {
                    diagonalOpen = behindOpen;
                    behindOpen = (visibility === null ? isVisible(x - deltaX, y) : visibility[(y - minY) * width + x - deltaX - minX] === 1) &&
                        isTransparent(x - deltaX, y);
                    if (!behindOpen &&
                        !(processedCell > firstCell
                            ? diagonalOpen
                            : (visibility === null ? isVisible(x - deltaX, y - deltaY) : y - deltaY >= minY && y - deltaY <= maxY &&
                                visibility[(y - deltaY - minY) * width + x - deltaX - minX] === 1) &&
                                isTransparent(x - deltaX, y - deltaY))) {
                        visible = false;
                    }
                    else {
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
                                }
                                else {
                                    if (startSlope >= startSlopes[idx] && endSlope <= endSlopes[idx]) {
                                        visible = false;
                                        break;
                                    }
                                    else {
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
                        }
                        else if (!extended) {
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
    setMapDimensions(mapWidth, mapHeight) {
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
    }
    compute(originX, originY, radius, isVisibleOrSetVisible, setVisibleFunc) {
        const minX = Math.max(0, originX - radius);
        const minY = Math.max(0, originY - radius);
        const maxX = Math.min(this.mapWidth - 1, originX + radius);
        const maxY = Math.min(this.mapHeight - 1, originY + radius);
        const width = maxX - minX + 1;
        const visibility = setVisibleFunc === undefined
            ? new Uint8Array(width * (maxY - minY + 1))
            : null;
        const setVisible = setVisibleFunc ?? isVisibleOrSetVisible;
        if (visibility !== null) {
            visibility[(originY - minY) * width + originX - minX] = 1;
        }
        setVisible(originX, originY);
        const data = {
            minX: minX,
            minY: minY,
            maxX: maxX,
            maxY: maxY,
            originX: originX,
            originY: originY,
            isVisible: isVisibleOrSetVisible,
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
