export class Mrpas {
    mapWidth;
    mapHeight;
    isTransparent;
    constructor(mapWidth, mapHeight, isTransparent) {
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        this.isTransparent = isTransparent;
    }
    computeOctantY(deltaX, deltaY, data) {
        const startSlopes = [];
        const endSlopes = [];
        const minX = data.minX;
        const maxX = data.maxX;
        const minY = data.minY;
        const maxY = data.maxY;
        const originX = data.originX;
        const originY = data.originY;
        const isTransparent = this.isTransparent;
        const isVisible = data.isVisible;
        const setVisible = data.setVisible;
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
        for (y = originY + deltaY; y >= minY && y <= maxY; y += deltaY, obstaclesInLastLine = totalObstacles, ++iteration) {
            halfSlope = 0.5 / iteration;
            previousEndSlope = -1;
            for (processedCell = Math.floor(minSlope * iteration + 0.5), x = originX + (processedCell * deltaX); processedCell <= iteration && x >= minX && x <= maxX; x += deltaX, ++processedCell, previousEndSlope = endSlope) {
                visible = true;
                extended = false;
                centreSlope = processedCell / iteration;
                startSlope = previousEndSlope;
                endSlope = centreSlope + halfSlope;
                transparencyChecked = false;
                if (obstaclesInLastLine > 0) {
                    if (!(isVisible(x, y - deltaY) &&
                        isTransparent(x, y - deltaY)) &&
                        !(isVisible(x - deltaX, y - deltaY) &&
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
        }
    }
    computeOctantX(deltaX, deltaY, data) {
        const startSlopes = [];
        const endSlopes = [];
        const minX = data.minX;
        const maxX = data.maxX;
        const minY = data.minY;
        const maxY = data.maxY;
        const originX = data.originX;
        const originY = data.originY;
        const isTransparent = this.isTransparent;
        const isVisible = data.isVisible;
        const setVisible = data.setVisible;
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
        for (x = originX + deltaX; x >= minX && x <= maxX; x += deltaX, obstaclesInLastLine = totalObstacles, ++iteration) {
            halfSlope = 0.5 / iteration;
            previousEndSlope = -1;
            for (processedCell = Math.floor(minSlope * iteration + 0.5), y = originY + (processedCell * deltaY); processedCell <= iteration && y >= minY && y <= maxY; y += deltaY, ++processedCell, previousEndSlope = endSlope) {
                visible = true;
                extended = false;
                centreSlope = processedCell / iteration;
                startSlope = previousEndSlope;
                endSlope = centreSlope + halfSlope;
                transparencyChecked = false;
                if (obstaclesInLastLine > 0) {
                    if (!(isVisible(x - deltaX, y) &&
                        isTransparent(x - deltaX, y)) &&
                        !(isVisible(x - deltaX, y - deltaY) &&
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
        }
    }
    setMapDimensions(mapWidth, mapHeight) {
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
    }
    compute(originX, originY, radius, isVisible, setVisible) {
        setVisible(originX, originY);
        const data = {
            minX: Math.max(0, originX - radius),
            minY: Math.max(0, originY - radius),
            maxX: Math.min(this.mapWidth - 1, originX + radius),
            maxY: Math.min(this.mapHeight - 1, originY + radius),
            originX: originX,
            originY: originY,
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
