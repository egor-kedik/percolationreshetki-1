const TYPES = ['square', 'triangular', 'honeycomb', 'cubic', 'bcc', 'fcc'];

class Grid {
  constructor(L, p, type = 'square') {
    this.L = L;
    this.p = p;
    this.type = TYPES.includes(type) ? type : 'square';
    this.cells = this._generate();
    this.positions = this._positions();
    this._neighbors = this._buildNeighbors();
    this.edges = this._buildEdges();
  }

  _generate() {
    const cells = new Uint8Array(this.L * this.L);
    for (let i = 0; i < cells.length; i++) cells[i] = Math.random() < this.p ? 1 : 0;
    return cells;
  }

  _positions() {
    const L = this.L, out = [];
    for (let y = 0; y < L; y++) for (let x = 0; x < L; x++) {
      let px = x, py = y;
      if (this.type === 'triangular') px += (y % 2) * 0.5;
      if (this.type === 'honeycomb') px += (y % 2) * 0.5;
      // 3D lattices are shown as conventional 2D projections to keep the model inspectable.
      if (this.type === 'cubic' || this.type === 'bcc' || this.type === 'fcc') {
        px = x + y * 0.34; py = y * 0.82;
      }
      out.push({ x: px, y: py });
    }
    return out;
  }

  _buildNeighbors() {
    const L = this.L, all = Array.from({ length: L * L }, () => []);
    const add = (a, b) => { if (b >= 0 && b < L * L && !all[a].includes(b)) all[a].push(b); };
    for (let y = 0; y < L; y++) for (let x = 0; x < L; x++) {
      const i = y * L + x;
      // Horizontal bonds are common to the 2D schematic representations.
      if (x > 0) add(i, i - 1);
      if (x < L - 1) add(i, i + 1);
      if (this.type !== 'honeycomb' || y % 2 === (x % 2)) {
        if (y > 0) add(i, i - L);
        if (y < L - 1) add(i, i + L);
      }
      if (this.type === 'triangular') {
        if (y > 0 && x > 0 && y % 2 === 0) add(i, i - L - 1);
        if (y > 0 && x < L - 1 && y % 2 === 1) add(i, i - L + 1);
      }
      if (this.type === 'bcc' || this.type === 'fcc') {
        if (y > 0 && x > 0) add(i, i - L - 1);
        if (y < L - 1 && x < L - 1) add(i, i + L + 1);
        if (this.type === 'fcc' && y > 0 && x < L - 1) add(i, i - L + 1);
        if (this.type === 'fcc' && y < L - 1 && x > 0) add(i, i + L - 1);
      }
    }
    // Make adjacency symmetric.
    all.forEach((list, i) => list.slice().forEach(j => { if (!all[j].includes(i)) all[j].push(i); }));
    return all;
  }

  _buildEdges() {
    const edges = [];
    this._neighbors.forEach((list, i) => list.forEach(j => { if (j > i) edges.push([i, j]); }));
    return edges;
  }

  neighbors(idx) { return this._neighbors[idx] || []; }
  getOccupiedRatio() { let count = 0; for (const c of this.cells) count += c; return count / this.cells.length; }
}

export default Grid;
