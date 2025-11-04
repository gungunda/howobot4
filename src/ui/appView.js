/**
 * Верхняя навигация из трёх кнопок.
 * Маршруты: dashboard («Сегодня»), schedule («Расписание»), calendar («Календарь»).
 */
const buttons = [
  { route: "dashboard", label: "Сегодня" },
  { route: "schedule",  label: "Расписание" },
  { route: "calendar",  label: "Календарь" },
];

export function renderAppNav(mount, onRoute) {
  mount.innerHTML = "";
  buttons.forEach((b, i) => {
    const btn = document.createElement("button");
    btn.textContent = b.label;
    btn.dataset.route = b.route;
    if (i === 0) btn.classList.add("active"); // по умолчанию активен первый
    btn.addEventListener("click", () => onRoute(b.route));
    mount.appendChild(btn);
  });
}

