class CanvasView {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.palette = ['#58a6ff','#3fb950','#d29922','#a371f7','#db61a2','#39c5cf','#f0883e','#7ee787'];
  }

  render({ grid, cluster }, { onlySpanning = false } = {}) {
    if (!grid || !cluster) return;
    const L = grid.L, margin = 24, cell = Math.max(8, Math.min(24, 560 / L));
    const maxX = Math.max(...grid.positions.map(p => p.x)), maxY = Math.max(...grid.positions.map(p => p.y));
    const scale = Math.min(560 / Math.max(1, maxX), 560 / Math.max(1, maxY));
    const width = Math.ceil(maxX * scale + margin * 2 + cell), height = Math.ceil(maxY * scale + margin * 2 + cell);
    this.canvas.width = width; this.canvas.height = height;
    const ctx = this.ctx; ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, width, height);
    const pts = grid.positions.map(p => ({ x: margin + p.x * scale, y: margin + p.y * scale }));
    ctx.lineWidth = grid.type === 'square' ? 1.4 : 1.1;
    ctx.strokeStyle = grid.type === 'cubic' || grid.type === 'bcc' || grid.type === 'fcc' ? 'rgba(150,170,205,.34)' : 'rgba(100,125,165,.42)';
    ctx.beginPath();
    for (const [a,b] of grid.edges) { ctx.moveTo(pts[a].x, pts[a].y); ctx.lineTo(pts[b].x, pts[b].y); }
    ctx.stroke();
    const radius = Math.max(2.4, Math.min(7, scale * .23));
    if (onlySpanning && cluster.spanningId < 0) {
      ctx.fillStyle = '#9fb2cc'; ctx.font = '600 16px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('Сквозного кластера нет', width / 2, height / 2);
    }
    for (let i = 0; i < grid.cells.length; i++) {
      const p = pts[i], occupied = grid.cells[i] === 1;
      const isSpan = occupied && cluster.labels[i] === cluster.spanningId && cluster.spanningId >= 0;
      ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      if (onlySpanning && !isSpan) ctx.fillStyle = '#1e2633';
      else if (!occupied) ctx.fillStyle = '#303946';
      else if (isSpan) ctx.fillStyle = '#ff5269';
      else ctx.fillStyle = this.palette[Math.max(0, cluster.labels[i]) % this.palette.length];
      ctx.fill();
      ctx.strokeStyle = '#0d1117'; ctx.lineWidth = .7; ctx.stroke();
    }
  }

  animate(state, order, onDone) {
    const { grid, cluster } = state;
    const L = grid.L, margin = 24, cell = Math.max(8, Math.min(24, 560 / L));
    const maxX = Math.max(...grid.positions.map(p => p.x)), maxY = Math.max(...grid.positions.map(p => p.y));
    const scale = Math.min(560 / Math.max(1, maxX), 560 / Math.max(1, maxY));
    const width = Math.ceil(maxX * scale + margin * 2 + cell), height = Math.ceil(maxY * scale + margin * 2 + cell);
    this.canvas.width = width; this.canvas.height = height;
    const pts = grid.positions.map(p => ({ x: margin + p.x * scale, y: margin + p.y * scale }));
    const ctx = this.ctx; ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(100,125,165,.38)'; ctx.lineWidth = 1; ctx.beginPath();
    for (const [a,b] of grid.edges) { ctx.moveTo(pts[a].x, pts[a].y); ctx.lineTo(pts[b].x, pts[b].y); } ctx.stroke();
    const radius = Math.max(2.4, Math.min(7, scale * .23));
    let step = 0;
    const draw = () => {
      const batch = L > 24 ? 8 : 3;
      for (let k = 0; k < batch && step < order.length; k++, step++) {
        const i = order[step], p = pts[i], occupied = grid.cells[i] === 1;
        const span = occupied && cluster.spanningId >= 0 && cluster.labels[i] === cluster.spanningId;
        ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = !occupied ? '#303946' : span ? '#ff5269' : '#58a6ff'; ctx.fill();
        ctx.strokeStyle = '#0d1117'; ctx.lineWidth = .7; ctx.stroke();
      }
      if (step < order.length) setTimeout(() => requestAnimationFrame(draw), 18);
      else { this.render(state); if (onDone) onDone(); }
    };
    requestAnimationFrame(draw);
  }

  exportPNG(filename) { const link = document.createElement('a'); link.download = filename; link.href = this.canvas.toDataURL('image/png'); link.click(); }
}
export default CanvasView;
