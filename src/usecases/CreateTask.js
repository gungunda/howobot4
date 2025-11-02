/**
 * CreateTask — добавить предмет в расписание конкретного дня недели.
 * Поток: load → mutate via Entities → save → ok
 */
import { genId, loadSchedule, saveSchedule } from "../storage/storage.js";
import { Task } from "../entities/entities.js";

/**
 * @param {object} p
 * @param {0|1|2|3|4|5|6} p.weekday
 * @param {string} p.title
 * @param {number} p.minutes
 * @param {number[]} [p.unloadDays] // опционально
 */
export function CreateTask({ weekday, title, minutes, unloadDays = [] }) {
  const schedule = loadSchedule();
  const task = new Task({
    id: genId(),
    title,
    minutes: Math.max(0, Math.floor(minutes || 0)),
    progress: 0,
    closed: false,
    unloadDays: unloadDays,
  });
  schedule.add(weekday, task);
  saveSchedule(schedule);
  return { ok: true, id: task.id };
}
