import { minutesToHhmm } from "../../../utils/date.js";

export class DashboardView {
  constructor(mount, handlers) {
    this.mount = mount;
    this.handlers = handlers;
  }
  render() {
    const { dateIso, vm } = this.handlers;
    this.mount.innerHTML = "";
    const header = document.createElement("div");
    header.className = "row";
    header.innerHTML = `<div class="section-title">Задачи на завтра (${dateIso})</div>
      <button class="btn" id="reset-day">Очистить день</button>`;
    header.querySelector("#reset-day").addEventListener("click", () => this.handlers.onResetDay());
    this.mount.appendChild(header);

    const kpi = document.createElement("div");
    kpi.className = "kpi";
    kpi.innerHTML = `
      <div class="badge">Нагрузка: ${vm.metrics.load}</div>
      <div class="badge">Выполнено: ${vm.metrics.done}</div>
      <div class="badge">Осталось: ${vm.metrics.left}</div>
      <div class="badge">Финиш: ${vm.metrics.finish}</div>
    `;
    this.mount.appendChild(kpi);

    vm.tasks.forEach(t => this.mount.appendChild(this.renderTaskCard(t)));
  }
  renderTaskCard(t) {
    const card = document.createElement("div");
    card.className = "card";
    const hhmm = minutesToHhmm(t.minutes);
    card.innerHTML = `
      <div class="row" style="justify-content: space-between;">
        <strong>${t.title}</strong>
        <span class="muted">${hhmm}</span>
      </div>
      <div class="row" style="margin-top:6px;">
        <button class="btn" data-step="-1">−10%</button>
        <input class="range" type="range" min="0" max="100" step="10" value="${t.progress}">
        <button class="btn" data-step="+1">+10%</button>
        <span>${t.progress}%</span>
        <button class="btn" data-action="toggle">${t.closed ? "Открыть" : "Закрыть"}</button>
      </div>
      <div class="row" style="margin-top:6px;">
        <label>Минуты:
          <input class="input" type="number" min="0" step="5" value="${t.minutes}">
        </label>
        <button class="btn" data-action="save-minutes">Сохранить</button>
      </div>
    `;
    card.querySelector('[data-step="-1"]').addEventListener("click", () => this.handlers.onStep(t.id, -1));
    card.querySelector('[data-step="+1"]').addEventListener("click", () => this.handlers.onStep(t.id, +1));
    card.querySelector('.range').addEventListener("input", (e) => this.handlers.onSlide(t.id, e.target.value));
    card.querySelector('[data-action="toggle"]').addEventListener("click", () => this.handlers.onToggle(t.id));
    card.querySelector('[data-action="save-minutes"]').addEventListener("click", () => {
      const val = Number(card.querySelector('input[type="number"]').value);
      this.handlers.onSetMinutes(t.id, val);
    });
    return card;
  }
}
