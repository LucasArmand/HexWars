import * as THREE from '../three.module.js'
import { WorldUtils } from './WorldUtils.js';
import { Tile } from './Tile.js';
import { Perlin } from "./Perlin.js"
export class TileGrid {

    constructor(width, height, radius=1.0) {
        this.width = width;
        this.height = height;
        this.radius = radius;
        this.noise = new Perlin();
        this.grid = [];
        this.centersToTiles = {}
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
        for (let y = 0; y < this.height; y++) {
            let row = [];
            for (let x = 0; x < this.width; x++) {
                let tileCenter = WorldUtils.hexagonalToCartesian(new THREE.Vector2(x, y), this.radius);
                let tile = new Tile(tileCenter, this.radius);
                tile.mesh.material.color = new THREE.Color(0.0, (this.noise.noise(x * 0.6, y * 0.6) + 1.0) * 0.5, 0);
                row.push(tile);
            }
            this.grid.push(row);
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
        for (let row of this.grid) {
            for (let tile of row) {
                scene.add(tile.mesh.clone());
            }
        }
        renderer.render(scene, camera);
        renderer.setRenderTarget(null);
        return tileRenderTarget.texture;
    }

    /**
     * Gets the tile at the given x-y cartesian coordinate
     */
    cartesianToTile(x, y) {

        let coordinate = WorldUtils.cartesianToNearestHexCenter(new THREE.Vector3(x, y, 0));
        let yIndex = parseInt(Math.round(coordinate.y  / 1.5));
        let xIndex = null;
        if (yIndex % 2 == 0) {
            xIndex = parseInt(Math.round(coordinate.x / (Math.sqrt(3))));
        } else {
            xIndex = parseInt(Math.round(coordinate.x / (Math.sqrt(3)))) - 1;
        }
        if ((yIndex < 0 || yIndex >= this.height) || (xIndex < 0 || xIndex >= this.width)) {
            return null;
        }
        return this.grid[yIndex][xIndex];
    }

    hexInterpolate(coordinate, propertyGenerator, radius) {
        // Get all hex centers within the specified radius
        let hexCenters = WorldUtils.getHexCentersWithinRadius(coordinate, radius);
        let tiles = [];
        let centers = [];
    
        // Collect valid tiles and their centers
        for (let center of hexCenters) {
            let tile = this.cartesianToTile(center.x, center.y);
            if (tile) {
                tiles.push(tile);
                centers.push(center);
            }
        }
    
        // If no tiles are found, return a default value
        if (tiles.length === 0) {
            return 0.0;
        }
    
        // Initialize arrays for weights and property values
        let weights = [];
        let properties = [];
        let totalWeight = 0;
    
        // Define a small epsilon to prevent division by zero
        const epsilon = 1e-8;
    
        // Compute weights and collect property values
        for (let i = 0; i < tiles.length; i++) {
            const center = centers[i];
            const tile = tiles[i];
            const distance = coordinate.distanceTo(center);
    
            // Avoid division by zero
            const adjustedDistance = distance + epsilon;
    
            // **Weighting Function Options:**
    
            // **Option 1: Inverse Distance Weighting (IDW)**
            // const weight = 1 / adjustedDistance;
    
            // **Option 2: Inverse Distance Squared Weighting**
            // const weight = 1 / (adjustedDistance * adjustedDistance);
    
            // **Option 3: Gaussian Weighting**
            const sigma = radius / 2; // Adjust sigma to control smoothness
            const weight = Math.exp(-Math.pow(distance / sigma, 2));
    
            // **Option 4: Custom Weighting Function**
            // You can define your own weighting function here
    
            weights.push(weight);
            properties.push(propertyGenerator(tile));
            totalWeight += weight;
        }
    
        // Compute the weighted average of the property values
        let interpolatedValue = 0;
        for (let i = 0; i < tiles.length; i++) {
            interpolatedValue += weights[i] * properties[i];
        }
    
        // Normalize the interpolated value by the total weight
        interpolatedValue /= totalWeight;
        return interpolatedValue;
    }
    
    

    lerpTiles(coordinate, propertyGenerator) {
        let allCenters = WorldUtils.getNearestHexCenters(coordinate);
        let allTiles = allCenters.map(center => this.cartesianToTile(center.x, center.y));
        let centers = [];
        let tiles = [];
        for (let i = 0; i < allTiles.length; i++) {
            if (allTiles[i]) {
                tiles.push(allTiles[i]);
                centers.push(allCenters[i])
            }
        }
        const distances = centers.map(center => coordinate.distanceTo(center));

        // Calculate inverse distances for weighting
        const invDistances = distances.map(d => 1 / (d * d * d));
        // Normalize weights
        const totalInvDistance = invDistances.reduce((acc, val) => acc + val, 0);
        const weights = invDistances.map(invD => invD / totalInvDistance);
        // Lerp the property
        let interpolatedProperty = 0;
        for (let i = 0; i < tiles.length; i++) {
            interpolatedProperty += propertyGenerator(tiles[i]) * weights[i];
        }
        return interpolatedProperty;
                
    }


    
}