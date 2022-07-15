const width = 720;
const height = 720;
const tileSize = 36;
const tilesX = width / tileSize;
const tilesY = height / tileSize;

let grid;

const Tile = {
  UNDECIDED: {
    imageRef: "tiles/undecided.png",
    image: null,
  },
  BLANK: {
    imageRef: "tiles/blank.png",
    image: null,
  },
  UP: {
    imageRef: "tiles/up.png",
    image: null,
  },
  RIGHT: {
    imageRef: "tiles/right.png",
    image: null,
  },
  DOWN: {
    imageRef: "tiles/down.png",
    image: null,
  },
  LEFT: {
    imageRef: "tiles/left.png",
    image: null,
  },
};

const neighbourhood = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
];

const invalidNeighbour = {};

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

    const neighbours = this.neighbours(c);

    this.cells[c].collapse(neighbours);
    this.open = this.open.filter((i) => i !== c);

    const nextOpen = neighbours.filter(
      (x) => x !== invalidNeighbour && this.cells[x].entropy() > 1
    );

    this.open = this.open.concat(nextOpen);

    return true;
  }

  neighbours(cellIdx) {
    const cellCoords = coordsFromIndex(cellIdx);

    const cellNeighbourhood = neighbourhood
      .map((n) => ({
        x: n.x + cellCoords.x,
        y: n.y + cellCoords.y,
      }))
      .map((n) => (validCoords(n) ? indexFromCoords(n) : invalidNeighbour));

    return cellNeighbourhood;
  }
}

function preload() {
  for (t in Tile) {
    Tile[t].image = loadImage(Tile[t].imageRef);
  }
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
