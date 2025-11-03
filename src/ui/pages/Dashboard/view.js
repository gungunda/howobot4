import { minutesToHhmm } from "../../../utils/date.js";

export class DashboardView{
  constructor(els, handlers){
    this.els = els;
    this.h = handlers;
  }
  render(){
    const { dateIso, vm } = this.h;
    // Шапка/статы
    if (this.els.dateEl) this.els.dateEl.textContent = `(${dateIso})`;
    this.els.stats.planned.textContent = vm.metrics.load;
    this.els.stats.done.textContent    = vm.metrics.done;
    this.els.stats.left.textContent    = vm.metrics.left;
    this.els.stats.eta.textContent     = vm.metrics.finish;

    // Кнопка «Очистить день»
    if (this.els.resetBtn){
      this.els.resetBtn.onclick = () => this.h.onResetDay();
    }

    // Список задач
    this.els.list.innerHTML = "";
    vm.tasks.forEach(t => this.els.list.appendChild(this.renderTaskCard(t)));

    // Разгрузка — пока просто скрыта (каркас на будущее)
    if (this.els.offloadWrap){
      const hasOffload = false; // заглушка на будущее
      this.els.offloadWrap.hidden = !hasOffload;
      this.els.offloadList.innerHTML = "";
    }
  }

  renderTaskCard(t){
    const card = document.createElement("div");
    card.className = "card";
    const hhmm = minutesToHhmm(t.minutes);
    card.innerHTML = `
      <div class="row">
        <strong>${t.title}</strong>
        <span class="muted">${hhmm}</span>
      </div>
      <div class="row">
        <button class="btn" data-step="-1">−10%</button>
        <input class="range" type="range" min="0" max="100" step="10" value="${t.progress}">
        <button class="btn" data-step="+1">+10%</button>
        <span>${t.progress}%</span>
        <button class="btn" data-action="toggle">${t.closed ? "Открыть" : "Закрыть"}</button>
      </div>
      <div class="row">
        <label>Минуты:
          <input class="input" type="number" min="0" step="5" value="${t.minutes}">
        </label>
        <button class="btn" data-action="save-minutes">Сохранить</button>
      </div>
    `;
    card.querySelector('[data-step="-1"]').addEventListener("click", () => this.h.onStep(t.id, -1));
    card.querySelector('[data-step="+1"]').addEventListener("click", () => this.h.onStep(t.id, +1));
    card.querySelector('.range').addEventListener("input", (e) => this.h.onSlide(t.id, e.target.value));
    card.querySelector('[data-action="toggle"]').addEventListener("click", () => this.h.onToggle(t.id));
    card.querySelector('[data-action="save-minutes"]').addEventListener("click", () => {
      const val = Number(card.querySelector('input[type="number"]').value);
      this.h.onSetMinutes(t.id, val);
    });
    return card;
  }
}


