/** 
 * DashboardPresenter — презентер экрана «Дашборд».
 * Задачи дня правятся в DayTasks(D), где D = this.baseDate (прямо).
 * D+1 используется только для показа списка (шаблон расписания на завтра).
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
    // D+1 — только для композиции показа
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

  // === Целевая дата для сохранений — СЕГОДНЯ (baseDate) ===
  get todayIso(){ return date.toIsoDate(this.baseDate); }

  /** Основные задачи — прогресс ±10%. */
  onStep(taskId, sign){
    SetProgress({ date: this.todayIso, taskId, delta: sign * config.progressStep });
    this.refresh();
  }

  /** Основные задачи — ползунок. */
  onSlide(taskId, value){
    SetProgress({ date: this.todayIso, taskId, value: Number(value) });
    this.refresh();
  }

  /** Основные задачи — закрыть/открыть. */
  onToggle(taskId){
    ToggleClosed({ taskId, date: this.todayIso });
    this.refresh();
  }

  /** Очистка дня. */
  onResetDay(){
    ResetDay({ date: this.todayIso });
    this.refresh();
  }

  /** Добавить новую задачу в сегодня. */
  onAddSave(title, minutes){
    AddDayTask({ date: this.todayIso, title, minutes: Number(minutes)||0 });
    this.refresh();
  }

  /** Правка существующей задачи сегодня. */
  onEditSave(taskId, title, minutes){
    EditDayTask({ date: this.todayIso, taskId, title, minutes: Number(minutes)||0 });
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

