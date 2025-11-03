import { loadSchedule, saveSchedule, genId } from "../../../storage/storage.js";
import { ScheduleView } from "./view.js";
import { Task } from "../../../entities/entities.js";

export class SchedulePresenter {
  constructor(sectionRoot){
    this.root = sectionRoot;
  }
  render(){
    this.schedule = loadSchedule();
    const els = {
      weekRoot: this.root.querySelector('[data-schedule-week]'),
    };
    this.view = new ScheduleView(els, {
      schedule: this.schedule,
      onAdd: (weekday, title, minutes) => this.onAdd(weekday, title, minutes),
      onSetMinutes: (weekday, taskId, minutes) => this.onSetMinutes(weekday, taskId, minutes),
      onRename: (weekday, taskId, title) => this.onRename(weekday, taskId, title),
      onToggleUnload: (weekday, taskId, targetWeekday) => this.onToggleUnload(weekday, taskId, targetWeekday),
      onRemove: (weekday, taskId) => this.onRemove(weekday, taskId),
    });
    this.view.render();
  }
  refresh(){ this.render(); }
  onAdd(weekday, title, minutes){
    const task = new Task({ id: genId(), title, minutes: Number(minutes)||0, progress: 0, closed: false, unloadDays: [] });
    this.schedule.add(weekday, task);
    saveSchedule(this.schedule);
    this.refresh();
  }
  onSetMinutes(weekday, taskId, minutes){
    this.schedule.setMinutes(weekday, taskId, Number(minutes)||0);
    saveSchedule(this.schedule);
    this.refresh();
  }
  onRename(weekday, taskId, title){
    this.schedule.rename(weekday, taskId, title);
    saveSchedule(this.schedule);
    this.refresh();
  }
  onToggleUnload(weekday, taskId, w){
    const t = this.schedule.find(weekday, taskId);
    if (!t) return;
    const blocked = ((weekday + 6) % 7);
    if (w === blocked) return;
    const arr = new Set(t.unloadDays || []);
    if (arr.has(w)) arr.delete(w); else arr.add(w);
    this.schedule.setUnloadDays(weekday, taskId, [...arr]);
    saveSchedule(this.schedule);
    this.refresh();
  }
  onRemove(weekday, taskId){
    this.schedule.remove(weekday, taskId);
    saveSchedule(this.schedule);
    this.refresh();
  }
}


