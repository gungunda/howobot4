/**
 * Доменные сущности: Task, Schedule, DayTasks.
 * Простейные классы с инвариантами и короткими методами.
 * JSDoc — на русском языке для понятности.
 */
import { clamp } from "../utils/date.js";

/** @typedef {0|1|2|3|4|5|6} Weekday  // Пн=0..Вс=6 */

export class Task {
  constructor({ id, title, minutes = 0, progress = 0, closed = false, unloadDays = null }) {
    this.id = String(id);
    this.title = String(title || "").trim();
    this.minutes = Math.max(0, Math.floor(minutes || 0));
    this.progress = clamp(Math.floor(progress || 0), 0, 100);
    this.closed = !!closed;
    this.unloadDays = Array.isArray(unloadDays) ? [...unloadDays] : null;
    if (!this.title) throw new Error("Task.title не может быть пустым");
  }
  rename(title) {
    const t = String(title || "").trim();
    if (!t) throw new Error("Название не может быть пустым");
    this.title = t;
  }
  setMinutes(mins) { this.minutes = Math.max(0, Math.floor(mins || 0)); }
  setProgress(v) { this.progress = clamp(Math.floor(v || 0), 0, 100); }
  toggleClosed() { this.closed = !this.closed; }
  clone() {
    return new Task({
      id: this.id, title: this.title, minutes: this.minutes,
      progress: this.progress, closed: this.closed, unloadDays: this.unloadDays ? [...this.unloadDays] : null
    });
  }
  withNoUnload() { const c = this.clone(); c.unloadDays = null; return c; }
}

/** Недельное расписание: byDay[0..6], где 0 = Пн, 6 = Вс. */
export class Schedule {
  /** @param {Record<Weekday, Task[]>|undefined} data */
  constructor(data) {
    /** @type {Record<Weekday, Task[]>} */
    this.byDay = { 0:[],1:[],2:[],3:[],4:[],5:[],6:[] };
    if (data) {
      for (const k of Object.keys(this.byDay)) {
        const arr = Array.isArray(data[k]) ? data[k] : [];
        this.byDay[k] = arr.map(t => new Task(t));
      }
    }
  }
  list(day) { return this.byDay[day] || []; }
  add(day, task) { const arr = this.byDay[day]; if (!arr) throw new Error("Неверный день недели"); arr.push(new Task(task)); }
  remove(day, taskId) { const arr = this.byDay[day]; if (!arr) return; const i = arr.findIndex(t => t.id === taskId); if (i >= 0) arr.splice(i, 1); }
  find(day, taskId) { const arr = this.byDay[day] || []; return arr.find(t => t.id === taskId) || null; }
  setMinutes(day, taskId, mins) { const t = this.find(day, taskId); if (!t) return; t.setMinutes(mins); }
  rename(day, taskId, title) { const t = this.find(day, taskId); if (!t) return; t.rename(title); }
  setUnloadDays(day, taskId, unloadDays) {
    const t = this.find(day, taskId); if (!t) return;
    const blocked = ((day + 6) % 7);
    const clean = (Array.isArray(unloadDays) ? unloadDays : [])
      .map(n => Number(n))
      .filter(n => n >= 0 && n <= 6 && n !== blocked);
    t.unloadDays = clean;
  }
}

export class DayTasks {
  constructor(date, tasks = []) { this.date = String(date); this.tasks = tasks.map(t => new Task(t).withNoUnload()); }
  static create(date, tasks=[]) { return new DayTasks(date, tasks); }
  addTask(task) { this.tasks.push(new Task(task).withNoUnload()); }
  removeTask(taskId) { const i = this.tasks.findIndex(t => t.id === taskId); if (i >= 0) this.tasks.splice(i, 1); }
  findTask(taskId) { return this.tasks.find(t => t.id === taskId) || null; }
  setMinutes(taskId, mins) { const t = this.findTask(taskId); if (!t) return; t.setMinutes(mins); }
  setProgress(taskId, progress) { const t = this.findTask(taskId); if (!t) return; t.setProgress(progress); }
  rename(taskId, title) { const t = this.findTask(taskId); if (!t) return; t.rename(title); }
  toggleClosed(taskId) { const t = this.findTask(taskId); if (!t) return; t.toggleClosed(); }
  clear() { this.tasks = []; }
}


