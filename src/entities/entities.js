/**
 * Доменные сущности: Task, Schedule, DayTasks.
 * Простейные классы с инвариантами и короткими методами.
 * JSDoc — на русском языке для понятности.
 */
import { clamp } from "../utils/date.js";

/** @typedef {0|1|2|3|4|5|6} Weekday */

/**
 * Класс предмета/задачи.
 * В расписании у задачи есть unloadDays (дни разгрузки).
 * В DayTasks unloadDays всегда null.
 */
export class Task {
  /**
   * @param {object} p
   * @param {string} p.id
   * @param {string} p.title
   * @param {number} p.minutes
   * @param {number} p.progress   0..100
   * @param {boolean} p.closed
   * @param {Weekday[]|null} p.unloadDays
   */
  constructor({ id, title, minutes = 0, progress = 0, closed = false, unloadDays = null }) {
    this.id = String(id);
    this.title = String(title || "").trim();
    this.minutes = Math.max(0, Math.floor(minutes || 0));
    this.progress = clamp(Math.floor(progress || 0), 0, 100);
    this.closed = !!closed;
    this.unloadDays = Array.isArray(unloadDays) ? [...unloadDays] : null;
    if (!this.title) throw new Error("Task.title не может быть пустым");
  }
  /** Переименовать предмет. */
  rename(title) {
    const t = String(title || "").trim();
    if (!t) throw new Error("Название не может быть пустым");
    this.title = t;
  }
  /** Установить минуты (целое, ≥0). */
  setMinutes(mins) {
    this.minutes = Math.max(0, Math.floor(mins || 0));
  }
  /** Установить прогресс, 0..100. */
  setProgress(v) {
    this.progress = clamp(Math.floor(v || 0), 0, 100);
  }
  /** Переключить флаг закрытости. */
  toggleClosed() {
    this.closed = !this.closed;
  }
  /** Возвращает копию задачи (для безопасного переноса между сущностями). */
  clone() {
    return new Task({
      id: this.id, title: this.title, minutes: this.minutes,
      progress: this.progress, closed: this.closed, unloadDays: this.unloadDays ? [...this.unloadDays] : null
    });
  }
  /** Принудительно обнулить unloadDays (для DayTasks). */
  withNoUnload() {
    const c = this.clone();
    c.unloadDays = null;
    return c;
  }
}

/**
 * Недельное расписание.
 * Хранит массивы Task по дням недели 0..6 (вс-пн... по стандарту JS).
 * ВАЛИДАЦИЯ: «предшествующий дню» для разгрузки запрещён.
 */
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
  /** Список задач для дня недели. */
  list(day) { return this.byDay[day] || []; }
  /** Добавить задачу в конкретный день недели. */
  add(day, task) {
    const arr = this.byDay[day]; if (!arr) throw new Error("Неверный день недели");
    arr.push(new Task(task));
  }
  /** Удалить задачу по id из дня недели. */
  remove(day, taskId) {
    const arr = this.byDay[day]; if (!arr) return;
    const i = arr.findIndex(t => t.id === taskId);
    if (i >= 0) arr.splice(i, 1);
  }
  /** Найти задачу. */
  find(day, taskId) {
    const arr = this.byDay[day] || [];
    return arr.find(t => t.id === taskId) || null;
  }
  /** Правка минут. */
  setMinutes(day, taskId, mins) {
    const t = this.find(day, taskId); if (!t) return;
    t.setMinutes(mins);
  }
  /** Правка названия. */
  rename(day, taskId, title) {
    const t = this.find(day, taskId); if (!t) return;
    t.rename(title);
  }
  /** Правка разгрузочных дней с запретом «предшественника». */
  setUnloadDays(day, taskId, unloadDays) {
    const t = this.find(day, taskId); if (!t) return;
    const blocked = ((day + 6) % 7);
    const clean = (Array.isArray(unloadDays) ? unloadDays : [])
      .map(n => Number(n))
      .filter(n => n >= 0 && n <= 6 && n !== blocked);
    t.unloadDays = clean;
  }
}

/**
 * Оверрайд задач на конкретный календарный день.
 * Здесь у каждой задачи unloadDays === null.
 */
export class DayTasks {
  /** @param {string} date ISO YYYY-MM-DD */
  constructor(date, tasks = []) {
    this.date = String(date);
    this.tasks = tasks.map(t => new Task(t).withNoUnload());
  }
  /** Создать пустой. */
  static create(date, tasks=[]) { return new DayTasks(date, tasks); }
  /** Добавить задачу (копия с unloadDays=null). */
  addTask(task) { this.tasks.push(new Task(task).withNoUnload()); }
  /** Удалить задачу. */
  removeTask(taskId) {
    const i = this.tasks.findIndex(t => t.id === taskId);
    if (i >= 0) this.tasks.splice(i, 1);
  }
  /** Найти задачу. */
  findTask(taskId) {
    return this.tasks.find(t => t.id === taskId) || null;
  }
  /** Правка минут. */
  setMinutes(taskId, mins) {
    const t = this.findTask(taskId); if (!t) return;
    t.setMinutes(mins);
  }
  /** Правка прогресса. */
  setProgress(taskId, progress) {
    const t = this.findTask(taskId); if (!t) return;
    t.setProgress(progress);
  }
  /** Правка названия. */
  rename(taskId, title) {
    const t = this.findTask(taskId); if (!t) return;
    t.rename(title);
  }
  /** Переключить флаг закрытия. */
  toggleClosed(taskId) {
    const t = this.findTask(taskId); if (!t) return;
    t.toggleClosed();
  }
  /** Очистить день (пустой список). */
  clear() {
    this.tasks = [];
  }
}
