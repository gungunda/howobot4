
/**
 * ResetToSchedule — удалить оверрайд дня, чтобы отобразить чистое расписание.
 * По сути: removeItem("day_YYYY-MM-DD").
 * @param {object} p
 * @param {string} p.date ISO YYYY-MM-DD
 * @returns {{ok:true}}
 */
import { deleteDay } from "../storage/storage.js";

export function ResetToSchedule({ date }) {
  deleteDay(date);
  return { ok: true };
}


