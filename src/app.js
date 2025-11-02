/**
 * Точка входа приложения.
 * - Роутинг между 3 экранами.
 * - Инициализация локали времени (берём с устройства).
 * - Периодическая чистка старых day_*.
 * - Навигация без библиотек.
 */
import { config } from "./config.js";
import * as date from "./utils/date.js";
import { cleanupOldDays, initStorage } from "./storage/storage.js";
import { renderAppNav } from "./ui/appView.js";
import { DashboardPresenter } from "./ui/pages/Dashboard/presenter.js";
import { SchedulePresenter } from "./ui/pages/Schedule/presenter.js";
import { CalendarPresenter } from "./ui/pages/Calendar/presenter.js";

const root = document.getElementById("app-root");
const navMount = document.getElementById("app-nav");

/** Простая «навигация» на кнопках */
const routes = {
  dashboard: () => new DashboardPresenter(root),
  schedule:  () => new SchedulePresenter(root),
  calendar:  () => new CalendarPresenter(root),
};

function mount(route) {
  root.innerHTML = "";
  const make = routes[route] || routes.dashboard;
  const p = make();
  p.render();
  highlight(route);
}

function highlight(route) {
  [...navMount.querySelectorAll("button")].forEach(btn => {
    btn.classList.toggle("active", btn.dataset.route === route);
  });
}

// Рендерим навигацию
renderAppNav(navMount, (route) => mount(route));

// Инициализация стораджа
initStorage();
cleanupOldDays(config.daysToKeep);

// Первая загрузка — dashboard
mount("dashboard");

// Делаем утилиты дат доступными для консоли (удобно ребёнку смотреть)
window.__planner = { date };
