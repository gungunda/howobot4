/** 
 * LoadDashboard — собирает данные для экрана «Дашборд».
 * FIX: вычисляем W по дню D (а не по D+1), чтобы разгрузка срабатывала в правильный день.
 * Дополнено: metrics.done теперь в процентах по всем задачам дня (и закрытым, и открытым).
 */
import { composeDPlus1View, loadSchedule, loadDay } from "../storage/storage.js";
import { minutesToHhmm, weekdayRu, toIsoDate, nextDateWithWeekdayMon0, addDays } from "../utils/date.js";

export function LoadDashboard(dPlus1Date) {
  const { dateIso, tasks } = composeDPlus1View(dPlus1Date);

  // Минуты для «осталось» и ETA: считаем только по ОТКРЫТЫМ задачам (как было).
  const totalMinutesOpen = tasks.reduce((s, t) => s + (t.closed ? 0 : (t.minutes||0)), 0);
  const doneMinutesOpen  = tasks.reduce((s, t) => {
    if (t.closed) return s;
    const pct = Math.max(0, Math.min(100, t.progress || 0));
    return s + Math.round((t.minutes||0) * pct / 100);
  }, 0);
  const leftMinutes  = Math.max(0, totalMinutesOpen - doneMinutesOpen);

  // Процент выполнения (metrics.done): по ВСЕМ задачам (и закрытым, и открытым)
  const totalAll = tasks.reduce((s, t) => s + (t.minutes||0), 0);
  const doneWeightedAll = tasks.reduce((s, t) => {
    const m = t?.minutes || 0;
    const p = Math.max(0, Math.min(100, t?.progress || 0));
    return s + m * (p / 100);
  }, 0);
  const donePercent = totalAll > 0 ? Math.round(doneWeightedAll / totalAll * 100) : 0;

  // ---- Offload ----
  // D = (D+1) - 1
  const D_date = addDays(new Date(dateIso), -1);
  const schedule = loadSchedule();
  const W = weekdayRu(D_date);            // текущий день экрана (Mon=0)
  const todayIds = new Set(tasks.map(t => t.id));

  /** @type {{id:string,title:string,minutes:number,progress:number,fromWeekday:0|1|2|3|4|5|6,targetIso:string}[]} */
  const offload = [];

  for (let R = 0; R < 7; R++) {
    if (R === (W + 1) % 7) continue; // это «родной» для сегодняшних основных задач — пропускаем
    const arr = schedule.list(R) || [];
    const T_weekday = ((R + 6) % 7); // R-1 в Mon0
    const T_date = nextDateWithWeekdayMon0(D_date, T_weekday, true); // включаем сегодняшний день, если совпал
    const T_iso = toIsoDate(T_date);
    const dayT = loadDay(T_iso); // override для T, если есть

    for (const t of arr) {
      const u = Array.isArray(t.unloadDays) ? t.unloadDays : [];
      if (!u.includes(W)) continue; // показываем только если W указан как разрешённый день разгрузки
      if (todayIds.has(t.id)) continue; // защита от дублей

      // Источник данных: override(T) если есть, иначе schedule[R]
      const fromOverride = dayT?.findTask?.(t.id);
      const title = fromOverride ? fromOverride.title : t.title;
      const minutes = fromOverride ? fromOverride.minutes : t.minutes;
      const progress = fromOverride ? (fromOverride.progress || 0) : (t.progress || 0);

      offload.push({
        id: t.id,
        title,
        minutes,
        progress,
        fromWeekday: R,
        targetIso: T_iso,
      });
    }
  }

  return {
    dateIso,
    tasks,
    offload,
    metrics: {
      load:  minutesToHhmm(totalMinutesOpen),
      done:  `${donePercent}%`,            // ← проценты по всем задачам
      left:  minutesToHhmm(leftMinutes),
      finish: minutesToHhmm(leftMinutes),
    }
  };
}

