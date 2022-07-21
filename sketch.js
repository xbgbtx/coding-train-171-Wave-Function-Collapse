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

class WFC {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.cells = new GridBuffer(w, h, () => new Set(tileData.values()));
  }

  collapseNext() {
    const entropyMap = this.createEntropyMap();

    if (entropyMap.size == 0) return false;

    const lowestEntropy = [...entropyMap.keys()].sort()[0];

    const lowestEntropySet = entropyMap.get(lowestEntropy);

    const i = [...lowestEntropySet][floor(random(lowestEntropySet.length))];

    const cell = this.cells.getValueByIdx(i);

    const val = [...cell][floor(random(cell.size))];

    cell.clear();
    cell.add(val);

    this.propagation(i);

    return true;
  }

  propagation(idx) {
    let open = this.cells.getAllNeighbours(idx).filter((n) => n !== null);

    while (open.length > 0) {
      const curr = open.pop();

      open = open.filter((i) => i != curr);

      const possibleTiles = this.cells.getValueByIdx(curr);

      if (possibleTiles.size == 1) continue;

      for (const t of possibleTiles) {
        for (const d in directions) {
          const edge = t.edges[d];

          const nIdx = this.cells.getNeighbour(curr, directions[d]);

          if (nIdx === null) continue;

          const n = this.cells.getValueByIdx(nIdx);

          let validMatch = false;

          for (const nPossibility of n) {
            if (nPossibility.matches(oppositeDirection(d), edge)) {
              validMatch = true;
              break;
            }
          }

          if (!validMatch) {
            possibleTiles.delete(t);

            open = open.concat(
              this.cells.getAllNeighbours(idx).filter((n) => n !== null)
            );
          }
        }
      }
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

  draw() {
    const ts = { x: width / this.w, y: height / this.h };
    for (let { cellValue, coords } of this.cells) {
      const possibleTiles = cellValue;
      const x = coords.x * ts.x;
      const y = coords.y * ts.y;

      for (const t of possibleTiles) {
        const tImg = t.image;
        tint(255, 255 / possibleTiles.size);
        image(tImg, x, y, ts.x, ts.y);
      }
    }
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
}

function setup() {
  createCanvas(720, 720);
  const w = 10;
  const h = 10;
  wfc = new WFC(w, h);
}

function draw() {
  let c = wfc.collapseNext();
  wfc.draw();

  if (!c) noLoop();
}
