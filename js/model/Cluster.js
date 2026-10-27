import Grid from './Grid.js';


class Cluster {
  constructor(grid) {
    this.grid = grid;
    this.labels = new Int32Array(grid.cells.length).fill(-1);
    this.sizes = [];
    this.touchesTop = [];
    this.touchesBottom = [];
    this.touchesLeft = [];
    this.touchesRight = [];
    this.spanningId = -1;
    this.numClusters = 0;
    this._run();
  }

  _run() {
    const { grid } = this;
    const L = grid.L;
    const stack = []; // обход в глубину (DFS)

    for (let start = 0; start < grid.cells.length; start++) {
      if (grid.cells[start] === 0 || this.labels[start] !== -1) continue;

      stack.length = 0;
      stack.push(start);
      this.labels[start] = this.numClusters;

      let size = 0;
      let tTop = false, tBot = false, tLeft = false, tRight = false;

      while (stack.length) {
        const idx = stack.pop();
        size++;
        const x = idx % L;
        const y = (idx / L) | 0;

        if (y === 0) tTop = true;
        if (y === L - 1) tBot = true;
        if (x === 0) tLeft = true;
        if (x === L - 1) tRight = true;

        const nb = grid.neighbors(idx);
        for (let k = 0; k < nb.length; k++) {
          const n = nb[k];
          if (grid.cells[n] === 1 && this.labels[n] === -1) {
            this.labels[n] = this.numClusters;
            stack.push(n);
          }
        }
      }

      this.sizes.push(size);
      this.touchesTop.push(tTop);
      this.touchesBottom.push(tBot);
      this.touchesLeft.push(tLeft);
      this.touchesRight.push(tRight);
      this.numClusters++;
    }

    this._findSpanning();
  }

  _findSpanning() {
    for (let id = 0; id < this.numClusters; id++) {
      if ((this.touchesTop[id] && this.touchesBottom[id]) ||
          (this.touchesLeft[id] && this.touchesRight[id])) {
        this.spanningId = id;
        return;
      }
    }
  }

  hasSpanning() { return this.spanningId >= 0; }
  maxSize() { return this.sizes.length ? Math.max(...this.sizes) : 0; }
}


export default Cluster;
