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
  Object.values(views).forEach(el => el.classList.remove("is-active"));
  (views[route] || views.dashboard).classList.add("is-active");
  render(route);
}

document.querySelectorAll('[data-nav]').forEach(btn => {
  btn.addEventListener('click', () => show(btn.dataset.nav));
});

initStorage();
cleanupOldDays(config.daysToKeep);

const dashboard = new DashboardPresenter(views.dashboard);
const schedule  = new SchedulePresenter(views.schedule);
const calendar  = new CalendarPresenter(views.calendar, {
  onSelectDate: (iso) => {
    dashboard.baseDate = new Date(iso);
    show("dashboard");
    dashboard.render();
  }
});

document.querySelector('[data-action="today"]')?.addEventListener('click', () => {
  const t = date.today();
  dashboard.baseDate = t;
  schedule.baseDate = t;
  calendar.baseDate = t;
  render(currentRoute);
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

show("dashboard");
window.__planner = { date };


