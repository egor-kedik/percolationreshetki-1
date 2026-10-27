import Grid from './Grid.js';
import Cluster from './Cluster.js';
import Statistics from './Statistics.js';



class PercolationModel {
  constructor({ L = 30, p = 0.5, lattice = 'square' } = {}) {
    this.L = Math.max(2, Math.min(30, Math.trunc(Number(L) || 30)));
    this.p = p;
    this.lattice = lattice;
    this.grid = null;
    this.cluster = null;
    this.stats = null;
    this._listeners = [];
    this.PC = 0.5927; // порог для квадратной решётки
  }

  subscribe(fn) {
    this._listeners.push(fn);
    return () => {
      this._listeners = this._listeners.filter(f => f !== fn);
    };
  }

  _emit() {
    const payload = this.snapshot();
    this._listeners.forEach(fn => fn(payload));
  }

  snapshot() {
    return {
      L: this.L,
      p: this.p,
      lattice: this.lattice,
      pc: this.PC,
      grid: this.grid,
      cluster: this.cluster,
      stats: this.stats ? this.stats.toObject() : null,
    };
  }

  setLattice(type) { this.lattice = type; this.regenerate(); }

  setP(p) {
    this.p = Math.max(0, Math.min(1, p));
    this.regenerate();
  }

  setL(L) {
    this.L = Math.max(2, Math.min(30, Math.trunc(Number(L) || 30)));
    this.regenerate();
  }

  regenerate() {
    this.grid = new Grid(this.L, this.p, this.lattice);
    this.cluster = new Cluster(this.grid);
    this.stats = new Statistics(this.grid, this.cluster);
    this._emit();
  }

  // --- Порядок обхода кластера для анимации ---
  getGrowthOrder(startIdx) {
    const grid = this.grid;
    if (!grid || grid.cells[startIdx] === 0) return [];

    const L = grid.L;
    const visited = new Uint8Array(L * L);
    const order = [];
    const queue = [startIdx];
    visited[startIdx] = 1;

    while (queue.length) {
      const idx = queue.shift();
      order.push(idx);
      const nb = grid.neighbors(idx);
      for (let k = 0; k < nb.length; k++) {
        const n = nb[k];
        if (grid.cells[n] === 1 && !visited[n]) {
          visited[n] = 1;
          queue.push(n);
        }
      }
    }
    return order;
  }

  // Конечномерная вероятность вертикального пересечения R_L(p), не параметр порядка P∞.
  // Интервал Уилсона показывает биномиальную статистическую неопределённость.
  computeCurve(trials = 200, steps = 20, L = this.L) {
    const points = [];
    const nTrials = Math.max(1, Math.trunc(trials));
    const size = Math.max(2, Math.min(30, Math.trunc(L)));
    for (let i = 0; i <= steps; i++) {
      const p = i / steps;
      let crossings = 0;
      for (let t = 0; t < nTrials; t++) {
        const grid = new Grid(size, p, this.lattice);
        const cluster = new Cluster(grid);
        // Только верх-низ: не смешиваем два направления в одном событии.
        let vertical = false;
        for (let id = 0; id < cluster.numClusters; id++) {
          if (cluster.touchesTop[id] && cluster.touchesBottom[id]) { vertical = true; break; }
        }
        if (vertical) crossings++;
      }
      const estimate = crossings / nTrials;
      const z = 1.96;
      const denom = 1 + z * z / nTrials;
      const center = (estimate + z * z / (2 * nTrials)) / denom;
      const half = z * Math.sqrt((estimate * (1 - estimate) / nTrials) + z * z / (4 * nTrials * nTrials)) / denom;
      points.push({ p, value: estimate, low: Math.max(0, center - half), high: Math.min(1, center + half), successes: crossings, trials: nTrials });
    }
    return points;
  }

  // Это p, при котором оценённая вероятность вертикального пересечения близка к 0.5
  // для конечного L, а не истинный критический порог бесконечной решётки.
  estimateFiniteSizeP50(trials = 200, L = this.L, steps = 100) {
    const points = this.computeCurve(trials, steps, L);
    return points.reduce((best, point) => Math.abs(point.value - 0.5) < Math.abs(best.value - 0.5) ? point : best, points[0]).p;
  }

}


export default PercolationModel;
