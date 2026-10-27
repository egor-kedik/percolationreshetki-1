// ViewModel: presentation state and UI commands independent of DOM elements.
export default class PercolationViewModel {
  constructor(model) {
    this.model = model;
    this.state = { busy: false, error: null, chart: [], selectedLattice: model.lattice };
    this.listeners = new Set();
    this.unsubscribeModel = model.subscribe(snapshot => {
      this.state = { ...this.state, snapshot, selectedLattice: snapshot.lattice, error: null };
      this._emit();
    });
  }
  subscribe(listener) { this.listeners.add(listener); listener(this.state); return () => this.listeners.delete(listener); }
  _emit() { for (const listener of this.listeners) listener(this.state); }
  setProbability(value) { const p = Number(value); if (!Number.isFinite(p) || p < 0 || p > 1) { this.state = { ...this.state, error: 'Вероятность p должна быть от 0 до 1.' }; this._emit(); return; } this.model.setP(p); }
  setSize(value) { const L = Number(value); if (!Number.isInteger(L) || L < 2 || L > 30) { this.state = { ...this.state, error: 'Размер решётки должен быть целым числом от 2 до 30.' }; this._emit(); return; } this.model.setL(L); }
  selectLattice(type) { this.state = { ...this.state, selectedLattice: type }; this._emit(); this.model.setLattice(type); }
  regenerate() { this.model.regenerate(); }
  buildChart(trials = 200, steps = 20) {
    this.state = { ...this.state, busy: true, error: null }; this._emit();
    try { const chart = this.model.computeCurve(trials, steps, this.model.L); this.state = { ...this.state, chart, busy: false }; this._emit(); return chart; }
    catch (error) { this.state = { ...this.state, busy: false, error: error?.message || 'Не удалось построить график.' }; this._emit(); return []; }
  }
  dispose() { this.unsubscribeModel?.(); this.listeners.clear(); }
}
