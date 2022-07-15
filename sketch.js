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

function indexFromCoords({ x, y }) {
  return tilesX * y + x;
}

function coordsFromIndex(i) {
  return {
    x: i % tilesX,
    y: floor(i / tilesX),
  };
}
function validCoords({ x, y }) {
  return x >= 0 && x < tilesX && y >= 0 && y < tilesY;
}

class Cell {
  constructor() {
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
      const cell = new Cell();
      this.cells.push(cell);
    }

    this.open = [floor(random(this.cells.length))];
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

  getEntropyMap(cellIndexes) {
    return cellIndexes.reduce((entropyMap, cellIdx) => {
      const e = this.cells[cellIdx].entropy();

      entropyMap.has(e)
        ? entropyMap.get(e).push(cellIdx)
        : entropyMap.set(e, [cellIdx]);

      return entropyMap;
    }, new Map());
  }

  collapseNext() {
    if (this.open.length <= 0) return false;

    const entropyMap = this.getEntropyMap(this.open);

    const sortedEntropyKeys = Array.from(entropyMap.keys())
      .filter((k) => k > 1)
      .sort((k1, k2) => k1 - k2);

    if (sortedEntropyKeys.size < 1) return false;

    const lowestEntropy = sortedEntropyKeys[0];

    if (lowestEntropy <= 1) return false;

    const candidates = entropyMap.get(lowestEntropy);
    const c = random(candidates);

    this.cells[c].collapse();
    this.open = this.open.filter((i) => i !== c);

    const neighbours = this.neighbours(c).filter(
      (x) => this.cells[x].entropy() > 1
    );

    this.open = this.open.concat(neighbours);

    return true;
  }

  neighbours(cellIdx) {
    const neighbourhood = [
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
    ];

    const cellCoords = coordsFromIndex(cellIdx);

    const cellNeighbourhood = neighbourhood
      .map((n) => ({
        x: n.x + cellCoords.x,
        y: n.y + cellCoords.y,
      }))
      .filter((c) => validCoords(c));

    return cellNeighbourhood.map((c) => indexFromCoords(c));
  }
}

function preload() {
  Tile.UNDECIDED.image = loadImage("tiles/undecided.png");
  Tile.BLANK.image = loadImage("tiles/blank.png");
  Tile.UP.image = loadImage("tiles/up.png");
  Tile.RIGHT.image = loadImage("tiles/right.png");
  Tile.DOWN.image = loadImage("tiles/down.png");
  Tile.LEFT.image = loadImage("tiles/left.png");
}

function setup() {
  const title = "171 - Wave Function Collapse";
  document.getElementById("sketch-title").innerText = title;
  window.document.title = title;

  createCanvas(720, 720);
  grid = new WFCGrid();
  grid.collapseNext();
}

function draw() {
  const status = grid.collapseNext();

  for (let i = 0; i < grid.getNumCells(); i++) {
    const t = grid.getCellAtIndex(i).getTile();
    const cellCoords = coordsFromIndex(i);
    const x = cellCoords.x * tileSize;
    const y = cellCoords.y * tileSize;
    image(t.image, x, y, tileSize, tileSize);
  }

  if (status == false) noLoop();
}
