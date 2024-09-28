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

        this.vertexShader = `
          // Vertex Shadercmd
          varying vec2 vUv; // Pass the UV coordinates to the fragment shader
          uniform sampler2D heightMap; // The heightmap texture
          uniform float displacementScale; // A scale factor to control displacement


          float gaussian(float x, float sigma) {
            return exp(- (x * x) / (2.0 * sigma * sigma)) / (2.0 * PI * sigma * sigma);
          }
          vec3 applyKernel(sampler2D sampleTexture, vec2 uv, vec2 texelSize) {
            for (float i = -kernelRadius; i <= kernelRadius; i++) {
                float weight = gaussian(i, sigma);
                vec2 offset = direction * texelSize * i;
                color += texture2D(tDiffuse, vUv + offset) * weight;
                total += weight;
            }
              return result / 9.0; // Normalize for a blur effect
          }

          void main() {
              vUv = uv; // Pass UV coordinates to the fragment shader

              // Sample the height value from the texture using the vertex UV coordinates
              vec4 heightData = vec4(applyKernel(heightMap, uv, vec2(1.0, 1.0)), 0.0);

              // Use the RGB values (or a single channel) to get the height
              float height = heightData.g; // Assuming height data is stored in the red channel

              // Displace the vertex position along the z-axis (or any axis)
              vec3 displacedPosition = position + normal * height * displacementScale;

              // Standard transformation to clip space
              gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
          }

        `;

        this.fragmentShader = `
          // Fragment Shader
          varying vec2 vUv; // Interpolated UV coordinates from the vertex shader
          uniform sampler2D heightMap;
          void main() {
              // Basic coloring (white)
              gl_FragColor = vec4(texture2D(heightMap, vUv).rgb, 1.0);
          }
        `;
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
        this.hexTarget.readP
        return this.noise.noise(10 * x, 10 * y) * 0.1;
    }

    generateTerrainMesh() {
        // Calculate the number of vertices in the x and y directions
        const widthSegments = Math.floor(this.width * this.resolutionPerUnit);
        const heightSegments = Math.floor(this.height * this.resolutionPerUnit);
      
        // Create a PlaneGeometry in the x-y plane
        const geometry = new THREE.PlaneGeometry(this.width, this.height, widthSegments, heightSegments);

        const material = new THREE.ShaderMaterial({
          uniforms: {
              heightMap: { value: this.hexTexture },  // Pass the heightmap texture
              displacementScale: { value: 5.0 }       // Adjust this to scale the height displacement
          },
          vertexShader: this.vertexShader,
          fragmentShader: this.fragmentShader,
          wireframe: false,  // Optional: show the wireframe of the plane for better visualization
      });

      this.mesh = new THREE.Mesh(geometry, material);
    }
    
    /*
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
        this.mesh = mesh;
      }
      */
}