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
                if (tileCenter.distanceTo(this.terrain.getCenter()) < 15) {
                    tile.mesh.material.color = new THREE.Color(0, 127, 0);
                } else {
                    tile.mesh.material.color = new THREE.Color(0, 0, 127);
                }

                this.grid.push(tile);
            }
        }
    }

    renderHexTexture(renderer) {
        let terrainSize = WorldUtils.getTerrainSize(this.terrain);
        let terrainOrigin = new THREE.Vector2(-Math.sqrt(3)/ 2, -1);

        const scene = new THREE.Scene();
        let tileRenderTarget = new THREE.WebGLRenderTarget(terrainSize.x * 10, terrainSize.y * 10); 

        renderer.setRenderTarget(tileRenderTarget);

        const left = -terrainSize.x / 2;
        const right = terrainSize.x / 2;
        const top = terrainSize.y / 2;
        const bottom = -terrainSize.y / 2;
        const near = 0.1;  
        const far = 1000;

        const camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);

        // Set camera position and orientation to look at the x-y plane
        camera.position.set(terrainSize.x/2 + terrainOrigin.x, terrainSize.y/2 + terrainOrigin.y, 10); // Move the camera along the z-axis
        camera.lookAt(terrainSize.x/2 + terrainOrigin.x, terrainSize.y/2 + terrainOrigin.y, 0);        // Look at the center of the plane
        camera.updateProjectionMatrix();
        for (let tile of this.grid) {
            scene.add(tile.mesh.clone());
        }
        renderer.render(scene, camera);
        renderer.setRenderTarget(null);
        return tileRenderTarget.texture;
    }


    
}