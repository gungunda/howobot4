/**
 * EditScheduleTask — правка предмета расписания (одно действие модалки).
 * @param {Object} p
 * @param {0|1|2|3|4|5|6} p.weekday
 * @param {string} p.taskId
 * @param {string} p.title
 * @param {number} p.minutes
 * @param {number[]} p.unloadDays
 * @returns {{ ok: true }}
 */
import { loadSchedule, saveSchedule } from "../storage/storage.js";

function normUnload(arr){
  const set = new Set((arr||[]).map(n => Number(n)).filter(n => n>=0 && n<=6));
  return Array.from(set).sort((a,b)=>a-b);
}

export function EditScheduleTask({ weekday, taskId, title, minutes, unloadDays }){
  const tt = String(title||"").trim();
  const mm = Math.max(0, Number(minutes)||0);
  const days = normUnload(unloadDays);
  if (!taskId || !tt) return { ok:false, reason:"bad_args" };

  const schedule = loadSchedule();
  schedule.rename(weekday, taskId, tt);
  schedule.setMinutes(weekday, taskId, mm);
  schedule.setUnloadDays(weekday, taskId, days);
  saveSchedule(schedule);
  return { ok:true };
}


