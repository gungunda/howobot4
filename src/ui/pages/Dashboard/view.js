
/** 
 * DashboardView — отображение дашборда.
 * Модалка и кнопка "+" создаются динамически (index.html править не нужно).
 * Инлайнового редактирования минут НЕТ — правка через модалку.
 */
import { minutesToHhmm } from "../../../utils/date.js";
import { ensureModalRoot, openModal } from "../../components/modal.js";

const DAY_NAMES = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];

export class DashboardView{
  /**
   * @param {object} els - ссылки на элементы DOM
   * @param {object} handlers - колбэки презентера
   */
  constructor(els, handlers){
    /** @type {any} */
    this.els = els;
    /** @type {any} */
    this.h = handlers;

    // Готовим модалку (если нет в DOM — создадим)
    ensureModalRoot();
  }

  /** Отрисовать дашборд. */
  render(){
    const { dateIso, vm } = this.h;

    if (this.els.dateEl) this.els.dateEl.textContent = `(${dateIso})`;
    this.els.stats.planned.textContent = vm.metrics.load || "0:00";
    this.els.stats.done.textContent    = vm.metrics.done ?? "0%";
    this.els.stats.left.textContent    = vm.metrics.left || "0:00";
    // ETA может называться finish — поддержим оба поля
    this.els.stats.eta.textContent     = vm.metrics.eta || vm.metrics.finish || "0:00";

    // Кнопки действий с задачами дня
    if (this.els.resetBtn){ this.els.resetBtn.onclick = () => this.h.onResetDay(); }
    if (this.els.resetToScheduleBtn){ this.els.resetToScheduleBtn.onclick = () => this.h.onResetToSchedule(); }
    if (this.els.addBtn) { this.els.addBtn.onclick = () => this.openAddForm(); }

    // Список задач дня
    this.els.list.innerHTML = "";
    vm.tasks.forEach(t => this.els.list.appendChild(this.renderTaskCard(t)));

    // Разгрузка
    if (this.els.offloadWrap){
      const hasOffload = (vm.offload && vm.offload.length > 0);
      this.els.offloadWrap.hidden = !hasOffload;
      this.els.offloadList.innerHTML = "";
      if (hasOffload){
        vm.offload.forEach(o => this.els.offloadList.appendChild(this.renderOffloadCard(o)));
      }
    }
  }

    /** Открыть модалку для добавления новой задачи в сегодня. */
  openAddForm(){
    const node = document.createElement("div");
    node.innerHTML = `
      <h3>Новая задача на сегодня</h3>
      <div class="form-row">
        <label>Название</label>
        <input data-f-title placeholder="Предмет" />
      </div>
      <div class="form-row">
        <label>Минуты</label>
        <input data-f-min type="number" min="0" step="5" value="25" />
      </div>
      <div class="form-actions">
        <button class="btn primary" data-save>Добавить</button>
      </div>
    `;
    openModal(node, {
      onSave: () => {
        const title = (node.querySelector('[data-f-title]')?.value || "").trim();
        const minutes = Number(node.querySelector('[data-f-min]')?.value || 0);
        if (!title) return; // простая валидация
        this.h.onAddSave(title, minutes);
      }
    });
  }

  /** Открыть модалку для редактирования существующей задачи. */
  openEditForm(t){
    const node = document.createElement("div");
    node.innerHTML = `
      <h3>Правка задачи</h3>
      <div class="form-row">
        <label>Название</label>
        <input data-f-title value="${t.title}" />
      </div>
      <div class="form-row">
        <label>Минуты</label>
        <input data-f-min type="number" min="0" step="5" value="${t.minutes}" />
      </div>
      <div class="form-actions">
        <button class="btn btn-danger" data-delete>Удалить</button>
        <button class="btn primary" data-save>Сохранить</button>
      </div>
    `;
    const close = openModal(node, {
      onSave: () => {
        const title = (node.querySelector('[data-f-title]')?.value || "").trim();
        const minutes = Number(node.querySelector('[data-f-min]')?.value || 0);
        if (!title) return;
        this.h.onEditSave(t.id, title, minutes);
      }
    });
    node.querySelector("[data-delete]")?.addEventListener("click", () => {
      this.h.onDelete(t.id);
      close();
    }, { once: true });
  }

  /** Карточка основной задачи (без инлайнового редактирования минут). */
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
        <button class="btn" data-action="edit">Править</button>
      </div>
    `;
    card.querySelector('[data-step="-1"]').addEventListener("click", () => this.h.onStep(t.id, -1));
    card.querySelector('[data-step="+1"]').addEventListener("click", () => this.h.onStep(t.id, +1));
    card.querySelector('.range').addEventListener("input", (e) => this.h.onSlide(t.id, e.target.value));
    card.querySelector('[data-action="toggle"]').addEventListener("click", () => this.h.onToggle(t.id));
    card.querySelector('[data-action="edit"]').addEventListener("click", () => this.openEditForm(t));
    return card;
  }

  /** Карточка разгрузки. */
  renderOffloadCard(o){
    const card = document.createElement("div");
    card.className = "card";
    const hhmm = minutesToHhmm(o.minutes);
    card.innerHTML = `
      <div class="row">
        <strong>${o.title}</strong>
        <span class="muted">${hhmm}</span>
        <span class="muted">из дня: ${DAY_NAMES[o.fromWeekday]}</span>
      </div>
      <div class="row">
        <button class="btn" data-step="-1">−10%</button>
        <input class="range" type="range" min="0" max="100" step="10" value="${o.progress}">
        <button class="btn" data-step="+1">+10%</button>
        <span>${o.progress}%</span>
      </div>
    `;
    card.querySelector('[data-step="-1"]').addEventListener("click", () => this.h.onOffloadStep(o.id, o.targetIso, -1));
    card.querySelector('[data-step="+1"]').addEventListener("click", () => this.h.onOffloadStep(o.id, o.targetIso, +1));
    card.querySelector('.range').addEventListener("input", (e) => this.h.onOffloadSlide(o.id, o.targetIso, e.target.value));
    return card;
  }
}



