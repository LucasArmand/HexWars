import * as THREE from './three.module.js'
import { CameraControls } from './CameraControls.js';
import { Tile } from './World/Tile.js'
import { WorldUtils } from "./World/WorldUtils.js"
import { Terrain } from "./World/Terrain.js"
import { TileGrid } from './World/TileGrid.js'
import { Perlin } from "./World/Perlin.js"
import { WaveFunctionGenerator } from './World/Generation/WaveFunctionGenerator.js';
import { PerlinGenerator } from './World/Generation/PerlinGenerator.js';


let scene = new THREE.Scene();

let width = 5
let height = 5
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Get the canvas element and its parent div
const canvas = document.querySelector('canvas');
const canvasDiv = document.querySelector('.canvas-div');

// Create a renderer and attach it to the canvas
let renderer = new THREE.WebGLRenderer({ canvas });
 // Set the initial size of the canvas based on the canvas-div
scene.background = new THREE.Color(0x000000); // Set background color for the scene
camera.position.z = 5;

camera.rotation.x = THREE.MathUtils.degToRad(40);

let tileRadius = 1.0;

let terrainSize = WorldUtils.calculateTerrainSize(height, width)
let terrainOrigin = new THREE.Vector2(-Math.sqrt(3)/ 2, -1);

let terrain = new Terrain(terrainSize.x, terrainSize.y, 10);

let grid = new TileGrid(width, height, 1.0);

terrain.attatchTileGrid(grid);

let fixedTiles = [new Tile(new THREE.Vector3(), [2, 2], tileRadius, Tile.Type.MIDLANDS )];
for (let y = 0; y < height; y++) {
    fixedTiles.push(new Tile(new THREE.Vector3(), [0, y], tileRadius, Tile.Type.OCEAN ))
    fixedTiles.push(new Tile(new THREE.Vector3(), [width - 1, y], tileRadius, Tile.Type.OCEAN ))
}
for (let x = 1; x < width - 1; x++) {
    fixedTiles.push(new Tile(new THREE.Vector3(), [x, 0], tileRadius, Tile.Type.OCEAN ))
    fixedTiles.push(new Tile(new THREE.Vector3(), [x, height - 1], tileRadius, Tile.Type.OCEAN ))
}
grid.setFixedTiles(fixedTiles)

let noiseFunctions = [
    {
        octave: -6,
        amplitude: 4,
        sigma: 1,
        offset: 2
    }
]

//let generator = new PerlinGenerator(noiseFunctions);
let generator = new WaveFunctionGenerator();
grid.generateHexGrid(generator);
for (let row of grid.grid) {
    for (let tile of row) {
        scene.add(tile.mesh);
    }
}

grid.lerpTiles(new THREE.Vector3(2.2, 2, 0), (tile) => {return tile.mesh.material.color.g});

/* USE THIS TO DEBUG WITH RED MARKER SPHERES */
let markerPositions = []
//markerPositions = WorldUtils.getHexCentersWithinRadius(new THREE.Vector3(10, 10, 0), 8);
const markerGeometry = new THREE.SphereGeometry(0.1, 32, 32);  // Small sphere
const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red color
for (let position of markerPositions) {
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.set(position.x, position.y, position.z);
    scene.add(marker)
}



terrain.hexTexture = grid.renderHexTexture(renderer);
terrain.generateTerrainMesh();

terrain.mesh.position.set(terrainSize.x / 2 + terrainOrigin.x, terrainSize.y / 2 + terrainOrigin.y,  0);

scene.add(terrain.mesh);

camera.position.x = terrainSize.x / 2 + terrainOrigin.x;
camera.position.y = terrainSize.y / 2 + terrainOrigin.y - 5;


const cameraControls = new CameraControls(camera, 0.1);

const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

  // Create a directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // White light with intensity 1

// Set the light position
directionalLight.position.set(0,0,15); // Positioned at (x: 50, y: 50, z: 50)

// Optionally, set the direction it points towards (default is toward the origin)
directionalLight.target.position.set(5, 0, 0);

// Add the light to the scene
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