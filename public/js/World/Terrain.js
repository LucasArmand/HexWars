import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.module.js';
import { Perlin } from "./Perlin.js"


export class Terrain {
    constructor(width, height, resolutionPerUnit) {
        this.width = width;
        this.height = height;
        this.resolutionPerUnit = resolutionPerUnit;
        this.noise = new Perlin();

        this.mesh = this.generateTerrainMesh();
    }
    elevationFunction(x, y) {

        return this.noise.noise(10 * x, 10 * y) * 0.0;
    }
    generateTerrainMesh() {
        // Calculate the number of vertices in the x and y directions
        const widthSegments = Math.floor(this.width * this.resolutionPerUnit);
        const heightSegments = Math.floor(this.height * this.resolutionPerUnit);
      
        // Create a PlaneGeometry in the x-y plane
        const geometry = new THREE.PlaneGeometry(this.width, this.height, widthSegments, heightSegments);
      
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
      
        // Create a mesh with the geometry and a simple material
        const material = new THREE.MeshStandardMaterial({
          color: 0x8a7f8d,
          wireframe: false,  // Set to true for debugging
          flatShading: true  // Use flat shading for sharper edges
        });
      
        const mesh = new THREE.Mesh(geometry, material);
        return mesh;
      }
}