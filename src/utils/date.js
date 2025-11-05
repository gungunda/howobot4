
/** Утилиты работы с датами (защищены от строк/таймстампов). */

export function asDate(d = new Date()) {
  if (d instanceof Date) return new Date(d.getTime());
  if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
    const [y,m,dd] = d.split("-").map(Number);
    return new Date(y, m - 1, dd, 0, 0, 0, 0); // локальная полуночь, без UTC-сдвига
  }
  // Любое, что понимает Date (таймстамп, ISO с временем и т.п.)
  return new Date(d);
}

export function today() { return new Date(); }

export function copy(d) {
  const x = asDate(d);
  return new Date(x.getTime());
}

export function dPlus1(d = today()) {
  const x = copy(d);
  x.setDate(x.getDate() + 1);
  return x;
}

export function toIsoDate(d = today()) {
  const x = asDate(d);
  const y = x.getFullYear().toString().padStart(4, "0");
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const dd = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export function minutesToHhmm(mins) {
  const total = Number(mins) || 0;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
}
export function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

export function weekdayEn(d = today()) { return asDate(d).getDay(); } // 0..6, Вс=0
export function weekdayRu(d = today()) { return (weekdayEn(d) + 6) % 7; }
export const weekday = weekdayRu;

/* ===== Доп. утилиты календаря ===== */
export function startOfMonth(d) {
  const c = asDate(d);
  c.setDate(1);
  c.setHours(0,0,0,0);
  return c;
}
export function daysInMonth(d) {
  const x = asDate(d);
  const y = x.getFullYear();
  const m = x.getMonth();
  return new Date(y, m + 1, 0).getDate();
}
export function startOfCalendarGrid(d, weekStartsMonday = true) {
  const first = startOfMonth(d);
  const jsDow = first.getDay();             // 0..6, Вс=0
  const dowMon = (jsDow === 0 ? 7 : jsDow); // 1..7, Пн=1..Вс=7
  const shift = weekStartsMonday ? (1 - dowMon) : (-jsDow);
  const c = copy(first);
  c.setDate(first.getDate() + shift);
  return c;
}
export function isSameDay(a, b) {
  const x = asDate(a), y = asDate(b);
  return x.getFullYear() === y.getFullYear()
      && x.getMonth() === y.getMonth()
      && x.getDate() === y.getDate();
}
export function isToday(d) { return isSameDay(d, today()); }
export function addDays(d, n) { const c = asDate(d); c.setDate(c.getDate() + Number(n||0)); return c; }
export function addMonths(d, n) { const c = asDate(d); c.setMonth(c.getMonth() + Number(n||0)); return c; }
/** Добавить минуты к дате. */
export function addMinutes(d, n) { const c = asDate(d); c.setMinutes(c.getMinutes() + Number(n||0)); return c; }

/** Формат локального времени HH:MM. */
export function timeHhmm(d = today()) {
  const x = asDate(d);
  return `${String(x.getHours()).padStart(2,"0")}:${String(x.getMinutes()).padStart(2,"0")}`;
}
export function monthLabel(d) { const x = asDate(d); return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}`; }

/** Разбор строки 'YYYY-MM-DD' как локальной даты (экспортируемая функция). */
export function fromIsoLocal(s) { return asDate(s); }

export function nextDateWithWeekdayMon0(fromDate, weekdayMon0, includeToday = false) {
  const start = copy(fromDate);
  if (!includeToday) start.setDate(start.getDate() + 1);
  const target = ((weekdayMon0 % 7) + 7) % 7;
  let cur = copy(start);
  for (let i = 0; i < 14; i++) {
    if (weekdayRu(cur) === target) return cur;
    cur.setDate(cur.getDate() + 1);
  }
  return cur;
}



