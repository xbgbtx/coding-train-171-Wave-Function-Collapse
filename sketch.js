const tiles = [];
const width = 720;
const height = 720;
const tileSize = 36;
const tilesX = width / tileSize;
const tilesY = height / tileSize;

let grid;

const Tile = {
  UNDECIDED: 0,
  BLANK: 1,
  UP: 2,
  RIGHT: 3,
  DOWN: 4,
  LEFT: 5,
};

function indexFromCoords(x, y) {
  return tilesX * y + x;
}

function coordsFromIndex(i) {
  return {
    x: i % tilesX,
    y: floor(i / tilesX),
  };
}

class Cell {
  constructor(index) {
    this.index = index;
    this.possibilities = [
      Tile.BLANK,
      Tile.UP,
      Tile.RIGHT,
      Tile.DOWN,
      Tile.LEFT,
    ];
  }

  getTile() {
    if (this.possibilities.length != 1) return Tile.UNDECIDED;
    return this.possibilities[0];
  }

  entropy() {
    return this.possibilities.length;
  }

  removePossibility(p) {
    this.possibilities = this.possibilities.filter((i) => i != p);
  }
}

class WFCGrid {
  constructor() {
    this.cells = [];

    for (let i = 0; i < tilesX * tilesY; i++) {
      const cell = new Cell(i);
      this.cells.push(cell);
    }
  }

  getNumCells() {
    return this.cells.length;
  }

  getCellAtIndex(i) {
    return this.cells[i];
  }

  removePossibility(index, p) {
    let cell = this.cells[index];
    cell.removePossibility(p);
  }

  getLowestEntropy() {
    return this.cells.reduce((curr, next) => {
      let nextE = next.entropy();
      return nextE < curr ? nextE : curr;
    }, 999999);
  }

  getLowestEntropyCells() {
    let e = this.getLowestEntropy();
    return this.cells.filter((i) => i.entropy() == e);
  }
}

function preload() {
  tiles[Tile.UNDECIDED] = loadImage("tiles/undecided.png");
  tiles[Tile.BLANK] = loadImage("tiles/blank.png");
  tiles[Tile.UP] = loadImage("tiles/up.png");
  tiles[Tile.RIGHT] = loadImage("tiles/right.png");
  tiles[Tile.DOWN] = loadImage("tiles/down.png");
  tiles[Tile.LEFT] = loadImage("tiles/left.png");
}

function setup() {
  const title = "171 - Wave Function Collapse";
  document.getElementById("sketch-title").innerText = title;
  window.document.title = title;

  createCanvas(720, 720);
  grid = new WFCGrid();

  //Test collapse first cell
  grid.removePossibility(3, Tile.UP);
}

function draw() {
  for (let i = 0; i < grid.getNumCells(); i++) {
    const t = grid.getCellAtIndex(i).getTile();
    const cellCoords = coordsFromIndex(i);
    const x = cellCoords.x * tileSize;
    const y = cellCoords.y * tileSize;
    image(tiles[t], x, y, tileSize, tileSize);
  }
  noLoop();
}
