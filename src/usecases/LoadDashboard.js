/**
 * LoadDashboard — собирает данные для экрана «Дашборд».
 * - Всегда показываем D+1 от выбранной даты (пока просто от «сегодня»).
 * - Метрики: нагрузка, выполнено, осталось, финиш (часы:минуты).
 */
import { composeDPlus1View } from "../storage/storage.js";
import { minutesToHhmm } from "../utils/date.js";

export function LoadDashboard(dPlus1) {
  const { base, override } = composeDPlus1View(dPlus1);
  const fact = override ? override.tasks : base;

  const totalMinutes = fact.reduce((s, t) => s + (t.closed ? 0 : t.minutes), 0);
  const doneMinutes  = fact.reduce((s, t) => {
    if (t.closed) return s;
    const pct = Math.max(0, Math.min(100, t.progress || 0));
    return s + Math.round(t.minutes * pct / 100);
  }, 0);
  const leftMinutes  = Math.max(0, totalMinutes - doneMinutes);

  return {
    tasks: fact,
    metrics: {
      load:  minutesToHhmm(totalMinutes),
      done:  minutesToHhmm(doneMinutes),
      left:  minutesToHhmm(leftMinutes),
      finish: minutesToHhmm(leftMinutes),
    }
  };
}
