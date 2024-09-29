// WaveFunctionGenerator.js
import { BaseGenerator } from './BaseGenerator.js';
import { Tile } from "../Tile.js";
import { PseudoTile } from '../PseudoTile.js';
import { WorldUtils } from '../WorldUtils.js';
import * as THREE from '../../three.module.js'

export class WaveFunctionGenerator extends BaseGenerator {
  constructor() {
    super();
    // OCEAN, COAST, LOWLAND, MIDLAND, HIGHLAND, MOUNTAIN
    this.transitionMatrix = 
   [[0.95, 0.05, 0.  , 0.  , 0.  , 0 ], // OCEAN 
    [0.05, 0.45 ,0.50, 0.  , 0.  , 0. ], // COAST
    [0.0 , 0.1 , 0.8 , 0.1 , 0.  , 0. ], // LOWLAND
    [0.0 , 0.0 , 0.3 , 0.4 , 0.3, 0.0], // MIDLAND
    [0.0 , 0.0 , 0.0 , 0.5 , 0.3 , 0.2], // HIGHLAND
    [0.0 , 0.0 , 0.0 , 0.0 , 0.5 , 0.5] // MOUNTAIN
  ]

  } 

  generateTile(pseudoTile) {
      let basisTile = pseudoTile.getRandomAdjacentTile();
   /* let probabilities = [1, 1, 1, 1, 1, 1];
    //for (let adjacentTile of pseudoTile.adjacentTiles) {
      let row = this.transitionMatrix[adjacentTile.type];
      for (let i = 0; i < 6; i++) {
        probabilities[i] *= row[i];
      }
    //}
    /*
    let total = 0;
    for (let i = 0; i < 6; i++) {
      total += probabilities[i] + 0.01;
    }
    for (let i = 0; i < 6; i++) {
      probabilities[i] = (probabilities[i] + 0.01)  / total;
    }
    console.log(probabilities)
    // Implement your tile generation logic here
    
    */
    let newType = Tile.getTypeFromInt(this.getRandomIndex(this.transitionMatrix[basisTile.type]));
    let tile = pseudoTile.realizeWithType(newType);
    return tile;
  }

  generateHexGrid(tileGrid) {
    const MAX_ITERS = 10_000;
    let iter = 0;
    const oddNeighborOffsets = [[0, -1], [1, -1], [-1, 0], [1, 0], [0, 1], [1, 1]]
    const evenNeighborOffsets = [[-1, -1], [0, -1], [-1, 0], [1, 0], [-1, 1], [0, 1]]
    // list of unsearched tiles
    let freshTiles = [];
    let generatedTileCount = 0;
    let grid = [];
    let coveredCoordinates = [];
    // Initalize freshTiles stack and populate grid 2D-array with fixed tiles
    for (let y = 0; y < tileGrid.height; y++) {
        let row = [];
        for (let x = 0; x < tileGrid.width; x++) {
            if (tileGrid.fixedTiles[y][x]) {
                freshTiles.push(tileGrid.fixedTiles[y][x])
                coveredCoordinates.push([x, y]);
                generatedTileCount++;
            }
            row.push(tileGrid.fixedTiles[y][x])
        }
        grid.push(row)
    }

     // list of all possible pseudoTiles that might be generated this iteration
    let newPseudoTiles = [];
    console.log(grid)

    // While there are tiles to be generated (and less than MAX_ITERS to prevent infinite in degenerate case).
    while (generatedTileCount < tileGrid.height * tileGrid.width && iter < MAX_ITERS) {
          iter += 1;
          // search any new tiles that have been generated
          while (freshTiles.length > 0) {
            // get next tile to generated stack, 
            let tile = freshTiles.pop();
            let coordinate = tile.coordinate;
            let offsetSet;
            if (coordinate[1] % 2 == 0) {
                offsetSet = evenNeighborOffsets;
            } else {
                offsetSet = oddNeighborOffsets;
            }
            // generate "new coordinates", an array of all possible new tiles to generate
            for (let offset of offsetSet) {
                let newCoordinate = [coordinate[0] + offset[0], coordinate[1] + offset[1]];   
                if (newCoordinate[0] >= 0 && newCoordinate[0] < tileGrid.width && newCoordinate[1] >= 0 && newCoordinate[1] < tileGrid.height) {         
                    // Tile hasn't been generated
                    if (grid[newCoordinate[0]][newCoordinate[1]] == null) {
                      // PseudoTile hasn't been created yet
                      let tileCenter = WorldUtils.hexagonalToCartesian(new THREE.Vector2(newCoordinate[0], newCoordinate[1]), tileGrid.radius);
                      let pseudoTile = new PseudoTile(tileCenter, newCoordinate, tileGrid.radius);
                      pseudoTile.addAdjacentTile(tile, coordinate)
                      newPseudoTiles.push(pseudoTile);
                      grid[newCoordinate[0]][newCoordinate[1]] = pseudoTile;
                    }
                    else if (grid[newCoordinate[0]][newCoordinate[1]] instanceof PseudoTile) {
                      // PseudoTile already exists, so add this tile as an adjacent.
                      grid[newCoordinate[0]][newCoordinate[1]].addAdjacentTile(tile, coordinate);
                    }
                }
            }
          }
      
        // choose random new coordinate to generate
        if (newPseudoTiles.length < 1) {
          return grid;
        }

        newPseudoTiles = tileGrid.shuffleArray(newPseudoTiles);
        let pseudoTile = newPseudoTiles.pop();
        // generate randomly selected coordinate
        let newTile = this.generateTile(pseudoTile);
        generatedTileCount++;
        grid[newTile.coordinate[0]][newTile.coordinate[1]] = newTile;
        freshTiles.push(newTile);

    }
    return grid;
  }

}
