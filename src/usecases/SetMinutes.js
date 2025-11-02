/**
 * SetMinutes — правка минут в Schedule или в DayTasks (D+1).
 */
import { ensureDay, loadSchedule, saveDay, saveSchedule } from "../storage/storage.js";

/**
 * @param {object} p
 * @param {string} p.taskId
 * @param {number} p.minutes
 * @param {string} [p.date] ISO — если передан, правим DayTasks
 * @param {0|1|2|3|4|5|6} [p.weekday] — если date не передан, правим Schedule
 */
export function SetMinutes({ taskId, minutes, date, weekday }) {
  const m = Math.max(0, Math.floor(minutes || 0));
  if (date) {
    const day = ensureDay(date);
    day.setMinutes(taskId, m);
    saveDay(date, day);
    return { ok: true, scope: "day" };
  }
  const schedule = loadSchedule();
  schedule.setMinutes(weekday, taskId, m);
  saveSchedule(schedule);
  return { ok: true, scope: "schedule" };
}
