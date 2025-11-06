/**
 * ScheduleView — экран «Расписание».
 * Правка/добавление предметов через модалки. Разгрузка редактируется только в модалке.
 * В карточках предметов разгрузка показывается текстом, без чекбоксов.
 */
import { minutesToHhmm } from "../../../utils/date.js";
import { WEEKDAYS_FULL, WEEKDAYS_SHORT } from "../../../utils/locale.ru.js";
import { ensureModalRoot, openModal } from "../../components/modal.js";

const DAY = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];

export class ScheduleView {
  constructor(els, h){
    this.els = els || {};
    this.h = h;
    ensureModalRoot();
  }

  render(){
    const root = this.els.weekRoot;
    root.innerHTML = "";
    for (let w = 0; w < 7; w++){
      root.appendChild(this.renderDay(w));
    }
  }

  renderDay(w){
    const wrap = document.createElement("div");
    wrap.className = "card";

    const head = document.createElement("div");
    head.className = "row";
    head.innerHTML = `<h3 class="day-title">${WEEKDAYS_FULL[w]}</h3>`;

    const addBtn = document.createElement("button");
    addBtn.className = "btn";
    addBtn.innerHTML = `<img class="icon" src="./assets/icons/plus.svg" alt="Добавить">`;
    addBtn.title = "Добавить предмет";
    addBtn.addEventListener("click", () => this.openAddForm(w));
    head.appendChild(addBtn);

    wrap.appendChild(head);

    const list = document.createElement("div");
    (this.h.schedule.list(w) || []).forEach(t => list.appendChild(this.renderTaskRow(w, t)));
    wrap.appendChild(list);

    return wrap;
  }

  renderTaskRow(w, t){
    const row = document.createElement("div");
    row.className = "row";

    const hhmm = minutesToHhmm(t.minutes);
    const unloadTxt = this.formatUnload(t.unloadDays);

    row.innerHTML = `
      <div class="row">
        <strong>${t.title}</strong>
        <span class="muted">${hhmm}</span>
      </div>
      <div class="row">
        <span class="muted">Разгр.: ${unloadTxt}</span>
        <button class="btn" data-act="edit"><img  class="icon" src="./assets/icons/pencil.svg" alt="Редактировать"></button>
      </div>
    `;

    row.querySelector('[data-act="edit"]').addEventListener("click", () => this.openEditForm(w, t));
    return row;
  }

  formatUnload(arr){
    if (!arr || arr.length === 0) return "—";
    const uniq = Array.from(new Set(arr)).filter(n => n>=0 && n<=6).sort((a,b)=>a-b);
    return uniq.map(n => DAY[n]).join(", ");
  }

  openAddForm(weekday){
    const node = document.createElement("div");
    node.innerHTML = `
      <h3>Новый предмет — ${WEEKDAYS_SHORT[weekday]}</h3>
      <div class="form-row">
        <label>Название</label>
        <input type="text" data-f-title placeholder="Введите название">
      </div>
      <div class="form-row">
        <label>Минуты</label>
        <input type="number" min="0" step="10" data-f-min value="0">
      </div>
      <div class="form-row" data-unloads></div>
      <div class="form-actions">
        <button class="btn" data-save>Сохранить</button>
      </div>
    `;

    const ul = this.buildUnloadDays(weekday, []);
    node.querySelector("[data-unloads]").appendChild(ul);

    openModal(node, {
      onSave: () => {
        const title = (node.querySelector('[data-f-title]')?.value || "").trim();
        const minutes = Number(node.querySelector('[data-f-min]')?.value || 0);
        const unloadDays = this.readUnloadDays(ul);
        if (!title) return;
        this.h.onAdd(weekday, title, minutes, unloadDays);
      }
    });
  }

  openEditForm(weekday, task){
    const node = document.createElement("div");
    node.innerHTML = `
      <h3>Правка предмета — ${WEEKDAYS_FULL[weekday]}</h3>
      <div class="form-row">
        <label>Название</label>
        <input type="text" data-f-title value="${task.title}">
      </div>
      <div class="form-row">
        <label>Минуты</label>
        <input type="number" min="0" step="5" data-f-min value="${task.minutes}">
      </div>
      <div class="form-row" data-unloads></div>
      <div class="form-actions">
        <button class="btn" data-delete>Удалить предмет</button>
        <button class="btn" data-save>Сохранить</button>
      </div>
    `;

    const ul = this.buildUnloadDays(weekday, task.unloadDays || []);
    node.querySelector("[data-unloads]").appendChild(ul);

    const close = openModal(node, {
      onSave: () => {
        const title = (node.querySelector('[data-f-title]')?.value || "").trim();
        const minutes = Number(node.querySelector('[data-f-min]')?.value || 0);
        const unloadDays = this.readUnloadDays(ul);
        if (!title) return;
        this.h.onEditSave(weekday, task.id, title, minutes, unloadDays);
      }
    });
    node.querySelector("[data-delete]")?.addEventListener("click", () => {
      this.h.onRemove(weekday, task.id);
      close();
    }, { once: true });
  }

  /**
   * Построить набор чекбоксов Пн..Вс.
   * prev = (weekday - 1 + 7) % 7 — основной день (D=R-1), его чекбокс дизейблим.
   */
  buildUnloadDays(weekday, unloadDays){
    const prev = (weekday + 6) % 7;
    const set = new Set(Array.isArray(unloadDays) ? unloadDays : []);

    const grid = document.createElement("div");
    grid.className = "unload-grid";

    for (let w=0; w<7; w++){
      const label = document.createElement("label");
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.setAttribute("data-w", String(w));

      if (w === prev){
        cb.checked = false;
        cb.disabled = true;
        label.title = "Основной день — не выбирается для разгрузки";
      } else if (set.has(w)){
        cb.checked = true;
      }

      const span = document.createElement("span");
      span.textContent = DAY[w];

      label.appendChild(cb);
      label.appendChild(span);
      grid.appendChild(label);
    }
    return grid;
  }

  readUnloadDays(fromNode){
    const out = [];
    fromNode.querySelectorAll('input[type="checkbox"][data-w]').forEach(cb => {
      if (cb.disabled) return;
      if (cb.checked) out.push(Number(cb.getAttribute("data-w")));
    });
    return out;
  }
}





