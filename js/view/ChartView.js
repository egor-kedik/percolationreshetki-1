class ChartView {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext("2d") : null;
  }

  render(data, pc) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;
    const pad = { top: 20, right: 20, bottom: 40, left: 50 };
    const plotW = W - pad.left - pad.right;
    const plotH = H - pad.top - pad.bottom;

    ctx.fillStyle = "#161b22";
    ctx.fillRect(0, 0, W, H);

    // сетка
    ctx.strokeStyle = "#30363d";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = pad.left + (plotW * i) / 10;
      const y = pad.top + (plotH * i) / 10;
      ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, pad.top + plotH); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + plotW, y); ctx.stroke();
    }

    // оси
    ctx.strokeStyle = "#8b949e";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, pad.top + plotH);
    ctx.lineTo(pad.left + plotW, pad.top + plotH);
    ctx.stroke();

    // подписи
    ctx.fillStyle = "#8b949e";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    for (let i = 0; i <= 10; i += 2) {
      const x = pad.left + (plotW * i) / 10;
      ctx.fillText((i / 10).toFixed(1), x, pad.top + plotH + 18);
    }
    ctx.textAlign = "right";
    for (let i = 0; i <= 10; i += 2) {
      const y = pad.top + plotH - (plotH * i) / 10;
      ctx.fillText((i / 10).toFixed(1), pad.left - 8, y + 4);
    }

    // названия осей
    ctx.textAlign = "center";
    ctx.fillStyle = "#58a6ff";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("p", pad.left + plotW / 2, H - 5);
    ctx.save();
    ctx.translate(15, pad.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("R_L(p)", 0, 0);
    ctx.restore();

    // линия p_c
    if (pc > 0 && pc < 1) {
      const xc = pad.left + plotW * pc;
      ctx.strokeStyle = "#ff4d4d";
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(xc, pad.top);
      ctx.lineTo(xc, pad.top + plotH);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 95% доверительный интервал Уилсона для вероятности пересечения.
    if (data && data.length > 1) {
      ctx.fillStyle = "rgba(88,166,255,0.16)";
      ctx.beginPath();
      data.forEach((pt, i) => {
        const x = pad.left + plotW * pt.p;
        const y = pad.top + plotH * (1 - pt.high);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      for (let i = data.length - 1; i >= 0; i--) {
        const pt = data[i], x = pad.left + plotW * pt.p;
        ctx.lineTo(x, pad.top + plotH * (1 - pt.low));
      }
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#58a6ff";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      data.forEach((pt, i) => {
        const x = pad.left + plotW * pt.p;
        const y = pad.top + plotH * (1 - pt.value);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      ctx.fillStyle = "#58a6ff";
      data.forEach((pt) => {
        const x = pad.left + plotW * pt.p;
        const y = pad.top + plotH * (1 - pt.value);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }
}


export default ChartView;
