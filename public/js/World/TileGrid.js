import * as THREE from '../three.module.js'
import { WorldUtils } from './WorldUtils.js';
import { Tile } from './Tile.js';
export class TileGrid {

    constructor(width, height, radius=1.0) {
        this.width = width;
        this.height = height;
        this.radius = radius;

        this.grid = [];
        this.terrain = null;
    }

    /**
     * Returns an array of hex Tiles arranged in a rectangular grid  
     * @param {*} width width of grid
     * @param {*} height height of grid
     * @param {*} radius radius of hexagonal tiles
     */
    generateHexGrid() {
        this.grid = [];
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                let tileCenter = WorldUtils.hexagonalToCartesian(new THREE.Vector2(x, y), this.radius);
                let tile = new Tile(tileCenter, this.radius);
                //console.log(this.terrain.getCenter());
                if (tileCenter.distanceTo(this.terrain.getCenter()) < 15) {
                    tile.mesh.material.color = new THREE.Color(0, 127, 0);
                } else {
                    tile.mesh.material.color = new THREE.Color(0, 0, 127);
                }

                this.grid.push(tile);
            }
        }
    }

    renderToTexture() {
        const renderScene = new THREE.Scene();
    }


    
}