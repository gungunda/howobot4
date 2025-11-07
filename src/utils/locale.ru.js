/**
 * Локаль RU: названия месяцев/дней и форматтеры строк.
 * Чистый модуль без сайд-эффектов.
 */
export const MONTHS_NOM = [
  "январь","февраль","март","апрель","май","июнь",
  "июль","август","сентябрь","октябрь","ноябрь","декабрь"
];

export const MONTHS_GEN = [
  "января","февраля","марта","апреля","мая","июня",
  "июля","августа","сентября","октября","ноября","декабря"
];

export const WEEKDAYS_FULL = [
  "понедельник","вторник","среда","четверг","пятница","суббота","воскресенье"
];

export const WEEKDAYS_GEN = [
  "понедельник","вторник","среду","четверг","пятницу","субботу","воскресенье"
];

export const WEEKDAYS_SHORT = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];

/** Имя месяца в именительном падеже (например: "ноябрь") */
export function formatMonthName(date) {
  const m = date instanceof Date ? date.getMonth() : new Date(date).getMonth();
  return MONTHS_NOM[m];
}

/** День и месяц в родительном падеже (например: "11 ноября") */
export function formatDayMonth(date) {
  const d = date instanceof Date ? date : new Date(date);
  const day = String(d.getDate()).padStart(1, "0"); // без ведущего нуля
  return `${day} ${MONTHS_GEN[d.getMonth()]}`;
}


