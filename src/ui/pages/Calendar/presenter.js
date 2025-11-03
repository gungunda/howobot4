import * as d from "../../../utils/date.js";
import { CalendarView } from "./view.js";

export class CalendarPresenter {
  constructor(sectionRoot, opts = {}){
    this.root = sectionRoot;
    this.baseDate = d.today();
    this.onSelectDate = opts.onSelectDate || (()=>{});
  }
  render(){
    const els = {
      label: this.root.querySelector('[data-calendar-label]'),
      grid:  this.root.querySelector('[data-calendar-grid]'),
      prev:  this.root.querySelector('[data-calendar-prev]'),
      next:  this.root.querySelector('[data-calendar-next]'),
    };
    this.view = new CalendarView(els, {
      baseDate: this.baseDate,
      onShiftMonth: (delta) => {
        this.baseDate = d.addMonths(this.baseDate, delta);
        this.render();
      },
      onSelect: (iso) => {
        this.baseDate = new Date(iso);
        this.onSelectDate(iso);
      }
    });
    this.view.render();
  }
}


