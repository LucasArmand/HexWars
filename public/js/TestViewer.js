import * as THREE from './three.module.js'
import { CameraControls } from './CameraControls.js';
import { Tile } from './World/Tile.js'
import { WorldUtils } from "./World/WorldUtils.js"
import { Terrain } from "./World/Terrain.js"
import { TileGrid } from './World/TileGrid.js'
import { Perlin } from "./World/Perlin.js"
import { WaveFunctionGenerator } from './World/Generation/WaveFunctionGenerator.js';
import { PerlinGenerator } from './World/Generation/PerlinGenerator.js';
import * as BufferGeometryUtils from './BufferGeometryUtils.js'


let scene = new THREE.Scene();

let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Get the canvas element and its parent div
const canvas = document.querySelector('canvas');
const canvasDiv = document.querySelector('.canvas-div');

// Create a renderer and attach it to the canvas
let renderer = new THREE.WebGLRenderer({ canvas });
 // Set the initial size of the canvas based on the canvas-div
scene.background = new THREE.Color(0x000000); // Set background color for the scene
camera.position.z = 5;
camera.position.y = -5;

camera.rotation.x = THREE.MathUtils.degToRad(40);


const early_geometry = new THREE.BufferGeometry();


let radius = 1;
const RT3 = Math.sqrt(3)


const vertices_arr = []; //new Float32Array( Tile.HEX_VERTICES );

function getSubtriangles(tri, level, triValues) {
    if (level == 0) {
        return [tri];
    }
    else {
        let ab = tri.a.clone().lerp(tri.b, 0.5);
        let bc = tri.b.clone().lerp(tri.c, 0.5);
        let ca = tri.c.clone().lerp(tri.a, 0.5);
    
        let a_tri = new THREE.Triangle(tri.a, ab, ca);
        let b_tri = new THREE.Triangle(ab, tri.b, bc);
        let c_tri = new THREE.Triangle(ca, bc, tri.c);
        let mid_tri = new THREE.Triangle(ab, bc, ca);
        const triangles = [a_tri, b_tri, c_tri, mid_tri]; 
        const subtriangles = [];
        for (let tri of triangles) {
            subtriangles.push(...getSubtriangles(tri, level - 1))
        }
        return subtriangles;
    }    
}

function interpolateValues(values, coordinate, offsetSet, index) {
    const present = [values[coordinate.x][coordinate.y]];
    if (values[coordinate.x + offsetSet[index][0]] != null && values[coordinate.x + offsetSet[index][0]][coordinate.y + offsetSet[index][1]] != null) {
        present.push(values[coordinate.x + offsetSet[index][0]][coordinate.y + offsetSet[index][1]]);
    }
    if (values[coordinate.x + offsetSet[(index + 1) % 6][0]] != null && values[coordinate.x + offsetSet[(index + 1) % 6][0]][coordinate.y + offsetSet[(index + 1) % 6][1]] != null) {
        present.push(values[coordinate.x + offsetSet[(index + 1) % 6][0]][coordinate.y + offsetSet[(index + 1) % 6][1]]);
    }
    let sum = 0
    for (let v of present) {
        sum += v;
    }
    return sum / present.length;
}

