/**
 * DropScheduleTask — удалить предмет из расписания дня недели.
 * @param {Object} p
 * @param {0|1|2|3|4|5|6} p.weekday
 * @param {string} p.taskId
 * @returns {{ ok: true }}
 */
import { loadSchedule, saveSchedule } from "../storage/storage.js";

export function DropScheduleTask({ weekday, taskId }){
  if (!taskId) return { ok:false, reason:"bad_args" };
  const schedule = loadSchedule();
  schedule.remove(weekday, taskId);
  saveSchedule(schedule);
  return { ok:true };
}


