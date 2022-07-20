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

  matches(direction, value) {
    return this.edges[direction] == value;
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

  setTile(idx, value) {
    this.tiles.setValueByIdx(idx, value);
  }
}

class WFC {
  constructor(w, h, types) {
    this.cells = new GridBuffer(w, h, () => new Set(types));
  }

  collapseNext() {
    const entropyMap = this.createEntropyMap();

    if (entropyMap.size == 0) {
      return { idx: -1, value: null };
    }

    const lowestEntropy = [...entropyMap.keys()].sort()[0];

    const lowestEntropySet = entropyMap.get(lowestEntropy);

    const i = [...lowestEntropySet][floor(random(lowestEntropySet.length))];

    const cell = this.cells.getValueByIdx(i);

    const val = [...cell][floor(random(cell.size))];

    cell.clear();
    cell.add(val);

    return { idx: i, value: val };
  }

  propagation(idx) {
    const open = [idx];
    const closed = new Set();

    while (open.length > 0) {
      const curr = open.pop();

      if (closed.has(curr)) continue;
      closed.add(curr);

      const neighbours = this.cells
        .getAllNeighbours(curr)
        .filter((x) => !closed.has(x));

      open = open.concat(neighbours);
    }
  }

  createEntropyMap() {
    const m = new Map();

    for (const i of this.cells) {
      const e = i.cellValue.size;
      const idx = i.index;

      if (e == 1) continue;

      m.has(e) ? m.set(e, [...m.get(e), idx]) : m.set(e, [idx]);
    }

    return m;
  }
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
  const w = 10;
  const h = 10;
  tileGrid = new TileGrid(w, h);
  wfc = new WFC(w, h, [
    tileTypes.UP,
    tileTypes.RIGHT,
    tileTypes.DOWN,
    tileTypes.LEFT,
    tileTypes.UP,
    tileTypes.BLANK,
  ]);
}

function draw() {
  const change = wfc.collapseNext();

  tileGrid.setTile(change.idx, change.value);

  tileGrid.draw();

  noLoop();
}
