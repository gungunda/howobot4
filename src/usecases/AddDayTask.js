/** 
 * AddDayTask — добавить новую задачу в DayTasks(date).
 * @param {Object} p
 * @param {string} p.date ISO-дата дня (сегодня)
 * @param {string} p.title Название
 * @param {number} p.minutes Минуты (>=0)
 * @returns {void}
 */
import { ensureDay, saveDay, genId } from "../storage/storage.js";

export function AddDayTask({ date, title, minutes }){
  const t = String(title || "").trim();
  const m = Math.max(0, Number(minutes) || 0);
  if (!t) return;

  const day = ensureDay(date);
  day.addTask({
    id: genId(),
    title: t,
    minutes: m,
    progress: 0,
    closed: false,
    unloadDays: null
  });
  saveDay(date, day);
}


