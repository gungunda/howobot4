/**
 * SchedulePresenter — управление расписанием.
 * Разгрузка редактируется ТОЛЬКО через модалки (add/edit).
 */
import { loadSchedule, saveSchedule, genId } from "../../../storage/storage.js";
import { Task } from "../../../entities/entities.js";
import { ScheduleView } from "./view.js";

export class SchedulePresenter {
  /** @param {HTMLElement} sectionRoot */
  constructor(sectionRoot){
    this.root = sectionRoot;
  }

  render(){
    this.schedule = loadSchedule();
    const els = { weekRoot: this.root.querySelector("[data-schedule-week]") };
    this.view = new ScheduleView(els, {
      schedule: this.schedule,
      onAdd: (weekday, title, minutes, unloadDays) => this.onAdd(weekday, title, minutes, unloadDays),
      onEditSave: (weekday, taskId, title, minutes, unloadDays) => this.onEditSave(weekday, taskId, title, minutes, unloadDays),
      onRemove: (weekday, taskId) => this.onRemove(weekday, taskId),
    });
    this.view.render();
  }
  refresh(){ this.render(); }

  /** Добавить новый предмет и сразу установить unloadDays. */
  onAdd(weekday, title, minutes, unloadDays){
    const t = new Task({
      id: genId(),
      title: String(title||"").trim(),
      minutes: Number(minutes)||0,
      progress: 0,
      closed: false,
      unloadDays: []
    });
    this.schedule.add(weekday, t);

    // установить разгрузки
    const days = this.normUnload(unloadDays);
    this.schedule.setUnloadDays(weekday, t.id, days);

    saveSchedule(this.schedule);
    this.refresh();
  }

  /** Сохранить правки предмета, включая unloadDays. */
  onEditSave(weekday, taskId, title, minutes, unloadDays){
    const tt = String(title||"").trim();
    const mm = Number(minutes)||0;
    this.schedule.rename(weekday, taskId, tt);
    this.schedule.setMinutes(weekday, taskId, mm);
    this.schedule.setUnloadDays(weekday, taskId, this.normUnload(unloadDays));
    saveSchedule(this.schedule);
    this.refresh();
  }

  /** Удалить предмет (доступно только через модалку). */
  onRemove(weekday, taskId){
    this.schedule.remove(weekday, taskId);
    saveSchedule(this.schedule);
    this.refresh();
  }

  /** Нормализация массива дней разгрузки. */
  normUnload(arr){
    const set = new Set((arr||[]).map(n => Number(n)).filter(n => n>=0 && n<=6));
    return Array.from(set).sort((a,b)=>a-b);
  }
}

