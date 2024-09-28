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