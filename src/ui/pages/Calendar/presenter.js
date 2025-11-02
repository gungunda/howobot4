import * as date from "../../../utils/date.js";
import { CalendarView } from "./view.js";

export class CalendarPresenter {
  constructor(mount) {
    this.mount = mount;
    this.baseDate = date.today();
  }
  render() {
    this.view = new CalendarView(this.mount, {
      baseDate: this.baseDate,
      onToday: () => { this.baseDate = date.today(); this.render(); },
      onShift: (days) => {
        const d = new Date(this.baseDate.getTime());
        d.setDate(d.getDate() + days);
        this.baseDate = d;
        this.render();
      }
    });
    this.view.render();
  }
}
