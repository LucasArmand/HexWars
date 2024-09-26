import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.module.js';

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

    constructor(position=new THREE.Vector3(0,0,0), radius=1.0) {
        this.position = position;
        this.radius = radius;
        this.mesh = this.generateMesh();

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