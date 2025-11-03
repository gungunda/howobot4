/** Утилиты работы с датами. */
export function today() { return new Date(); }
export function copy(d) { return new Date(d.getTime()); }
export function dPlus1(d = today()) { const c = copy(d); c.setDate(c.getDate() + 1); return c; }
export function toIsoDate(d){ const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,"0"); const day=String(d.getDate()).padStart(2,"0"); return `${y}-${m}-${day}`; }
export function minutesToHhmm(mins){ const h=Math.floor((mins||0)/60); const m=(mins||0)%60; return `${h}:${String(m).padStart(2,"0")}`; }
export function clamp(v,min,max){ return Math.max(min, Math.min(max,v)); }

/** Нумерация дней недели
 *  JS стандарт: Sunday=0..Saturday=6 → weekdayEn()
 *  Русский формат: Monday=0..Sunday=6 → weekdayRu()
 */
export function weekdayEn(d = today()) { return d.getDay(); }
export function weekdayRu(d = today()) { return (d.getDay() + 6) % 7; }

// Для совместимости старого кода: weekday() теперь = weekdayRu()
export const weekday = weekdayRu;

/* ===== Доп. утилиты для календаря ===== */
export function startOfMonth(d){ const c=copy(d); c.setDate(1); c.setHours(0,0,0,0); return c; }
export function daysInMonth(d){ const y=d.getFullYear(); const m=d.getMonth(); return new Date(y,m+1,0).getDate(); }
export function startOfCalendarGrid(d, weekStartsMonday=true){
  const first=startOfMonth(d);
  const jsDow=first.getDay();                // 0..6, 0=Sun
  const dowMon=(jsDow===0?7:jsDow);          // Mon=1..Sun=7
  const shift=weekStartsMonday?(1-dowMon):(-jsDow);
  const c=copy(first); c.setDate(first.getDate()+shift); return c;
}
export function isSameDay(a,b){ return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }
export function isToday(d){ return isSameDay(d, today()); }
export function addDays(d,n){ const c=copy(d); c.setDate(c.getDate()+n); return c; }
export function addMonths(d,n){ const c=copy(d); c.setMonth(c.getMonth()+n); return c; }
export function monthLabel(d){ const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,"0"); return `${y}-${m}`; }

/**
 * Найти ближайшую дату вперёд (включая/исключая сегодня) с заданным днём недели (Mon=0..Sun=6).
 * @param {Date} fromDate
 * @param {number} weekdayMon0 0..6 (Пн..Вс)
 * @param {boolean} includeToday считать ли текущую дату подходящей, если день совпадает
 * @returns {Date}
 */
export function nextDateWithWeekdayMon0(fromDate, weekdayMon0, includeToday=false){
  const start = copy(fromDate);
  if (!includeToday) {
    // сдвинем на 1 день, чтобы исключить сегодня
    start.setDate(start.getDate() + 1);
  }
  const target = ((weekdayMon0 % 7) + 7) % 7;
  let cur = copy(start);
  for (let i=0;i<14;i++){ // гарантированно найдём в течение двух недель
    if (weekdayRu(cur) === target) return cur;
    cur.setDate(cur.getDate()+1);
  }
  return cur; // fallback (не должен сработать)
}


