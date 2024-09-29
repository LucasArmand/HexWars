import * as THREE from '../three.module.js'

export class Tile {

    static HEX_VERTICES = [
        0,0,0,
        0.8660253882408142,0.5,0,
        6.123234262925839e-17,1,0,
        0,0,0,
        6.123234262925839e-17,1,0,
        -0.8660253882408142,0.5,0,
        0,0,0,
        -0.8660253882408142,0.5,0,
        -0.8660253882408142,-0.5,0,
        0,0,0,
        -0.8660253882408142,-0.5,0,
        -1.8369701465288538e-16,-1,0,
        0,0,0,
        -1.8369701465288538e-16,-1,0,
        0.8660253882408142,-0.5,0,
        0,0,0,
        0.8660253882408142,-0.5, 0,
        0.8660253882408142, 0.5, 0
    ]

    static Type = Object.freeze({
        OCEAN: 0,
        COAST: 1,
        LOWLANDS: 2,
        MIDLANDS: 3,
        HIGHLANDS: 4,
        MOUNTAINS: 5
      });

    static getTypeFromInt(value) {
        for (const key in Tile.Type) {
          if (Tile.Type[key] === value) {
            return { name: key, value: value };
          }
        }
        throw new Error("Invalid integer for Type");
    }
      

    constructor(position = new THREE.Vector3(0,0,0), coordinate=[0,0], radius=1.0, tileType=Tile.Type.LAND) {
        this.position = position;
        this.coordinate = coordinate;
        this.radius = radius;
        this.mesh = this.generateMesh();
        this.height = 0.0;
        this.type = tileType; // this is an int, with the Type object being shorthand to access int values (similar to enum).

    }

    getHeight() {
        return Math.pow(1.6, this.type) / 2 + 0.5
    }

    getColor() {
        switch (this.type) {
            case Tile.Type.OCEAN:
                return new THREE.Color(0x1E90FF); // Example ocean color (Dodger Blue)
            
            case Tile.Type.COAST:
                return new THREE.Color(0x3EB0FF); // Example coast color (Sandy Brown)
            
            case Tile.Type.LOWLANDS:
                return new THREE.Color(0x32CD32); // Example lowlands color (Lime Green)
            
            case Tile.Type.MIDLANDS:
                return new THREE.Color(0x228B22); // Example midlands color (Forest Green)
            
            case Tile.Type.HIGHLANDS:
                return new THREE.Color(0x8B4513); // Example highlands color (Saddle Brown)
            
            case Tile.Type.MOUNTAINS:
                return new THREE.Color(0xA9A9A9); // Example mountains color (Dark Gray)
            
            default:
                return new THREE.Color(0x000000); // Fallback color (Black) for unknown types
        }
    }
  

    generateMesh() {
        let vertices = [];
        for (let i = 0; i < Tile.HEX_VERTICES.length; i++) {
            vertices.push(Tile.HEX_VERTICES[i] * this.radius)
        }
        // Create BufferGeometry and assign the vertices
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    
        // Define the material for the hexagon (using basic white color)
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }); // Use DoubleSide to render both sides of the 2D hexagon
    
        // Return the mesh for rendering
        let mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(this.position.x, this.position.y, this.position.z);

        return mesh;
    }
}