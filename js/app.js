window.addEventListener('error', (event) => {
  if (event.target && event.target.src) {
    showAssetError(`Не найден файл: ${event.target.src}`);
  } else if (event.message) {
    showAssetError(`Ошибка JS: ${event.message}`);
  }
}, true);

function showAssetError(message) {
  const existing = document.getElementById('app-error');
  if (existing) return;
  const el = document.createElement('div');
  el.id = 'app-error';
  el.textContent = message;
  el.style.cssText = 'position:fixed;left:0;right:0;top:0;z-index:9999;background:#b62324;color:#fff;padding:10px 16px;font:14px sans-serif';
  (document.body || document.documentElement).appendChild(el);
}

import PercolationModel from './model/PercolationModel.js';
import CanvasView from './view/CanvasView.js';
import StatsView from './view/StatsView.js';
import ControlsView from './view/ControlsView.js';
import ChartView from './view/ChartView.js';
import PercolationController from './controller/PercolationController.js';
import PercolationViewModel from './view/PercolationViewModel.js';

document.addEventListener('DOMContentLoaded', () => {
  const canvasEl = document.getElementById('grid-canvas');
  const chartEl = document.getElementById('chart-canvas');
  if (!canvasEl) return;

  const model = new PercolationModel({ L: 30, p: 0.5 });
  const view = {
    canvas: new CanvasView(canvasEl),
    stats: new StatsView(),
    controls: new ControlsView(),
    chart: new ChartView(chartEl),
  };
  const viewModel = new PercolationViewModel(model);
  const controller = new PercolationController(model, view, viewModel);

  const chartBtn = document.getElementById('chart-build');
  if (chartBtn) chartBtn.addEventListener('click', () => controller.buildChart());

  window.percolationLab = { model, viewModel, controller };
});
