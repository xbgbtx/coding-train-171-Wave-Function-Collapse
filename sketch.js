const width = 720;
const height = 720;
const tileSize = 36;
const tilesX = width / tileSize;
const tilesY = height / tileSize;

let grid;

const Tile = {
  UNDECIDED: {
    image: null,
  },
  BLANK: {
    image: null,
  },
  UP: {
    image: null,
  },
  RIGHT: {
    image: null,
  },
  DOWN: {
    image: null,
  },
  LEFT: {
    image: null,
  },
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

  collapse() {
    const c = random(this.possibilities);
    this.possibilities = [c];
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

  getEntropyMap() {
    return this.cells.reduce((entropyMap, cell) => {
      const e = cell.entropy();

      entropyMap.has(e)
        ? entropyMap.get(e).push(cell)
        : entropyMap.set(e, [cell]);

      return entropyMap;
    }, new Map());
  }

  collapseNext() {
    const entropyMap = this.getEntropyMap();

    const sortedEntropyKeys = Array.from(entropyMap.keys())
      .filter((k) => k > 1)
      .sort((k1, k2) => k1 - k2);

    const lowestEntropy = sortedEntropyKeys[0];

    if (lowestEntropy <= 1) return false;

    const candidates = entropyMap.get(lowestEntropy);
    console.log(candidates[0]);
    const c = random(candidates);

    c.collapse();
    return true;
  }
}

function preload() {
  Tile[Tile.UNDECIDED].image = loadImage("tiles/undecided.png");
  Tile[Tile.BLANK].image = loadImage("tiles/blank.png");
  Tile[Tile.UP].image = loadImage("tiles/up.png");
  Tile[Tile.RIGHT].image = loadImage("tiles/right.png");
  Tile[Tile.DOWN].image = loadImage("tiles/down.png");
  Tile[Tile.LEFT].image = loadImage("tiles/left.png");
}

function setup() {
  const title = "171 - Wave Function Collapse";
  document.getElementById("sketch-title").innerText = title;
  window.document.title = title;

  createCanvas(720, 720);
  grid = new WFCGrid();

  //Test collapse first cell
  grid.collapseNext();
}

function draw() {
  const status = grid.collapseNext();

  for (let i = 0; i < grid.getNumCells(); i++) {
    const t = grid.getCellAtIndex(i).getTile();
    const cellCoords = coordsFromIndex(i);
    const x = cellCoords.x * tileSize;
    const y = cellCoords.y * tileSize;
    image(Tile[t].image, x, y, tileSize, tileSize);
  }

  if (status == false) noLoop();
}
