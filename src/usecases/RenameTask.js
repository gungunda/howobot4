/**
 * RenameTask — переименование в Schedule или в DayTasks.
 */
import { loadSchedule, saveSchedule, ensureDay, saveDay } from "../storage/storage.js";

/**
 * @param {object} p
 * @param {string} p.title
 * @param {string} p.taskId
 * @param {string} [p.date] ISO YYYY-MM-DD — если передан, правим в DayTasks
 * @param {0|1|2|3|4|5|6} [p.weekday] — если date не передан, правим в Schedule
 */
export function RenameTask({ title, taskId, date, weekday }) {
  if (date) {
    const day = ensureDay(date);
    day.rename(taskId, title);
    saveDay(date, day);
    return { ok: true, scope: "day" };
  }
  const schedule = loadSchedule();
  schedule.rename(weekday, taskId, title);
  saveSchedule(schedule);
  return { ok: true, scope: "schedule" };
}
