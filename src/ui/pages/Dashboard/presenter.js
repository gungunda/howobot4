/**
 * DashboardPresenter — презентер экрана «Дашборд».
 * ВАЖНО: основные задачи показываются для D+1, но любые правки (progress/minutes/closed)
 * записываются в DayTasks(D), где D = (D+1) - 1 (сегодня).
 */
import * as date from "../../../utils/date.js";
import { LoadDashboard } from "../../../usecases/LoadDashboard.js";
import { SetProgress } from "../../../usecases/SetProgress.js";
import { SetMinutes } from "../../../usecases/SetMinutes.js";
import { ToggleClosed } from "../../../usecases/ToggleClosed.js";
import { ResetDay } from "../../../usecases/ResetDay.js";
import { DashboardView } from "./view.js";
import { config } from "../../../config.js";

export class DashboardPresenter {
  constructor(sectionRoot){
    this.root = sectionRoot;
    this.baseDate = date.today();
  }

  /** Рендер экрана. */
  render(){
    const d1 = date.dPlus1(this.baseDate);     // завтрашняя дата (родной день расписания)
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
      // Основные задачи → сохраняем в DayTasks(D), где D = d1 - 1
      onStep: (taskId, sign) => this.onStep(taskId, sign),
      onSlide: (taskId, value) => this.onSlide(taskId, value),
      onToggle: (taskId) => this.onToggle(taskId),
      onSetMinutes: (taskId, minutes) => this.onSetMinutes(taskId, minutes),
      onResetDay: () => this.onResetDay(),

      // Разгрузка → сохраняем в DayTasks(targetIso), пришедший из VM
      onOffloadStep: (taskId, targetIso, sign) => this.onOffloadStep(taskId, targetIso, sign),
      onOffloadSlide: (taskId, targetIso, value) => this.onOffloadSlide(taskId, targetIso, value),
    });

    this.view.render();
  }

  /** Полный перерендер. */
  refresh(){ this.render(); }

  /** Изменение прогресса основной задачи ±10%. */
  onStep(taskId, sign){
    const d1 = date.dPlus1(this.baseDate);
    const d = this.baseDate;                  // D = (D+1) - 1
    SetProgress({ date: date.toIsoDate(d), taskId, delta: sign * config.progressStep });
    this.refresh();
  }

  /** Изменение прогресса основной задачи ползунком. */
  onSlide(taskId, value){
    const d1 = date.dPlus1(this.baseDate);
    const d = this.baseDate;                  // D = (D+1) - 1
    SetProgress({ date: date.toIsoDate(d), taskId, value: Number(value) });
    this.refresh();
  }

  /** Переключение статуса закрытости основной задачи. */
  onToggle(taskId){
    const d1 = date.dPlus1(this.baseDate);
    const d = this.baseDate;                  // D = (D+1) - 1
    ToggleClosed({ taskId, date: date.toIsoDate(d) });
    this.refresh();
  }

  /** Установка минут основной задачи. */
  onSetMinutes(taskId, minutes){
    const d1 = date.dPlus1(this.baseDate);
    const d = this.baseDate;                  // D = (D+1) - 1
    SetMinutes({ taskId, minutes: Number(minutes), date: date.toIsoDate(d) });
    this.refresh();
  }

  /** Очистка оверрайда текущего дня (DayTasks(D)). */
  onResetDay(){
    const d1 = date.dPlus1(this.baseDate);
    const d = this.baseDate;                  // D = (D+1) - 1
    ResetDay({ date: date.toIsoDate(d) });
    this.refresh();
  }

  /** Разгрузка: шаг прогресса (±10%) — сохраняем в DayTasks(targetIso). */
  onOffloadStep(taskId, targetIso, sign){
    SetProgress({ date: targetIso, taskId, delta: sign * config.progressStep });
    this.refresh();
  }

  /** Разгрузка: ползунок — сохраняем в DayTasks(targetIso). */
  onOffloadSlide(taskId, targetIso, value){
    SetProgress({ date: targetIso, taskId, value: Number(value) });
    this.refresh();
  }
}

