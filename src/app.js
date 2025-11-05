// /src/app.js
/**
 * Точка входа. Навигация по data-* и инициализация presenters.
 */
import { config } from "./config.js";
import * as date from "./utils/date.js";
import { cleanupOldDays, initStorage } from "./storage/storage.js";
import { DashboardPresenter } from "./ui/pages/Dashboard/presenter.js";
import { SchedulePresenter } from "./ui/pages/Schedule/presenter.js";
import { CalendarPresenter } from "./ui/pages/Calendar/presenter.js";

const views = {
  dashboard: document.querySelector('[data-view="dashboard"]'),
  schedule:  document.querySelector('[data-view="schedule"]'),
  calendar:  document.querySelector('[data-view="calendar"]'),
};

function show(route){
  document.querySelectorAll('.view').forEach(v => v.classList.remove('is-active'));
  const el = route === "schedule" ? views.schedule
    : route === "calendar" ? views.calendar
    : views.dashboard;
  el?.classList.add('is-active');
}

initStorage();
cleanupOldDays(config.daysToKeep);

const dashboard = new DashboardPresenter(views.dashboard);
const schedule  = new SchedulePresenter(views.schedule);
const calendar  = new CalendarPresenter(views.calendar, {
  onSelectDate: (iso) => {
    dashboard.baseDate = date.fromIsoLocal(iso);
    show("dashboard");
    render("dashboard");
  }
});

// верхняя навигация
document.querySelectorAll("[data-nav]").forEach(btn => {
  btn.addEventListener("click", () => {
    const route = btn.getAttribute("data-nav");

    // Если клик по «Сегодня» — сбрасываем дашборд на текущую дату
    if (route === "dashboard") {
      dashboard.baseDate = date.today();
    }

    show(route);
    render(route);
  });
});

// (опционально) отдельная кнопка «сегодня», если присутствует в разметке
document.querySelector('[data-action="today"]')?.addEventListener('click', () => {
  const t = date.today();
  dashboard.baseDate = t;
  schedule.baseDate = t;
  calendar.baseDate = t;
  show("dashboard");
  render("dashboard");
});

let currentRoute = "dashboard";
function render(route){
  currentRoute = route || currentRoute;
  switch(currentRoute){
    case "schedule":  schedule.render(); break;
    case "calendar":  calendar.render(); break;
    default:          dashboard.render(); break;
  }
}

// старт: показать и отрисовать дашборд
show("dashboard");
render("dashboard");

window.__planner = { date };