/**
 * SetProgress — изменение прогресса задачи для конкретной даты (обычно D+1).
 * Всегда правим в DayTasks.
 */
import { ensureDayTaskFromSchedule, saveDay } from "../storage/storage.js";
import { clamp } from "../utils/date.js";

/**
 * @param {object} p
 * @param {string} p.date ISO YYYY-MM-DD — какой день правим
 * @param {string} p.taskId
 * @param {number} [p.delta]  — относительное изменение (например +10/-10)
 * @param {number} [p.value]  — абсолютное значение 0..100
 */
export function SetProgress({ date, taskId, delta, value }) {
  const day = ensureDayTaskFromSchedule(date, taskId);
  const t = day.findTask(taskId);
  const next = (typeof value === "number")
    ? clamp(Math.floor(value), 0, 100)
    : clamp(Math.floor((t?.progress || 0) + (delta || 0)), 0, 100);
  day.setProgress(taskId, next);
  saveDay(date, day);
  return { ok: true, progress: next };
}


