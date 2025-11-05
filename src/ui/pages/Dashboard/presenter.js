/** 
 * DashboardPresenter — презентер экрана «Дашборд».
 * Добавлены хендлеры открытия/сохранения модалок: onAddSave, onEditSave.
 * Основные задачи сохраняются в DayTasks(D), где D = (D+1) - 1.
 */
import * as date from "../../../utils/date.js";
import { LoadDashboard } from "../../../usecases/LoadDashboard.js";
import { SetProgress } from "../../../usecases/SetProgress.js";

import { ToggleClosed } from "../../../usecases/ToggleClosed.js";
import { ResetDay } from "../../../usecases/ResetDay.js";
import { DashboardView } from "./view.js";
import { config } from "../../../config.js";
import { AddDayTask } from "../../../usecases/AddDayTask.js";
import { EditDayTask } from "../../../usecases/EditDayTask.js";

export class DashboardPresenter {
  /** @param {HTMLElement} sectionRoot */
  constructor(sectionRoot){
    this.root = sectionRoot;
    this.baseDate = date.today();
  }

  /** Рендер экрана. */
  render(){
    const d1 = date.dPlus1(this.baseDate);
    const vm = LoadDashboard(d1);

    const els = {
      dateEl: this.root.querySelector('[data-dashboard-date]'),
      stats: {
        planned: this.root.querySelector('[data-dashboard-stat="planned"]'),
        done:    this.root.querySelector('[data-dashboard-stat="done"]'),
        left:    this.root.querySelector('[data-dashboard-stat="left"]'),
        eta:     this.root.querySelector('[data-dashboard-stat="eta"]'),
      },
      list: this.root.querySelector('[data-dashboard-tasks]'),
      offloadWrap: this.root.querySelector('[data-dashboard-offload-wrapper]'),
      offloadList: this.root.querySelector('[data-dashboard-offload]'),
      resetBtn: this.root.querySelector('[data-action="reset-day"]'),
    };

    this.view = new DashboardView(els, {
      dateIso: date.toIsoDate(d1),
      vm,
      onStep: (taskId, sign) => this.onStep(taskId, sign),
      onSlide: (taskId, value) => this.onSlide(taskId, value),
      onToggle: (taskId) => this.onToggle(taskId),

      onResetDay: () => this.onResetDay(),

      // модалки
      onAddSave: (title, minutes) => this.onAddSave(title, minutes),
      onEditSave: (taskId, title, minutes) => this.onEditSave(taskId, title, minutes),

      // оффлоад
      onOffloadStep: (taskId, targetIso, sign) => this.onOffloadStep(taskId, targetIso, sign),
      onOffloadSlide: (taskId, targetIso, value) => this.onOffloadSlide(taskId, targetIso, value),
    });

    this.view.render();
  }

  /** Полный перерендер. */
  refresh(){ this.render(); }

  /** Основные задачи — прогресс ±10%. */
  onStep(taskId, sign){
    const d = date.addDays(date.dPlus1(this.baseDate), -1);
    SetProgress({ date: date.toIsoDate(d), taskId, delta: sign * config.progressStep });
    this.refresh();
  }

  /** Основные задачи — ползунок. */
  onSlide(taskId, value){
    const d = date.addDays(date.dPlus1(this.baseDate), -1);
    SetProgress({ date: date.toIsoDate(d), taskId, value: Number(value) });
    this.refresh();
  }

  /** Основные задачи — закрыть/открыть. */
  onToggle(taskId){
    const d = date.addDays(date.dPlus1(this.baseDate), -1);
    ToggleClosed({ taskId, date: date.toIsoDate(d) });
    this.refresh();
  }

  /** Основные задачи — смена минут. */
  /** Очистка дня. */
  onResetDay(){
    const d = date.addDays(date.dPlus1(this.baseDate), -1);
    ResetDay({ date: date.toIsoDate(d) });
    this.refresh();
  }

  /** Добавить новую задачу в сегодня. */
  onAddSave(title, minutes){
    const d = date.addDays(date.dPlus1(this.baseDate), -1);
    AddDayTask({ date: date.toIsoDate(d), title, minutes: Number(minutes)||0 });
    this.refresh();
  }

  /** Правка существующей задачи сегодня. */
  onEditSave(taskId, title, minutes){
    const d = date.addDays(date.dPlus1(this.baseDate), -1);
    EditDayTask({ date: date.toIsoDate(d), taskId, title, minutes: Number(minutes)||0 });
    this.refresh();
  }

  /** Оффлоад — шаг ±10%. */
  onOffloadStep(taskId, targetIso, sign){
    SetProgress({ date: targetIso, taskId, delta: sign * config.progressStep });
    this.refresh();
  }

  /** Оффлоад — ползунок. */
  onOffloadSlide(taskId, targetIso, value){
    SetProgress({ date: targetIso, taskId, value: Number(value) });
    this.refresh();
  }
}

