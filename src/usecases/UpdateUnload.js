/**
 * UpdateUnload — изменение прогресса задачи «в разгрузке».
 * Меняем прогресс в целевом дне (DayTasks targetDate).
 */
import { ensureDay, saveDay, loadSchedule } from "../storage/storage.js";
import { clamp } from "../utils/date.js";

/**
 * @param {object} p
 * @param {string} p.targetDate ISO — день, для которого идёт разгрузка
 * @param {string} p.taskId
 * @param {number} [p.delta]
 * @param {number} [p.value]
 * @param {0|1|2|3|4|5|6} [p.targetWeekday] — для проверки доступности разгрузки (опционально)
 */
export function UpdateUnload({ targetDate, taskId, delta, value, targetWeekday }) {
  const day = ensureDay(targetDate);
  const t = day.findTask(taskId);
  if (!t) {
    const sched = loadSchedule();
    let title = "Задача";
    for (let w=0; w<7; w++) {
      const cand = sched.list(w).find(x => x.id === taskId);
      if (cand) { title = cand.title; break; }
    }
    day.addTask({ id: taskId, title, minutes: 0, progress: 0, closed: false, unloadDays: null });
  }
  const task = day.findTask(taskId);
  const next = (typeof value === "number")
    ? clamp(Math.floor(value), 0, 100)
    : clamp(Math.floor((task?.progress || 0) + (delta || 0)), 0, 100);
  day.setProgress(taskId, next);
  saveDay(targetDate, day);
  return { ok: true, progress: next };
}
