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

const directions = {
  UP: { x: 0, y: -1 },
  RIGHT: { x: 1, y: 0 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
};

function oppositDirection(d) {
  switch (d) {
    case "UP":
      return "DOWN";
    case "RIGHT":
      return "LEFT";
    case "DOWN":
      return "UP";
    case "LEFT":
      return "RIGHT";
  }
}

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
    this.tiles = [];

    for (let i = 0; i < w * h; i++) {
      this.tiles.push(tileData.get(tileTypes.UNDECIDED));
    }
  }

  tileSize() {
    return { x: width / this.w, y: height / this.h };
  }

  draw() {
    for (let i = 0; i < this.tiles.length; i++) {
      const row = floor(i / this.w);
      const col = i % this.w;
      const ts = this.tileSize();
      const x = col * ts.x;
      const y = row * ts.y;
      const tImg = this.tiles[i].image;

      image(tImg, x, y, ts.x, ts.y);
    }
  }

  setTile(idx, tile) {
    this.tiles[idx] = tile;
  }

  idxToCoord(idx) {
    return { x: idx % this.w, y: floor(idx / this.w) };
  }

  coordToIdx({ x, y }) {
    return y * this.w + x;
  }

  validCoord({ x, y }) {
    return x >= 0 && x < this.w && y >= 0 && y < this.h;
  }

  getNeighbour(idx, { x, y }) {
    const c = this.idxToCoord(idx);
    const n = { x: c.x + x, y: c.y + y };

    if (!this.validCoord(n)) return null;

    return this.coordToIdx(n);
  }

  getAllNeighbours(idx) {
    const neighbours = [];
    for (const d in directions) {
      const n = this.getNeighbour(idx, directions[d]);
      neighbours.push(n);
    }
    return neighbours;
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

    const neighbours = tileGrid.getAllNeighbours(next);

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

  collapse(idx) {
    const possibleTypes = new Set(this.types);

    for (const t of possibleTypes) {
      for (const d in directions) {
        //edge value for this tile
        const tEdge = tileData.get(t).edges[d];

        const directionOffset = directions[d];
        const neighbourIdx = tileGrid.getNeighbour(idx, directionOffset);

        if (neighbourIdx === null) continue;

        const neighbourType = tileGrid.tiles[neighbourIdx].type;

        if (neighbourType == tileTypes.UNDECIDED) continue;

        const neighbourEdge =
          tileData.get(neighbourType).edges[directions[oppositDirection(d)]];

        if (tEdge !== neighbourEdge) {
          possibleTypes.delete(t);
          break;
        }
      }
    }

    return [...possibleTypes][floor(random() * possibleTypes.size)];
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
  wfc.collapseNext();
  tileGrid.draw();

  if (wfc.open.length <= 0) noLoop();
}
