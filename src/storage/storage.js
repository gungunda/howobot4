// /src/storage/storage.js
/**
 * Единое хранилище поверх localStorage.
 * Ключи:
 *  - schedule_v1         — недельный шаблон (весь целиком)
 *  - day_YYYY-MM-DD      — оверрайд конкретного дня (DayTasks)
 * ВАЖНО: отдельных task_${id} нет. Задачи живут только внутри schedule/day.
 */
import { DayTasks, Schedule, Task } from "../entities/entities.js";
import { toIsoDate, weekdayRu, addDays } from "../utils/date.js";

const KEY_SCHEDULE = "schedule_v1";

/** Инициализация: создаём пустой schedule при отсутствии. */
export function initStorage() {
  if (!localStorage.getItem(KEY_SCHEDULE)) {
    const empty = new Schedule();
    saveSchedule(empty);
  }
}

/** Простой генератор id */
export function genId() {
  const suf = Math.random().toString(36).slice(2, 6);
  return `${Date.now().toString(36)}${suf}`;
}

/** Сохранить недельное расписание. */
export function saveSchedule(schedule) {
  const plain = { 0:[],1:[],2:[],3:[],4:[],5:[],6:[] };
  for (const d of Object.keys(plain)) {
    plain[d] = (schedule.byDay[d] || []).map(t => ({
      id: t.id, title: t.title, minutes: t.minutes, progress: t.progress,
      closed: t.closed, unloadDays: t.unloadDays ? [...t.unloadDays] : []
    }));
  }
  localStorage.setItem(KEY_SCHEDULE, JSON.stringify(plain));
}

/** Загрузить недельное расписание. */
export function loadSchedule() {
  const raw = localStorage.getItem(KEY_SCHEDULE);
  if (!raw) return new Schedule();
  try { return new Schedule(JSON.parse(raw)); } catch { return new Schedule(); }
}

/** Ключ day_* по ISO дате. */
function dayKey(dateIso) { return `day_${dateIso}`; }

/** Сохранить DayTasks. */
export function saveDay(dateIso, day) {
  const iso = toIsoDate(new Date(dateIso));
  const plain = {
    date: iso,
    tasks: day.tasks.map(t => ({
      id: t.id,
      title: t.title,
      minutes: t.minutes,
      progress: t.progress,
      closed: t.closed,
      unloadDays: null
    }))
  };
  localStorage.setItem(dayKey(iso), JSON.stringify(plain));
}

/** Загрузить DayTasks. Возвращает DayTasks или null. */
export function loadDay(dateIso) {
  const iso = toIsoDate(new Date(dateIso));
  const raw = localStorage.getItem(dayKey(iso));
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw);
    return new DayTasks(obj.date, obj.tasks);
  } catch { return null; }
}

/** Убедиться, что DayTasks существует (иначе создать пустой). */
export function ensureDay(dateIso) {
  return loadDay(dateIso) || DayTasks.create(toIsoDate(new Date(dateIso)));
}

/** Удалить оверрайд дня (полностью). */
export function deleteDay(dateIso) {
  localStorage.removeItem(dayKey(toIsoDate(new Date(dateIso))));
}

/** Очистить старые day_* старше N дней от сегодня. */
export function cleanupOldDays(daysToKeep) {
  if (!Number.isFinite(daysToKeep) || daysToKeep <= 0) return;
  const now = new Date();
  const limit = new Date(now.getTime());
  limit.setDate(limit.getDate() - daysToKeep);
  const limitIso = toIsoDate(limit);
  const keys = Object.keys(localStorage).filter(k => k.startsWith("day_"));
  for (const k of keys) {
    const iso = k.slice(4);
    if (iso < limitIso) localStorage.removeItem(k);
  }
}

/**
 * Найти задачу из расписания для календарной даты D, где
 * R = D+1 — родной день в расписании (Mon=0).
 */
export function findScheduledTaskForDate(dateIso, taskId){
  const schedule = loadSchedule();
  const d = new Date(dateIso);
  const rDate = addDays(d, 1);
  const r = weekdayRu(rDate); // Пн=0
  const t = schedule.find(r, taskId);
  return t ? new Task(t) : null;
}

/**
 * Убедиться, что в оверрайде дня D есть запись по taskId;
 * если нет — подтянуть копию из расписания R = D+1 (с правильными title/minutes).
 */
export function ensureDayTask(dateIso, taskId){
  const day = ensureDay(dateIso);
  const found = day.findTask(taskId);
  if (found) return day;
  const base = findScheduledTaskForDate(dateIso, taskId);
  if (base) {
    day.addTask(base);
    return day;
  }
  // fallback (не должно срабатывать при корректных данных расписания)
  day.addTask({ id: taskId, title: "Задача", minutes: 0, progress: 0, closed: false, unloadDays: null });
  return day;
}

/**
 * Композиция для экрана D+1:
 *  - если override(D) существует — он источник истины, показываем ТОЛЬКО его задачи;
 *  - если override(D) нет — показываем чистое расписание для weekdayRu(D+1).
 * Возвращает { dateIso (D+1 ISO), tasks: Task[] }.
 */
export function composeDPlus1View(dPlus1) {
  const dateIso = toIsoDate(dPlus1);
  const override = loadDay(toIsoDate(addDays(dPlus1, -1))); // DayTasks(D), где D = (D+1)-1

  // ⚠️ Поведение «экрана»: наличие оверрайда (даже пустого) полностью определяет список задач
  if (override) {
    const tasks = (override.tasks || []).map(t =>
      new Task({ id: t.id, title: t.title, minutes: t.minutes, progress: t.progress, closed: t.closed, unloadDays: null })
    );
    return { dateIso, tasks };
  }

  // Нет оверрайда — чистое расписание
  const w = weekdayRu(dPlus1);
  const schedule = loadSchedule();
  const base = schedule.list(w).map(t => new Task(t));
  return { dateIso, tasks: base };
}