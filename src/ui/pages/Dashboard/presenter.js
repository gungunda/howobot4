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
      onSetMinutes: (taskId, minutes) => this.onSetMinutes(taskId, minutes),
      onResetDay: () => this.onResetDay(),
      // оффлоад
      onOffloadStep: (taskId, targetIso, sign) => this.onOffloadStep(taskId, targetIso, sign),
      onOffloadSlide: (taskId, targetIso, value) => this.onOffloadSlide(taskId, targetIso, value),
    });
    this.view.render();
  }
  refresh(){ this.render(); }
  // Основные
  onStep(taskId, sign){
    const d1 = date.dPlus1(this.baseDate);
    SetProgress({ date: date.toIsoDate(d1), taskId, delta: sign * config.progressStep });
    this.refresh();
  }
  onSlide(taskId, value){
    const d1 = date.dPlus1(this.baseDate);
    SetProgress({ date: date.toIsoDate(d1), taskId, value: Number(value) });
    this.refresh();
  }
  onToggle(taskId){
    const d1 = date.dPlus1(this.baseDate);
    ToggleClosed({ taskId, date: date.toIsoDate(d1) });
    this.refresh();
  }
  onSetMinutes(taskId, minutes){
    const d1 = date.dPlus1(this.baseDate);
    SetMinutes({ taskId, minutes: Number(minutes), date: date.toIsoDate(d1) });
    this.refresh();
  }
  onResetDay(){
    const d1 = date.dPlus1(this.baseDate);
    ResetDay({ date: date.toIsoDate(d1) });
    this.refresh();
  }
  // Оффлоад — пишем в DayTasks(targetIso)
  onOffloadStep(taskId, targetIso, sign){
    SetProgress({ date: targetIso, taskId, delta: sign * config.progressStep });
    this.refresh();
  }
  onOffloadSlide(taskId, targetIso, value){
    SetProgress({ date: targetIso, taskId, value: Number(value) });
    this.refresh();
  }
}


