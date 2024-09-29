// ContinentsGeneration.js
import { BaseGenerator } from './BaseGenerator.js';
import { Tile } from "../Tile.js";
import { PseudoTile } from '../PseudoTile.js';

export class ContinentsGenerator extends BaseGenerator {
  constructor() {
    super();
    // OCEAN, COAST, LOWLAND, MIDLAND, HIGHLAND, MOUNTAIN
    this.transitionMatrix = 
   [[0.99, 0.01, 0, 0, 0, 0], // OCEAN 
    [0.45, 0.1, 0.45, 0, 0, 0], // COAST
    [0.0, 0.1,0.6, 0.2, 0, 0], // LOWLAND
    [0.0, 0.0, 0.3, 0.4, 0.3, 0.0], // MIDLAND
    [0.0, 0.0, 0.0, 0.3, 0.4, 0.3], // HIGHLAND
    [0.0, 0.0, 0.0, 0.0, 0.7, 0.3] // MOUNTAIN
  ]

  } 

  generateTile(pseudoTile) {
    let probabilities = [0, 0, 0, 0, 0, 0];
    for (let adjacentTile of pseudoTile.adjacentTiles) {
      let row = this.transitionMatrix[adjacentTile.type];
      console.log(adjacentTile.type)
      for (let i = 0; i < 6; i++) {
        probabilities[i] += row[i] / 6.0;
      }
    }
    // Implement your tile generation logic here
    let newType = Tile.getTypeFromInt(this.getRandomIndex(probabilities));
    let tile = pseudoTile.realizeWithType(newType);
    return tile;
  }
}
