// PerlinGenerator.js
import { BaseGenerator } from './BaseGenerator.js';
import { Tile } from "../Tile.js";
import { PseudoTile } from '../PseudoTile.js';
import { Perlin } from '../Perlin.js';
import { WorldUtils } from '../WorldUtils.js';
import * as THREE from '../../three.module.js'
export class PerlinGenerator extends BaseGenerator {
  constructor(noiseFunctions) {
    super();
    this.perlin = new Perlin();
    this.noiseFunctions = [];
    this.generateNoiseFunctions(noiseFunctions);
  } 

  generateNoiseFunctions(noiseFunctions) {
    for (let noiseFunction of noiseFunctions) {
        this.noiseFunctions.push( (x, y) => { 
            let octave = Math.pow(2, noiseFunction.octave) * Math.PI;
            let amplitude = noiseFunction.amplitude;
            let offset = noiseFunction.offset;
            let sigma = noiseFunction.sigma;
            return Math.pow(this.perlin.noise(x * octave, y * octave), sigma) * amplitude + offset;
        }
        )
    }
  }
  generateTile(pseudoTile) {
    let elevation = 0.0;
    for (let noiseFunction of this.noiseFunctions) {
        elevation += noiseFunction(pseudoTile.coordinate[0], pseudoTile.coordinate[1]);
    }
    let newType = Tile.getTypeFromInt(Math.floor(Math.min(Math.max(elevation, 0)), 5))
    let tile = pseudoTile.realizeWithType(newType);
    return tile;
  }
  generateHexGrid(tileGrid) {
    let grid = [];
    for (let y = 0; y < tileGrid.height; y++) {
        let row = [];
        for (let x = 0; x < tileGrid.width; x++) {
            let tileCenter = WorldUtils.hexagonalToCartesian(new THREE.Vector2(x, y), tileGrid.radius);
            row.push(this.generateTile(new PseudoTile(tileCenter, [x, y], tileGrid.radius)))
        }
        grid.push(row);
    }
    return grid;
  }
}
