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
        //console.log(this.tileGrid.cartesianToTile(x, y))
        let tile = this.tileGrid.cartesianToTile(x, y);
        if (tile) {
          let landHeight = 1//this.tileGrid.hexInterpolate(new THREE.Vector3(x, y, 0), (tile) => {return 1}, 3);
          return landHeight// + this.noise.noise(10 * x, 10 * y) * 0.1;;
        }
        return 0.0;
        return this.noise.noise(10 * x, 10 * y) * 0.1;
    }

    generateTerrainMesh() {
        // Calculate the number of vertices in the x and y directions
        const widthSegments = Math.floor(this.width * this.resolutionPerUnit);
        const heightSegments = Math.floor(this.height * this.resolutionPerUnit);
      
        // Create a PlaneGeometry in the x-y plane
        const geometry = new THREE.PlaneGeometry(this.width, this.height, widthSegments, heightSegments);

        const material = new THREE.MeshStandardMaterial({
            vertexColors: true,
           // flatShading: true
        });

      // Access the vertices of the geometry and modify the z-value using elevationFunction
      const vertices = geometry.attributes.position;
      const colors = new Float32Array(vertices.count * 3);
    
      for (let i = 0; i < vertices.count; i++) {
          // Get the current vertex position (x, y)
          let x = vertices.getX(i);
          let y = vertices.getY(i);

          x += this.width / 2 - Math.sqrt(3) / 2;
          y += this.height / 2 - 1;
      
          // Set the z-value based on the elevationFunction(x, y)
          const z = this.elevationFunction(x, y);
          let tile = this.tileGrid.cartesianToTile(x, y);
          if (tile) {
            colors[i * 3] = color.r; 
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
          }
          // Update the vertex z position
          vertices.setZ(i, z);
        }
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Need to notify Three.js that the geometry's vertices have been updated
        vertices.needsUpdate = true;
        geometry.attributes.color.needsUpdate = true;

        // Optionally, recompute normals for correct lighting
        geometry.computeVertexNormals();
      
        this.mesh = new THREE.Mesh(geometry, material);
    }
}