function generateHexTris(position, coordinate, level, values) {
    const vertices = [];
    const triangles = [];
    // These start from the upper-right neighbor and go clockwise. ORDER MATTERS
    const oddNeighborOffsets = [[1, 1],[1, 0], [1, -1], [0, -1], [-1, 0], [0, 1]]
    const evenNeighborOffsets = [[0, 1], [1, 0], [0, -1], [-1, -1], [-1, 0], [-1, 1]]
    let offsetSet;
    if (coordinate.y % 2 == 0) {
        offsetSet = evenNeighborOffsets;
    } else {
        offsetSet = oddNeighborOffsets;
    }
    let interpolatedValues = [];
    for (let i = 0; i < 6; i++) {
        interpolatedValues.push(interpolateValues(values, coordinate, offsetSet, i));// Middle, Upper Right, Right
    }

    for (let i = 0; i < Tile.HEX_VERTICES.length; i+= 9) {
        let triangle = new THREE.Triangle(
            new THREE.Vector3(Tile.HEX_VERTICES[i],Tile.HEX_VERTICES[i + 1], Tile.HEX_VERTICES[i + 2]),
            new THREE.Vector3(Tile.HEX_VERTICES[i + 3], Tile.HEX_VERTICES[i + 4], Tile.HEX_VERTICES[i + 5]),
            new THREE.Vector3(Tile.HEX_VERTICES[i + 6],Tile.HEX_VERTICES[i + 7], Tile.HEX_VERTICES[i + 8])
        )
        let offsetSet;
        // This is the value for a, b, and c of the triangle
        let triIndex = Math.round(i/9);
        let triValues = [values[coordinate.x][coordinate.y], interpolatedValues[triIndex],interpolatedValues[(triIndex + 1) % 6]]
        let up = new THREE.Vector3(0, 0, 0.3);
        triangle.a.add(position);
        triangle.a.add(up.clone().multiplyScalar(triValues[0]))
        triangle.b.add(position);
        triangle.b.add(up.clone().multiplyScalar(triValues[1]))
        triangle.c.add(position);
        triangle.c.add(up.clone().multiplyScalar(triValues[2]))
        triangles.push(...getSubtriangles(triangle, level, triValues));
    }
    for (let tri of triangles) {
        vertices.push(...tri.a, ...tri.b, ...tri.c);
    }
    return vertices
}

function generateHexTerrainMesh(width, height, level, values) {
    const vertices = [];
    let rowAxis = new THREE.Vector3(1, 0, 0);
    let colAxis = new THREE.Vector3(0.5, Math.sqrt(3) / 2.0, 0);
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            let coordinate = new THREE.Vector2(i, j);
            let isIndent = false;
            if (coordinate.y % 2 == 1) {
                isIndent = true;
            }
            let indent = isIndent ? 1: 0;
            let origin = rowAxis.clone().multiplyScalar((-coordinate.y + indent) * radius * Math.sqrt(3) / 2);
            let position = origin
                    .add(rowAxis.clone().multiplyScalar(coordinate.x * radius * Math.sqrt(3))
                    .add(colAxis.clone().multiplyScalar(coordinate.y * radius * Math.sqrt(3))));
            vertices.push(...generateHexTris(position, coordinate, level, values))
        }
    }
    return vertices;    
}
let width = 20;
let height = 20;
let noise = new Perlin();
let values = []
for (let i = 0; i < width; i++){
    let row = [];
    for (let j = 0; j < height; j++) {
        row.push(noise.noise((i * 5) / width, (j * 5) / height) * 10);
    }
    values.push(row);
}
console.log(values)
const vertices = new Float32Array(generateHexTerrainMesh(width, height, 1, values));

early_geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

console.log(early_geometry.attributes.position.count)
const geometry = BufferGeometryUtils.mergeVertices(early_geometry)
console.log(geometry.attributes.position.count)

const material = new THREE.MeshBasicMaterial( { color: 0xff0000 , wireframe: true} );
const mesh = new THREE.Mesh( geometry, material );

scene.add(mesh)


const cameraControls = new CameraControls(camera, 0.1);

const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

  // Create a directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // White light with intensity 1
directionalLight.position.set(0,0,15);
directionalLight.target.position.set(5, 0, 0);

scene.add(directionalLight);

// Listen for window resize and adjust the canvas size
resizeCanvas();
window.addEventListener('resize', resizeCanvas);


function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

    // Update camera position
    cameraControls.updateCameraPosition();

    // Retrieve and log the camera position (if needed)
    const cameraPosition = cameraControls.getCameraPosition();
}

// Function to resize the renderer based on canvas-div size
function resizeCanvas() {
    const width = canvasDiv.clientWidth;
    const height = canvasDiv.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

animate();