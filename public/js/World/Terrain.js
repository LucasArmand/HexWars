import * as THREE from '../three.module.js'
import { Perlin } from "./Perlin.js"
import { WorldUtils } from './WorldUtils.js';


export class Terrain {
    constructor(width, height, resolutionPerUnit) {
        this.width = width;
        this.height = height;
        this.resolutionPerUnit = resolutionPerUnit;
        this.noise = new Perlin();
        this.tileGrid = null;
        this.hexTexture = null;
        this.mesh = null;

    }
    
    attatchTileGrid(tileGrid) {
      this.tileGrid = tileGrid;
      tileGrid.terrain = this;
    }

    getCenter() {
      let size = WorldUtils.getTerrainSize(this);
      return new THREE.Vector3(size.x / 2, size.y / 2, 0);
    }
    elevationFunction(x, y) {
        //return this.tileGrid.getTileAt(x, y);
        return this.noise.noise(10 * x, 10 * y) * 0.1;
    }

    generateTerrainMesh() {
        // Calculate the number of vertices in the x and y directions
        const widthSegments = Math.floor(this.width * this.resolutionPerUnit);
        const heightSegments = Math.floor(this.height * this.resolutionPerUnit);
      
        // Create a PlaneGeometry in the x-y plane
        const geometry = new THREE.PlaneGeometry(this.width, this.height, widthSegments, heightSegments);

        const material = new THREE.MeshStandardMaterial({
            color: 0x116611,
            flatShading: true
        });

      // Access the vertices of the geometry and modify the z-value using elevationFunction
      const vertices = geometry.attributes.position;
    
      for (let i = 0; i < vertices.count; i++) {
          // Get the current vertex position (x, y)
          const x = vertices.getX(i);
          const y = vertices.getY(i);
      
          // Set the z-value based on the elevationFunction(x, y)
          const z = this.elevationFunction(x, y);
      
          // Update the vertex z position
            vertices.setZ(i, z);
        }
        // Need to notify Three.js that the geometry's vertices have been updated
        vertices.needsUpdate = true;

        // Optionally, recompute normals for correct lighting
        geometry.computeVertexNormals();
      
        this.mesh = new THREE.Mesh(geometry, material);
    }
}