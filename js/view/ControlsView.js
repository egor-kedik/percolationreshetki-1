class ControlsView {
  constructor() {
    this.pSlider = document.getElementById("p-slider");
    this.pValue = document.getElementById("p-value");
    this.sizeInput = document.getElementById("size-select");
    this.latticeSelect = document.getElementById("lattice-select");
    this.regenBtn = document.getElementById("regenerate");
    this.toggleBtn = document.getElementById("toggle-spanning");
    this.animBtn = document.getElementById("animate");
    this.exportBtn = document.getElementById("export-png");

    this.sizeError = document.getElementById("size-error");
    this.sizeValid = true;
    if (this.sizeInput) {
      this.sizeInput.addEventListener("input", () => this.validateSize(false));
      this.sizeInput.addEventListener("keydown", (e) => {
        if (["-", "+", "e", "E", ".", ","].includes(e.key)) {
          e.preventDefault();
          this.showSizeError("Нужно целое положительное число от 2 до 30.");
        }
      });
      this.sizeInput.addEventListener("paste", (e) => {
        const text = (e.clipboardData || window.clipboardData).getData("text");
        if (!/^\d+$/.test(text.trim())) {
          e.preventDefault();
          this.showSizeError("Буквы и специальные символы запрещены — введи цифры от 2 до 30.");
        }
      });
      this.sizeInput.addEventListener("change", () => {
        if (this.validateSize(true)) this.sizeInput.dispatchEvent(new Event("size-valid", { bubbles: true }));
      });
      this.sizeInput.addEventListener("blur", () => this.validateSize(true));
    }
  }

  showSizeError(message) {
    if (this.sizeError) this.sizeError.textContent = message;
    if (this.sizeInput) this.sizeInput.setAttribute("aria-invalid", "true");
    this.sizeValid = false;
  }

  validateSize(commit) {
    if (!this.sizeInput) return false;
    const raw = this.sizeInput.value.trim();
    if (!/^\d+$/.test(raw)) {
      this.showSizeError(raw === "" ? "Укажи размер решётки: от 2 до 30." : "Ошибка: введи только цифры, без букв, знаков и дробей.");
      return false;
    }
    const n = Number(raw);
    if (n < 2) {
      this.showSizeError("Слишком маленький размер. Минимум — 2 × 2.");
      return false;
    }
    if (n > 30) {
      this.showSizeError("Слишком большое число! Максимальный размер — 30 × 30.");
      return false;
    }
    if (this.sizeError) this.sizeError.textContent = "";
    this.sizeInput.removeAttribute("aria-invalid");
    this.sizeValid = true;
    if (commit) this.sizeInput.value = String(n);
    return true;
  }

  setPValue(p) { if (this.pValue) this.pValue.textContent = p.toFixed(2); }

  setToggleLabel(only) {
    if (this.toggleBtn) this.toggleBtn.textContent = only ? "Показать все кластеры" : "Только сквозной";
  }

  syncInputs({ p, L, lattice }) {
    if (this.latticeSelect && lattice) this.latticeSelect.value = lattice;
    if (this.pSlider) this.pSlider.value = p;
    if (this.sizeInput) this.sizeInput.value = String(Math.max(2, Math.min(30, Math.trunc(Number(L) || 30))));
    this.setPValue(p);
  }

  onPChange(fn) {
    if (this.pSlider) this.pSlider.addEventListener("input", () => fn(parseFloat(this.pSlider.value)));
  }
  onLatticeChange(fn) { if (this.latticeSelect) this.latticeSelect.addEventListener("change", () => fn(this.latticeSelect.value)); }
  onSizeChange(fn) {
    if (!this.sizeInput) return;
    this.sizeInput.addEventListener("change", () => {
      if (!this.validateSize(true)) return;
      fn(Number(this.sizeInput.value));
    });
  }
  onRegenerate(fn) { if (this.regenBtn) this.regenBtn.addEventListener("click", fn); }
  onToggleSpanning(fn) { if (this.toggleBtn) this.toggleBtn.addEventListener("click", fn); }
  onAnimate(fn) { if (this.animBtn) this.animBtn.addEventListener("click", fn); }
  onExport(fn) { if (this.exportBtn) this.exportBtn.addEventListener("click", fn); }
  disableAnimate(flag) { if (this.animBtn) this.animBtn.disabled = !!flag; }
}
export default ControlsView;
