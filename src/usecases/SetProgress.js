/**
 * SetProgress — изменение прогресса задачи для конкретной даты (обычно D+1 или «разгрузка»).
 * Всегда правим в DayTasks.
 */
import { ensureDay, saveDay } from "../storage/storage.js";
import { clamp } from "../utils/date.js";

/**
 * @param {object} p
 * @param {string} p.date ISO YYYY-MM-DD — какой день правим
 * @param {string} p.taskId
 * @param {number} [p.delta]  — относительное изменение (например +10/-10)
 * @param {number} [p.value]  — абсолютное значение 0..100
 */
export function SetProgress({ date, taskId, delta, value }) {
  const day = ensureDay(date);
  const t = day.findTask(taskId);
  if (!t) {
    day.addTask({ id: taskId, title: "Задача", minutes: 0, progress: 0, closed: false, unloadDays: null });
  }
  const task = day.findTask(taskId);
  const next = (typeof value === "number")
    ? clamp(Math.floor(value), 0, 100)
    : clamp(Math.floor((task?.progress || 0) + (delta || 0)), 0, 100);
  day.setProgress(taskId, next);
  saveDay(date, day);
  return { ok: true, progress: next };
}
