import * as dt from "../../../utils/date.js";
import { formatMonthName } from "../../../utils/locale.ru.js";

const WEEK_HEAD = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];

export class CalendarView {
  constructor(els, h){
    this.els = els;
    this.h = h;
  }
  render(){
    const base = this.h.baseDate;
    this.els.label.textContent = formatMonthName(base);

    this.els.prev.onclick = () => this.h.onShiftMonth(-1);
    this.els.next.onclick = () => this.h.onShiftMonth(1);

    const start = dt.startOfCalendarGrid(base, true);
    const month = base.getMonth();
    const selectedIso = dt.toIsoDate(base);

    const frag = document.createDocumentFragment();

    for (let i=0;i<7;i++){
      const head = document.createElement("div");
      head.className = "cell is-head";
      head.textContent = WEEK_HEAD[i];
      frag.appendChild(head);
    }

    let cursor = new Date(start.getTime());
    for (let i=0;i<42;i++){
      const cell = document.createElement("div");
      cell.className = "cell";
      const iso = dt.toIsoDate(cursor);
      cell.textContent = String(cursor.getDate());
      cell.dataset.dateIso = iso;

      if (cursor.getMonth() !== month) cell.classList.add("is-outside-month");
      if (dt.isToday(cursor)) cell.classList.add("is-today");
      if (iso === selectedIso) cell.classList.add("is-selected");

      cell.onclick = () => this.h.onSelect(iso);

      frag.appendChild(cell);
      cursor.setDate(cursor.getDate()+1);
    }

    this.els.grid.innerHTML = "";
    this.els.grid.appendChild(frag);
  }
}





