let tileData;
let tileGrid;
let wfc;

const tileTypes = {
  UP: 0,
  RIGHT: 1,
  DOWN: 2,
  LEFT: 3,
  BLANK: 4,
  UNDECIDED: 5,
};

class Tile {
  constructor(type, imageRef, edges) {
    this.type = type;
    this.image = loadImage(imageRef);
    this.edges = edges;
  }
}

class TileGrid {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.tiles = new GridBuffer(w, h, () => tileTypes.UNDECIDED);
  }

  tileSize() {
    return { x: width / this.w, y: height / this.h };
  }

  draw() {
    for (let { cellValue, coords } of this.tiles) {
      const ts = this.tileSize();
      const x = coords.x * ts.x;
      const y = coords.y * ts.y;
      const tImg = tileData.get(cellValue).image;
      image(tImg, x, y, ts.x, ts.y);
    }
  }

  setTile(idx, tile) {
    this.tiles[idx] = tile;
  }
}

class WFC {
  constructor(initialOpen, types, undecided) {
    this.open = [initialOpen];
    this.types = types;
    this.undecided = undecided;
    this.collapsed = new Set();
  }

  collapseNext() {
    const next = this.popRandomOpen();

    const neighbours = tileGrid.tiles.getAllNeighbours(next);

    const newType = this.collapse(next);
    const newTile = tileData.get(newType);
    tileGrid.setTile(next, newTile);

    for (const n of neighbours) {
      if (n === null) continue;
      if (this.collapsed.has(n)) continue;

      this.open.push(n);
    }

    this.collapsed.add(next);
  }

  popRandomOpen() {
    const r = this.open[floor(random(this.open.length))];

    this.open = this.open.filter((x) => x !== r);

    return r;
  }

  collapse(idx) {}
}

function preload() {
  tileData = new Map();
  tileData.set(
    tileTypes.UP,
    new Tile(tileTypes.UP, "tiles/up.png", {
      UP: 1,
      RIGHT: 1,
      DOWN: 0,
      LEFT: 1,
    })
  );
  tileData.set(
    tileTypes.RIGHT,
    new Tile(tileTypes.RIGHT, "tiles/right.png", {
      UP: 1,
      RIGHT: 1,
      DOWN: 1,
      LEFT: 0,
    })
  );
  tileData.set(
    tileTypes.DOWN,
    new Tile(tileTypes.DOWN, "tiles/down.png", {
      UP: 0,
      RIGHT: 1,
      DOWN: 1,
      LEFT: 1,
    })
  );
  tileData.set(
    tileTypes.LEFT,
    new Tile(tileTypes.LEFT, "tiles/left.png", {
      UP: 1,
      RIGHT: 0,
      DOWN: 1,
      LEFT: 1,
    })
  );
  tileData.set(
    tileTypes.BLANK,
    new Tile(tileTypes.BLANK, "tiles/blank.png", {
      UP: 0,
      RIGHT: 0,
      DOWN: 0,
      LEFT: 0,
    })
  );
  tileData.set(
    tileTypes.UNDECIDED,
    new Tile(tileTypes.UNDECIDED, "tiles/undecided.png"),
    []
  );
}

function setup() {
  createCanvas(720, 720);
  tileGrid = new TileGrid(10, 10);
  wfc = new WFC(
    0,
    [
      tileTypes.UP,
      tileTypes.RIGHT,
      tileTypes.DOWN,
      tileTypes.LEFT,
      tileTypes.UP,
      tileTypes.BLANK,
    ],
    tileTypes.UNDECIDED
  );
}

function draw() {
  //wfc.collapseNext();
  tileGrid.draw();

  if (wfc.open.length <= 0) noLoop();
}
