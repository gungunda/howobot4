/**
 * Единое хранилище поверх localStorage.
 * Ключи:
 *  - schedule_v1         — недельный шаблон (весь целиком)
 *  - day_YYYY-MM-DD      — оверрайд конкретного дня
 * ВАЖНО: отдельных task_${id} нет. Задачи живут только внутри schedule/day.
 */
import { DayTasks, Schedule, Task } from "../entities/entities.js";
import { toIsoDate } from "../utils/date.js";

const KEY_SCHEDULE = "schedule_v1";

/** Инициализация: создаём пустой schedule при отсутствии. */
export function initStorage() {
  if (!localStorage.getItem(KEY_SCHEDULE)) {
    const empty = new Schedule();
    saveSchedule(empty);
  }
}

/** Простой генератор id: время + короткий суффикс. */
export function genId() {
  const suf = Math.random().toString(36).slice(2, 6);
  return `${Date.now().toString(36)}${suf}`;
}

/** Сохранить недельное расписание. */
export function saveSchedule(schedule) {
  // сериализуем без методов: plain JSON
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
  try {
    const obj = JSON.parse(raw);
    return new Schedule(obj);
  } catch {
    return new Schedule();
  }
}

/** Ключ day_* по ISO дате. */
function dayKey(dateIso) {
  return `day_${dateIso}`;
}

/** Сохранить DayTasks (обнуляем unloadDays у всех задач). */
export function saveDay(dateIso, day) {
  const iso = toIsoDate(new Date(dateIso));
  const plain = {
    date: iso,
    tasks: day.tasks.map(t => ({
      id: t.id, title: t.title, minutes: t.minutes, progress: t.progress, closed: t.closed, unloadDays: null
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
  } catch {
    return null;
  }
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
 * Композиция D+1 для отображения:
 * - base: задачи из расписания на нужный weekday
 * - override: DayTasks (если есть)
 */
export function composeDPlus1View(dPlus1) {
  const dateIso = toIsoDate(dPlus1);
  const weekday = dPlus1.getDay();
  const schedule = loadSchedule();
  const base = schedule.list(weekday).map(t => new Task(t));
  const override = loadDay(dateIso);
  return { base, override };
}
