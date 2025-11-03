/**
 * ToggleClosed — переключение статуса закрытия (в DayTasks или Schedule).
 */
import { ensureDayTaskFromSchedule, loadSchedule, saveDay, saveSchedule } from "../storage/storage.js";

/**
 * @param {object} p
 * @param {string} p.taskId
 * @param {string} [p.date] ISO — если передан, правим DayTasks
 * @param {0|1|2|3|4|5|6} [p.weekday] — иначе правим Schedule (Пн=0..Вс=6)
 */
export function ToggleClosed({ taskId, date, weekday }) {
  if (date) {
    const day = ensureDayTaskFromSchedule(date, taskId);
    day.toggleClosed(taskId);
    saveDay(date, day);
    return { ok: true, scope: "day" };
  }
  const schedule = loadSchedule();
  const t = schedule.find(weekday, taskId);
  if (t) t.toggleClosed();
  saveSchedule(schedule);
  return { ok: true, scope: "schedule" };
}

