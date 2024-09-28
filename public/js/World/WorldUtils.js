import * as THREE from '../three.module.js'
import { Tile } from './Tile.js'
import { Terrain } from './Terrain.js';
export class WorldUtils {

    /**
     * Converts hexagonal coordinate to cartesian coordinate
     * @param {*} coordinate coordinate in hexagonal coords
     * @param {*} radius radius of hexagons in the coordinate
     * @returns 
     */
    static hexagonalToCartesian(coordinate, radius = 1.0) {
        let rowAxis = new THREE.Vector3(1, 0, 0);
        let colAxis = new THREE.Vector3(0.5, Math.sqrt(3) / 2.0, 0);
        let isIndent = false;
        if (coordinate.y % 2 == 1) {
            isIndent = true;
        }
        let indent = isIndent ? 1: 0;
        let origin = rowAxis.clone().multiplyScalar((-coordinate.y + indent) * radius * Math.sqrt(3) / 2);
        return origin
            .add(rowAxis.clone().multiplyScalar(coordinate.x * radius * Math.sqrt(3))
            .add(colAxis.clone().multiplyScalar(coordinate.y * radius * Math.sqrt(3))
        ));
    }

    static cartesianToHexagonal(coordinate, radius = 1.0) {
        /*
        * The odd rows have hexagon centers at x = sqrt(3) * n and y = 3n for n >= 0 
        * The even rows have hexagon centers at x = sqrt(3) * (n - 0.5) and y = 3n - 1.5 for n >= 1
        * For any point, the two closest rows will be one even and one odd
        * For any point, the closest columns will be the shortest horizontal distance
        * even row y-values look like [0, 3, 6, 9...]
        * odd row y-values look like [1.5, 4.5, 7.5, 10.5...]
        * even row x-values look like [sqrt(3), 2 * sqrt(3), 4 * sqrt(3)...]
        * odd row x-values look like [sqrt(3) * 0.5, sqrt(3) * 1.5, sqrt(3) * 2.5...]
        * 
        * we know that an input x-value will fall between two even centers and two odd centers
        * we know that an input y-value will fall between an even and odd y-value
        * 
        * so, 
        * 1. find the nearest two y-values for rows (upper and lower)
        * 2. find the two nearest x-values per row (left and right)
        * 3. return the hex center with the shortest distance
        */
        console.log(coordinate)
        let x = coordinate.x;
        let y = coordinate.y;
        let lowerIsEven = Math.floor(y / 1.5) % 2 == 0;
        let evenBound = lowerIsEven ? Math.floor(y / 1.5) * 1.5 : Math.ceil(y / 1.5) * 1.5;
        let oddBound = lowerIsEven ? Math.ceil(y / 1.5) * 1.5 : Math.floor(y / 1.5) * 1.5;
        console.log(Math.ceil(y / 1.5) * 1.5)
        console.log(Math.floor(y / 1.5) * 1.5)
        
        let leftEvenBound = Math.floor(x / Math.sqrt(3)) * Math.sqrt(3);
        let leftOddBound = Math.floor((x - Math.sqrt(3) / 2.0 ) / Math.sqrt(3)) * Math.sqrt(3) + Math.sqrt(3) / 2.0;

        let rightEvenBound = Math.ceil(x / Math.sqrt(3)) * Math.sqrt(3);
        let rightOddBound = Math.ceil((x - Math.sqrt(3) / 2.0 ) / Math.sqrt(3)) * Math.sqrt(3) + Math.sqrt(3) / 2.0;

        let points = []
        points = [new THREE.Vector3(leftEvenBound, evenBound, 0),
                      new THREE.Vector3(rightEvenBound, evenBound, 0),
                      new THREE.Vector3(leftOddBound, oddBound, 0),
                      new THREE.Vector3(rightOddBound, oddBound, 0)
        ]
        let minDistance = radius;
        let minCenter = null;
        for (let point of points) {
            if (point.distanceTo(coordinate) < minDistance) {
                minDistance = point.distanceTo(coordinate);
                minCenter = point.clone();
            }
        }
        return minCenter;

    }
    static getTerrainSize(terrain, radius=1.0) {
        return WorldUtils.calculateTerrainSize(terrain.tileGrid.height, terrain.tileGrid.width, terrain.tileGrid.radius)
    }

    static calculateTerrainSize(height, width, radius=1.0) {
        let maxTile = WorldUtils.hexagonalToCartesian(new THREE.Vector2(width, height)).add(new THREE.Vector2(Math.sqrt(3) * 0.5, 0.5))
        let minTile = new THREE.Vector2(0, 0);
        let terrainSize = maxTile.sub(minTile)
        if (height % 2 == 1) {
            terrainSize.x -= Math.sqrt(3) / 2;
        }
        return terrainSize;
    }
    
}