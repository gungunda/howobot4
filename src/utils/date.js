/**
 * Утилиты работы с датами.
 * - Используем локаль устройства автоматически.
 * - Ключи дней — всегда ISO YYYY-MM-DD для предсказуемости.
 */

/** Возвращает объект Date на «сегодня» по локали устройства. */
export function today() {
  return new Date();
}

/** Возвращает Date для D+1 от переданной даты d (или от сегодня). */
export function dPlus1(d = today()) {
  const copy = new Date(d.getTime());
  copy.setDate(copy.getDate() + 1);
  return copy;
}

/** ISO-ключ дня YYYY-MM-DD. */
export function toIsoDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Номер дня недели 0..6 (вс = 0). Привязываемся к JS-стандарту. */
export function weekday(d = today()) {
  return d.getDay();
}

/** Преобразование минут в строку "часы:минуты", например 90 -> "1:30". */
export function minutesToHhmm(mins) {
  const h = Math.floor((mins || 0) / 60);
  const m = (mins || 0) % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
}

/** Клэмп значения в диапазон [min, max]. */
export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

