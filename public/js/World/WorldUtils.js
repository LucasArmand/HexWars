import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.module.js';
import { Tile } from './Tile.js'
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
    /**
     * Returns an array of hex Tiles arranged in a rectangular grid  
     * @param {*} width width of grid
     * @param {*} height height of grid
     * @param {*} radius radius of hexagonal tiles
     * @returns array of Tiles
     */
    static generateHexGrid(width, height, radius=1.0) {
        let tiles = [];
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                let tileCenter = WorldUtils.hexagonalToCartesian(new THREE.Vector2(x, y), radius);
                let tile = new Tile(tileCenter, radius);
                //tile.mesh.material.color = new THREE.Color((tileCenter.x  / (width * radius * Math.sqrt(3))),(tileCenter.y / (height * radius *  Math.sqrt(3))), 0);
                tiles.push(tile);
            }
        }
        return tiles;
    }

    static calculateTerrainSize(width, height, radius=1.0) {
        let maxTile = WorldUtils.hexagonalToCartesian(new THREE.Vector2(width, height)).add(new THREE.Vector2(Math.sqrt(3) * 0.5, 0.5))
        let minTile = new THREE.Vector2(0, 0);
        let terrainSize = maxTile.sub(minTile)
        if (height % 2 == 1) {
            terrainSize.x -= Math.sqrt(3) / 2;
        }
        return terrainSize;
    }
    
}