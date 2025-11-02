import { toIsoDate, dPlus1 } from "../../../utils/date.js";

export class CalendarView {
  constructor(mount, handlers) {
    this.mount = mount;
    this.h = handlers;
  }
  render() {
    this.mount.innerHTML = "";
    const d = this.h.baseDate;
    const wrap = document.createElement("div");
    wrap.className = "card";
    wrap.innerHTML = `
      <div class="row">
        <strong>Базовая дата (D):</strong>
        <span>${toIsoDate(d)}</span>
        <button class="btn" data-act="prev">−1 день</button>
        <button class="btn" data-act="today">Сегодня</button>
        <button class="btn" data-act="next">+1 день</button>
      </div>
      <div class="row" style="margin-top:8px">
        <span class="muted">На дашборде всегда показывается D+1: <strong>${toIsoDate(dPlus1(d))}</strong></span>
      </div>
    `;
    wrap.querySelector('[data-act="prev"]').addEventListener("click", () => this.h.onShift(-1));
    wrap.querySelector('[data-act="today"]').addEventListener("click", () => this.h.onToday());
    wrap.querySelector('[data-act="next"]').addEventListener("click", () => this.h.onShift(1));
    this.mount.appendChild(wrap);
  }
}
