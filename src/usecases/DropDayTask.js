/**
 * DropDayTask — удалить задачу из DayTasks(date).
 * @param {Object} p
 * @param {string} p.date   ISO YYYY-MM-DD
 * @param {string} p.taskId
 * @returns {{ ok: true }}
 */
import { ensureDay, saveDay } from "../storage/storage.js";

export function DropDayTask({ date, taskId }){
  const day = ensureDay(date);
  day.tasks = day.tasks.filter(t => t.id !== taskId);
  saveDay(date, day);
  return { ok:true };
}


