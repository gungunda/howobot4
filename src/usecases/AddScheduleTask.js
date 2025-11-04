/**
 * AddScheduleTask — добавить предмет в расписание дня недели.
 * @param {Object} p
 * @param {0|1|2|3|4|5|6} p.weekday  Пн=0..Вс=6
 * @param {string} p.title           Название
 * @param {number} p.minutes         Минуты (>=0)
 * @param {number[]} p.unloadDays    Дни разгрузки (Mon0), можно пустой массив
 * @returns {{ ok: true, id: string }}
 */
import { loadSchedule, saveSchedule, genId } from "../storage/storage.js";
import { Task } from "../entities/entities.js";

function normUnload(arr){
  const set = new Set((arr||[]).map(n => Number(n)).filter(n => n>=0 && n<=6));
  return Array.from(set).sort((a,b)=>a-b);
}

export function AddScheduleTask({ weekday, title, minutes, unloadDays = [] }){
  const tt = String(title||"").trim();
  const mm = Math.max(0, Number(minutes)||0);
  const days = normUnload(unloadDays);
  if (!tt) return { ok:false, reason:"empty_title" };

  const schedule = loadSchedule();
  const task = new Task({
    id: genId(),
    title: tt,
    minutes: mm,
    progress: 0,
    closed: false,
    unloadDays: days
  });
  schedule.add(weekday, task);
  // на всякий случай дублируем в setter, если реализация хранит отдельно
  schedule.setUnloadDays?.(weekday, task.id, days);
  saveSchedule(schedule);
  return { ok:true, id: task.id };
}


