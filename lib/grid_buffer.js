class GridBuffer {
  constructor(w, h, initialValue) {
    this.w = w;
    this.h = h;
    this.buffer = [];

    for (let i = 0; i < w * h; i++) this.buffer.push(initialValue);
  }

  idxToCoords(idx) {
    return { x: idx % this.w, y: floor(idx / this.w) };
  }

  coordsToIdx({ x, y }) {
    return y * this.w + x;
  }

  validCoords({ x, y }) {
    return x >= 0 && x < this.w && y >= 0 && y < this.h;
  }

  setValueByIdx(idx, value) {
    this.buffer[idx] = value;
  }

  setValueByCoords({ x, y }, value) {
    this.buffer[this.coordsToIdx] = value;
  }

  getValueByIdx(idx) {
    return this.buffer[idx];
  }

  getValueByCoords({ x, y }) {
    return this.buffer[this.coordsToIdx({ x, y })];
  }

  getNeighbour(idx, { x, y }) {
    const c = this.idxToCoords(idx);
    const n = { x: c.x + x, y: c.y + y };

    if (!this.validCoords(n)) return null;

    return this.buffer[this.coordsToIdx(n)];
  }

  getAllNeighbours(idx) {
    const neighbours = [];
    for (const d in directions) {
      const n = this.getNeighbour(idx, directions[d]);
      neighbours.push(n);
    }
    return neighbours;
  }

  [Symbol.iterator]() {
    let i = 0;
    let _buffer = this.buffer;
    return {
      next: () => ({
        value: {
          cellValue: _buffer[i],
          coords: this.idxToCoords(i),
        },
        done: !(i++ in _buffer),
      }),
    };
  }
}

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
