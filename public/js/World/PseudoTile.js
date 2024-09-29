import { Tile } from "./Tile.js"

export class PseudoTile {

    constructor(position, coordinate, radius = 1.0) {
        this.coordinate = coordinate;
        this.position = position;
        this.adjacentCoordinates = [];
        this.adjacentTiles = [];
    }

    addAdjacentTile(tile, coordinate) {
        this.adjacentTiles.push(tile);
        this.adjacentCoordinates.push(coordinate);
    }

    getRandomAdjacentTile() {
        let index = Math.floor(Math.random() * this.adjacentTiles.length);
        return this.adjacentTiles[index];
    }

    realizeWithType(type) {
        return new Tile(this.position, this.coordinate, this.radius, type.value);
    }
}