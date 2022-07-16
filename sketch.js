let tileData;
let tileGrid;

const tileTypes = {
  UP: 0,
  RIGHT: 1,
  DOWN: 2,
  LEFT: 3,
  BLANK: 4,
  UNDECIDED: 5,
};

class Tile {
  constructor(imageRef, edges) {
    this.image = loadImage(imageRef);
    this.edges;
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
}

function preload() {
  tileData = new Map();
  tileData.set(tileTypes.UP, new Tile("tiles/up.png"), [1, 1, 0, 1]);
  tileData.set(tileTypes.RIGHT, new Tile("tiles/right.png"), [1, 1, 1, 0]);
  tileData.set(tileTypes.DOWN, new Tile("tiles/undecided.png"), [0, 1, 1, 1]);
  tileData.set(tileTypes.LEFT, new Tile("tiles/undecided.png"), [1, 0, 1, 1]);
  tileData.set(tileTypes.BLANK, new Tile("tiles/undecided.png"), [0, 0, 0, 0]);
  tileData.set(tileTypes.UNDECIDED, new Tile("tiles/undecided.png"), []);
}

function setup() {
  createCanvas(720, 720);
  tileGrid = new TileGrid(10, 10);
}

function draw() {
  tileGrid.draw();
  noLoop();
}
