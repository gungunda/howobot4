/** 
 * EditDayTask — правка названия и минут задачи в DayTasks(date).
 * @param {Object} p
 * @param {string} p.date ISO-дата дня (сегодня)
 * @param {string} p.taskId ID задачи
 * @param {string} p.title Новое название
 * @param {number} p.minutes Новые минуты (>=0)
 * @returns {void}
 */
import { ensureDayTask, saveDay } from "../storage/storage.js";

export function EditDayTask({ date, taskId, title, minutes }){
  const t = String(title || "").trim();
  const m = Math.max(0, Number(minutes) || 0);
  if (!taskId || !t) return;

  const day = ensureDayTask(date, taskId);
  const item = day.findTask(taskId);
  if (!item) return;

  item.title = t;
  item.minutes = m;
  saveDay(date, day);
}

