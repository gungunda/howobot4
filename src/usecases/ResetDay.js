/**
 * ResetDay — очищает DayTasks указанной даты (пустой список).
 */
import { ensureDay, saveDay } from "../storage/storage.js";

/**
 * @param {object} p
 * @param {string} p.date ISO YYYY-MM-DD
 */
export function ResetDay({ date }) {
  const day = ensureDay(date);
  day.clear();
  saveDay(date, day);
  return { ok: true };
}
