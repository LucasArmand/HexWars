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
camera.position.y = -5;

camera.rotation.x = THREE.MathUtils.degToRad(40);


const geometry = new THREE.BufferGeometry();


const RT3 = Math.sqrt(3)

let rowAxis = new THREE.Vector3(1, 0, 0);
let colAxis = new THREE.Vector3(0.5, Math.sqrt(3) / 2.0, 0);
let isIndent = false;
if (coordinate.y % 2 == 1) {
    isIndent = true;
}
let indent = isIndent ? 1: 0;
let origin = rowAxis.clone().multiplyScalar((-coordinate.y + indent) * radius * Math.sqrt(3) / 2);
return origin
    .add(rowAxis.clone().multiplyScalar(coordinate.x * radius * Math.sqrt(3))
    .add(colAxis.clone().multiplyScalar(coordinate.y * radius * Math.sqrt(3))
));

const vertices = new Float32Array( [
    0.0, 0.0, 0.0,
   -RT3, -0.5,  0.0, // v0
	0.0, -1.0,  0.0, // v1
	1.0,  1.0,  0.0, // v2
   -1.0,  1.0,  0.0, // v3
] );

const indices = [
	0, 1, 2,
	2, 3, 0,
];

geometry.setIndex( indices );
geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
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