import { minutesToHhmm } from "../../../utils/date.js";

const DAY_NAMES = ["Вс","Пн","Вт","Ср","Чт","Пт","Сб"];

export class ScheduleView {
  constructor(els, handlers){
    this.els = els;
    this.h = handlers;
  }
  render(){
    const root = this.els.weekRoot;
    root.innerHTML = "";
    for (let w = 0; w < 7; w++) {
      root.appendChild(this.renderDayBlock(w));
    }
  }
  renderDayBlock(w){
    const wrap = document.createElement("div");
    wrap.className = "card";
    const head = document.createElement("div");
    head.className = "row";
    head.innerHTML = `<strong>${DAY_NAMES[w]}</strong>`;
    wrap.appendChild(head);

    const list = document.createElement("div");
    (this.h.schedule.list(w) || []).forEach(t => list.appendChild(this.renderTaskRow(w, t)));
    wrap.appendChild(list);

    const form = document.createElement("div");
    form.className = "row";
    form.innerHTML = `
      <input class="input" placeholder="Название" />
      <input class="input" type="number" min="0" step="5" placeholder="Минуты" />
      <button class="btn">Добавить</button>
    `;
    const [title, minutes, btn] = form.querySelectorAll("input,button");
    btn.addEventListener("click", () => {
      const t = String(title.value || "").trim();
      const m = Number(minutes.value) || 0;
      if (!t) return;
      this.h.onAdd(w, t, m);
    });
    wrap.appendChild(form);
    return wrap;
  }
  renderTaskRow(w, t){
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `
      <div class="row">
        <input class="input" value="${t.title}" style="min-width:200px" />
        <input class="input" type="number" min="0" step="5" value="${t.minutes}" style="width:90px" />
        <span class="muted">${minutesToHhmm(t.minutes)}</span>
      </div>
      <div class="row">
        ${this.renderUnloadControls(w, t)}
        <button class="btn" data-act="save">Сохранить</button>
        <button class="btn btn-danger" data-act="remove">Удалить</button>
      </div>
    `;
    const [title, minutes] = row.querySelectorAll('input.input');
    row.querySelector('[data-act="save"]').addEventListener("click", () => {
      this.h.onRename(w, t.id, title.value);
      this.h.onSetMinutes(w, t.id, Number(minutes.value)||0);
    });
    row.querySelector('[data-act="remove"]').addEventListener("click", () => this.h.onRemove(w, t.id));
    row.querySelectorAll('input[type="checkbox"][data-w]').forEach(ch => {
      ch.addEventListener("change", () => {
        const ww = Number(ch.dataset.w);
        this.h.onToggleUnload(w, t.id, ww);
      });
    });
    return row;
  }
  renderUnloadControls(w, t){
    const blocked = ((w + 6) % 7);
    const sel = new Set(t.unloadDays || []);
    let html = `<div class="row">`;
    for (let ww=0; ww<7; ww++) {
      const dis = ww === blocked ? "disabled" : "";
      const checked = sel.has(ww) ? "checked" : "";
      html += `
        <label class="muted" title="Разгрузочный день ${DAY_NAMES[ww]}">
          <input type="checkbox" data-w="${ww}" ${dis} ${checked}/> ${DAY_NAMES[ww]}
        </label>`;
    }
    html += `</div>`;
    return html;
  }
}


