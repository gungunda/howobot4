/**
 * SchedulePresenter — управление расписанием.
 * ВСЕ изменения через юзкейсы Add/Edit/DropScheduleTask (единое действие модалки).
 */
import { loadSchedule } from "../../../storage/storage.js";
import { ScheduleView } from "./view.js";

import { AddScheduleTask } from "../../../usecases/AddScheduleTask.js";
import { EditScheduleTask } from "../../../usecases/EditScheduleTask.js";
import { DropScheduleTask } from "../../../usecases/DropScheduleTask.js";

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
      onAdd:      (weekday, title, minutes, unloadDays) => this.onAdd(weekday, title, minutes, unloadDays),
      onEditSave: (weekday, taskId, title, minutes, unloadDays) => this.onEditSave(weekday, taskId, title, minutes, unloadDays),
      onRemove:   (weekday, taskId) => this.onRemove(weekday, taskId),
    });
    this.view.render();
  }
  refresh(){ this.render(); }

  /** Добавить новый предмет и разгрузки (одно действие). */
  onAdd(weekday, title, minutes, unloadDays){
    AddScheduleTask({ weekday, title, minutes, unloadDays });
    this.refresh();
  }

  /** Сохранить правки предмета (одно действие). */
  onEditSave(weekday, taskId, title, minutes, unloadDays){
    EditScheduleTask({ weekday, taskId, title, minutes, unloadDays });
    this.refresh();
  }

  /** Удалить предмет (только из модалки). */
  onRemove(weekday, taskId){
    DropScheduleTask({ weekday, taskId });
    this.refresh();
  }
}

